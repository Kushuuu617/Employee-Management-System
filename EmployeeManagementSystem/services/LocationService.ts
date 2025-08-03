import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp: number;
}

class LocationService {
  private static instance: LocationService;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      // Try to get address
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });

        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          locationData.address = [
            address.street,
            address.city,
            address.region,
            address.country,
          ]
            .filter(Boolean)
            .join(', ');
        }
      } catch (addressError) {
        console.warn('Could not get address:', addressError);
      }

      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async getLocationWithTimeout(timeoutMs: number = 10000): Promise<LocationData | null> {
    try {
      const locationPromise = this.getCurrentLocation();
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      });

      return await Promise.race([locationPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error getting location with timeout:', error);
      return null;
    }
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  isLocationWithinRadius(
    targetLat: number,
    targetLon: number,
    currentLat: number,
    currentLon: number,
    radiusKm: number = 0.5
  ): boolean {
    const distance = this.calculateDistance(
      targetLat,
      targetLon,
      currentLat,
      currentLon
    );
    return distance <= radiusKm;
  }

  formatLocationForDisplay(location: LocationData): string {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }
}

export default LocationService; 