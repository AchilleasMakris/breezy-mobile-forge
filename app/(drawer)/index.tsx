import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function Dashboard() {
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Mock data - will be replaced with Supabase data later
  const user = {
    name: 'Donald Trump',
    title: 'Junior Full Stack Developer',
    avatar: null, // Will use Supabase storage URL later
    gpa: 3.8,
  };

  // Sample data for demonstration - will be populated from Supabase
  const meetings = [
    {
      id: 1,
      title: 'Townhall Meeting',
      time: '01:30 AM - 02:00 AM',
      type: 'meeting',
    },
    {
      id: 2,
      title: 'Dashboard Report',
      time: '01:30 AM - 02:00 AM',
      type: 'meeting',
    },
  ];

  const tasks = [
    {
      id: 1,
      title: 'Wiring Dashboard Analytics',
      status: 'In Progress',
      priority: 'High',
      dueDate: '27 April',
      progress: 75,
    },
  ];

  const weeklyData = [2, 1, 0, 0, 3, 0, 1]; // Tasks completed per day
  const weekLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // This will later fetch data from Supabase
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today Meeting Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today Meeting</Text>
            {meetings.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{meetings.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>Your schedule for the day</Text>

          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <View key={meeting.id} style={styles.meetingCard}>
                <View style={styles.meetingIcon}>
                  <Feather name="video" size={20} color="#667eea" />
                </View>
                <View style={styles.meetingInfo}>
                  <Text style={styles.meetingTitle}>{meeting.title}</Text>
                  <Text style={styles.meetingTime}>{meeting.time}</Text>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <Text style={styles.joinButtonText}>Join Meet</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Meeting Available</Text>
              <Text style={styles.emptyStateDescription}>
                It looks like you don't have any meetings scheduled at the moment.
                This space will be updated as new meetings are added!
              </Text>
            </View>
          )}
        </View>

        {/* Today Task Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today Task</Text>
            {tasks.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tasks.length}</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionSubtitle}>The tasks assigned to you for today</Text>

          {tasks.length > 0 ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskIcon}>
                    <Feather name="book-open" size={16} color="#667eea" />
                  </View>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                
                <View style={styles.taskDetails}>
                  <View style={styles.taskStatus}>
                    <Text style={styles.statusText}>{task.status}</Text>
                    <View style={[styles.priorityBadge, task.priority === 'High' && styles.highPriority]}>
                      <Text style={[styles.priorityText, task.priority === 'High' && styles.highPriorityText]}>
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
                    </View>
                    <View style={styles.dueDateSection}>
                      <Feather name="calendar" size={12} color="#94a3b8" />
                      <Text style={styles.dueDate}>{task.dueDate}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateTitle}>No Tasks Assigned</Text>
              <Text style={styles.emptyStateDescription}>
                It looks like you don't have any tasks assigned to you right now. Don't
                worry, this space will be updated as new tasks become available.
              </Text>
            </View>
          )}
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
  // Header Styles
  header: {
    marginBottom: 24,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 2,
  },
  userTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  // Meeting Card Styles
  meetingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  meetingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  meetingInfo: {
    flex: 1,
  },
  meetingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  meetingTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  joinButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#ffffff',
  },
  // Task Card Styles
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  taskDetails: {
    gap: 12,
  },
  taskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#64748b',
  },
  priorityBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  highPriority: {
    backgroundColor: '#fef2f2',
  },
  priorityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#64748b',
  },
  highPriorityText: {
    color: '#ef4444',
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  dueDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  dueDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#94a3b8',
  },
  // Empty State Styles
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
});