import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PunchScreen } from './components/PunchScreen';
import { CameraScreen } from './components/CameraScreen';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from './components/ui/sonner';
import DatabaseService from './services/DatabaseService';
import { PhotoData } from './services/CameraService';

type Screen = 'login' | 'punch' | 'camera' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [dbService] = useState(() => DatabaseService.getInstance());

  useEffect(() => {
    // Check if user is already logged in
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await dbService.getAuthToken();
      const currentEmployeeId = await dbService.getCurrentEmployeeId();
      
      if (token && currentEmployeeId) {
        // Verify employee still exists
        const employees = await dbService.getEmployees();
        const employee = employees.find(emp => emp.id === currentEmployeeId);
        
        if (employee) {
          setAuthToken(token);
          setUserName(employee.name);
          setEmployeeId(currentEmployeeId);
          setCurrentScreen('punch');
        } else {
          // Employee not found, clear auth
          await dbService.clearAuth();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = (token: string, name: string, empId: string) => {
    setAuthToken(token);
    setUserName(name);
    setEmployeeId(empId);
    setCurrentScreen('punch');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserName('');
    setEmployeeId('');
    setCurrentScreen('login');
  };

  const handleAdminAccess = () => {
    setCurrentScreen('admin');
  };

  const handleBackToApp = () => {
    setCurrentScreen('login');
  };

  const handleCameraCapture = () => {
    setCurrentScreen('camera');
  };

  const handlePhotoCapture = (photoData: PhotoData) => {
    // Complete the punch with photo data
    if ((window as any).completePunch) {
      (window as any).completePunch(photoData);
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
        <LoginScreen 
          onLogin={handleLogin} 
          onAdminAccess={handleAdminAccess}
        />
      )}
      
      {currentScreen === 'punch' && authToken && employeeId && (
        <PunchScreen 
          userName={userName} 
          employeeId={employeeId}
          onCameraCapture={handleCameraCapture}
          onLogout={handleLogout}
        />
      )}
      
      {currentScreen === 'camera' && (
        <CameraScreen 
          onCapture={handlePhotoCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminPanel onBack={handleBackToApp} />
      )}
      
      <Toaster />
    </div>
  );
}