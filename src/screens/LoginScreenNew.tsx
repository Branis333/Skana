import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<any, 'Login'>;
};

const API_BASE_URL = 'https://brainink-backend.onrender.com';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: '',
        fname: '',
        lname: '',
    });
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleInputChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = () => {
        if (!form.username.trim() || !form.password.trim()) {
            Alert.alert('Validation Error', 'Username and password are required');
            return false;
        }

        if (!isLogin) {
            if (!form.email.trim() || !form.fname.trim() || !form.lname.trim()) {
                Alert.alert('Validation Error', 'All fields are required for registration');
                return false;
            }
            if (form.password.length < 6) {
                Alert.alert('Validation Error', 'Password must be at least 6 characters');
                return false;
            }
        }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            console.log('🔐 Attempting login...');
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: form.username,
                    password: form.password,
                }),
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                console.log('✅ Login successful');
                console.log('Response data:', data); let userData;

                // The encrypted_data is actually encrypted and needs a decryption key
                // For now, use the user data directly from the token or fallback to form data
                if (data.user) {
                    // If user data is provided directly
                    userData = {
                        id: data.user.id,
                        username: data.user.username,
                        email: data.user.email,
                        fname: data.user.fname,
                        lname: data.user.lname,
                    };
                } else {
                    // Fallback to form data for now since encrypted_data requires decryption
                    userData = {
                        id: data.id || 1, // Use ID from response or default
                        username: form.username,
                        email: data.email || '',
                        fname: data.fname || '',
                        lname: data.lname || '',
                    };
                }

                login(data.access_token, userData);
                navigation.navigate('RoleSelection');
            } else {
                Alert.alert('Login Failed', data.detail || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error instanceof SyntaxError) {
                Alert.alert('Error', 'Invalid response from server. Please try again.');
            } else if (error.message?.includes('Network')) {
                Alert.alert('Network Error', 'Please check your internet connection and try again.');
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            console.log('📝 Attempting registration...');
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fname: form.fname,
                    lname: form.lname,
                    username: form.username,
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                console.log('✅ Registration successful');
                console.log('Response data:', data); let userData;

                // The encrypted_data is actually encrypted and needs a decryption key
                // For now, use the user data directly from the token or fallback to form data
                if (data.user) {
                    // If user data is provided directly
                    userData = {
                        id: data.user.id,
                        username: data.user.username,
                        email: data.user.email,
                        fname: data.user.fname,
                        lname: data.user.lname,
                    };
                } else {
                    // Fallback to form data for now since encrypted_data requires decryption
                    userData = {
                        id: data.id || 1, // Use ID from response or default
                        username: form.username,
                        email: form.email,
                        fname: form.fname,
                        lname: form.lname,
                    };
                }

                login(data.access_token, userData);
                navigation.navigate('RoleSelection');
            } else {
                Alert.alert('Registration Failed', data.detail || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));

            if (error instanceof SyntaxError) {
                Alert.alert('Error', 'Invalid response from server. Please try again.');
            } else if (error.message?.includes('Network')) {
                Alert.alert('Network Error', 'Please check your internet connection and try again.');
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isLogin) {
            handleLogin();
        } else {
            handleSignUp();
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>BrainInk School</Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Welcome back!' : 'Create your account'}
                    </Text>
                </View>

                <View style={styles.form}>
                    {!isLogin && (
                        <>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>First Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.fname}
                                        onChangeText={(value) => handleInputChange('fname', value)}
                                        placeholder="First name"
                                        autoCapitalize="words"
                                    />
                                </View>
                                <View style={[styles.inputGroup, styles.halfWidth]}>
                                    <Text style={styles.label}>Last Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.lname}
                                        onChangeText={(value) => handleInputChange('lname', value)}
                                        placeholder="Last name"
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={form.username}
                            onChangeText={(value) => handleInputChange('username', value)}
                            placeholder="Enter username or email"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={form.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                placeholder="Enter your password"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                {isLogin ? 'Login' : 'Create Account'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() => setIsLogin(!isLogin)}
                    >
                        <Text style={styles.switchText}>
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Login'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        marginBottom: 20,
    },
    halfWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    eyeButton: {
        padding: 12,
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    switchButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    switchText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
    },
});
