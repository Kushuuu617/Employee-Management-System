import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface LoginScreenProps {
  onLogin: (token: string, userName: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber || pin.length !== 4) return;
    
    setIsLoading(true);
    
    // Mock login - simulate API call
    setTimeout(() => {
      // Mock successful login
      const mockToken = 'mock-jwt-token-' + Date.now();
      const mockUserName = phoneNumber.startsWith('9876') ? 'Ramesh' : 'Employee';
      
      // Store in localStorage (in real app, use SecureStore)
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userName', mockUserName);
      
      onLogin(mockToken, mockUserName);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Employee Login</CardTitle>
          <p className="text-muted-foreground">Enter your details to continue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">📱 Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pin">🔐 4-digit PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter PIN"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          
          <Button 
            onClick={handleLogin}
            disabled={!phoneNumber || pin.length !== 4 || isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging in...' : '🔘 Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}