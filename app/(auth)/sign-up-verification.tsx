import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const SignUpVerification = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [code, setCode] = useState('');

    const onPress = async () => {
        if (!isLoaded) {
          return;
        }
    
        try {
          const completeSignUp = await signUp.attemptEmailAddressVerification({
            code,
          });
          
          await setActive({ session: completeSignUp.createdSessionId });
          
        } catch (err: any) {
          Alert.alert(err.errors[0].message);
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
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>Enter the code sent to your email address</Text>

                <TextInput 
                    value={code} 
                    placeholder="Verification Code" 
                    placeholderTextColor="#9ca3af"
                    style={styles.inputField} 
                    onChangeText={setCode} 
                    keyboardType="numeric"
                />
                
                <TouchableOpacity style={styles.verifyButton} onPress={onPress}>
                    <Text style={styles.verifyButtonText}>Verify Email</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    )
}

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
        textAlign: 'center',
      },
      verifyButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 16,
      },
      verifyButtonText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
        color: '#ffffff',
      },
});

export default SignUpVerification; 