import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Payslip {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  netSalary: number;
  status: string;
  processedDate: string;
}

export default function Payroll() {
  const { user } = useAuthStore();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const { data } = await api.get('/payroll/my-payslips');
        setPayslips(data);
      } catch (err) {
        console.error('Failed to load payslips', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="card-title" style={{ fontSize: '2rem' }}>My Payslips</h1>
      
      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem' }}>Period</th>
              <th style={{ padding: '0.75rem' }}>Processed Date</th>
              <th style={{ padding: '0.75rem' }}>Base Salary</th>
              <th style={{ padding: '0.75rem' }}>Net Salary</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
              <th style={{ padding: '0.75rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {payslips.map(slip => (
              <tr key={slip.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem 0.75rem' }}>{slip.payPeriodStart} - {slip.payPeriodEnd}</td>
                <td style={{ padding: '1rem 0.75rem' }}>{slip.processedDate ? new Date(slip.processedDate).toLocaleDateString() : '-'}</td>
                <td style={{ padding: '1rem 0.75rem' }}>${slip.baseSalary.toLocaleString()}</td>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold' }}>${slip.netSalary.toLocaleString()}</td>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem',
                    background: slip.status === 'PAID' ? '#d1fae5' : '#e0e7ff',
                    color: slip.status === 'PAID' ? '#065f46' : '#3730a3'
                  }}>
                    {slip.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.75rem' }}>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}>Download PDF</button>
                </td>
              </tr>
            ))}
            {payslips.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No payslips generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
