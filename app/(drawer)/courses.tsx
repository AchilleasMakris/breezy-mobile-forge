import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '../../providers/SupabaseProvider';
import CourseModal, { Course } from '../../components/CourseModal';

// Add a color property to the Course interface for the UI
interface CourseWithColor extends Course {
    color: string;
}

const COURSE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Courses() {
  const { userId } = useAuth();
  const { supabase, loading: supabaseLoading } = useSupabase();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseWithColor[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const fetchCourses = useCallback(async () => {
    if (!userId || !supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const coursesWithColors = data.map((course, index) => ({
        ...course,
        color: COURSE_COLORS[index % COURSE_COLORS.length],
      }));
      setCourses(coursesWithColors);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch courses: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (supabase && userId) {
        fetchCourses();
    }
  }, [userId, supabase]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, [fetchCourses]);

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalVisible(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const handleDeleteCourse = (courseId: string) => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course and all its related data?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            if (!supabase) return;
            try {
              const { error } = await supabase.from('courses').delete().eq('id', courseId);
              if (error) throw error;
              fetchCourses(); // Refresh the list
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete course: ' + error.message);
            }
          } 
        }
      ]
    );
  };

  const handleFormSubmit = async (courseData: Course) => {
    if (!supabase) return;

    // Validation: ensure required fields are present
    const requiredFields: (keyof Course)[] = [
      'name',
      'professor',
      'credits',
      'semester',
      'year',
      'code',
    ];

    const missing = requiredFields.filter((field) => {
      const value = (courseData as any)[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    // Remove UI-only properties such as 'color'
    const { color, ...dbCourse } = courseData as any;

    try {
        if (selectedCourse?.id) {
            // Update existing course
            const { error } = await supabase
              .from('courses')
              .update({ ...dbCourse, user_id: userId })
              .eq('id', selectedCourse.id);
            if (error) throw error;
        } else {
            // Add new course
            const { error } = await supabase
              .from('courses')
              .insert({ ...dbCourse, user_id: userId });
            if (error) throw error;
        }
        setModalVisible(false);
        fetchCourses(); // Refresh list after submission
    } catch (error: any) {
        Alert.alert('Error', 'Failed to save course: ' + error.message);
    }
  };

  const stats = useMemo(() => {
    const totalECTS = courses.reduce((sum, course) => sum + (course.credits || 0), 0);
    const coursesWithGrades = courses.filter(c => c.grade != null && c.grade > 0);
    const gpa = coursesWithGrades.length > 0 
      ? coursesWithGrades.reduce((sum, course) => sum + (course.grade || 0), 0) / coursesWithGrades.length
      : 0;
    
    return {
        totalECTS,
        currentGPA: gpa.toFixed(1)
    };
  }, [courses]);

  if (loading || supabaseLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Your Courses</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCourse}>
                <Feather name="plus" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Add Course</Text>
            </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.gpaCard]}>
            <Text style={styles.statLabel}>Current GPA</Text>
            <Text style={styles.statValue}>{stats.currentGPA}</Text>
            <Text style={styles.statDescription}>Based on {courses.filter(c => c.grade != null).length} courses</Text>
            <View style={styles.statIcon}>
              <Feather name="award" size={24} color="#667eea" />
            </View>
          </View>

          <View style={[styles.statCard, styles.ectsCard]}>
            <Text style={styles.statLabel}>Total ECTS</Text>
            <Text style={styles.statValue}>{stats.totalECTS}</Text>
            <Text style={styles.statDescription}>Credits earned</Text>
            <View style={styles.statIcon}>
              <Feather name="book-open" size={24} color="#10b981" />
            </View>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesSection}>
            {courses.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="book-open" size={48} color="#cbd5e1" />
                    <Text style={styles.emptyStateTitle}>No Courses Yet</Text>
                    <Text style={styles.emptyStateDescription}>
                        Tap "Add Course" to get started and organize your academic life.
                    </Text>
                </View>
            ) : (
                courses.map((course) => (
                    <View key={course.id} style={styles.courseCard}>
                    <View style={styles.courseHeader}>
                        <View style={[styles.colorIndicator, { backgroundColor: course.color }]} />
                        <View style={styles.courseInfo}>
                        <Text style={styles.courseName}>{course.name}</Text>
                        <Text style={styles.courseCode}>{course.code}</Text>
                        </View>
                        <View style={styles.courseActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditCourse(course)}>
                            <Feather name="edit" size={18} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteCourse(course.id!)}>
                            <Feather name="trash-2" size={18} color="#ef4444" />
                        </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.courseDetails}>
                        <View style={styles.detailItem}>
                        <Feather name="user" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{course.professor}</Text>
                        </View>
                        <View style={styles.detailItem}>
                        <Feather name="calendar" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{course.semester} {course.year}</Text>
                        </View>
                        <View style={styles.detailItem}>
                        <Feather name="book-open" size={16} color="#64748b" />
                        <Text style={styles.detailText}>{course.credits} ECTS</Text>
                        </View>
                    </View>

                    {/* Grade Display */}
                    {course.grade && (
                        <View style={styles.gradeContainer}>
                        <Text style={styles.gradeText}>{course.grade}/10</Text>
                        </View>
                    )}
                    </View>
                ))
            )}
        </View>
      </ScrollView>
      <CourseModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  gpaCard: {
    backgroundColor: '#dbeafe',
  },
  ectsCard: {
    backgroundColor: '#dcfce7',
  },
  statLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 4,
  },
  statDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  statIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Courses Section
  coursesSection: {
    marginBottom: 32,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16, // Changed from 12
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, // Changed from 1
    },
    shadowOpacity: 0.05,
    shadowRadius: 8, // Changed from 3
    elevation: 2, // Changed from 1
    // Removed borderWidth and borderColor to match old style more closely
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Kept from old style
    marginBottom: 16,
    // justifyContent: 'space-between' is implicitly handled by flex:1 on courseInfo
  },
  colorIndicator: { // Added from old style
    width: 4,
    height: 40, // Adjust height as needed, or link to text height
    borderRadius: 2,
    marginRight: 16,
  },
  courseInfo: {
    flex: 1,
    // Removed justifyContent: 'center' as it's not in old style for this part
  },
  courseName: {
    fontFamily: 'Inter-SemiBold', // Changed from Inter-Bold
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  courseCode: { // Was 'instructor' in old style, using 'courseCode' for current data
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  courseActions: {
    flexDirection: 'row',
    gap: 8,
    // alignItems: 'center', // if needed, but old style didn't have actions here
  },
  actionButton: { // Kept existing action button style
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  courseDetails: {
    // flexDirection: 'row', // Old style had row, but for 3 items, column might be better.
    // Let's try column layout for the detail items as per current structure, but styled like old detailItem
    flexDirection: 'column', // Changed from 'row' in old style to accommodate multiple items better
    gap: 10, // Adjusted gap
    // marginBottom: 16, // Added from old style if spacing is needed before progress bar (which is removed)
  },
  detailItem: { // Added from old style
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: 'Inter-Medium', // Changed from Inter-Regular
    fontSize: 14,
    color: '#64748b',
    // marginLeft: 8, // Replaced by gap in detailItem
    // flex: 1, // Removed as it might not be needed with column layout / specific detail items
  },
  // Grade Styles
  gradeContainer: {
    position: 'absolute',
    bottom: 16,
    right: 20,
    backgroundColor: '#e0f2fe', // Light blue background
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  gradeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#0ea5e9', // Sky blue text
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});