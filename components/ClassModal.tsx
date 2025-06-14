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

// ActionSheetIOS lazy import
let ActionSheetIOS: typeof import('react-native').ActionSheetIOS | undefined;
if (Platform.OS === 'ios') ActionSheetIOS = require('react-native').ActionSheetIOS;

export interface ClassItem {
  id?: string;
  title: string;
  meeting_link?: string;
  classroom?: string;
  professor: string;
  course_id?: string;
  date: string; // ISO date string e.g. 2025-06-05
  start_time: string; // HH:mm a
  end_time?: string;
  is_online: boolean;
}

const URL_REGEX = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: ClassItem) => void;
  initialData?: ClassItem | null;
  courses: { id: string; name: string }[]; // for dropdown
}

export default function ClassModal({ isVisible, onClose, onSubmit, initialData, courses }: Props) {
  const [form, setForm] = useState<ClassItem>({
    title: '',
    professor: '',
    meeting_link: '',
    classroom: '',
    course_id: courses[0]?.id,
    date: new Date().toISOString().substring(0, 10),
    start_time: '08:00 AM',
    end_time: '',
    is_online: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({
        title: '',
        professor: '',
        meeting_link: '',
        classroom: '',
        course_id: courses[0]?.id,
        date: new Date().toISOString().substring(0, 10),
        start_time: '08:00 AM',
        end_time: '',
        is_online: true,
    })
  }, [initialData, isVisible, courses]);

  const onChange = (field: keyof ClassItem, value: any) => setForm({ ...form, [field]: value });

  const validate = () => {
    const req = ['title', 'professor', 'course_id', 'date', 'start_time'] as (keyof ClassItem)[];
    if (form.is_online) req.push('meeting_link'); else req.push('classroom');
    const newErr: Record<string, string> = {};
    req.forEach(f => { const v = (form as any)[f]; if (!v) newErr[f] = 'Required'; });
    if(form.is_online && form.meeting_link && !URL_REGEX.test(form.meeting_link)){
        newErr.meeting_link = 'Please enter a valid URL.'
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const submit = () => { if (validate()) { onSubmit(form); onClose(); } };

  // helper to open iOS picker sheet
  const openSheet = (options: string[], current: string, cb: (val:string)=>void) => {
    if (Platform.OS !== 'ios' || !ActionSheetIOS) return;
    ActionSheetIOS.showActionSheetWithOptions({ options: [...options,'Cancel'], cancelButtonIndex: options.length }, i=>{ if(i!==undefined&&i<options.length) cb(options[i]); });
  };

  const handleDateConfirm = (selectedDate: Date) => {
    onChange('date', format(selectedDate, 'yyyy-MM-dd'));
    setShowDatePicker(false);
  };

  const handleTimeConfirm = (field: 'start_time' | 'end_time') => (selectedDate: Date) => {
    onChange(field, format(selectedDate, 'hh:mm a'));
    field === 'start_time' ? setShowStartPicker(false) : setShowEndPicker(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}><Text style={styles.title}>{initialData?'Edit':'Add'} Class</Text><TouchableOpacity onPress={onClose}><Feather name="x" size={24} color="#64748b"/></TouchableOpacity></View>
          <ScrollView>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Online Class</Text>
              <TouchableOpacity onPress={()=>onChange('is_online', !form.is_online)} style={styles.toggleTrack}>
                <View style={[styles.toggleThumb, form.is_online && { transform:[{ translateX:20 }], backgroundColor:'#10b981'}]} />
              </TouchableOpacity>
            </View>
            {/* Title */}
            <Text style={styles.label}>Class Name *</Text>
            <TextInput style={styles.input} value={form.title} onChangeText={t=>onChange('title',t)} placeholder="e.g., Weekly Study Session" />
            {errors.title && <Text style={styles.error}>{errors.title}</Text>}
            {/* Conditional fields */}
            {form.is_online ? (
              <>
                <Text style={styles.label}>Meeting Link *</Text>
                <TextInput style={styles.input} value={form.meeting_link} onChangeText={t=>onChange('meeting_link',t)} placeholder="https://zoom.us/j/123" keyboardType="url" autoCapitalize="none" />
                {errors.meeting_link && <Text style={styles.error}>{errors.meeting_link}</Text>}
              </>
            ): (
              <>
                <Text style={styles.label}>Classroom Number *</Text>
                <TextInput style={styles.input} value={form.classroom} onChangeText={t=>onChange('classroom',t)} placeholder="e.g., Room 204" />
                {errors.classroom && <Text style={styles.error}>{errors.classroom}</Text>}
              </>
            )}
            <Text style={styles.label}>Professor *</Text>
            <TextInput style={styles.input} value={form.professor} onChangeText={t=>onChange('professor',t)} placeholder="Dr. Smith" />
            {errors.professor && <Text style={styles.error}>{errors.professor}</Text>}
            {/* Course select */}
            <Text style={styles.label}>Course *</Text>
            {Platform.OS==='ios'? (
              <TouchableOpacity style={styles.pickerIOS} onPress={()=>openSheet(courses.map(c=>c.name), courses.find(c=>c.id===form.course_id)?.name||'', name=>{ const id=courses.find(c=>c.name===name)?.id; onChange('course_id', id);})}>
                <Text style={styles.pickerText}>{courses.find(c=>c.id===form.course_id)?.name || 'Select course'}</Text>
              </TouchableOpacity>
            ):(
              <View style={styles.pickerAndroid}>
                <Picker selectedValue={form.course_id} onValueChange={v=>onChange('course_id',v)}>
                  {courses.map(c=><Picker.Item key={c.id} label={c.name} value={c.id}/>)}</Picker>
                </View>
            )}
            {errors.course_id && <Text style={styles.error}>{errors.course_id}</Text>}
            {/* Date */}
            <Text style={styles.label}>Class Date *</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text>{format(new Date(form.date), 'MMMM dd, yyyy')}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={new Date(form.date)}
              onConfirm={handleDateConfirm}
              onCancel={() => setShowDatePicker(false)}
            />
            {errors.date && <Text style={styles.error}>{errors.date}</Text>}
            {/* Time pickers simplified */}
            <View style={styles.row}>
                <View style={styles.half}>
                    <Text style={styles.label}>Start Time *</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
                        <Text>{form.start_time}</Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={showStartPicker}
                      mode="time"
                      date={new Date()}
                      onConfirm={handleTimeConfirm('start_time')}
                      onCancel={() => setShowStartPicker(false)}
                    />
                    {errors.start_time && <Text style={styles.error}>{errors.start_time}</Text>}
                </View>
                <View style={styles.half}>
                    <Text style={styles.label}>End Time (Optional)</Text>
                    <TouchableOpacity style={styles.input} onPress={() => setShowEndPicker(true)}>
                        <Text>{form.end_time || 'Select time'}</Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={showEndPicker}
                      mode="time"
                      date={new Date()}
                      onConfirm={handleTimeConfirm('end_time')}
                      onCancel={() => setShowEndPicker(false)}
                    />
                </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.submitButton} onPress={submit}><Text style={styles.submitText}>{initialData?'Update':'Add'} Class</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'flex-end'},
  container:{height:'90%',backgroundColor:'#f8fafc',borderTopLeftRadius:24,borderTopRightRadius:24,padding:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  title:{fontFamily:'Inter-Bold',fontSize:20,color:'#1e293b'},
  label:{fontFamily:'Inter-SemiBold',fontSize:13,color:'#334155',marginBottom:6,marginTop:12},
  input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#cbd5e1',borderRadius:10,padding:12,fontFamily:'Inter-Regular', height: 48, justifyContent: 'center'},
  error:{color:'red',fontSize:12},
  switchRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},
  toggleTrack:{width:50,height:24,borderRadius:12,backgroundColor:'#e5e7eb',padding:2},
  toggleThumb:{width:20,height:20,borderRadius:10,backgroundColor:'#fff'},
  pickerAndroid:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:10,marginBottom:10},
  pickerIOS:{borderWidth:1,borderColor:'#cbd5e1',borderRadius:10,padding:14,backgroundColor:'#fff'},
  pickerText:{fontFamily:'Inter-Regular',fontSize:16,color:'#1e293b'},
  submitButton:{backgroundColor:'#6366f1',padding:16,borderRadius:12,alignItems:'center',marginTop:12},
  submitText:{fontFamily:'Inter-SemiBold',color:'#fff',fontSize:16},
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
}); 