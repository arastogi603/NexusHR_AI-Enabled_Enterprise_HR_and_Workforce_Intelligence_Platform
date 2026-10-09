import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface LeaveBalance {
  casualLeave: number;
  sickLeave: number;
  earnedLeave: number;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  employeeName?: string;
}

export default function LeaveManagement() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [managerQueue, setManagerQueue] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    try {
      const [balRes, leavesRes] = await Promise.all([
        api.get('/leaves/balance'),
        api.get('/leaves')
      ]);
      setBalance(balRes.data);
      setMyLeaves(leavesRes.data);

      if (user?.role === 'MANAGER' || user?.role === 'ADMIN') {
        const queueRes = await api.get('/leaves/requests');
        setManagerQueue(queueRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason
      });
      alert('Leave applied successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to apply for leave');
    }
  };

  const processLeave = async (id: string, approve: boolean) => {
    try {
      await api.put(`/leaves/${id}/${approve ? 'approve' : 'reject'}`);
      loadData();
    } catch (err) {
      alert('Error processing leave');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="card-title" style={{ fontSize: '2rem' }}>Leave Management</h1>
      
      {balance && (
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3>Casual Leaves</h3>
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>{balance.casualLeave}</div>
          </div>
          <div className="card">
            <h3>Sick Leaves</h3>
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>{balance.sickLeave}</div>
          </div>
          <div className="card">
            <h3>Earned Leaves</h3>
            <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>{balance.earnedLeave}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h2 className="card-title">Apply for Leave</h2>
          {formError && <div style={{ color: 'red', marginBottom: '1rem' }}>{formError}</div>}
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                <option value="CASUAL">Casual Leave</option>
                <option value="SICK">Sick Leave</option>
                <option value="EARNED">Earned Leave</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" required value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" required value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Reason</label>
              <textarea className="form-input" rows={3} required value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2 className="card-title">My Leave History</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.5rem' }}>Type</th>
                  <th style={{ padding: '0.5rem' }}>Dates</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{leave.leaveType}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{leave.startDate} to {leave.endDate}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem',
                        background: leave.status === 'APPROVED' ? '#d1fae5' : leave.status === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                        color: leave.status === 'APPROVED' ? '#065f46' : leave.status === 'REJECTED' ? '#991b1b' : '#92400e'
                      }}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myLeaves.length === 0 && <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>No leaves found</td></tr>}
              </tbody>
            </table>
          </div>

          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <div className="card">
              <h2 className="card-title">Manager Approval Queue</h2>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.5rem' }}>Employee</th>
                    <th style={{ padding: '0.5rem' }}>Dates</th>
                    <th style={{ padding: '0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {managerQueue.map(leave => (
                    <tr key={leave.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{leave.employeeName} <br/><small>{leave.leaveType}</small></td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>{leave.startDate}<br/>to {leave.endDate}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <button onClick={() => processLeave(leave.id, true)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', marginRight: '0.5rem', background: 'var(--success-color)' }}>Approve</button>
                        <button onClick={() => processLeave(leave.id, false)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', background: 'var(--danger-color)' }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                  {managerQueue.length === 0 && <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>No pending requests</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
