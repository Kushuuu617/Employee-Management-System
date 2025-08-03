import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CameraScreenProps {
  onCapture: () => void;
  onCancel: () => void;
}

export function CameraScreen({ onCapture, onCancel }: CameraScreenProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    
    // Simulate camera capture and processing
    setTimeout(() => {
      setIsCapturing(false);
      onCapture(); // This will trigger punch completion and go back to main screen
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>📷 Camera Capture</CardTitle>
          <p className="text-muted-foreground">Take a photo for attendance</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mock Camera Viewfinder */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            {isCapturing ? (
              <div className="text-center space-y-2">
                <div className="animate-spin text-2xl">📸</div>
                <p>Processing...</p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-4xl">📱</div>
                <p className="text-sm text-muted-foreground">Camera Preview</p>
                <p className="text-xs text-muted-foreground">
                  (Simulated for web demo)
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1"
              disabled={isCapturing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCapture} 
              className="flex-1"
              disabled={isCapturing}
            >
              {isCapturing ? 'Capturing...' : '📸 Capture'}
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            Photo will be automatically uploaded with GPS location
          </p>
        </CardContent>
      </Card>
    </div>
  );
}