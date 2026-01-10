import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

export default function AdminMessages(){
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/contact`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/contact/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch (err) {
      console.error('markRead', err);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Messages</h2>
      {loading && <div>Loading…</div>}
      {!loading && messages.length === 0 && <div>No messages</div>}
      <div style={{ marginTop: 12 }}>
        {messages.map(m => (
          <div key={m._id} style={{ padding:12, borderRadius:8, marginBottom:10, background: m.read ? '#fff' : '#f8fafc', boxShadow: '0 6px 18px rgba(2,6,23,0.04)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <strong>{m.name}</strong> <span style={{ color:'#475569' }}>({m.email})</span>
                <div style={{ color:'#64748b', fontSize:13 }}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
              <div>
                {!m.read && <button onClick={() => markRead(m._id)} style={{ marginRight:8 }}>Mark read</button>}
              </div>
            </div>
            {m.subject && <div style={{ marginTop:8, fontWeight:600 }}>{m.subject}</div>}
            <div style={{ marginTop:8, whiteSpace:'pre-wrap' }}>{m.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
