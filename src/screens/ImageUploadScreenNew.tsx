import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
    TextInput,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ImageUploadScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ImageUpload'>;
};

const API_BASE_URL = 'https://brainink-backend.onrender.com';

// Interfaces based on backend response
interface Classroom {
    id: number;
    name: string;
    description?: string;
    capacity?: number;
    location?: string;
    school_id: number;
    teacher_id?: number;
    student_count?: number;
}

interface Subject {
    id: number;
    name: string;
    description?: string;
    school_id: number;
    created_date: string;
    is_active: boolean;
    teacher_count?: number;
    student_count?: number;
    students?: Student[];
}

interface Assignment {
    id: number;
    title: string;
    description?: string;
    subject_id: number;
    teacher_id: number;
    due_date?: string;
    max_points: number;
    assignment_type?: string;
    created_date: string;
    is_active: boolean;
    subject?: Subject;
    grade_count?: number;
    average_score?: number;
}

interface Student {
    id: number;
    user_id: number;
    username: string;
    fname: string;
    lname: string;
    email: string;
    classroom_id?: number;
    enrollment_date: string;
    is_active: boolean;
}

interface BulkUploadStudent {
    student_id: number;
    student_name: string;
    has_pdf: boolean;
    pdf_id?: number;
    image_count: number;
    generated_date?: string;
    is_graded: boolean;
}

