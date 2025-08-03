import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PunchScreen } from './components/PunchScreen';
import { CameraScreen } from './components/CameraScreen';
import { Toaster } from './components/ui/sonner';

type Screen = 'login' | 'punch' | 'camera';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const savedUserName = localStorage.getItem('userName');
    
    if (token && savedUserName) {
      setAuthToken(token);
      setUserName(savedUserName);
      setCurrentScreen('punch');
    }
  }, []);

  const handleLogin = (token: string, name: string) => {
    setAuthToken(token);
    setUserName(name);
    setCurrentScreen('punch');
  };

  const handleCameraCapture = () => {
    setCurrentScreen('camera');
  };

  const handlePhotoCapture = () => {
    // Complete the punch (this calls the function exposed by PunchScreen)
    if ((window as any).completePunch) {
      (window as any).completePunch();
    }
    
    // Go back to punch screen
    setCurrentScreen('punch');
  };

  const handleCameraCancel = () => {
    setCurrentScreen('punch');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}
      
      {currentScreen === 'punch' && authToken && (
        <PunchScreen 
          userName={userName} 
          onCameraCapture={handleCameraCapture}
        />
      )}
      
      {currentScreen === 'camera' && (
        <CameraScreen 
          onCapture={handlePhotoCapture}
          onCancel={handleCameraCancel}
        />
      )}
      
      <Toaster />
    </div>
  );
}