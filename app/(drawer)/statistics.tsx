import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import ActivityChart from '../../components/ActivityChart';
import { useUniversityData } from '../../hooks/useUniversityData';

export default function Statistics() {
  const { 
    gpa, 
    courses, 
    tasks, 
    weeklyActivity, 
    completedCredits, 
    totalCredits,
    loading 
  } = useUniversityData();

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const averageGrade = courses.length > 0 ? courses.reduce((sum, course) => sum + course.grade, 0) / courses.length : 0;
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalWeeklyTasks = weeklyActivity.reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading statistics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Performance Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statHalf}>
                <StatCard
                  title="Average Grade"
                  value={averageGrade}
                  decimals={1}
                  suffix="/10"
                  icon={<Feather name="award" size={24} color="#ffffff" />}
                  gradient={['#3b82f6', '#1d4ed8']}
                />
              </View>
              <View style={styles.statHalf}>
                <StatCard
                  title="Completion Rate"
                  value={completionRate}
                  decimals={0}
                  suffix="%"
                  icon={<Feather name="target" size={24} color="#ffffff" />}
                  gradient={['#10b981', '#059669']}
                />
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statHalf}>
                <StatCard
                  title="Weekly Tasks"
                  value={totalWeeklyTasks}
                  suffix=" completed"
                  icon={<Feather name="calendar" size={24} color="#ffffff" />}
                  gradient={['#f59e0b', '#d97706']}
                />
              </View>
              <View style={styles.statHalf}>
                <StatCard
                  title="Progress"
                  value={totalCredits > 0 ? Math.round((completedCredits / totalCredits) * 100) : 0}
                  suffix="%"
                  icon={<Feather name="trending-up" size={24} color="#ffffff" />}
                  gradient={['#ef4444', '#dc2626']}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Activity Chart */}
        <ActivityChart data={weeklyActivity} labels={weekLabels} />

        {/* Course Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Performance</Text>
          
          {courses.map((course) => (
            <View key={course.id} style={styles.coursePerformance}>
              <View style={styles.courseHeader}>
                <View style={[styles.colorDot, { backgroundColor: course.color }]} />
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseGrade}>{course.grade.toFixed(1)}/10</Text>
              </View>
              
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(course.grade / 10) * 100}%`,
                      backgroundColor: course.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Academic Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Goals</Text>
          
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>Semester Target</Text>
            <Text style={styles.goalDescription}>
              Maintain GPA above 8.5 and complete all assignments on time
            </Text>
            <View style={styles.goalProgress}>
              <Text style={styles.goalLabel}>Current Progress</Text>
              <View style={styles.goalBar}>
                <View
                  style={[
                    styles.goalFill,
                    { width: `${(gpa / 10) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.goalPercentage}>{Math.round((gpa / 10) * 100)}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statHalf: {
    flex: 1,
  },
  coursePerformance: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  courseName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  courseGrade: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#1e293b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  goalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  goalProgress: {
    marginTop: 8,
  },
  goalLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  goalBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  goalPercentage: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#3b82f6',
    textAlign: 'right',
  },
}); 