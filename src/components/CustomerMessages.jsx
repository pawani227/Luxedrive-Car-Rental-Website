import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import './CustomerMessages.css';

const API = 'http://localhost:5000/api/messages';

export default function CustomerMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`${API}/user/${user.email}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Count admin messages the customer hasn't read
  const unreadCount = (c) => c.thread.filter(m => m.sender === 'admin' && !m.read).length;

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
          body: JSON.stringify({ reader: 'customer' })
        });
        load();
      } catch {}
    }
  };

  const sendMessage = async (id) => {
    if (!replyText.trim()) return;
    try {
      await fetch(`${API}/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'customer', text: replyText })
      });
      setReplyText('');
      load();
    } catch {
      alert('Failed to send message');
    }
  };

  if (conversations.length === 0) return null;

  return (
    <div className="cust-msg-section">
      <h2 className="cust-msg-title"><FaComments /> My Messages & Replies</h2>
      <div className="cust-msg-list">
        {conversations.map((c) => {
          const unread = unreadCount(c);
          const isOpen = expandedId === c._id;
          const lastMsg = c.thread[c.thread.length - 1];
          return (
            <div key={c._id} className={`cust-conv ${unread > 0 ? 'unread' : ''}`}>
              {/* Header */}
              <div className="cust-conv-head" onClick={() => openConversation(c)}>
                <div>
                  <strong>
                    {c.subject || 'Your message'}
                    {unread > 0 && <span className="cust-badge">{unread} NEW REPLY</span>}
                  </strong>
                  <p className="cust-preview">
                    {lastMsg?.sender === 'admin' ? 'LuxeDrive: ' : 'You: '}
                    {lastMsg?.text.slice(0, 50)}{lastMsg?.text.length > 50 ? '...' : ''}
                  </p>
                </div>
                <span className="cust-toggle">{isOpen ? '▲ Close' : '▼ Open'}</span>
              </div>

              {/* Chat Thread */}
              {isOpen && (
                <div className="cust-chat-box">
                  <div className="cust-chat-thread">
                    {c.thread.map((m, i) => (
                      <div
                        key={i}
                        className={`cust-bubble ${m.sender === 'customer' ? 'own' : 'other'} ${m.sender === 'admin' && !m.read ? 'is-unread' : ''}`}
                      >
                        <span className="cust-bubble-sender">
                          {m.sender === 'customer' ? 'You' : 'LuxeDrive Team'}
                        </span>
                        <p>{m.text}</p>
                        <span className="cust-bubble-time">{new Date(m.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Send message */}
                  <div className="cust-chat-input">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage(c._id)}
                      placeholder="Type your message..."
                    />
                    <button onClick={() => sendMessage(c._id)}>
                      <FaPaperPlane /> Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}