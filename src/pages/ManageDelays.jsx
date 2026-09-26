import { useState, useEffect } from 'react';
import { FaClock, FaCar, FaCheck } from 'react-icons/fa';
import './ManageDelays.css';

const API = 'http://localhost:5000/api/delays';
const BOOKING_API = 'http://localhost:5000/api/bookings';

export default function ManageDelays() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [replyText, setReplyText] = useState('');

  const loadReports = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) {
        // Filter out incomplete old reports
        setReports(data.data.filter(r => r.thread && r.thread.length > 0));
      }
    } catch (err) {
      console.error('Failed to load delay reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    const interval = setInterval(loadReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateReturnTime = (report) => {
    if (!report.bookingId) {
      alert('Booking information is missing.');
      return;
    }
    setSelectedReport(report);
    setNewDate(report.bookingId.endDate || '');
    setNewTime(report.bookingId.returnTime || '10:00');
    setReplyText('');
    setModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      // First update the booking time
      const res = await fetch(`${BOOKING_API}/${selectedReport.bookingId._id}/time`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: newDate, returnTime: newTime })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        // Now save the reply
        if (replyText) {
          await fetch(`${API}/${selectedReport._id}/reply`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: 'admin', text: replyText })
          });
        }
        
        alert('Booking updated and reply sent successfully!');
        setModalOpen(false);
        loadReports();
      } else {
        alert('Failed to extend time: ' + data.message);
      }
    } catch (err) {
      alert('Error updating booking');
    }
  };

  const handleQuickReply = async (reportId, text) => {
    if (!text) return;
    try {
      await fetch(`${API}/${reportId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text })
      });
      loadReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'resolved' } : r));
      }
    } catch (err) {
      console.error('Error resolving delay report', err);
    }
  };

  return (
    <div className="md-page">
      <div className="md-container">
        <div className="md-header">
          <h1>Delay Reports</h1>
          <p>Review customer delays and adjust booking return times to update vehicle availability.</p>
        </div>

        {loading ? (
          <div className="md-empty">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="md-empty">
            <FaClock />
            <h2>No delay reports</h2>
            <p>Customers will appear here when they report a delay.</p>
          </div>
        ) : (
          <div className="md-grid">
            {reports.map(report => (
              <div key={report._id} className="md-card">
                <div className="md-card-header">
                  <div>
                    <h3 className="md-customer">{report.customerName}</h3>
                    <p className="md-email">{report.customerEmail}</p>
                  </div>
                  <span className={`md-badge md-badge-${report.status}`}>
                    {report.status}
                  </span>
                </div>

                <div className="md-vehicle">
                  <FaCar /> {report.vehicleDetails}
                </div>

                <div className="md-reason-box">
                  <p className="md-reason-title">Chat Thread</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {report.thread && report.thread.map((msg, i) => (
                      <div key={i} style={{ 
                        background: msg.sender === 'admin' ? '#e0e7ff' : '#ffffff',
                        padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                        maxWidth: '90%'
                      }}>
                        <small style={{ fontWeight: 'bold', color: msg.sender === 'admin' ? '#4f46e5' : '#475569' }}>
                          {msg.sender === 'admin' ? 'Admin' : 'Customer'}
                        </small>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#1e293b' }}>{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="md-actions">
                    <button className="md-btn md-btn-update" onClick={() => handleUpdateReturnTime(report)}>
                      Update Time & Reply
                    </button>
                    <button className="md-btn md-btn-resolve" onClick={() => handleResolve(report._id)}>
                      <FaCheck /> Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedReport && (
        <div className="md-modal-overlay">
          <div className="md-modal">
            <h2>Update Return Time & Reply</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="md-form-group">
                <label>New Return Date</label>
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="md-form-group">
                <label>New Return Time</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} required />
              </div>
              <div className="md-form-group">
                <label>Admin Reply to Customer</label>
                <textarea 
                  rows="3" 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Tell the customer the time has been updated..." 
                />
              </div>
              <div className="md-modal-actions">
                <button type="button" className="md-btn" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="md-btn md-btn-update">Save & Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
