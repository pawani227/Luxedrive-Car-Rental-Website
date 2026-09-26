import { useState, useEffect } from 'react';
import { FaTrash, FaFilter, FaEnvelope, FaEnvelopeOpen, FaCheckCircle, FaPaperPlane, FaComments } from 'react-icons/fa';
import './ManageMessages.css';

const API = 'http://localhost:5000/api/messages';

export default function ManageMessages() {
  const [conversations, setConversations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  // Count customer messages the admin hasn't read
  const unreadCount = (c) => c.thread.filter(m => m.sender === 'customer' && !m.read).length;

  // Open/close a conversation + mark customer messages as read
  const openConversation = async (c) => {
    if (expandedId === c._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(c._id);
    setReplyText('');
    if (unreadCount(c) > 0) {
      try {
        await fetch(`${API}/${c._id}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reader: 'admin' })
        });
        load();
      } catch {}
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`${API}/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'admin', text: replyText })
      });
      setReplyText('');
      load();
    } catch {
      alert('Failed to send reply');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this conversation?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    setExpandedId(null);
    load();
  };

  const filtered = conversations.filter(c => {
    if (statusFilter === 'unread') return unreadCount(c) > 0;
    if (statusFilter === 'read') return unreadCount(c) === 0;
    return true;
  });

  const stats = {
    total: conversations.length,
    unread: conversations.filter(c => unreadCount(c) > 0).length,
    read: conversations.filter(c => unreadCount(c) === 0).length
  };

  return (
    <div className="dashboard-page" style={{ paddingBottom: '20px' }}>
      <div className="page-header">
        <h1>Contact Messages</h1>
        <p>Chat with customers who reached out through the contact form</p>
      </div>

      <div className="container-msg">
        {/* Stats */}
        <div className="msg-stats">
          <div className="msg-stat-card">
            <div className="msg-stat-icon" style={{ background: '#6366f1' }}><FaEnvelope /></div>
            <div><h3>{stats.total}</h3><p>Conversations</p></div>
          </div>
          <div className="msg-stat-card">
            <div className="msg-stat-icon" style={{ background: '#f59e0b' }}><FaEnvelopeOpen /></div>
            <div><h3>{stats.unread}</h3><p>Unread</p></div>
          </div>
          <div className="msg-stat-card">
            <div className="msg-stat-icon" style={{ background: '#10b981' }}><FaCheckCircle /></div>
            <div><h3>{stats.read}</h3><p>Read</p></div>
          </div>
        </div>

        {/* Filter */}
        <div className="msg-toolbar">
          <div className="msg-filter">
            <FaFilter />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Conversations</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <p className="msg-count">{filtered.length} conversations found</p>
        </div>

        {/* Conversations */}
        {loading ? (
          <div className="msg-empty"><FaEnvelope /><h3>Loading...</h3></div>
        ) : error ? (
          <div className="msg-empty">
            <FaEnvelope />
            <h3>Cannot connect to server</h3>
            <p>Make sure the backend is running (cd backend → npm run dev).</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="msg-empty">
            <FaEnvelope />
            <h3>No conversations found</h3>
            <p>Messages will appear here when customers contact you.</p>
          </div>
        ) : (
          <div className="msg-list">
            {filtered.map((c) => {
              const unread = unreadCount(c);
              const isOpen = expandedId === c._id;
              const lastMsg = c.thread[c.thread.length - 1];
              return (
                <div key={c._id} className={`msg-card ${unread > 0 ? 'unread' : ''}`}>
                  {/* Header (click to open chat) */}
                  <div className="msg-card-header" onClick={() => openConversation(c)}>
                    <div className="msg-sender">
                      <div className="msg-avatar">{c.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <h4>
                          {c.name}
                          {unread > 0 && <span className="msg-badge">{unread} NEW</span>}
                        </h4>
                        <span className="msg-email">{c.email}</span>
                        <p className="msg-subject-preview">
                          <strong>{c.subject}</strong> — {lastMsg?.text.slice(0, 45)}
                          {lastMsg?.text.length > 45 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="msg-meta">
                      <span className="msg-date">{new Date(c.updatedAt).toLocaleString()}</span>
                      <span className="msg-toggle">{isOpen ? '▲ Close' : '▼ Open Chat'}</span>
                    </div>
                  </div>

                  {/* Chat Thread (when open) */}
                  {isOpen && (
                    <div className="chat-box">
                      {c.phone && <p className="chat-phone">📞 {c.phone}</p>}
                      <div className="chat-thread">
                        {c.thread.map((m, i) => (
                          <div
                            key={i}
                            className={`chat-bubble ${m.sender === 'admin' ? 'own' : 'other'} ${m.sender === 'customer' && !m.read ? 'is-unread' : ''}`}
                          >
                            <span className="chat-sender">
                              {m.sender === 'admin' ? 'You (Admin)' : c.name}
                            </span>
                            <p>{m.text}</p>
                            <span className="chat-time">{new Date(m.createdAt).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      {/* Reply input */}
                      <div className="chat-input">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendReply(c._id)}
                          placeholder="Type your reply..."
                        />
                        <button className="chat-send" onClick={() => sendReply(c._id)}>
                          <FaPaperPlane /> Send
                        </button>
                        <button className="chat-delete" onClick={() => handleDelete(c._id)} title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}