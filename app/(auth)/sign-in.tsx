import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Text, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) {
      return;
    }
    setError(''); // Clear previous errors

    try {
      const completeSignIn = await signIn.create({
        identifier,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'An unexpected error occurred.';
      setError(errorMessage);
    }
  };

  return (
    <LinearGradient
        colors={['#e0e7ff', '#c7d2fe', '#818cf8']}
        style={styles.container}
    >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#1e293b" />
        </TouchableOpacity>

        <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
            
            <TextInput 
                autoCapitalize="none" 
                placeholder="Email or Username" 
                placeholderTextColor="#9ca3af"
                value={identifier} 
                onChangeText={setIdentifier} 
                style={styles.inputField}
            />
            <TextInput 
                placeholder="Password" 
                placeholderTextColor="#9ca3af"
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                style={styles.inputField}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
                <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <Link href="/(auth)/sign-up" asChild>
                    <Pressable>
                    <Text style={styles.footerLink}>Sign Up</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      },
      backButton: {
          position: 'absolute',
          top: 60,
          left: 20,
          padding: 8,
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderRadius: 16,
      },
      formContainer: {
        width: '100%',
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 24,
      },
      title: {
          fontFamily: 'Inter-Bold',
          fontSize: 28,
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: 8,
      },
      subtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 24,
      },
      inputField: {
        fontFamily: 'Inter-Medium',
        marginVertical: 8,
        height: 55,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#fff',
        fontSize: 16,
      },
      errorText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
      },
      signInButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 16,
      },
      signInButtonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#ffffff',
      },
      footer: {
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 24,
      },
      footerText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#475569',
      },
      footerLink: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
        color: '#6366f1',
      }
});

export default SignIn; 