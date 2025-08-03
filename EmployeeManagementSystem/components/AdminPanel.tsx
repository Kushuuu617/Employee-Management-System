import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import DatabaseService, { AttendanceRecord, Employee } from '../services/DatabaseService';

interface AdminPanelProps {
  onBack: () => void;
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbService] = useState(() => DatabaseService.getInstance());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empData, recordData] = await Promise.all([
        dbService.getEmployees(),
        dbService.getAttendanceRecords()
      ]);
      
      setEmployees(empData);
      setAttendanceRecords(recordData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    // Filter by employee
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(record => record.employeeId === selectedEmployee);
    }

    // Filter by date
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.toDateString() === selectedDateObj.toDateString();
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const exportData = () => {
    const filteredRecords = getFilteredRecords();
    const csvData = [
      ['Employee', 'Punch Type', 'Timestamp', 'Location', 'Synced'],
      ...filteredRecords.map(record => [
        getEmployeeName(record.employeeId),
        record.punchType,
        formatDate(record.timestamp),
        `${record.location.latitude}, ${record.location.longitude}`,
        record.isSynced ? 'Yes' : 'No'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate || 'all'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await dbService.clearAllData();
        toast.success('All data cleared successfully');
        loadData();
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Failed to clear data');
      }
    }
  };

  const filteredRecords = getFilteredRecords();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>📊 Admin Panel</CardTitle>
              <Button variant="outline" onClick={onBack}>
                ← Back to App
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View and manage employee attendance records
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button onClick={exportData} size="sm">
                    📥 Export
                  </Button>
                  <Button onClick={loadData} size="sm" variant="outline">
                    🔄 Refresh
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">📈 Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{filteredRecords.length}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredRecords.filter(r => r.punchType === 'IN').length}
                </div>
                <div className="text-sm text-muted-foreground">Punch Ins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredRecords.filter(r => !r.isSynced).length}
                </div>
                <div className="text-sm text-muted-foreground">Unsynced</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">📋 Attendance Records</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p>Loading records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Employee</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Synced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{getEmployeeName(record.employeeId)}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.punchType === 'IN' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.punchType}
                          </span>
                        </td>
                        <td className="p-2">{formatDate(record.timestamp)}</td>
                        <td className="p-2 text-xs">
                          {record.location.address || 
                           `${record.location.latitude.toFixed(4)}, ${record.location.longitude.toFixed(4)}`}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.isSynced 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {record.isSynced ? 'Yes' : 'No'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 text-red-600">⚠️ Danger Zone</h3>
            <Button 
              onClick={clearAllData} 
              variant="destructive"
              size="sm"
            >
              🗑️ Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              This will permanently delete all employees and attendance records.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 