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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { Course } from './CourseModal'; // Re-use course type

// Lazy import ActionSheetIOS only on iOS
let ActionSheetIOS: typeof import('react-native').ActionSheetIOS | undefined;
if (Platform.OS === 'ios') {
  ActionSheetIOS = require('react-native').ActionSheetIOS;
}

export interface Task {
    id?: string;
    title: string;
    description?: string;
    due_date?: string; // YYYY-MM-DD
    due_time?: string; // HH:mm
    priority: 'Low' | 'Medium' | 'High';
    status: 'To Do' | 'In Progress' | 'Finished';
    course_id?: string;
    user_id?: string;
}

interface TaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (task: Task) => void;
  initialData?: Task | null;
  courses: Partial<Course>[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  initialData,
  courses,
}) => {
    const [task, setTask] = useState<Task>({
        title: '',
        description: '',
        priority: 'Low',
        status: 'To Do',
      });
      const [errors, setErrors] = useState<{[K in keyof Task]?: string}>({});
    
      const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
      const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTask(initialData);
    } else {
        // Reset to default for new task
        setTask({
            title: '',
            description: '',
            priority: 'Low',
            status: 'To Do',
          });
    }
  }, [initialData, isVisible]);

  const handleInputChange = (field: keyof Task, value: string | number) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const newErrors: {[K in keyof Task]?: string} = {};
    if (!task.title) newErrors.title = 'Task Title is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(task);
    }
  };

  const handleDateConfirm = (date: Date) => {
    handleInputChange('due_date', format(date, 'yyyy-MM-dd'));
    setDatePickerVisibility(false);
  };

  const handleTimeConfirm = (time: Date) => {
    handleInputChange('due_time', format(time, 'HH:mm'));
    setTimePickerVisibility(false);
  };

  const openPickerIOS = (
    options: string[],
    onSelect: (val: string) => void
  ) => {
    if (Platform.OS !== 'ios' || !ActionSheetIOS) return;
    ActionSheetIOS.showActionSheetWithOptions(
      { options: [...options, 'Cancel'], cancelButtonIndex: options.length },
      (buttonIndex) => {
        if (buttonIndex !== undefined && buttonIndex < options.length) {
          onSelect(options[buttonIndex]);
        }
      }
    );
  };

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
                {initialData ? 'Edit Task' : 'Add New Task'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>
              {initialData ? 'Update your task details.' : 'Fill in the details for your new task.'}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Complete Chapter 5 Reading"
                value={task.title}
                onChangeText={(text) => handleInputChange('title', text)}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add more details about the task..."
                value={task.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
              />

              <Text style={styles.label}>Due Date (Optional)</Text>
              <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.input}>
                  <Feather name="calendar" size={16} color="#64748b" style={{marginRight: 8}}/>
                  <Text style={{color: task.due_date ? '#1e293b' : '#9ca3af'}}>
                      {task.due_date ? format(new Date(task.due_date), 'MMMM do, yyyy') : 'Select a date'}
                  </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Due Time (Optional)</Text>
              <TouchableOpacity onPress={() => setTimePickerVisibility(true)} style={styles.input}>
                  <Feather name="clock" size={16} color="#64748b" style={{marginRight: 8}}/>
                  <Text style={{color: task.due_time ? '#1e293b' : '#9ca3af'}}>
                      {task.due_time ? format(new Date(`1970-01-01T${task.due_time}`), 'p') : 'Select a time'}
                  </Text>
              </TouchableOpacity>

              <Text style={styles.label}>Priority *</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.pickerIOS} onPress={() => openPickerIOS(['Low', 'Medium', 'High'], (val) => handleInputChange('priority', val))}>
                  <Text style={styles.pickerIOSText}>{task.priority}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={task.priority} onValueChange={(val) => handleInputChange('priority', val)}>
                    <Picker.Item label="Low" value="Low" />
                    <Picker.Item label="Medium" value="Medium" />
                    <Picker.Item label="High" value="High" />
                  </Picker>
                </View>
              )}

              <Text style={styles.label}>Status *</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.pickerIOS} onPress={() => openPickerIOS(['To Do', 'In Progress', 'Finished'], (val) => handleInputChange('status', val as Task['status']))}>
                  <Text style={styles.pickerIOSText}>{task.status}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={task.status} onValueChange={(val) => handleInputChange('status', val)}>
                    <Picker.Item label="To Do" value="To Do" />
                    <Picker.Item label="In Progress" value="In Progress" />
                    <Picker.Item label="Finished" value="Finished" />
                  </Picker>
                </View>
              )}

              <Text style={styles.label}>Course (Optional)</Text>
              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.pickerIOS} onPress={() => openPickerIOS(courses.map(c=>c.name!), (val) => {
                    const selectedCourse = courses.find(c => c.name === val);
                    if(selectedCourse) handleInputChange('course_id', selectedCourse.id!);
                })}>
                  <Text style={styles.pickerIOSText}>{courses.find(c=>c.id === task.course_id)?.name || 'Select a course'}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={task.course_id} onValueChange={(val) => handleInputChange('course_id', val)}>
                    <Picker.Item label="Select a course" value={undefined} />
                    {courses.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                  </Picker>
                </View>
              )}

            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisibility(false)}
      />
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleTimeConfirm}
        onCancel={() => setTimePickerVisibility(false)}
      />
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
        marginTop: 8,
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        justifyContent: 'center',
    },
    pickerIOS: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 55,
        justifyContent: 'center',
    },
    pickerIOSText: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#1e293b',
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
        backgroundColor: '#1e293b',
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
        marginTop: -4,
        marginBottom: 8,
    },
});

export default TaskModal; 