import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import DatabaseService, { Employee } from '../services/DatabaseService';

interface LoginScreenProps {
  onLogin: (token: string, userName: string, employeeId: string) => void;
  onAdminAccess: () => void;
}

export function LoginScreen({ onLogin, onAdminAccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbService] = useState(() => DatabaseService.getInstance());

  useEffect(() => {
    // Initialize with sample employees for testing
    initializeSampleEmployees();
  }, []);

  const initializeSampleEmployees = async () => {
    try {
      const employees = await dbService.getEmployees();
      if (employees.length === 0) {
        const sampleEmployees: Employee[] = [
          {
            id: 'emp_001',
            phoneNumber: '9876543210',
            name: 'Ramesh Kumar',
            pin: '1234'
          },
          {
            id: 'emp_002',
            phoneNumber: '9876543211',
            name: 'Priya Sharma',
            pin: '5678'
          },
          {
            id: 'emp_003',
            phoneNumber: '9876543212',
            name: 'Amit Patel',
            pin: '9999'
          }
        ];

        for (const employee of sampleEmployees) {
          await dbService.saveEmployee(employee);
        }
      }
    } catch (error) {
      console.error('Error initializing sample employees:', error);
    }
  };

  const handleLogin = async () => {
    if (!phoneNumber || pin.length !== 4) {
      toast.error('Please enter valid phone number and 4-digit PIN');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find employee by phone number
      const employee = await dbService.getEmployeeByPhone(phoneNumber);
      
      if (!employee) {
        toast.error('Employee not found. Please check your phone number.');
        setIsLoading(false);
        return;
      }

      // Verify PIN
      if (employee.pin !== pin) {
        toast.error('Invalid PIN. Please try again.');
        setIsLoading(false);
        return;
      }

      // Generate auth token
      const token = `auth_${employee.id}_${Date.now()}`;
      
      // Save authentication
      await dbService.saveAuthToken(token, employee.id);
      
      toast.success(`Welcome back, ${employee.name}!`);
      
      onLogin(token, employee.name, employee.id);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (phone: string, pinCode: string) => {
    setPhoneNumber(phone);
    setPin(pinCode);
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

          {/* Demo Accounts */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Demo Accounts:</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('9876543210', '1234')}
                className="text-xs"
              >
                👤 Ramesh (1234)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('9876543211', '5678')}
                className="text-xs"
              >
                👤 Priya (5678)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('9876543212', '9999')}
                className="text-xs"
              >
                👤 Amit (9999)
              </Button>
            </div>
          </div>

          {/* Admin Access */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={onAdminAccess}
              className="w-full text-sm text-muted-foreground"
            >
              📊 Admin Panel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}