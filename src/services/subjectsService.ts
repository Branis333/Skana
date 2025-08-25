/**
 * Subjects Service for React Native
 * Handles subjects and image upload operations
 */

const BACKEND_URL = 'https://brainink-backend.onrender.com';

export interface Subject {
    id: number;
    name: string;
    description?: string;
    school_id: number;
    created_date: string;
    is_active: boolean;
}

export interface UploadedImage {
    id: number;
    filename: string;
    original_filename: string;
    description?: string;
    tags?: string;
    subject_name?: string;
    upload_date: string;
    file_path?: string;
    file_size?: number;
    mime_type?: string;
    uploaded_by?: number;
    is_active?: boolean;
}

export interface ImageListResponse {
    images: UploadedImage[];
    total_count: number;
    page: number;
    per_page: number;
    total_pages: number;
}

export interface ImageUploadResponse {
    success: boolean;
    message: string;
    image?: UploadedImage;
    error?: string;
}

class SubjectsService {
    private async makeAuthenticatedRequest(
        endpoint: string,
        token: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: any,
        isFormData: boolean = false
    ): Promise<Response> {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        const headers: HeadersInit = {
            'Authorization': `Bearer ${token}`,
        };

        // Only set Content-Type for JSON requests, not FormData
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const config: RequestInit = {
            method,
            headers
        };

        if (body) {
            if (isFormData) {
                config.body = body; // FormData object
            } else if (method !== 'GET') {
                config.body = JSON.stringify(body);
            }
        }

        const response = await fetch(`${BACKEND_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
        }

        return response;
    }

    /**
     * Get all subjects for the current teacher
     */
    async getMySubjects(token: string): Promise<Subject[]> {
        try {
            const response = await this.makeAuthenticatedRequest(
                '/study-area/academic/teachers/my-subjects',
                token
            );

            return await response.json();
        } catch (error) {
            console.error('Error getting subjects:', error);
            throw error;
        }
    }

    /**
     * Get all uploaded images for the current user
     */
    async getMyImages(token: string, page: number = 1, perPage: number = 20): Promise<ImageListResponse> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `/study-area/images-management/my-images?page=${page}&per_page=${perPage}`,
                token
            );

            return await response.json();
        } catch (error) {
            console.error('Error getting my images:', error);
            throw error;
        }
    }

    /**
     * Upload a new image
     */
    async uploadImage(
        token: string,
        imageUri: string,
        fileName: string,
        subjectId: number,
        description?: string,
        tags?: string
    ): Promise<ImageUploadResponse> {
        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Add the image file
            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: fileName,
            } as any);

            // Add other fields
            formData.append('subject_id', subjectId.toString());

            if (description) {
                formData.append('description', description);
            }

            if (tags) {
                formData.append('tags', tags);
            }

            const response = await this.makeAuthenticatedRequest(
                '/study-area/images-management/upload',
                token,
                'POST',
                formData,
                true // isFormData
            );

            return await response.json();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Get a specific image by ID
     */
    async getImage(token: string, imageId: number): Promise<UploadedImage> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `/study-area/images-management/${imageId}`,
                token
            );

            return await response.json();
        } catch (error) {
            console.error('Error getting image:', error);
            throw error;
        }
    }

    /**
     * Update image metadata
     */
    async updateImage(
        token: string,
        imageId: number,
        description?: string,
        tags?: string,
        subjectId?: number
    ): Promise<UploadedImage> {
        try {
            const formData = new FormData();

            if (description !== undefined) {
                formData.append('description', description);
            }

            if (tags !== undefined) {
                formData.append('tags', tags);
            }

            if (subjectId !== undefined) {
                formData.append('subject_id', subjectId.toString());
            }

            const response = await this.makeAuthenticatedRequest(
                `/study-area/images-management/${imageId}`,
                token,
                'PUT',
                formData,
                true // isFormData
            );

            return await response.json();
        } catch (error) {
            console.error('Error updating image:', error);
            throw error;
        }
    }

    /**
     * Delete an image
     */
    async deleteImage(token: string, imageId: number): Promise<boolean> {
        try {
            await this.makeAuthenticatedRequest(
                `/study-area/images-management/${imageId}`,
                token,
                'DELETE'
            );

            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    /**
     * Get images for a specific subject
     */
    async getSubjectImages(token: string, subjectId: number, page: number = 1, perPage: number = 20): Promise<ImageListResponse> {
        try {
            const response = await this.makeAuthenticatedRequest(
                `/study-area/images-management/subject/${subjectId}/images?page=${page}&per_page=${perPage}`,
                token
            );

            return await response.json();
        } catch (error) {
            console.error('Error getting subject images:', error);
            throw error;
        }
    }
}

export const subjectsService = new SubjectsService();
