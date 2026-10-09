import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  departmentsCount: number;
  employeesOnLeaveToday: number;
  currentMonthPayrollExpense: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get('/analytics/dashboard');
        setMetrics(data);
      } catch (err) {
        setError('Failed to load dashboard data. Are you an Admin/Manager?');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  
  return (
    <div>
      <h1 className="card-title" style={{ fontSize: '2rem' }}>Overview Dashboard</h1>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}
      
      {metrics && (
        <div className="grid-3">
          <div className="card">
            <h3 style={{ color: 'var(--text-secondary)' }}>Total Employees</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{metrics.totalEmployees}</div>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--text-secondary)' }}>On Leave Today</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--danger-color)' }}>{metrics.employeesOnLeaveToday}</div>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--text-secondary)' }}>Monthly Payroll</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>${metrics.currentMonthPayrollExpense?.toLocaleString()}</div>
          </div>
        </div>
      )}
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="card-title">Welcome to NexusHR</h2>
        <p>This is the Demo UI connected directly to the robust Spring Boot backend. Use the sidebar to navigate through available modules.</p>
      </div>
    </div>
  );
}
