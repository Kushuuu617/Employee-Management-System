import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner@2.0.3';

interface PunchScreenProps {
  userName: string;
  onCameraCapture: () => void;
}

interface PunchStatus {
  isPunchedIn: boolean;
  lastPunchTime: string | null;
  lastPunchType: 'IN' | 'OUT' | null;
}

export function PunchScreen({ userName, onCameraCapture }: PunchScreenProps) {
  const [punchStatus, setPunchStatus] = useState<PunchStatus>({
    isPunchedIn: false,
    lastPunchTime: null,
    lastPunchType: null
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location] = useState('New Delhi'); // Mock location

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Load saved punch status
    const savedStatus = localStorage.getItem('punchStatus');
    if (savedStatus) {
      setPunchStatus(JSON.parse(savedStatus));
    }

    return () => clearInterval(timer);
  }, []);

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

  const handleRefresh = () => {
    toast.success('Status refreshed!');
  };

  // Mock punch success (called from parent after camera)
  const completePunch = () => {
    const now = new Date();
    const newStatus: PunchStatus = {
      isPunchedIn: !punchStatus.isPunchedIn,
      lastPunchTime: formatTime(now),
      lastPunchType: punchStatus.isPunchedIn ? 'OUT' : 'IN'
    };
    
    setPunchStatus(newStatus);
    localStorage.setItem('punchStatus', JSON.stringify(newStatus));
    
    toast.success(
      `✅ Punched ${newStatus.lastPunchType} at ${newStatus.lastPunchTime}`,
      {
        description: `📍 Location: ${location}\n📸 Photo uploaded`,
        duration: 3000
      }
    );
  };

  // Expose completePunch to parent component
  useEffect(() => {
    (window as any).completePunch = completePunch;
  }, [punchStatus]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl">Hello, {userName} 👋</h1>
              <p className="text-muted-foreground">Today: {formatDate(currentTime)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status Info */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Location: {location}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🕒</span>
              <span>
                Last Punch: {punchStatus.lastPunchTime 
                  ? `PUNCHED ${punchStatus.lastPunchType} at ${punchStatus.lastPunchTime}`
                  : 'No punches today'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Big Punch Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={handlePunchButtonClick}
            className="w-full h-20 text-lg"
            size="lg"
          >
            📸 Tap to Punch {punchStatus.isPunchedIn ? 'Out' : 'In'}
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

        {/* Refresh Button */}
        <div className="text-center">
          <Button variant="outline" onClick={handleRefresh}>
            🔁 Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}