export const ImageUploadScreen: React.FC<ImageUploadScreenProps> = ({ navigation }) => {
    // Selection state
    const [selectedClassroom, setSelectedClassroom] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedAssignment, setSelectedAssignment] = useState<string>('');
    const [selectedStudent, setSelectedStudent] = useState<string>('');

    // Data state
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

    // Upload state
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [imageDescription, setImageDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Loading states
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Modal states
    const [showClassroomModal, setShowClassroomModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [bulkUploadStudents, setBulkUploadStudents] = useState<BulkUploadStudent[]>([]);

    const { user, token, school, role, logout } = useAuth();

    useEffect(() => {
        loadClassrooms();
        requestPermissions();
    }, []);

    // Load subjects when classroom is selected
    useEffect(() => {
        if (selectedClassroom) {
            loadSubjects();
        } else {
            setSubjects([]);
            setSelectedSubject('');
            setAssignments([]);
            setSelectedAssignment('');
            setFilteredStudents([]);
            setSelectedStudent('');
        }
    }, [selectedClassroom]);

    // Load assignments when subject is selected
    useEffect(() => {
        if (selectedSubject) {
            loadAssignments();
        } else {
            setAssignments([]);
            setSelectedAssignment('');
        }
    }, [selectedSubject]);

    // Load students when classroom and subject are selected (following web frontend pattern)
    useEffect(() => {
        if (selectedClassroom && selectedSubject) {
            loadFilteredStudents();
        } else if (selectedSubject) {
            loadStudentsFromSubject();
        } else {
            setFilteredStudents([]);
            setSelectedStudent('');
        }
    }, [selectedClassroom, selectedSubject]);

    const makeAuthenticatedRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, isFormData: boolean = false) => {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        const headers: any = {
            'Authorization': `Bearer ${token}`,
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const config: any = {
            method,
            headers
        };

        if (body) {
            if (isFormData) {
                config.body = body;
            } else if (method !== 'GET') {
                config.body = JSON.stringify(body);
            }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
        }

        return response;
    };

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
            Alert.alert(
                'Permissions Required',
                'Camera and photo library permissions are required to upload images.',
                [{ text: 'OK' }]
            );
        }
    };

    const loadClassrooms = async () => {
        try {
            setLoadingClassrooms(true);
            console.log('🏫 Loading teacher classrooms...');

            const response = await makeAuthenticatedRequest('/study-area/classrooms/my-assigned');
            const classroomsData = await response.json();
            console.log('✅ Loaded classrooms:', classroomsData);

            setClassrooms(classroomsData);
        } catch (error) {
            console.error('❌ Failed to load classrooms:', error);
            Alert.alert('Error', 'Failed to load classrooms');
        } finally {
            setLoadingClassrooms(false);
        }
    };

    const loadSubjects = async () => {
        try {
            setLoadingSubjects(true);
            console.log('📚 Loading teacher subjects...');

            const response = await makeAuthenticatedRequest('/study-area/academic/teachers/my-subjects');
            const subjectsData = await response.json();
            console.log('✅ Loaded subjects:', subjectsData);

            setSubjects(subjectsData);
        } catch (error) {
            console.error('❌ Failed to load subjects:', error);
            Alert.alert('Error', 'Failed to load subjects');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadAssignments = async () => {
        try {
            setLoadingAssignments(true);
            console.log('� Loading assignments...');

            const response = await makeAuthenticatedRequest(`/study-area/academic/assignments/subject/${selectedSubject}`);
            const assignmentsData = await response.json();
            console.log('✅ Loaded assignments:', assignmentsData);

            setAssignments(assignmentsData);
        } catch (error) {
            console.error('❌ Failed to load assignments:', error);
            Alert.alert('Error', 'Failed to load assignments');
        } finally {
            setLoadingAssignments(false);
        }
    };

    const loadFilteredStudents = async () => {
        try {
            setLoadingStudents(true);
            console.log(`🏫 Getting classroom ${selectedClassroom} students...`);

            // Use the exact same endpoint pattern as teacherService.getClassroomStudents
            const response = await makeAuthenticatedRequest(`/study-area/classrooms/${selectedClassroom}/students`);
            const classroomData = await response.json();
            console.log('🔍 Raw classroom response:', JSON.stringify(classroomData, null, 2));

            // Handle different response formats - sometimes it's direct array, sometimes nested
            let classroomStudents = [];

            if (Array.isArray(classroomData)) {
                classroomStudents = classroomData;
                console.log('📋 Using direct array format');
            } else if (classroomData && Array.isArray(classroomData.students)) {
                classroomStudents = classroomData.students;
                console.log('📋 Using nested students array format');
            } else if (classroomData && classroomData.data && Array.isArray(classroomData.data)) {
                classroomStudents = classroomData.data;
                console.log('📋 Using nested data array format');
            } else {
                console.warn('⚠️ Unexpected classroom response format. Type:', typeof classroomData, 'Value:', classroomData);
                classroomStudents = [];
            }

            console.log('✅ Classroom students count:', classroomStudents.length);

            // Only try to map if we have an array
            if (!Array.isArray(classroomStudents)) {
                console.error('❌ classroomStudents is not an array:', typeof classroomStudents, classroomStudents);
                throw new Error('Invalid students data format from classroom endpoint');
            }

            // Transform the data to match our interface
            const transformedStudents = classroomStudents.map((student: any) => ({
                id: student.id || student.student_id,
                user_id: student.user_id || student.id,
                username: student.username || student.name || `${student.fname || ''} ${student.lname || ''}`.trim(),
                fname: student.fname || student.name?.split(' ')[0] || '',
                lname: student.lname || student.name?.split(' ').slice(1).join(' ') || '',
                email: student.email || student.user?.email || '',
                classroom_id: student.classroom_id || parseInt(selectedClassroom),
                enrollment_date: student.enrollment_date || new Date().toISOString(),
                is_active: student.is_active !== false
            }));

            setFilteredStudents(transformedStudents);
            setSelectedStudent(''); // Reset student selection

            if (transformedStudents.length === 0) {
                console.log('⚠️ No students found in classroom');
            } else {
                console.log('✅ Successfully loaded and transformed', transformedStudents.length, 'students');
            }
        } catch (error) {
            console.error('❌ Failed to get classroom students:', error);
            console.error('❌ Error details:', error.message);
            // Fallback to subject-only students if classroom fails
            if (selectedSubject) {
                console.log('🔄 Falling back to subject-only students...');
                loadStudentsFromSubject();
            } else {
                setFilteredStudents([]);
            }
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadStudentsFromSubject = async () => {
        try {
            setLoadingStudents(true);
            console.log(`👥 Loading students from subject ${selectedSubject}...`);

            // Get students enrolled in the selected subject (matching teacherClassroomService pattern)
            const response = await makeAuthenticatedRequest(`/study-area/academic/subjects/${selectedSubject}`);
            const subjectData = await response.json();
            console.log('✅ Loaded subject data:', subjectData);

            // Extract students from the subject response
            const studentsData = subjectData.students || [];
            console.log('✅ Subject students count:', studentsData.length);

            // Transform the data to match our interface - handle the format from subject endpoint
            const transformedStudents = studentsData.map((student: any) => ({
                id: student.id,
                user_id: student.user_id || student.id,
                username: student.username || student.name || `${student.fname || ''} ${student.lname || ''}`.trim(),
                fname: student.fname || student.name?.split(' ')[0] || '',
                lname: student.lname || student.name?.split(' ').slice(1).join(' ') || '',
                email: student.email || student.user?.email || '',
                classroom_id: student.classroom_id,
                enrollment_date: student.enrollment_date || new Date().toISOString(),
                is_active: student.is_active !== false
            }));

            setFilteredStudents(transformedStudents);
            setSelectedStudent(''); // Reset student selection

            if (transformedStudents.length === 0) {
                console.log('⚠️ No students found in subject');
            }
        } catch (error) {
            console.error('❌ Failed to load subject students:', error);
            Alert.alert('Error', 'Failed to load students from subject');
        } finally {
            setLoadingStudents(false);
        }
    };

    const pickImages = async (source: 'camera' | 'gallery') => {
        try {
            let result;
            if (source === 'camera') {
                // For camera, we'll take one photo at a time but allow adding multiple
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: false, // Remove editing to allow bulk capture
                    quality: 0.8,
                });
            } else {
                // For gallery, allow multiple selection
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsMultipleSelection: true, // Enable multiple selection
                    quality: 0.8,
                    selectionLimit: 10, // Limit to 10 images at once for performance
                });
            }

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setSelectedImages(prev => [...prev, ...newImages]);

                // Show feedback about how many images were added
                const count = result.assets.length;
                Alert.alert(
                    'Images Added',
                    `${count} image${count > 1 ? 's' : ''} added successfully. Total: ${selectedImages.length + count}`
                );
            }
        } catch (error) {
            console.error('Error picking images:', error);
            Alert.alert('Error', 'Failed to pick images. Please try again.');
        }
    };

    const showImagePicker = () => {
        Alert.alert(
            'Add Images',
            'Choose how you want to add images to your bulk upload',
            [
                {
                    text: 'Camera (Take Photo)',
                    onPress: () => pickImages('camera')
                },
                {
                    text: 'Gallery (Select Multiple)',
                    onPress: () => pickImages('gallery')
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const uploadImages = async () => {
        // Clear previous messages and validate inputs (matching web frontend pattern)
        if (selectedImages.length === 0) {
            Alert.alert('Error', 'Please select files to upload');
            return;
        }

        if (!selectedStudent) {
            Alert.alert('Error', 'Please select a student');
            return;
        }

        if (!selectedAssignment) {
            Alert.alert('Error', 'Assignment not found');
            return;
        }

        // Validate that all files are images (matching web frontend validation)
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        // For React Native, we'll assume all selected images are valid since they come from ImagePicker

        try {
            setIsUploading(true);
            console.log('� Starting bulk upload process...');

            // Get authentication token
            if (!token) {
                throw new Error('Authentication required');
            }

            // Create FormData for bulk upload (matching web frontend exactly)
            const formData = new FormData();
            formData.append('assignment_id', selectedAssignment);
            formData.append('student_id', selectedStudent);

            // Add all selected files (matching web frontend pattern)
            selectedImages.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `image_${index}.jpg`;
                formData.append('files', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: filename,
                } as any);
            });

            console.log('📤 Uploading', selectedImages.length, 'files for student:', selectedStudent);

            // Call the exact same bulk upload endpoint as web frontend using existing auth method
            const response = await makeAuthenticatedRequest(
                '/study-area/bulk-upload-to-pdf',
                'POST',
                formData,
                true
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Bulk upload failed: ${response.status} - ${errorText}`);
            }

            console.log('✅ Bulk upload successful!');

            // Reset form (matching web frontend)
            setSelectedImages([]);
            setImageDescription('');

            // Success message (matching web frontend pattern)
            const student = filteredStudents.find(s => s.id.toString() === selectedStudent);
            const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
            Alert.alert('Success', `Successfully uploaded ${selectedImages.length} files for ${student?.fname} ${student?.lname} - ${assignment?.title}`);

            // Clear the selected images after successful upload
            setSelectedImages([]);
            setImageDescription('');

        } catch (error) {
            console.error('❌ Bulk upload failed:', error);
            Alert.alert('Error', error instanceof Error ? error.message : 'Bulk upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    onPress: () => {
                        logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    },
                },
            ]
        );
    };

    const getSelectedClassroomName = () => {
        const classroom = classrooms.find(c => c.id.toString() === selectedClassroom);
        return classroom ? classroom.name : 'Select a classroom';
    };

    const getSelectedSubjectName = () => {
        const subject = subjects.find(s => s.id.toString() === selectedSubject);
        return subject ? subject.name : 'Select a subject';
    };

    const getSelectedAssignmentName = () => {
        const assignment = assignments.find(a => a.id.toString() === selectedAssignment);
        return assignment ? assignment.title : 'Select an assignment';
    };

    const getSelectedStudentName = () => {
        const student = filteredStudents.find(s => s.id.toString() === selectedStudent);
        return student ? `${student.fname} ${student.lname}` : 'Select a student';
    };

    const renderSelectionModal = (
        visible: boolean,
        onClose: () => void,
        title: string,
        data: any[],
        selectedValue: string,
        onSelect: (value: string) => void,
        nameKey: string,
        loading: boolean = false
    ) => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={data}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        onSelect(item.id.toString());
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item[nameKey]}</Text>
                                    {selectedValue === item.id.toString() && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={styles.modalList}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );



    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Assignment Upload</Text>
                        <Text style={styles.headerSubtitle}>Upload student assignment images</Text>
                        {user && (
                            <Text style={styles.welcomeText}>Welcome, {user.fname || 'Teacher'}</Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Selection Flow */}
            <View style={styles.selectionSection}>
                <Text style={styles.sectionTitle}>Selection Flow</Text>

                {/* Step 1: Classroom Selection */}
                <View style={styles.stepContainer}>
                    <Text style={styles.stepTitle}>1. Select Classroom</Text>
                    <TouchableOpacity
                        style={styles.selector}
                        onPress={() => setShowClassroomModal(true)}
                        disabled={loadingClassrooms}
                    >
                        <Text style={styles.selectorText}>{getSelectedClassroomName()}</Text>
                        {loadingClassrooms ? (
                            <ActivityIndicator size="small" color="#3B82F6" />
                        ) : (
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Step 2: Subject Selection */}
                {selectedClassroom && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>2. Select Subject</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowSubjectModal(true)}
                            disabled={loadingSubjects}
                        >
                            <Text style={styles.selectorText}>{getSelectedSubjectName()}</Text>
                            {loadingSubjects ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3: Assignment Selection */}
                {selectedSubject && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>3. Select Assignment</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowAssignmentModal(true)}
                            disabled={loadingAssignments}
                        >
                            <Text style={styles.selectorText}>{getSelectedAssignmentName()}</Text>
                            {loadingAssignments ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 4: Student Selection */}
                {selectedAssignment && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>4. Select Student</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowStudentModal(true)}
                            disabled={loadingStudents}
                        >
                            <Text style={styles.selectorText}>{getSelectedStudentName()}</Text>
                            {loadingStudents ? (
                                <ActivityIndicator size="small" color="#3B82F6" />
                            ) : (
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Upload Section */}
            {selectedStudent && (
                <View style={styles.uploadSection}>
                    <Text style={styles.sectionTitle}>Upload Images</Text>

                    {/* Image Selection */}
                    <TouchableOpacity
                        style={styles.imagePicker}
                        onPress={showImagePicker}
                    >
                        <Ionicons name="images" size={48} color="#9CA3AF" />
                        <Text style={styles.imagePickerText}>
                            {selectedImages.length > 0
                                ? `${selectedImages.length} image(s) selected`
                                : 'Tap to add images (bulk upload)'
                            }
                        </Text>
                        <Text style={styles.imagePickerSubtext}>
                            {selectedImages.length > 0
                                ? 'Tap to add more images'
                                : 'Camera (single) or Gallery (multiple)'
                            }
                        </Text>
                    </TouchableOpacity>

                    {/* Selected Images Preview */}
                    {selectedImages.length > 0 && (
                        <View style={styles.imagePreviewContainer}>
                            <View style={styles.previewHeader}>
                                <Text style={styles.inputLabel}>Selected Images ({selectedImages.length})</Text>
                                <TouchableOpacity
                                    style={styles.addMoreButton}
                                    onPress={showImagePicker}
                                >
                                    <Ionicons name="add-circle" size={20} color="#3B82F6" />
                                    <Text style={styles.addMoreText}>Add More</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                                {selectedImages.map((uri, index) => (
                                    <View key={index} style={styles.imagePreviewItem}>
                                        <Image source={{ uri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Description Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description (Optional)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Add a description for this assignment..."
                            value={imageDescription}
                            onChangeText={setImageDescription}
                            multiline
                        />
                    </View>

                    {/* Upload Button */}
                    <TouchableOpacity
                        style={[
                            styles.uploadButton,
                            (isUploading || selectedImages.length === 0) && styles.uploadButtonDisabled
                        ]}
                        onPress={uploadImages}
                        disabled={isUploading || selectedImages.length === 0}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                        )}
                        <Text style={styles.uploadButtonText}>
                            {isUploading ? 'Uploading...' : 'Upload Images'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Bulk Upload Status */}
            {selectedAssignment && bulkUploadStudents.length > 0 && (
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Student Upload Status</Text>
                    {bulkUploadStudents.map((student) => (
                        <View key={student.student_id} style={styles.studentStatusItem}>
                            <View style={styles.studentInfo}>
                                <Text style={styles.studentName}>{student.student_name}</Text>
                                <Text style={styles.studentStatus}>
                                    {student.has_pdf ? `PDF Generated (${student.image_count} images)` : 'No upload'}
                                </Text>
                            </View>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: student.has_pdf ? '#10B981' : '#6B7280' }
                            ]} />
                        </View>
                    ))}
                </View>
            )}

            {/* Selection Modals */}
            {renderSelectionModal(
                showClassroomModal,
                () => setShowClassroomModal(false),
                'Select Classroom',
                classrooms,
                selectedClassroom,
                setSelectedClassroom,
                'name',
                loadingClassrooms
            )}

            {renderSelectionModal(
                showSubjectModal,
                () => setShowSubjectModal(false),
                'Select Subject',
                subjects,
                selectedSubject,
                setSelectedSubject,
                'name',
                loadingSubjects
            )}

            {renderSelectionModal(
                showAssignmentModal,
                () => setShowAssignmentModal(false),
                'Select Assignment',
                assignments,
                selectedAssignment,
                setSelectedAssignment,
                'title',
                loadingAssignments
            )}

            {renderSelectionModal(
                showStudentModal,
                () => setShowStudentModal(false),
                'Select Student',
                filteredStudents,
                selectedStudent,
                setSelectedStudent,
                'username',
                loadingStudents
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    welcomeText: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
        marginTop: 4,
    },
    logoutButton: {
        padding: 8,
    },
    selectionSection: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 16,
    },
    stepContainer: {
        marginBottom: 16,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    selector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FFFFFF',
    },
    selectorText: {
        fontSize: 16,
        color: '#1F2937',
        flex: 1,
    },
    uploadSection: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    imagePicker: {
        height: 120,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
    },
    imagePickerText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 8,
        fontWeight: '500',
    },
    imagePickerSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    imagePreviewContainer: {
        marginBottom: 16,
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#EBF4FF',
        borderRadius: 6,
        gap: 4,
    },
    addMoreText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    imagePreviewScroll: {
        marginTop: 8,
    },
    imagePreviewItem: {
        position: 'relative',
        marginRight: 12,
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        height: 80,
        textAlignVertical: 'top',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        gap: 8,
    },
    uploadButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statusSection: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    studentStatusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    studentStatus: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '80%',
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    modalList: {
        maxHeight: 300,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalItemText: {
        fontSize: 16,
        color: '#374151',
        flex: 1,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
});

export default ImageUploadScreen;
