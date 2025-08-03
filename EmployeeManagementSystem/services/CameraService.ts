import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export interface PhotoData {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  timestamp: number;
}

class CameraService {
  private static instance: CameraService;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaPermission = await MediaLibrary.requestPermissionsAsync();
      
      return cameraPermission.status === 'granted' && mediaPermission.status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  async takePhoto(cameraRef: React.RefObject<Camera>): Promise<PhotoData | null> {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera not ready');
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false,
      });

      const photoData: PhotoData = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        base64: photo.base64,
        timestamp: Date.now(),
      };

      // Save to media library
      try {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      } catch (saveError) {
        console.warn('Could not save photo to library:', saveError);
      }

      return photoData;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  async getCameraStatus(): Promise<{
    hasPermission: boolean;
    isAvailable: boolean;
  }> {
    try {
      const hasPermission = await this.requestPermissions();
      const isAvailable = Camera.isAvailableAsync();
      
      return {
        hasPermission,
        isAvailable: await isAvailable,
      };
    } catch (error) {
      console.error('Error getting camera status:', error);
      return {
        hasPermission: false,
        isAvailable: false,
      };
    }
  }

  validatePhotoQuality(photo: PhotoData): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check minimum dimensions
    if (photo.width < 640 || photo.height < 480) {
      issues.push('Photo resolution too low');
    }
    
    // Check file size (if base64 is available)
    if (photo.base64) {
      const sizeInBytes = (photo.base64.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 5) {
        issues.push('Photo file size too large');
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  async compressPhoto(photo: PhotoData): Promise<PhotoData> {
    // For now, return the original photo
    // In a real implementation, you might want to compress the image
    return photo;
  }
}

export default CameraService; 