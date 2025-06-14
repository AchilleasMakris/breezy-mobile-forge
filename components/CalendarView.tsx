import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth } from 'date-fns';
import { Event } from '../hooks/useSchedule';
import { LinearGradient } from 'expo-linear-gradient';

interface CalendarViewProps {
  events: Event[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarView({
  events,
  currentDate,
  onDateChange,
  selectedDate,
  onSelectedDateChange,
}: CalendarViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days from previous/next month
    const startingDayIndex = getDay(monthStart);
    const gridDays = [...Array(startingDayIndex).fill(null), ...days];

    const eventsByDate = React.useMemo(() => {
        return events.reduce((acc, event) => {
            const dateStr = format(event.date, 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(event);
            return acc;
        }, {} as Record<string, Event[]>);
    }, [events]);

  const renderDay = (day: Date | null, index: number) => {
    if (!day) {
        return <View style={styles.dayCell} key={index} />;
    }

    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateStr] || [];
    const isSelected = isSameDay(day, selectedDate);

    const content = (
        <>
            <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{format(day, 'd')}</Text>
            {dayEvents.length > 0 && (
                <View style={styles.dotsContainer}>
                    {dayEvents.slice(0, 2).map((event: Event) => (
                        <View key={event.id} style={[styles.dot, { backgroundColor: event.color }]} />
                    ))}
                </View>
            )}
        </>
    );

    return (
        <TouchableOpacity key={index} style={styles.dayCell} onPress={() => onSelectedDateChange(day)}>
            {isSelected ? (
                <LinearGradient colors={['#818cf8', '#6366f1']} style={styles.selectedDay}>
                    {content}
                </LinearGradient>
            ) : content}
        </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onDateChange(subMonths(currentDate, 1))}>
            <Feather name="chevron-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => onDateChange(addMonths(currentDate, 1))}>
            <Feather name="chevron-right" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((day, index) => <Text key={`${day}-${index}`} style={styles.weekdayText}>{day}</Text>)}
      </View>

      <View style={styles.grid}>
        {gridDays.map(renderDay)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 18,
        color: '#1e293b',
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    weekdayText: {
        fontFamily: 'Inter-Medium',
        fontSize: 12,
        color: '#94a3b8',
        width: 32,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#1e293b',
    },
    selectedDay: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDayText: {
        color: '#ffffff',
        fontFamily: 'Inter-Bold',
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 6,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginHorizontal: 1,
    }
}); 