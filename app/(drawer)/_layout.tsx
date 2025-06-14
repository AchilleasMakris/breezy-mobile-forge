import { Drawer } from 'expo-router/drawer';
import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import CustomDrawerContent from '../../components/CustomDrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        drawerType: 'slide',
        drawerActiveTintColor: '#6366f1',
        drawerInactiveTintColor: '#1e293b',
        drawerActiveBackgroundColor: '#ede9fe',
        drawerLabelStyle: {
          fontFamily: 'Inter-SemiBold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={{ marginLeft: 16 }}
          >
            <Feather name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
          drawerIcon: ({ size, color }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="courses"
        options={{
          drawerLabel: 'Courses',
          title: 'Courses',
          drawerIcon: ({ size, color }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name="classes"
        options={{
          drawerLabel: 'Classes',
          title: 'Classes',
          drawerIcon: ({ size, color }) => (
            <Feather name="book" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="tasks"
        options={{
          drawerLabel: 'Tasks',
          title: 'Tasks',
          drawerIcon: ({ size, color }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="schedule"
        options={{
          drawerLabel: 'Schedule',
          title: 'Schedule',
          drawerIcon: ({ size, color }) => (
            <Feather name="calendar" size={size} color={color} />
          ),
        }}
      />
       <Drawer.Screen
        name="statistics"
        options={{
          drawerLabel: 'Statistics',
          title: 'Statistics',
          drawerIcon: ({ size, color }) => (
            <Feather name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
          drawerIcon: ({ size, color }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="edit-profile"
        options={{
            drawerItemStyle: { display: 'none' },
            title: 'Edit Profile'
        }}
      />
      <Drawer.Screen
        name="security"
        options={{
            drawerItemStyle: { display: 'none' },
            title: 'Security'
        }}
      />
    </Drawer>
  );
} 