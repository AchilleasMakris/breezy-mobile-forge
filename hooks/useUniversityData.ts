import { useState, useEffect } from 'react';

export interface Course {
  id: string;
  name: string;
  instructor: string;
  credits: number;
  grade: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface ClassSchedule {
  id: string;
  title: string;
  instructor: string;
  time: string;
  location: string;
  color: string;
  day: string;
}

export interface UniversityData {
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  courses: Course[];
  tasks: Task[];
  weeklyActivity: number[];
  schedule: ClassSchedule[];
  loading: boolean;
  error: string | null;
}

// Mock data - in a real app, this would come from an API
const mockData: Omit<UniversityData, 'loading' | 'error'> = {
  gpa: 8.7,
  totalCredits: 120,
  completedCredits: 85,
  courses: [
    {
      id: '1',
      name: 'Advanced Mathematics',
      instructor: 'Dr. Smith',
      credits: 4,
      grade: 9.2,
      color: '#3b82f6',
    },
    {
      id: '2',
      name: 'Computer Science',
      instructor: 'Prof. Johnson',
      credits: 3,
      grade: 8.8,
      color: '#10b981',
    },
    {
      id: '3',
      name: 'Physics',
      instructor: 'Dr. Brown',
      credits: 4,
      grade: 8.5,
      color: '#f59e0b',
    },
    {
      id: '4',
      name: 'English Literature',
      instructor: 'Prof. Davis',
      credits: 2,
      grade: 8.9,
      color: '#ef4444',
    },
  ],
  tasks: [
    {
      id: '1',
      title: 'Calculus Assignment #5',
      course: 'Advanced Mathematics',
      dueDate: 'Tomorrow',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      title: 'Programming Project',
      course: 'Computer Science',
      dueDate: 'In 3 days',
      priority: 'medium',
      completed: false,
    },
    {
      id: '3',
      title: 'Physics Lab Report',
      course: 'Physics',
      dueDate: 'Next week',
      priority: 'low',
      completed: false,
    },
    {
      id: '4',
      title: 'Essay on Shakespeare',
      course: 'English Literature',
      dueDate: 'Yesterday',
      priority: 'high',
      completed: true,
    },
  ],
  weeklyActivity: [3, 5, 2, 7, 4, 6, 1],
  schedule: [
    {
      id: '1',
      title: 'Advanced Mathematics',
      instructor: 'Dr. Smith',
      time: '09:00 - 10:30',
      location: 'Room 101',
      color: '#3b82f6',
      day: 'Monday',
    },
    {
      id: '2',
      title: 'Computer Science',
      instructor: 'Prof. Johnson',
      time: '11:00 - 12:30',
      location: 'Lab 205',
      color: '#10b981',
      day: 'Monday',
    },
    {
      id: '3',
      title: 'Physics',
      instructor: 'Dr. Brown',
      time: '14:00 - 15:30',
      location: 'Room 303',
      color: '#f59e0b',
      day: 'Tuesday',
    },
  ],
};

export function useUniversityData(): UniversityData {
  const [data, setData] = useState<UniversityData>({
    ...mockData,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setData({
          ...mockData,
          loading: false,
          error: null,
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load university data',
        }));
      }
    };

    fetchData();
  }, []);

  return data;
}