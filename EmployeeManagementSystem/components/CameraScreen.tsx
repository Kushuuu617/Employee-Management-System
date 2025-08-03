import { useState, useRef, useEffect } from 'react';
import { Camera, CameraType } from 'expo-camera';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import CameraService, { PhotoData } from '../services/CameraService';

interface CameraScreenProps {
  onCapture: (photoData: PhotoData) => void;
  onCancel: () => void;
}

export function CameraScreen({ onCapture, onCancel }: CameraScreenProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const cameraRef = useRef<Camera>(null);
  const [cameraService] = useState(() => CameraService.getInstance());

  useEffect(() => {
    (async () => {
      const status = await cameraService.requestPermissions();
      setHasPermission(status);
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) {
      toast.error('Camera not ready. Please try again.');
      return;
    }

    setIsCapturing(true);
    
    try {
      const photo = await cameraService.takePhoto(cameraRef);
      
      if (!photo) {
        toast.error('Failed to capture photo. Please try again.');
        return;
      }

      // Validate photo quality
      const validation = cameraService.validatePhotoQuality(photo);
      if (!validation.isValid) {
        toast.error(`Photo quality issues: ${validation.issues.join(', ')}`);
        return;
      }

      toast.success('Photo captured successfully!');
      onCapture(photo);
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const switchCamera = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin text-2xl mb-2">📷</div>
            <p>Requesting camera permission...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>📷 Camera Access Required</CardTitle>
            <p className="text-muted-foreground">
              This app needs camera access to capture attendance photos.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enable camera permissions in your device settings to continue.
            </p>
            <Button onClick={onCancel} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-screen">
        {/* Camera View */}
        <Camera
          ref={cameraRef}
          type={cameraType}
          className="flex-1"
          ratio="4:3"
        >
          {/* Camera Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* Top Controls */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="bg-black/50 text-white border-white/20"
              >
                ✕ Cancel
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                className="bg-black/50 text-white border-white/20"
              >
                🔄 Switch
              </Button>
            </div>

            {/* Center Guide */}
            <div className="flex-1 flex items-center justify-center">
              <div className="border-2 border-white/50 rounded-lg p-8">
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">📸</div>
                  <p className="text-sm">Position your face in the frame</p>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-center items-center space-x-4 pb-8">
              <Button
                onClick={handleCapture}
                disabled={isCapturing}
                className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/50 hover:bg-white/30"
              >
                {isCapturing ? (
                  <div className="animate-spin text-white">⏳</div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white"></div>
                )}
              </Button>
            </div>
          </div>
        </Camera>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4">
        <Card className="bg-black/80 text-white">
          <CardContent className="pt-4">
            <p className="text-sm text-center">
              📸 Take a clear photo of your face for attendance verification
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}