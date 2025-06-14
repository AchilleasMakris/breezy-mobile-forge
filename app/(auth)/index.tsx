import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TaskCard from '../../components/TaskCard';
import ActivityChart from '../../components/ActivityChart';

export default function WelcomeScreen() {
    const router = useRouter();

  return (
    <LinearGradient
      colors={['#e0e7ff', '#c7d2fe', '#818cf8']}
      style={styles.container}
    >
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.artContainer}>
                <View style={[styles.card, styles.card1]}>
                    <TaskCard
                        title="CS10 EXAM PREP"
                        course="CS101"
                        dueDate="27 July 2025"
                        priority="high"
                    />
                </View>
                <View style={[styles.card, styles.card2]}>
                     <ActivityChart data={[5, 7, 6, 8, 9, 10, 8]} labels={['S', 'M', 'T', 'W', 'T', 'F', 'S']} />
                </View>
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>Your University Journey, Simplified</Text>
                <Text style={styles.subtitle}>
                    Intuitive, all-in-one academic planning at your fingertips, across all your devices.
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.signInButton]}
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        <Text style={[styles.buttonText, styles.signInButtonText]}>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.signUpButton]}
                        onPress={() => router.push('/(auth)/sign-up')}
                    >
                        <Text style={[styles.buttonText, styles.signUpButtonText]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'space-between',
    },
    artContainer: {
        height: '55%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    card1: {
        transform: [{ rotate: '-10deg' }, { translateX: -20 }, { translateY: 20 }],
        zIndex: 1,
        width: '80%'
    },
    card2: {
        transform: [{ rotate: '5deg' }, { translateX: 30 }, { translateY: -40 }],
        width: '85%'
    },
    contentContainer: {
        paddingHorizontal: 32,
        paddingBottom: 40,
    },
    title: {
        fontFamily: 'Inter-Bold',
        fontSize: 32,
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    buttonContainer: {
        gap: 16,
    },
    button: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    signInButton: {
        backgroundColor: '#6366f1',
    },
    signUpButton: {
        backgroundColor: '#f1f5f9',
    },
    buttonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
    signInButtonText: {
        color: '#ffffff',
    },
    signUpButtonText: {
        color: '#1e293b',
    },
}); 