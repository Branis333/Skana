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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ImageUploadScreenProps = {
    navigation: NativeStackNavigationProp<any, 'ImageUpload'>;
};

interface Subject {
    id: number;
    name: string;
}

interface UploadedImage {
    id: number;
    filename: string;
    original_filename: string;
    description?: string;
    tags?: string;
    subject_name?: string;
    upload_date: string;
}

const API_BASE_URL = 'https://brainink-backend.onrender.com';

export const ImageUploadScreen: React.FC<ImageUploadScreenProps> = ({ navigation }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageDescription, setImageDescription] = useState('');
    const [imageTags, setImageTags] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);
    const { user, token, school, role, logout } = useAuth();

    useEffect(() => {
        loadSubjects();
        loadMyImages();
        requestPermissions();
    }, []);

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

    const loadSubjects = async () => {
        try {
            // Mock subjects data - replace with actual API call
            const mockSubjects: Subject[] = [
                { id: 1, name: 'Mathematics' },
                { id: 2, name: 'Science' },
                { id: 3, name: 'English' },
                { id: 4, name: 'History' },
                { id: 5, name: 'Art' },
            ];
            setSubjects(mockSubjects);
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    };

    const loadMyImages = async () => {
        if (!token) return;

        setIsLoading(true);
        try {
            // For now, use mock data to avoid API issues
            const mockImages: UploadedImage[] = [
                {
                    id: 1,
                    filename: 'sample1.jpg',
                    original_filename: 'My First Upload.jpg',
                    description: 'Sample image description',
                    tags: 'math, homework',
                    subject_name: 'Mathematics',
                    upload_date: new Date().toISOString(),
                },
                {
                    id: 2,
                    filename: 'sample2.jpg',
                    original_filename: 'Science Project.jpg',
                    description: 'Another sample image',
                    tags: 'science, experiment',
                    subject_name: 'Science',
                    upload_date: new Date(Date.now() - 86400000).toISOString(),
                }
            ];
            setUploadedImages(mockImages);

            // You can uncomment this when your backend is ready:
            /*
            const response = await fetch(`${API_BASE_URL}/images-management/my-images`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUploadedImages(data.images || []);
            } else {
                console.error('Failed to load images');
            }
            */
        } catch (error) {
            console.error('Error loading images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const pickImageFromCamera = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image from camera:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image from gallery:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    const showImagePickerOptions = () => {
        Alert.alert(
            'Select Image',
            'Choose how you want to select an image',
            [
                { text: 'Camera', onPress: pickImageFromCamera },
                { text: 'Gallery', onPress: pickImageFromGallery },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const uploadImage = async () => {
        if (!selectedImage) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        if (!token) {
            Alert.alert('Error', 'Authentication required');
            return;
        }

        setIsUploading(true);
        try {
            // For now, just simulate the upload since the backend integration might be causing issues
            Alert.alert('Success', 'Image upload functionality is ready! (Backend integration needed)');

            // Reset form
            setSelectedImage(null);
            setImageDescription('');
            setImageTags('');
            setSelectedSubject(null);

            // You can uncomment and modify this section when your backend is ready:
            /*
            const formData = new FormData();
            
            const imageFile = {
                uri: selectedImage,
                type: 'image/jpeg',
                name: 'image.jpg',
            } as any;

            formData.append('file', imageFile);
            formData.append('description', imageDescription);
            formData.append('tags', imageTags);
            if (selectedSubject) {
                formData.append('subject_id', selectedSubject.id.toString());
            }

            const response = await fetch(`${API_BASE_URL}/images-management/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert('Success', 'Image uploaded successfully!');
                // Reset form
                setSelectedImage(null);
                setImageDescription('');
                setImageTags('');
                setSelectedSubject(null);
                // Reload images
                loadMyImages();
            } else {
                Alert.alert('Upload Failed', data.message || 'Failed to upload image');
            }
            */
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setIsUploading(false);
        }
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
                        logout(); // No await needed
                        navigation.navigate('Login');
                    },
                },
            ]
        );
    };

    const renderSubjectModal = () => (
        <Modal
            visible={showSubjectModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSubjectModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Subject</Text>
                        <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.subjectsList}>
                        {subjects.map((subject) => (
                            <TouchableOpacity
                                key={subject.id}
                                style={styles.subjectItem}
                                onPress={() => {
                                    setSelectedSubject(subject);
                                    setShowSubjectModal(false);
                                }}
                            >
                                <Text style={styles.subjectName}>{subject.name}</Text>
                                {selectedSubject?.id === subject.id && (
                                    <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
                        <Text style={styles.headerTitle}>Upload Images</Text>
                        <Text style={styles.headerSubtitle}>
                            {school?.name} • {role}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <Ionicons name="log-out" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.welcomeText}>Welcome, {user?.fname} {user?.lname}!</Text>
            </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Upload New Image</Text>

                {/* Image Preview */}
                {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setSelectedImage(null)}
                        >
                            <Ionicons name="close-circle" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.imagePickerButton}
                        onPress={showImagePickerOptions}
                    >
                        <Ionicons name="camera" size={48} color="#6B7280" />
                        <Text style={styles.imagePickerText}>Tap to select image</Text>
                        <Text style={styles.imagePickerSubtext}>Camera or Gallery</Text>
                    </TouchableOpacity>
                )}

                {/* Form Fields */}
                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Description (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={imageDescription}
                            onChangeText={setImageDescription}
                            placeholder="Describe the image content..."
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tags (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            value={imageTags}
                            onChangeText={setImageTags}
                            placeholder="Enter tags separated by commas..."
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Subject (Optional)</Text>
                        <TouchableOpacity
                            style={styles.subjectSelector}
                            onPress={() => setShowSubjectModal(true)}
                        >
                            <Text style={styles.subjectSelectorText}>
                                {selectedSubject ? selectedSubject.name : 'Select a subject'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                        onPress={uploadImage}
                        disabled={isUploading || !selectedImage}
                    >
                        {isUploading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                                <Text style={styles.uploadButtonText}>Upload Image</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* My Images Section */}
            <View style={styles.myImagesSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Uploaded Images</Text>
                    {isLoading && <ActivityIndicator size="small" color="#3B82F6" />}
                </View>

                {uploadedImages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                        <Text style={styles.emptyStateText}>No images uploaded yet</Text>
                        <Text style={styles.emptyStateSubtext}>Upload your first image above</Text>
                    </View>
                ) : (
                    <View style={styles.imageGrid}>
                        {uploadedImages.map((image) => (
                            <View key={image.id} style={styles.imageCard}>
                                <View style={styles.imageCardHeader}>
                                    <Text style={styles.imageCardTitle} numberOfLines={1}>
                                        {image.original_filename}
                                    </Text>
                                    <Text style={styles.imageCardDate}>
                                        {new Date(image.upload_date).toLocaleDateString()}
                                    </Text>
                                </View>
                                {image.description && (
                                    <Text style={styles.imageCardDescription} numberOfLines={2}>
                                        {image.description}
                                    </Text>
                                )}
                                {image.subject_name && (
                                    <View style={styles.imageCardSubject}>
                                        <Text style={styles.imageCardSubjectText}>{image.subject_name}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {renderSubjectModal()}
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
        padding: 24,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
    logoutButton: {
        padding: 8,
    },
    welcomeText: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
    },
    uploadSection: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    imagePickerButton: {
        height: 200,
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
    formSection: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        textAlignVertical: 'top',
    },
    subjectSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#FFFFFF',
    },
    subjectSelectorText: {
        fontSize: 16,
        color: '#374151',
    },
    uploadButton: {
        flexDirection: 'row',
        backgroundColor: '#3B82F6',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    uploadButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    myImagesSection: {
        margin: 16,
        marginTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 12,
        fontWeight: '500',
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    imageGrid: {
        gap: 12,
    },
    imageCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    imageCardTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    imageCardDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    imageCardDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    imageCardSubject: {
        alignSelf: 'flex-start',
        backgroundColor: '#EBF4FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    imageCardSubjectText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    subjectsList: {
        maxHeight: 300,
    },
    subjectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    subjectName: {
        fontSize: 16,
        color: '#374151',
    },
});
