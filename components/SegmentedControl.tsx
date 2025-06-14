import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentedControlProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export default function SegmentedControl({ options, selectedValue, onValueChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          style={[
            styles.segment,
            selectedValue === option && styles.activeSegment
          ]}
          onPress={() => onValueChange(option)}
        >
          <Text style={[
            styles.segmentText,
            selectedValue === option && styles.activeSegmentText
          ]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#475569',
  },
  activeSegmentText: {
    color: '#6366f1',
  },
}); 