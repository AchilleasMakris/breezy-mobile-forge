import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '../../providers/SupabaseProvider';
import TaskModal, { Task } from '../../components/TaskModal';
import { Course } from '../../components/CourseModal';
import { isPast, parseISO, format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

type FilterType = 'Active' | 'In Progress' | 'Finished';

interface TaskWithCourse extends Task {
  course_name?: string;
}

const priorityColors: Record<Task['priority'], { background: string; text: string; icon: React.ReactNode }> = {
  Low: { background: '#dcfce7', text: '#166534', icon: <Feather name="check-circle" size={14} color="#16a34a" /> },
  Medium: { background: '#ffedd5', text: '#9a3412', icon: <Feather name="alert-triangle" size={14} color="#f97316" /> },
  High: { background: '#fee2e2', text: '#991b1b', icon: <Feather name="zap" size={14} color="#ef4444" /> },
};

export default function TasksScreen() {
    const { userId } = useAuth();
    const { supabase, loading: supabaseLoading } = useSupabase();

    const [tasks, setTasks] = useState<TaskWithCourse[]>([]);
    const [courses, setCourses] = useState<Partial<Course>[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('Active');
  
    const fetchCoursesAndTasks = useCallback(async () => {
        if (!userId || !supabase) return;
        setLoading(true);
        try {
            const { data: courseData, error: courseError } = await supabase.from('courses').select('id, name').eq('user_id', userId);
            if (courseError) throw courseError;
            setCourses(courseData || []);
            const courseMap = (courseData || []).reduce((acc, course) => {
                acc[course.id] = course.name;
                return acc;
            }, {} as Record<string, string>);

            const { data: taskData, error: taskError } = await supabase.from('tasks').select('*').eq('user_id', userId);
            if (taskError) throw taskError;

            const tasksWithCourseNames = (taskData || []).map(task => ({
                ...task,
                course_name: task.course_id ? courseMap[task.course_id] : 'General',
            }));
            setTasks(tasksWithCourseNames);

        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, supabase]);

    useEffect(() => {
        if (supabase && userId) fetchCoursesAndTasks();
    }, [userId, supabase]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCoursesAndTasks();
    }, [fetchCoursesAndTasks]);

    const openAddTask = () => {
        setSelectedTask(null);
        setModalVisible(true);
    };

    const openEditTask = (task: Task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const handleDeleteTask = (id: string) => {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    if (!supabase) return;
                    const { error } = await supabase.from('tasks').delete().eq('id', id);
                    if (error) Alert.alert('Error', error.message);
                    else fetchCoursesAndTasks();
                },
            },
        ]);
    };

    const handleFormSubmit = async (taskData: Task) => {
        if (!supabase || !userId) return;
        try {
            const { id, course_name, ...updateData } = taskData as TaskWithCourse;
            if (id) { // Update
                const { error } = await supabase.from('tasks').update(updateData).eq('id', id);
                if (error) throw error;
            } else { // Insert
                const { error } = await supabase.from('tasks').insert({ ...updateData, user_id: userId });
                if (error) throw error;
            }
            fetchCoursesAndTasks();
            setModalVisible(false);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleToggleStatus = async (task: TaskWithCourse) => {
        if (!supabase) return;
        const newStatus = task.status === 'Finished' ? 'To Do' : 'Finished';
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id!);
        if (error) {
            Alert.alert('Error', 'Failed to update task status.');
        } else {
            fetchCoursesAndTasks();
        }
    }
  
    const filteredTasks = useMemo(() => {
      let tasksToFilter;
      if (activeFilter === 'Active') {
        tasksToFilter = tasks.filter(task => task.status === 'To Do' || task.status === 'In Progress');
      } else {
        tasksToFilter = tasks.filter((task) => task.status === activeFilter);
      }
      
      return tasksToFilter.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
  
        const aDateTime = parseISO(a.due_time ? `${a.due_date}T${a.due_time}` : a.due_date);
        const bDateTime = parseISO(b.due_time ? `${b.due_date}T${b.due_time}` : b.due_date);
  
        return aDateTime.getTime() - bDateTime.getTime();
      });
    }, [tasks, activeFilter]);
  
    const taskCounts = useMemo(() => ({
      'To Do': tasks.filter(task => task.status === 'To Do').length,
      'In Progress': tasks.filter(task => task.status === 'In Progress').length,
      'Finished': tasks.filter(task => task.status === 'Finished').length,
    }), [tasks]);

    const isOverdue = (task: Task) => {
        if (task.status === 'Finished' || !task.due_date) return false;
        const dueDateTime = task.due_time ? `${task.due_date}T${task.due_time}` : task.due_date;
        return isPast(parseISO(dueDateTime));
    };
  
    const renderEmptyState = () => (
      <View style={styles.emptyStateContainer}>
        <Feather name="list" size={64} color="#cbd5e1" />
        <Text style={styles.emptyStateTitle}>No Tasks Yet</Text>
        <Text style={styles.emptyStateDescription}>Tap "Add New Task" to get started.</Text>
      </View>
    );

    const renderTaskCard = (task: TaskWithCourse) => {
        const priorityStyle = priorityColors[task.priority];
        const overdue = isOverdue(task);
        return (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskCardHeader}>
                <View style={[styles.taskIconWrapper, { backgroundColor: priorityStyle.background }]}>
                    {priorityStyle.icon}
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.taskTitle} numberOfLines={2}>{task.title}</Text>
                    <Text style={styles.courseName}>{task.course_name}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => handleToggleStatus(task)} style={styles.actionButton}>
                        <Feather name="check-square" size={18} color="#16a34a"/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openEditTask(task)} style={styles.actionButton}><Feather name="edit" size={16} color="#64748b"/></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteTask(task.id!)} style={styles.actionButton}><Feather name="trash-2" size={16} color="#ef4444"/></TouchableOpacity>
                </View>
            </View>
      
            <View style={styles.taskCardFooter}>
              <View style={styles.dueDateContainer}>
                <Feather name="calendar" size={14} color={overdue ? '#ef4444' : '#64748b'} />
                <Text style={[styles.dueDateText, overdue && {color: '#ef4444'}]}>
                  {task.due_date ? format(parseISO(task.due_date), 'MMM dd') : 'No date'}
                </Text>
                {task.due_time && (
                    <>
                        <Feather name="clock" size={14} color={overdue ? '#ef4444' : '#64748b'} style={{ marginLeft: 8 }} />
                        <Text style={[styles.dueDateText, overdue && {color: '#ef4444'}]}>{format(new Date(`1970-01-01T${task.due_time}`), 'p')}</Text>
                    </>
                )}
              </View>
              {overdue && <View style={styles.overdueBadge}><Text style={styles.overdueText}>OVERDUE</Text></View>}
              <View style={[styles.statusTag, { backgroundColor: priorityColors[task.priority].background }]}>
                <Text style={[styles.statusTagText, { color: priorityColors[task.priority].text }]}>{task.status}</Text>
              </View>
            </View>
          </View>
        );
      };
      
  if (loading || supabaseLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#6366f1" /></View>
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
            colors={['#818cf8', '#6366f1']}
            style={styles.header}
        >
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Challenges Awaiting</Text>
                <Text style={styles.headerSubtitle}>Let's tackle your to-do list</Text>
            </View>
            <Feather name="clipboard" size={60} color="rgba(255,255,255,0.3)" style={styles.headerIcon} />
        </LinearGradient>

        <View style={styles.contentContainer}>
            <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Summary of Your Work</Text>
                <View style={styles.summaryCardsContainer}>
                    <View style={styles.summaryCard}><Feather name="list" size={20} color="#3b82f6" /><Text style={styles.summaryCount}>{taskCounts['To Do']}</Text><Text style={styles.summaryLabel}>To Do</Text></View>
                    <View style={styles.summaryCard}><Feather name="zap" size={20} color="#f97316" /><Text style={styles.summaryCount}>{taskCounts['In Progress']}</Text><Text style={styles.summaryLabel}>In Progress</Text></View>
                    <View style={styles.summaryCard}><Feather name="check-circle" size={20} color="#16a34a" /><Text style={styles.summaryCount}>{taskCounts['Finished']}</Text><Text style={styles.summaryLabel}>Done</Text></View>
                </View>
            </View>

            <View style={styles.listHeaderContainer}>
                <Text style={styles.sectionTitle}>Your Tasks</Text>
                <TouchableOpacity style={styles.addTaskButton} onPress={openAddTask}>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.addTaskButtonText}>Add Task</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
            {(['Active', 'In Progress', 'Finished'] as FilterType[]).map((filter) => (
                <TouchableOpacity key={filter} style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton,]} onPress={() => setActiveFilter(filter)}>
                <Text style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterButtonText,]}>
                    {filter}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            {tasks.length === 0 ? renderEmptyState() : (
                filteredTasks.length > 0 ? filteredTasks.map(renderTaskCard) : (
                    <View style={styles.emptyStateContainer}>
                        <Text style={styles.emptyStateTitle}>No tasks in "{activeFilter}"</Text>
                    </View>
                )
            )}
        </View>
      </ScrollView>
      <TaskModal 
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedTask}
        courses={courses}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // Increased for status bar
    paddingBottom: 60, // Space for the summary to overlap
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  headerTextContainer: {},
  headerTitle: {
      fontFamily: 'Inter-Bold',
      fontSize: 28,
      color: '#fff',
      marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  headerIcon: {
      position: 'absolute',
      right: 20,
      top: 60,
      transform: [{ rotate: '15deg' }],
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: -40, // Pulls the content up to overlap with header
  },
  summarySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 18,
      color: '#1e293b',
      marginBottom: 16
  },
  summaryCardsContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1f2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  listHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTaskButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addTaskButtonText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#4b5563',
  },
  activeFilterButtonText: {
    color: '#6366f1',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 22,
  },
  courseName: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2,
  },
  actions: {
      flexDirection: 'row',
      gap: 0,
      marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dueDateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6b7280',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
  },
  overdueBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: '#fee2e2',
      borderRadius: 6,
  },
  overdueText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#ef4444',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
