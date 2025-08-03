# Employee Attendance Management System

A simple, user-friendly mobile app for employee attendance tracking with photo verification and GPS location tracking.

## 🎯 Features

### For Employees
- **Simple Login**: Phone number + 4-digit PIN authentication
- **Photo Attendance**: Take a photo to punch in/out
- **GPS Tracking**: Automatic location capture for attendance verification
- **Offline Support**: Works without internet connection
- **Today's Summary**: View your attendance records for the day
- **User-Friendly**: Designed for users with basic tech knowledge

### For Administrators
- **Admin Panel**: View all employee attendance records
- **Data Export**: Export attendance data to CSV
- **Filtering**: Filter by employee and date
- **Statistics**: View attendance statistics and analytics
- **Data Management**: Clear all data when needed

## 📱 Demo Accounts

The app comes with pre-configured demo accounts for testing:

| Employee | Phone Number | PIN |
|----------|--------------|-----|
| Ramesh Kumar | 9876543210 | 1234 |
| Priya Sharma | 9876543211 | 5678 |
| Amit Patel | 9876543212 | 9999 |

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (for mobile testing)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm start
   ```

3. **Run on Device/Simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web Browser

## 🏗️ Architecture

### Services
- **DatabaseService**: Handles local data storage using AsyncStorage
- **LocationService**: Manages GPS location tracking and geocoding
- **CameraService**: Handles photo capture and validation

### Components
- **LoginScreen**: Employee authentication
- **PunchScreen**: Main attendance interface
- **CameraScreen**: Photo capture interface
- **AdminPanel**: Administrative dashboard

### Data Models
```typescript
interface Employee {
  id: string;
  phoneNumber: string;
  name: string;
  pin: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  punchType: 'IN' | 'OUT';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photoUri?: string;
  isSynced: boolean;
}
```

## 📊 How It Works

### Employee Flow
1. **Login**: Enter phone number and 4-digit PIN
2. **Punch**: Tap the punch button to start attendance process
3. **Photo**: Take a photo for verification
4. **Location**: GPS location is automatically captured
5. **Confirmation**: Attendance is recorded with timestamp

### Admin Flow
1. **Access**: Click "Admin Panel" on login screen
2. **View Records**: See all attendance records in a table
3. **Filter**: Filter by employee or date
4. **Export**: Download data as CSV file
5. **Manage**: Clear data or view statistics

## 🔧 Technical Details

### Permissions Required
- **Camera**: For photo capture
- **Location**: For GPS tracking
- **Media Library**: For saving photos

### Data Storage
- **Local Storage**: Uses AsyncStorage for offline functionality
- **Photo Storage**: Photos saved to device gallery
- **Sync Status**: Tracks which records have been synced

### Offline Capability
- Works completely offline
- Data stored locally until internet connection
- Automatic sync when connection restored

## 🎨 UI/UX Features

### Design Principles
- **Simple**: Minimal interface for easy use
- **Clear**: Large buttons and clear instructions
- **Visual**: Emojis and icons for better understanding
- **Responsive**: Works on all screen sizes

### Accessibility
- Large touch targets
- High contrast colors
- Clear text labels
- Voice-over friendly

## 🔒 Security Features

### Authentication
- PIN-based authentication
- Session management
- Secure token storage

### Data Protection
- Local data encryption
- Photo privacy controls
- Location data anonymization

## 📈 Future Enhancements

### Planned Features
- **Cloud Sync**: Real-time data synchronization
- **Biometric Auth**: Fingerprint/face recognition
- **Geofencing**: Location-based attendance zones
- **Push Notifications**: Reminders and alerts
- **Reports**: Advanced analytics and reporting
- **Multi-language**: Support for multiple languages

### API Integration
- **Backend API**: Connect to company server
- **Real-time Updates**: Live attendance monitoring
- **Advanced Analytics**: Detailed attendance reports

## 🐛 Troubleshooting

### Common Issues

**Camera not working**
- Check camera permissions in device settings
- Restart the app
- Ensure camera is not used by another app

**Location not detected**
- Enable location services
- Check GPS permissions
- Move to an area with better GPS signal

**App crashes on startup**
- Clear app data and restart
- Reinstall the app
- Check device storage space

### Debug Mode
Enable debug logging by adding to console:
```javascript
console.log('Debug mode enabled');
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for simple, effective employee attendance management**
