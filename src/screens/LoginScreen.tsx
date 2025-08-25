// import React, { useState } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     Alert,
//     ActivityIndicator,
//     ScrollView,
//     KeyboardAvoidingView,
//     Platform,
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { Ionicons } from '@expo/vector-icons';
// import { useAuth } from '../context/AuthContext';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// type LoginScreenProps = {
//     navigation: NativeStackNavigationProp<any, 'Login'>;
// };

// const API_BASE_URL = 'https://brainink-backend.onrender.com';

// export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
//     const [form, setForm] = useState({
//         username: '',
//         password: '',
//         email: '',
//         fname: '',
//         lname: '',
//     });
//     const [isLogin, setIsLogin] = useState(true);
//     const [showPassword, setShowPassword] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const { login } = useAuth();

//     const handleInputChange = (field: string, value: string) => {
//         setForm(prev => ({
//             ...prev,
//             [field]: value,
//         }));
//     };

//     const validateForm = () => {
//         if (isLogin) {
//             if (!form.username || !form.password) {
//                 Alert.alert('Error', 'Please fill in all fields');
//                 return false;
//             }
//         } else {
//             if (!form.fname || !form.lname || !form.username || !form.email || !form.password) {
//                 Alert.alert('Error', 'Please fill in all fields');
//                 return false;
//             }
//         }
//         return true;
//     };

//     const handleLogin = async () => {
//         if (!validateForm()) return;

//         setIsLoading(true);
//         try {
//             console.log('🔐 Attempting login...');
//             const response = await fetch(`${API_BASE_URL}/login`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     username: form.username,
//                     password: form.password,
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 console.log('✅ Login successful');

//                 // Decrypt user data (simplified - in real app you'd properly decrypt)
//                 const userData = {
//                     id: Math.floor(Math.random() * 1000), // This would come from decrypted data
//                     username: form.username,
//                     email: form.email || `${form.username}@example.com`,
//                     fname: 'User',
//                     lname: 'Name',
//                 };

//                 login(data.access_token, userData); // No await needed
//                 navigation.navigate('RoleSelection');
//             } else {
//                 Alert.alert('Login Failed', data.detail || 'Invalid credentials');
//             }
//         } catch (error) {
//             console.error('Login error:', error);
//             Alert.alert('Error', 'Network error. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSignUp = async () => {
//         if (!validateForm()) return;

//         setIsLoading(true);
//         try {
//             console.log('📝 Attempting registration...');
//             const response = await fetch(`${API_BASE_URL}/register`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     fname: form.fname,
//                     lname: form.lname,
//                     username: form.username,
//                     email: form.email,
//                     password: form.password,
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 console.log('✅ Registration successful');

//                 const userData = {
//                     id: Math.floor(Math.random() * 1000),
//                     username: form.username,
//                     email: form.email,
//                     fname: form.fname,
//                     lname: form.lname,
//                 };

//                 login(data.access_token, userData); // No await needed
//                 navigation.navigate('RoleSelection');
//             } else {
//                 Alert.alert('Registration Failed', data.detail || 'Registration failed');
//             }
//         } catch (error) {
//             console.error('Registration error:', error);
//             Alert.alert('Error', 'Network error. Please try again.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleSubmit = () => {
//         if (isLogin) {
//             handleLogin();
//         } else {
//             handleSignUp();
//         }
//     };

//     return (
//         <KeyboardAvoidingView
//             style={styles.container}
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         >
//             <StatusBar style="auto" />
//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <View style={styles.logoContainer}>
//                         <Ionicons name="school" size={48} color="#3B82F6" />
//                     </View>
//                     <Text style={styles.title}>BrainInk School</Text>
//                     <Text style={styles.subtitle}>
//                         {isLogin ? 'Sign in to your account' : 'Create your account'}
//                     </Text>
//                 </View>

//                 {/* Form */}
//                 <View style={styles.formContainer}>
//                     {!isLogin && (
//                         <>
//                             <View style={styles.nameRow}>
//                                 <View style={styles.nameInput}>
//                                     <Text style={styles.label}>First Name</Text>
//                                     <TextInput
//                                         style={styles.input}
//                                         value={form.fname}
//                                         onChangeText={(value) => handleInputChange('fname', value)}
//                                         placeholder="Enter first name"
//                                         autoCapitalize="words"
//                                     />
//                                 </View>
//                                 <View style={styles.nameInput}>
//                                     <Text style={styles.label}>Last Name</Text>
//                                     <TextInput
//                                         style={styles.input}
//                                         value={form.lname}
//                                         onChangeText={(value) => handleInputChange('lname', value)}
//                                         placeholder="Enter last name"
//                                         autoCapitalize="words"
//                                     />
//                                 </View>
//                             </View>

