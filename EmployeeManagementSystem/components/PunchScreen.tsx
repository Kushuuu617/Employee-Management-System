import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import DatabaseService, { AttendanceRecord } from '../services/DatabaseService';
import LocationService, { LocationData } from '../services/LocationService';
import { PhotoData } from '../services/CameraService';

interface PunchScreenProps {
  userName: string;
  employeeId: string;
  onCameraCapture: () => void;
  onLogout: () => void;
}

interface PunchStatus {
  isPunchedIn: boolean;
  lastPunchTime: string | null;
  lastPunchType: 'IN' | 'OUT' | null;
  todayRecords: AttendanceRecord[];
}

export function PunchScreen({ userName, employeeId, onCameraCapture, onLogout }: PunchScreenProps) {
  const [punchStatus, setPunchStatus] = useState<PunchStatus>({
    isPunchedIn: false,
    lastPunchTime: null,
    lastPunchType: null,
    todayRecords: []
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbService] = useState(() => DatabaseService.getInstance());
  const [locationService] = useState(() => LocationService.getInstance());

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load today's attendance records
    loadTodayAttendance();
    
    // Get current location
    getCurrentLocation();

    return () => clearInterval(timer);
  }, [employeeId]);

  const loadTodayAttendance = async () => {
    try {
      const todayRecords = await dbService.getTodayAttendanceRecords(employeeId);
      const lastRecord = todayRecords[todayRecords.length - 1];
      
      setPunchStatus(prev => ({
        ...prev,
        todayRecords,
        isPunchedIn: lastRecord?.punchType === 'IN',
        lastPunchTime: lastRecord ? formatTime(new Date(lastRecord.timestamp)) : null,
        lastPunchType: lastRecord?.punchType || null
      }));
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handlePunchButtonClick = () => {
    onCameraCapture();
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await loadTodayAttendance();
      await getCurrentLocation();
      toast.success('Status refreshed!');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dbService.clearAuth();
      onLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Complete punch with photo and location data
  const completePunch = async (photoData: PhotoData) => {
    try {
      setIsLoading(true);
      
      // Get current location if not available
      let location = currentLocation;
      if (!location) {
        location = await locationService.getLocationWithTimeout(5000);
      }

      if (!location) {
        toast.error('Could not get location. Please try again.');
        return;
      }

      const now = new Date();
      const punchType: 'IN' | 'OUT' = punchStatus.isPunchedIn ? 'OUT' : 'IN';
      
      const attendanceRecord: AttendanceRecord = {
        id: dbService.generateId(),
        employeeId,
        employeeName: userName,
        punchType,
        timestamp: now.toISOString(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        },
        photoUri: photoData.uri,
        isSynced: false
      };

      // Save to database
      await dbService.saveAttendanceRecord(attendanceRecord);
      
      // Update punch status
      const newStatus: PunchStatus = {
        isPunchedIn: !punchStatus.isPunchedIn,
        lastPunchTime: formatTime(now),
        lastPunchType: punchType,
        todayRecords: [...punchStatus.todayRecords, attendanceRecord]
      };
      
      setPunchStatus(newStatus);
      
      toast.success(
        `✅ Punched ${punchType} at ${formatTime(now)}`,
        {
          description: `📍 ${locationService.formatLocationForDisplay(location)}\n📸 Photo uploaded`,
          duration: 3000
        }
      );
    } catch (error) {
      console.error('Error completing punch:', error);
      toast.error('Failed to record attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Expose completePunch to parent component
  useEffect(() => {
    (window as any).completePunch = completePunch;
  }, [punchStatus, currentLocation, userName, employeeId]);

  const getLocationDisplay = () => {
    if (currentLocation) {
      return locationService.formatLocationForDisplay(currentLocation);
    }
    return 'Getting location...';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl">Hello, {userName} 👋</h1>
              <p className="text-muted-foreground">Today: {formatDate(currentTime)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(currentTime)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span className="text-sm">Location: {getLocationDisplay()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🕒</span>
              <span className="text-sm">
                Last Punch: {punchStatus.lastPunchTime 
                  ? `PUNCHED ${punchStatus.lastPunchType} at ${punchStatus.lastPunchTime}`
                  : 'No punches today'
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>📊</span>
              <span className="text-sm">
                Today's Records: {punchStatus.todayRecords.length} punches
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Big Punch Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handlePunchButtonClick}
            disabled={isLoading}
            className="w-full h-20 text-lg"
            size="lg"
          >
            {isLoading ? 'Processing...' : `📸 Tap to Punch ${punchStatus.isPunchedIn ? 'Out' : 'In'}`}
          </Button>
          
          <div className="flex items-center justify-center gap-2">
            <span className={punchStatus.isPunchedIn ? '🔴' : '🟢'}>
              {punchStatus.isPunchedIn ? '🔴' : '🟢'}
            </span>
            <span>
              Status: You are currently PUNCHED {punchStatus.isPunchedIn ? 'IN' : 'OUT'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            (ℹ️ You will be asked to take a photo)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex-1"
          >
            🔁 Refresh
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1"
          >
            🚪 Logout
          </Button>
        </div>

        {/* Today's Summary */}
        {punchStatus.todayRecords.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">📅 Today's Summary</h3>
              <div className="space-y-2">
                {punchStatus.todayRecords.map((record, index) => (
                  <div key={record.id} className="flex justify-between text-sm">
                    <span>{record.punchType}</span>
                    <span>{formatTime(new Date(record.timestamp))}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}