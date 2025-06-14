import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Text, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const SignUp = () => {
    const { isLoaded, signUp } = useSignUp();
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [agree, setAgree] = useState(false);
    const [error, setError] = useState('');
  
    const onSignUpPress = async () => {
      if (!isLoaded) {
        return;
      }
      setError(''); // Clear previous errors

      if (!agree) {
          setError('Please agree to the Terms of Service and Privacy Policy.');
          return;
      }
  
      try {
        await signUp.create({
          firstName,
          lastName,
          username,
          emailAddress,
          password,
        });
        
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

        router.push('/(auth)/sign-up-verification');
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
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>Start your journey with us today</Text>

                <TextInput
                    autoCapitalize="words"
                    placeholder="First Name"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.inputField}
                />
                <TextInput
                    autoCapitalize="words"
                    placeholder="Last Name"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.inputField}
                />
                <TextInput
                    autoCapitalize="none"
                    placeholder="Username"
                    placeholderTextColor="#9ca3af"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.inputField}
                />
                <TextInput 
                    autoCapitalize="none" 
                    placeholder="Email Address" 
                    placeholderTextColor="#9ca3af"
                    value={emailAddress} 
                    onChangeText={setEmailAddress} 
                    style={styles.inputField}
                    keyboardType="email-address"
                />
                <TextInput 
                    placeholder="Password" 
                    placeholderTextColor="#9ca3af"
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    style={styles.inputField}
                />

                <View style={styles.agreeContainer}>
                    <TouchableOpacity onPress={() => setAgree(!agree)} style={styles.checkbox}>
                        {agree && <Feather name="check" size={18} color="#6366f1" />}
                    </TouchableOpacity>
                    <Text style={styles.agreeText}>
                        I agree to the{' '}
                        <Text style={styles.linkText}>Terms of Service</Text> and{' '}
                        <Text style={styles.linkText}>Privacy Policy</Text>.
                    </Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
    
                <TouchableOpacity style={styles.signUpButton} onPress={onSignUpPress}>
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link href="/(auth)/sign-in" asChild>
                        <Pressable>
                            <Text style={styles.footerLink}>Sign In</Text>
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
      agreeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        gap: 12,
      },
      checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#6366f1',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
      },
      agreeText: {
          flex: 1,
          fontFamily: 'Inter-Regular',
          fontSize: 14,
          color: '#475569',
          lineHeight: 20,
      },
      linkText: {
          fontFamily: 'Inter-SemiBold',
          color: '#6366f1',
          textDecorationLine: 'underline',
      },
      errorText: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: '#ef4444',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 8,
      },
      signUpButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 16,
      },
      signUpButtonText: {
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
  
  export default SignUp; 