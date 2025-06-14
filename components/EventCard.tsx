import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ClassItem } from './ClassModal';
import { Task } from './TaskModal';
import { Event } from '../hooks/useSchedule';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
    const isClass = event.type === 'class';
    const item = event.data;

    let time = '';
    if (isClass && 'start_time' in item) {
        time = item.start_time;
        if (item.end_time) {
            time += ` - ${item.end_time}`;
        }
    } else if (!isClass && 'due_time' in item && item.due_time) {
        time = format(new Date(`1970-01-01T${item.due_time}`), 'p');
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, { borderLeftColor: event.color }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${event.color}20`}]}>
                    <Feather name={isClass ? 'book-open' : 'check-square'} size={18} color={event.color} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
                    {event.courseName && (
                        <Text style={styles.courseName}>{event.courseName}</Text>
                    )}
                </View>
            </View>
            <View style={styles.details}>
                {time ? (
                    <View style={styles.detailItem}>
                        <Feather name="clock" size={14} color="#64748b" />
                        <Text style={styles.detailText}>{time}</Text>
                    </View>
                ) : null}
                 {!isClass && 'status' in item && (
                    <View style={[styles.statusBadge, {
                        backgroundColor: item.status === 'Finished' ? '#dcfce7' : '#ffedd5'
                    }]}>
                        <Text style={[styles.statusText, {
                            color: item.status === 'Finished' ? '#166534' : '#9a3412'
                        }]}>{item.status}</Text>
                    </View>
                 )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#1e293b',
    },
    courseName: {
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        color: '#64748b',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: '#f1f5f9'
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: '#475569',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 12,
    }
}); 