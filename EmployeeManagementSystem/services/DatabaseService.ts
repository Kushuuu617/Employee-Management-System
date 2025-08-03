import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AttendanceRecord {
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

export interface Employee {
  id: string;
  phoneNumber: string;
  name: string;
  pin: string;
}

class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Employee Management
  async saveEmployee(employee: Employee): Promise<void> {
    try {
      const employees = await this.getEmployees();
      const existingIndex = employees.findIndex(emp => emp.id === employee.id);
      
      if (existingIndex >= 0) {
        employees[existingIndex] = employee;
      } else {
        employees.push(employee);
      }
      
      await AsyncStorage.setItem('employees', JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const data = await AsyncStorage.getItem('employees');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  }

  async getEmployeeByPhone(phoneNumber: string): Promise<Employee | null> {
    try {
      const employees = await this.getEmployees();
      return employees.find(emp => emp.phoneNumber === phoneNumber) || null;
    } catch (error) {
      console.error('Error getting employee by phone:', error);
      return null;
    }
  }

  // Attendance Management
  async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      const records = await this.getAttendanceRecords();
      records.push(record);
      await AsyncStorage.setItem('attendance_records', JSON.stringify(records));
    } catch (error) {
      console.error('Error saving attendance record:', error);
      throw error;
    }
  }

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const data = await AsyncStorage.getItem('attendance_records');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting attendance records:', error);
      return [];
    }
  }

  async getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecords();
      return records.filter(record => record.employeeId === employeeId);
    } catch (error) {
      console.error('Error getting attendance records by employee:', error);
      return [];
    }
  }

  async getTodayAttendanceRecords(employeeId: string): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecordsByEmployee(employeeId);
      const today = new Date().toDateString();
      
      return records.filter(record => {
        const recordDate = new Date(record.timestamp).toDateString();
        return recordDate === today;
      });
    } catch (error) {
      console.error('Error getting today attendance records:', error);
      return [];
    }
  }

  async getUnsyncedRecords(): Promise<AttendanceRecord[]> {
    try {
      const records = await this.getAttendanceRecords();
      return records.filter(record => !record.isSynced);
    } catch (error) {
      console.error('Error getting unsynced records:', error);
      return [];
    }
  }

  async markRecordAsSynced(recordId: string): Promise<void> {
    try {
      const records = await this.getAttendanceRecords();
      const recordIndex = records.findIndex(record => record.id === recordId);
      
      if (recordIndex >= 0) {
        records[recordIndex].isSynced = true;
        await AsyncStorage.setItem('attendance_records', JSON.stringify(records));
      }
    } catch (error) {
      console.error('Error marking record as synced:', error);
      throw error;
    }
  }

  // Authentication
  async saveAuthToken(token: string, employeeId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('currentEmployeeId', employeeId);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async getCurrentEmployeeId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('currentEmployeeId');
    } catch (error) {
      console.error('Error getting current employee ID:', error);
      return null;
    }
  }

  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('currentEmployeeId');
    } catch (error) {
      console.error('Error clearing auth:', error);
      throw error;
    }
  }

  // Utility methods
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export default DatabaseService; 