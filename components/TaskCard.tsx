import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TaskCardProps {
  title: string;
  course: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  onPress?: () => void;
}

export default function TaskCard({
  title,
  course,
  dueDate,
  priority,
  completed = false,
  onPress,
}: TaskCardProps) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const getPriorityIcon = () => {
    if (completed) {
      return <Feather name="check-circle" size={16} color="#10b981" />;
    }
    
    switch (priority) {
      case 'high':
        return <Feather name="alert-circle" size={16} color="#ef4444" />;
      case 'medium':
        return <Feather name="clock" size={16} color="#f59e0b" />;
      case 'low':
        return <Feather name="clock" size={16} color="#10b981" />;
      default:
        return <Feather name="clock" size={16} color="#64748b" />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        completed && styles.completedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.priorityIndicator}>
          {getPriorityIcon()}
        </View>
        <View style={styles.content}>
          <Text style={[
            styles.title,
            completed && styles.completedTitle,
          ]}>
            {title}
          </Text>
          <Text style={styles.course}>{course}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.dueDate}>{dueDate}</Text>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor() + '20' },
        ]}>
          <Text style={[
            styles.priorityText,
            { color: getPriorityColor() },
          ]}>
            {priority.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  priorityIndicator: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  course: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
  },
});