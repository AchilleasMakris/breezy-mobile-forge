import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActivityChartProps {
  data: number[];
  labels: string[];
}

export default function ActivityChart({ data, labels }: ActivityChartProps) {
  const maxValue = Math.max(...data);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks Completed This Week</Text>
      
      <View style={styles.chart}>
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 120 : 0;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: height,
                      backgroundColor: value > 0 ? '#3b82f6' : '#e2e8f0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.label}>{labels[index]}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#1e293b',
  },
});