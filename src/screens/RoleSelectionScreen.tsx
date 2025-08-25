import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { schoolSelectionService, School as BackendSchool } from '../services/schoolSelectionService';

type RoleSelectionScreenProps = {
    navigation: NativeStackNavigationProp<any, 'RoleSelection'>;
};

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState<'loading' | 'school' | 'role' | 'email'>('loading');
    const [availableSchools, setAvailableSchools] = useState<BackendSchool[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<BackendSchool | null>(null);
    const [selectedRole, setSelectedRole] = useState<'teacher' | 'principal' | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, setSchoolAndRole, token } = useAuth();

    useEffect(() => {
        loadAvailableSchools();
    }, []);

    const loadAvailableSchools = async () => {
        try {
            setError('');
            console.log('📚 Loading available schools...');

            if (!token) {
                setError('Authentication required. Please login again.');
                return;
            }

            const schools = await schoolSelectionService.getAvailableSchools(token);
            console.log('✅ Schools loaded:', schools);

            if (schools && schools.length > 0) {
                setAvailableSchools(schools);
                setCurrentStep('school');
            } else {
                setError('No schools available for your account. Please contact your administrator.');
                setCurrentStep('school');
            }
        } catch (error) {
            console.error('Error loading schools:', error);
            setError('Unable to load schools. Please try again or contact support.');
            setCurrentStep('school');
        }
    };

    const handleSchoolSelect = (school: BackendSchool) => {
        setSelectedSchool(school);
        setCurrentStep('role');
    };

    const handleRoleSelect = (role: 'teacher' | 'principal') => {
        setSelectedRole(role);
        setCurrentStep('email');
        if (user?.email) {
            setUserEmail(user.email);
        }
    };

    const handleConfirmSelection = async () => {
        if (!selectedSchool || !selectedRole || !userEmail) {
            setError('Please complete all steps: select school, role, and enter your email');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!token) {
            setError('Authentication required. Please login again.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('📋 Confirming school and role selection...');

            let result;
            if (selectedRole === 'principal') {
                result = await schoolSelectionService.selectSchoolAsPrincipal(
                    selectedSchool.id,
                    userEmail,
                    token
                );
            } else {
                result = await schoolSelectionService.selectSchoolAsTeacher(
                    selectedSchool.id,
                    userEmail,
                    token
                );
            }

            if (result.success) {
                console.log('✅ School and role confirmed successfully');

                // Store the confirmed selection
                setSchoolAndRole(selectedSchool, selectedRole);

                // Navigate to image upload screen
                navigation.navigate('ImageUpload');
            } else {
                setError(result.message || 'Failed to confirm your selection. Please try again.');
            }
        } catch (error: any) {
            console.error('Error confirming selection:', error);
            setError(error.message || 'Failed to confirm your selection. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const roles = [
        {
            id: 'teacher' as const,
            title: 'Teacher',
            description: 'Manage classes, create assignments, and monitor student progress',
            icon: 'school' as const,
            color: '#10B981',
        },
        {
            id: 'principal' as const,
            title: 'Principal',
            description: 'Oversee school operations, manage teachers, and view analytics',
            icon: 'shield-checkmark' as const,
            color: '#8B5CF6',
        },
    ];

    const renderStepIndicator = () => {
        const steps = ['school', 'role', 'email'];
        const currentStepIndex = steps.indexOf(currentStep);

        return (
            <View style={styles.stepIndicator}>
                {steps.map((step, index) => (
                    <View key={step} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                index <= currentStepIndex && styles.stepCircleActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.stepNumber,
                                    index <= currentStepIndex && styles.stepNumberActive,
                                ]}
                            >
                                {index + 1}
                            </Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    index < currentStepIndex && styles.stepLineActive,
                                ]}
                            />
                        )}
                    </View>
                ))}
            </View>
        );
    };

    if (currentStep === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading available schools...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {currentStep === 'school' && 'Select Your School'}
                    {currentStep === 'role' && 'Choose Your Role'}
                    {currentStep === 'email' && 'Confirm Your Email'}
                </Text>
                <Text style={styles.subtitle}>
                    {currentStep === 'school' && 'Choose the school you belong to'}
                    {currentStep === 'role' && 'Select your role in the school'}
                    {currentStep === 'email' && 'Verify your email address'}
                </Text>
                {user && (
                    <Text style={styles.welcome}>Welcome, {user.fname} {user.lname}!</Text>
                )}
            </View>

            {/* Progress Indicator */}
            {renderStepIndicator()}

            {/* Error Message */}
            {error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={24} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            {/* School Selection */}
            {currentStep === 'school' && (
                <View style={styles.content}>
                    {availableSchools.map((school) => (
                        <TouchableOpacity
                            key={school.id}
                            style={styles.schoolCard}
                            onPress={() => handleSchoolSelect(school)}
                        >
                            <View style={styles.schoolIcon}>
                                <Ionicons name="school" size={32} color="#3B82F6" />
                            </View>
                            <View style={styles.schoolInfo}>
                                <Text style={styles.schoolName}>{school.name}</Text>
                                {school.address && (
                                    <Text style={styles.schoolLocation}>{school.address}</Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Role Selection */}
            {currentStep === 'role' && (
                <View style={styles.content}>
                    <View style={styles.selectedSchoolInfo}>
                        <Text style={styles.selectedSchoolText}>
                            Selected School: {selectedSchool?.name}
                        </Text>
                    </View>

                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            style={styles.roleCard}
                            onPress={() => handleRoleSelect(role.id)}
                        >
                            <View style={[styles.roleIcon, { backgroundColor: role.color + '20' }]}>
                                <Ionicons name={role.icon} size={32} color={role.color} />
                            </View>
                            <View style={styles.roleInfo}>
                                <Text style={styles.roleTitle}>{role.title}</Text>
                                <Text style={styles.roleDescription}>{role.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Email Confirmation */}
            {currentStep === 'email' && (
                <View style={styles.content}>
                    <View style={styles.confirmationInfo}>
                        <Text style={styles.confirmationTitle}>Confirm Your Selection</Text>
                        <View style={styles.selectionSummary}>
                            <Text style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>School: </Text>
                                {selectedSchool?.name}
                            </Text>
                            <Text style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Role: </Text>
                                {selectedRole}
                            </Text>
                        </View>
                    </View>

                    {/* Email Input */}
                    <View style={styles.emailSection}>
                        <Text style={styles.emailLabel}>Email Address</Text>
                        <TextInput
                            style={styles.emailInput}
                            value={userEmail}
                            onChangeText={setUserEmail}
                            placeholder="Enter your email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Text style={styles.emailHint}>
                            This email will be used to confirm your role at {selectedSchool?.name}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
                        onPress={handleConfirmSelection}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcome: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#3B82F6',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    stepLineActive: {
        backgroundColor: '#3B82F6',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        margin: 24,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        flex: 1,
        marginLeft: 12,
        color: '#EF4444',
        fontSize: 14,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    schoolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    schoolIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#EBF4FF',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    schoolInfo: {
        flex: 1,
    },
    schoolName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    schoolLocation: {
        fontSize: 14,
        color: '#6B7280',
    },
    selectedSchoolInfo: {
        backgroundColor: '#EBF4FF',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    selectedSchoolText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
        textAlign: 'center',
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roleIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    roleInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    roleDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
    confirmationInfo: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    confirmationTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    selectionSummary: {
        gap: 12,
    },
    summaryItem: {
        fontSize: 16,
        color: '#374151',
    },
    summaryLabel: {
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emailSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    emailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    emailInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    emailHint: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});
