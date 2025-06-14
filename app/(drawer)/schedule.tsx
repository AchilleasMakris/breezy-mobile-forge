import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSchedule, Event } from '../../hooks/useSchedule';
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, getDay, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import CalendarView from '../../components/CalendarView';
import EventCard from '../../components/EventCard';
import SegmentedControl from '../../components/SegmentedControl';
import { useAuth } from '@clerk/clerk-expo';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Schedule() {
  const { userId } = useAuth();
  const { events, loading, refresh } = useSchedule(userId);
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'Week' | 'Month'>('Week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const weeklyEvents = useMemo(() => {
    const today = new Date();
    const start = startOfDay(startOfWeek(today, { weekStartsOn: 1 })); // Monday
    const end = endOfDay(endOfWeek(today, { weekStartsOn: 1 }));
    return events.filter(e => isWithinInterval(e.date, { start, end }));
  }, [events]);
  
  const groupedWeeklyEvents = useMemo(() => {
    return weeklyEvents.reduce((acc, event) => {
        const day = DAYS[getDay(event.date)];
        if (!acc[day]) acc[day] = [];
        acc[day].push(event);
        return acc;
    }, {} as Record<string, Event[]>);
  }, [weeklyEvents]);

  const selectedDayEvents = useMemo(() => {
      return events.filter(e => isSameDay(e.date, selectedDate));
  }, [events, selectedDate]);

  const handleEventPress = (event: Event) => {
    // Navigate to the respective screen to show details or allow actions
    if (event.type === 'class') {
        router.push({ pathname: '/(drawer)/classes', params: { classId: event.id }});
    } else {
        router.push({ pathname: '/(drawer)/tasks', params: { taskId: event.id }});
    }
  }

  const renderEmptyState = (title: string) => (
    <View style={styles.emptyState}>
        <Feather name="calendar" size={48} color="#cbd5e1" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>There are no events scheduled.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
        <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Your Schedule</Text>
            </View>
            <SegmentedControl options={['Week', 'Month']} selectedValue={viewMode} onValueChange={(val) => setViewMode(val as any)} />
            
            {loading && !events.length ? (
                <ActivityIndicator size="large" color="#6366f1" />
            ) : viewMode === 'Week' ? (
                <>
                    {WEEK_DAYS.map(day => {
                        const dayEvents = groupedWeeklyEvents[day] || [];
                        return (
                            <View key={day} style={styles.daySection}>
                                <Text style={styles.dayTitle}>{day}</Text>
                                {dayEvents.length > 0 ? (
                                    dayEvents.map(event => <EventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />)
                                ) : (
                                    <View style={styles.emptyDayCard}>
                                        <Text style={styles.emptyDayText}>No events scheduled.</Text>
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </>
            ) : (
                <>
                    <CalendarView 
                        events={events}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        selectedDate={selectedDate}
                        onSelectedDateChange={setSelectedDate}
                    />
                    <Text style={styles.dayTitle}>{format(selectedDate, 'MMMM do')}</Text>
                    {selectedDayEvents.length > 0 ? (
                        selectedDayEvents.map(event => <EventCard key={event.id} event={event} onPress={() => handleEventPress(event)} />)
                    ) : renderEmptyState(`No events for ${format(selectedDate, 'MMMM do')}`)}
                </>
            )}
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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#1e293b',
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center'
  },
  emptyDayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDayText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#94a3b8'
  }
});