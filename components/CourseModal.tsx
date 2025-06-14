import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Lazy import ActionSheetIOS only on iOS to avoid web undefined
let ActionSheetIOS: typeof import('react-native').ActionSheetIOS | undefined;
if (Platform.OS === 'ios') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ActionSheetIOS = require('react-native').ActionSheetIOS;
}

export interface Course {
    id?: string;
    name: string;
    code?: string;
    professor?: string;
    credits?: number;
    grade?: number;
    semester?: string;
    year?: string;
    user_id?: string;
  }

interface CourseModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
  initialData?: Course | null;
}

const CourseModal: React.FC<CourseModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [course, setCourse] = useState<Course>({
    name: '',
    code: '',
    credits: undefined,
    professor: '',
    grade: undefined,
    semester: 'Fall',
    year: new Date().getFullYear().toString(),
  });

  const [errors, setErrors] = useState<{[K in keyof Course]?: string}>({});

  useEffect(() => {
    if (initialData) {
      setCourse({
        ...initialData,
        credits: initialData.credits ?? undefined,
        grade: initialData.grade ?? undefined,
        year: initialData.year ?? new Date().getFullYear().toString(),
      });
    } else {
      setCourse({
        name: '',
        code: '',
        credits: undefined,
        professor: '',
        grade: undefined,
        semester: 'Fall',
        year: new Date().getFullYear().toString(),
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof Course, value: string | number) => {
    setCourse((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: {[K in keyof Course]?: string} = {};
    const requiredFields: (keyof Course)[] = ['name','code','professor','credits','semester','year'];
    requiredFields.forEach((field)=>{
      const value = (course as any)[field];
      if(value===undefined||value===null||value===''){
        newErrors[field] = 'Required';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length===0;
  };

  const handleSubmit = () => {
    if(!validate()){
      return;
    }
    onSubmit(course);
    onClose();
  };

  const academicYears = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return `${year}-${year + 1}`;
  });

  // iOS native picker via ActionSheet
  const openPickerIOS = (
    currentValue: string,
    options: string[],
    onSelect: (val: string) => void
  ) => {
    if (Platform.OS !== 'ios' || !ActionSheetIOS) return;
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options, 'Cancel'],
        cancelButtonIndex: options.length,
        title: 'Select',
      },
      (buttonIndex) => {
        if (buttonIndex !== undefined && buttonIndex < options.length) {
          onSelect(options[buttonIndex]);
        }
      }
    );
  };

  const renderError = (field:keyof Course) => errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text>:null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {initialData ? 'Edit Course' : 'Add New Course'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {initialData ? 'Update the details of your course.' : 'Add a new course to your academic schedule.'}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Course Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Introduction to Computer Science"
                value={course.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
              {renderError('name')}

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Course Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., CS101"
                    value={course.code}
                    onChangeText={(text) => handleInputChange('code', text)}
                  />
                  {renderError('code')}
                </View>
                <View style={styles.half}>
                    <Text style={styles.label}>ECTS</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 6"
                        value={course.credits?.toString() ?? ''}
                        onChangeText={(text) => handleInputChange('credits', Number(text))}
                        keyboardType="numeric"
                    />
                    {renderError('credits')}
                </View>
              </View>

              <Text style={styles.label}>Professor</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Dr. Smith"
                value={course.professor}
                onChangeText={(text) => handleInputChange('professor', text)}
              />
              {renderError('professor')}

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Grade (0-10)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 8.5"
                    value={course.grade?.toString() ?? ''}
                    onChangeText={(text) => handleInputChange('grade', Number(text))}
                    keyboardType="decimal-pad"
                  />
                  {renderError('grade')}
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>Semester</Text>
                  {Platform.OS === 'ios' ? (
                    <TouchableOpacity
                      style={styles.pickerIOS}
                      onPress={() =>
                        openPickerIOS(
                          course.semester || 'Fall',
                          ['Fall', 'Spring', 'Summer', 'Full Year'],
                          (val) => handleInputChange('semester', val)
                        )
                      }
                    >
                      <Text style={styles.pickerIOSText}>{course.semester}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={course.semester}
                        onValueChange={(itemValue) => handleInputChange('semester', itemValue)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Fall" value="Fall" />
                        <Picker.Item label="Spring" value="Spring" />
                        <Picker.Item label="Summer" value="Summer" />
                        <Picker.Item label="Full Year" value="Full Year" />
                      </Picker>
                    </View>
                  )}
                  {renderError('semester')}
                </View>
              </View>

              <Text style={styles.label}>Academic Year</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity
                  style={styles.pickerIOS}
                  onPress={() =>
                    openPickerIOS(
                      course.year || academicYears[5],
                      academicYears,
                      (val) => handleInputChange('year', val)
                    )
                  }
                >
                  <Text style={styles.pickerIOSText}>{course.year}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={course.year}
                    onValueChange={(itemValue) => handleInputChange('year', itemValue)}
                    style={styles.picker}
                  >
                    {academicYears.map((year) => (
                      <Picker.Item key={year} label={year} value={year} />
                    ))}
                  </Picker>
                </View>
              )}
              {renderError('year')}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {initialData ? 'Update Course' : 'Add Course'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      height: '90%',
      backgroundColor: '#f8fafc',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
    },
    title: {
      fontFamily: 'Inter-Bold',
      fontSize: 22,
      color: '#1e293b',
    },
    closeButton: {
        padding: 4,
    },
    subtitle: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: '#64748b',
      marginTop: 16,
      marginBottom: 24,
    },
    form: {
      flex: 1,
    },
    label: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 14,
      color: '#334155',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: '#1e293b',
      marginBottom: 20,
    },
    row: {
      flexDirection: 'row',
      gap: 16,
    },
    half: {
      flex: 1,
    },
    pickerContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        marginBottom: 20,
        justifyContent: 'center',
    },
    picker: {
        height: 55,
        // The styling for the picker itself is limited on Android/iOS
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      gap: 12,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
    },
    cancelButton: {
      backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: '#475569',
    },
    submitButton: {
      backgroundColor: '#6366f1',
    },
    submitButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: '#ffffff',
    },
    errorText: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      color: 'red',
      marginTop: 4,
    },
    pickerIOS: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#cbd5e1',
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 55,
      justifyContent: 'center',
      marginBottom: 20,
    },
    pickerIOSText: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      color: '#1e293b',
    },
  });
  
  export default CourseModal; 