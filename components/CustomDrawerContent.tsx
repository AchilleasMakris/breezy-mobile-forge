import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function CustomDrawerContent(props: any) {
  const { signOut } = useAuth();
  const { user } = useUser();
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.imageUrl }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.emailAddresses[0].emailAddress}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => signOut()}>
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={[styles.footerButtonText, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#1e293b',
  },
  email: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
}); 