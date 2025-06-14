import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useSupabase } from '../../providers/SupabaseProvider';
import ClassModal, { ClassItem } from '../../components/ClassModal';
import { format, parseISO } from 'date-fns';

interface ClassWithCourse extends ClassItem {
  course_name?: string;
  color: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const buildCourseMap = (courseList: {id: string, name: string}[]) => {
  return courseList.reduce((acc, course) => {
    acc[course.id] = course.name;
    return acc;
  }, {} as Record<string, string>);
};

export default function Classes() {
  const { userId } = useAuth();
  const { supabase } = useSupabase();

  const [classes, setClasses] = useState<ClassWithCourse[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const fetchCoursesAndClasses = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);
    try {
      // Fetch courses first
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id,name')
        .eq('user_id', userId);
      
      if (courseError) throw courseError;
      setCourses(courseData || []);
      const courseMap = buildCourseMap(courseData || []);

      // Then fetch classes
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (classError) throw classError;

      const list = (classData || []).map((item, idx) => ({
        ...item,
        course_name: courseMap[item.course_id] || '-',
        color: COLORS[idx % COLORS.length],
      }));
      setClasses(list);

    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (supabase && userId) {
      fetchCoursesAndClasses();
    }
  }, [userId, supabase]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCoursesAndClasses();
  }, [fetchCoursesAndClasses]);

  const openAdd = () => {
    setSelectedClass(null);
    setModalVisible(true);
  };

  const openEdit = (cl: ClassItem) => {
    setSelectedClass(cl);
    setModalVisible(true);
  };

  const deleteClass = (id: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!supabase) return;
          const { error } = await supabase.from('classes').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else fetchCoursesAndClasses();
        },
      },
    ]);
  };

  const handleSubmit = async (cls: ClassItem) => {
    if (!supabase) return;
    try {
      // Remove UI-only props if they exist
      const { color, course_name, ...dbClass } = cls as any;

      if (dbClass.id) {
        const { error } = await supabase
          .from('classes')
          .update({ ...dbClass })
          .eq('id', dbClass.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('classes')
          .insert({ ...dbClass, user_id: userId });
        if (error) throw error;
      }
      fetchCoursesAndClasses();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleJoinClass = async (link?: string) => {
    if (!link) {
      return Alert.alert('Invalid Link', 'This class does not have a valid meeting link.');
    }
    const canOpen = await Linking.canOpenURL(link);
    if (canOpen) {
      Linking.openURL(link);
    } else {
      Alert.alert('Invalid Link', 'Cannot open this URL.');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#6366f1" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Classes</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Feather name="plus" size={20} color="#fff" /><Text style={styles.addTxt}>Add Class</Text>
          </TouchableOpacity>
        </View>
        {classes.length === 0 ? (
          <View style={styles.empty}><Text>No classes yet</Text></View>
        ): (
          classes.map(item => (
            <View key={item.id} style={[styles.card]}> 
              <View style={styles.rowBetween}>
                <View style={[styles.iconWrap,{backgroundColor:item.color}]}> 
                  <Feather name={item.is_online?'video':'map-pin'} size={20} color="#fff" />
                </View>
                <View style={{flex:1,marginLeft:12}}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.professor}</Text>
                  <View style={styles.badge}><Text style={styles.badgeTxt}>{item.is_online?'Online':'In-Person'}</Text></View>
                </View>
                <TouchableOpacity onPress={()=>openEdit(item)} style={styles.iconBtn}><Feather name="edit" size={16} color="#64748b"/></TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteClass(item.id!)} style={styles.iconBtn}><Feather name="trash-2" size={16} color="#ef4444"/></TouchableOpacity>
              </View>
              <View style={styles.infoRow}><Feather name="book-open" size={14} color="#64748b"/><Text style={styles.infoTxt}>{item.course_name||'—'}</Text></View>
              <View style={styles.infoRow}><Feather name="calendar" size={14} color="#64748b"/><Text style={styles.infoTxt}>{format(parseISO(item.date), 'MMMM dd, yyyy')}</Text></View>
              <View style={styles.infoRow}><Feather name="clock" size={14} color="#64748b"/><Text style={styles.infoTxt}>{item.start_time}{item.end_time?` - ${item.end_time}`:''}</Text></View>
              {!item.is_online && item.classroom && (
                <View style={styles.infoRow}><Feather name="map" size={14} color="#64748b"/><Text style={styles.infoTxt}>{item.classroom}</Text></View>
              )}
              {item.is_online && item.meeting_link && (
                <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoinClass(item.meeting_link)}>
                  <Feather name="external-link" size={16} color="#fff"/><Text style={styles.joinTxt}>Join Class</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
      <ClassModal
        isVisible={modalVisible}
        onClose={()=>setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={selectedClass}
        courses={courses}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#f8fafc'},
  content:{flex:1,paddingHorizontal:20,paddingTop:20},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  header:{fontFamily:'Inter-Bold',fontSize:24,color:'#1e293b'},
  addBtn:{backgroundColor:'#6366f1',flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:10,borderRadius:12,gap:8},
  addTxt:{fontFamily:'Inter-SemiBold',color:'#fff',fontSize:14},
  empty:{alignItems:'center',marginTop:40},
  card:{backgroundColor:'#fff',borderRadius:16,padding:20,marginBottom:16,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:8,elevation:2},
  rowBetween:{flexDirection:'row',alignItems:'center'},
  iconWrap:{width:40,height:40,borderRadius:20,justifyContent:'center',alignItems:'center'},
  iconBtn:{width:32,height:32,borderRadius:8,backgroundColor:'#f8fafc',justifyContent:'center',alignItems:'center',marginLeft:8,borderWidth:1,borderColor:'#e2e8f0'},
  title:{fontFamily:'Inter-SemiBold',fontSize:16,color:'#1e293b'},
  subtitle:{fontFamily:'Inter-Regular',fontSize:14,color:'#64748b'},
  badge:{backgroundColor:'#f1f5f9',borderRadius:8,paddingHorizontal:8,paddingVertical:4,marginTop:4,alignSelf:'flex-start'},
  badgeTxt:{fontFamily:'Inter-Bold',fontSize:10,color:'#64748b'},
  infoRow:{flexDirection:'row',alignItems:'center',gap:6,marginTop:6},
  infoTxt:{fontFamily:'Inter-Regular',fontSize:14,color:'#475569'},
  joinBtn:{backgroundColor:'#6366f1',flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingVertical:10,borderRadius:10,marginTop:12},
  joinTxt:{color:'#fff',fontFamily:'Inter-SemiBold'},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
}); 