//                             <View style={styles.inputGroup}>
//                                 <Text style={styles.label}>Email</Text>
//                                 <TextInput
//                                     style={styles.input}
//                                     value={form.email}
//                                     onChangeText={(value) => handleInputChange('email', value)}
//                                     placeholder="Enter your email"
//                                     keyboardType="email-address"
//                                     autoCapitalize="none"
//                                 />
//                             </View>
//                         </>
//                     )}

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Username</Text>
//                         <TextInput
//                             style={styles.input}
//                             value={form.username}
//                             onChangeText={(value) => handleInputChange('username', value)}
//                             placeholder="Enter username or email"
//                             autoCapitalize="none"
//                         />
//                     </View>

//                     <View style={styles.inputGroup}>
//                         <Text style={styles.label}>Password</Text>
//                         <View style={styles.passwordContainer}>
//                             <TextInput
//                                 style={styles.passwordInput}
//                                 value={form.password}
//                                 onChangeText={(value) => handleInputChange('password', value)}
//                                 placeholder="Enter your password"
//                                 secureTextEntry={!showPassword}
//                                 autoCapitalize="none"
//                             />
//                             <TouchableOpacity
//                                 style={styles.eyeButton}
//                                 onPress={() => setShowPassword(!showPassword)}
//                             >
//                                 <Ionicons
//                                     name={showPassword ? 'eye-off' : 'eye'}
//                                     size={20}
//                                     color="#6B7280"
//                                 />
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* Submit Button */}
//                     <TouchableOpacity
//                         style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
//                         onPress={handleSubmit}
//                         disabled={isLoading}
//                     >
//                         {isLoading ? (
//                             <ActivityIndicator color="#FFFFFF" />
//                         ) : (
//                             <Text style={styles.submitButtonText}>
//                                 {isLogin ? 'Sign In' : 'Create Account'}
//                             </Text>
//                         )}
//                     </TouchableOpacity>

//                     {/* Toggle Mode */}
//                     <View style={styles.toggleContainer}>
//                         <Text style={styles.toggleText}>
//                             {isLogin ? "Don't have an account? " : 'Already have an account? '}
//                         </Text>
//                         <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
//                             <Text style={styles.toggleLink}>
//                                 {isLogin ? 'Sign Up' : 'Sign In'}
//                             </Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </ScrollView>
//         </KeyboardAvoidingView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#F9FAFB',
//     },
//     scrollContent: {
//         flexGrow: 1,
//         padding: 20,
//         justifyContent: 'center',
//     },
//     header: {
//         alignItems: 'center',
//         marginBottom: 40,
//     },
//     logoContainer: {
//         width: 80,
//         height: 80,
//         backgroundColor: '#EBF4FF',
//         borderRadius: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: '#1F2937',
//         marginBottom: 8,
//     },
//     subtitle: {
//         fontSize: 16,
//         color: '#6B7280',
//         textAlign: 'center',
//     },
//     formContainer: {
//         backgroundColor: '#FFFFFF',
//         borderRadius: 16,
//         padding: 24,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.1,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     nameRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//     },
//     nameInput: {
//         flex: 1,
//         marginRight: 10,
//     },
//     inputGroup: {
//         marginBottom: 20,
//     },
//     label: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#374151',
//         marginBottom: 8,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#D1D5DB',
//         borderRadius: 8,
//         padding: 12,
//         fontSize: 16,
//         backgroundColor: '#FFFFFF',
//     },
//     passwordContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#D1D5DB',
//         borderRadius: 8,
//         backgroundColor: '#FFFFFF',
//     },
//     passwordInput: {
//         flex: 1,
//         padding: 12,
//         fontSize: 16,
//     },
//     eyeButton: {
//         padding: 12,
//     },
//     submitButton: {
//         backgroundColor: '#3B82F6',
//         borderRadius: 8,
//         padding: 16,
//         alignItems: 'center',
//         marginTop: 8,
//     },
//     submitButtonDisabled: {
//         backgroundColor: '#9CA3AF',
//     },
//     submitButtonText: {
//         color: '#FFFFFF',
//         fontSize: 16,
//         fontWeight: '600',
//     },
//     toggleContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: 24,
//     },
//     toggleText: {
//         color: '#6B7280',
//         fontSize: 14,
//     },
//     toggleLink: {
//         color: '#3B82F6',
//         fontSize: 14,
//         fontWeight: '600',
//     },
// });
