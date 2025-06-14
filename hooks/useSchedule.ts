import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '../providers/SupabaseProvider';
import { Alert } from 'react-native';
import { ClassItem } from '../components/ClassModal';
import { Task } from '../components/TaskModal';

export interface Event {
    id: string;
    title: string;
    date: Date;
    type: 'class' | 'task';
    color: string;
    courseName?: string;
    data: ClassItem | Task;
}

const COURSE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const useSchedule = (userId: string | null | undefined) => {
    const { supabase } = useSupabase();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);

    const fetchData = useCallback(async () => {
        if (!userId || !supabase) return;
        setLoading(true);
        try {
            // Fetch courses
            const { data: coursesData, error: coursesError } = await supabase
                .from('courses')
                .select('id, name')
                .eq('user_id', userId);
            if (coursesError) throw coursesError;
            const courses = coursesData || [];

            const courseMap = courses.reduce((acc, course) => {
                acc[course.id] = course.name;
                return acc;
            }, {} as Record<string, string>);
            
            const courseColorMap = courses.reduce((acc, course, index) => {
                acc[course.id] = COURSE_COLORS[index % COURSE_COLORS.length];
                return acc;
            }, {} as Record<string, string>);

            // Fetch classes
            const { data: classesData, error: classesError } = await supabase
                .from('classes')
                .select('*')
                .eq('user_id', userId);
            if (classesError) throw classesError;

            // Fetch tasks, excluding finished ones
            const { data: tasksData, error: tasksError } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['To Do', 'In Progress']);
                
            if (tasksError) throw tasksError;

            const classEvents: Event[] = (classesData || [])
                .map((c: ClassItem): Event | null => {
                    if (!c.date) return null;
                    const date = new Date(`${c.date}T00:00:00`);
                    if (isNaN(date.getTime())) return null; // Invalid date check
                    return {
                        id: c.id!,
                        title: c.title,
                        date,
                        type: 'class',
                        color: c.course_id ? courseColorMap[c.course_id] : '#64748b',
                        courseName: c.course_id ? courseMap[c.course_id] : 'General',
                        data: c,
                    };
                })
                .filter((e): e is Event => e !== null);

            const taskEvents: Event[] = (tasksData || [])
                .map((t: Task): Event | null => {
                    if (!t.due_date) return null;
                    const date = new Date(t.due_date);
                    if (isNaN(date.getTime())) return null; // Invalid date check
                    return {
                        id: t.id!,
                        title: t.title,
                        date,
                        type: 'task',
                        color: t.course_id ? courseColorMap[t.course_id] : '#64748b',
                        courseName: t.course_id ? courseMap[t.course_id] : 'General',
                        data: t,
                    };
                })
                .filter((e): e is Event => e !== null);

            setEvents([...classEvents, ...taskEvents].sort((a,b) => a.date.getTime() - b.date.getTime()));

        } catch (e: any) {
            Alert.alert('Error fetching schedule', e.message);
        } finally {
            setLoading(false);
        }
    }, [userId, supabase]);

    useEffect(() => {
        if (supabase && userId) {
            fetchData();
        }
    }, [supabase, userId]);

    return { events, loading, refresh: fetchData };
} 