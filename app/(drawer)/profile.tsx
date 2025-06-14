import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

const NativeProfileScreen = () => {
    const { signOut } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const onSignOutPress = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error("Error signing out", err);
            Alert.alert("Sign Out Error", "Could not sign out, please try again.");
        }
    };

    const handleOpenProfileInBrowser = () => {
        // This URL should point to your app's user profile page configured in Clerk
        // This is a placeholder and will need to be configured in your Clerk dashboard
        // under "Paths" to be your production URL. For development, you can often
        // use the development server URL if it's accessible.
        // A more robust solution might involve getting this base URL from environment variables.
        const profileUrl = 'https://your-clerk-hosted-domain.clerk.accounts.dev/user';
        WebBrowser.openBrowserAsync(profileUrl);
    }

    const handleMenuItemPress = (feature: string) => {
        if (feature === 'Edit Profile') {
            router.push('/(drawer)/edit-profile');
        } else if (feature === 'Security Settings') {
            router.push('/(drawer)/security');
        } else {
            Alert.alert("Coming Soon", `${feature} functionality is not yet implemented.`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {user?.imageUrl && (
                    <Image
                        source={{ uri: user.imageUrl }}
                        style={styles.avatar}
                    />
                )}
                <Text style={styles.name}>{user?.fullName}</Text>
                <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
            </View>

            <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Edit Profile')}>
                    <Feather name="user" size={20} color="#475569" />
                    <Text style={styles.menuItemText}>Edit Profile</Text>
                    <Feather name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Security Settings')}>
                    <Feather name="shield" size={20} color="#475569" />
                    <Text style={styles.menuItemText}>Security</Text>
                    <Feather name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('Privacy Policy')}>
                    <Feather name="lock" size={20} color="#475569" />
                    <Text style={styles.menuItemText}>Privacy Policy</Text>
                    <Feather name="chevron-right" size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={onSignOutPress}>
                <Feather name="log-out" size={20} color="#ef4444" />
                <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}


export default function ProfileScreen() {
    if (Platform.OS === 'web') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { UserProfile } = require('@clerk/clerk-react');
        return (
          <View style={styles.webContainer}>
            <UserProfile path="/profile" routing="path" appearance={{ variables:{ colorPrimary:'#6366f1' } }} />
          </View>
        );
    }
    
    return <NativeProfileScreen />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    webContainer:{
      flex:1,
      alignItems:'stretch',
      paddingHorizontal:0,
      backgroundColor:'#ffffff'
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#e2e8f0',
    },
    name: {
        fontFamily: 'Inter-Bold',
        fontSize: 24,
        color: '#1e293b',
    },
    email: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    menuContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    menuItemText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#334155',
        marginLeft: 20,
        flex: 1,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        borderRadius: 16,
        paddingVertical: 18,
        marginTop: 40,
        gap: 12,
    },
    signOutButtonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#b91c1c',
    }
});