import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Nav.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

export default function NotificationBell(){
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/contact/unread-count`);
      setCount(res.data.unread || 0);
    } catch (err) {
      // silently fail
    }
  };

  useEffect(() => {
    fetchCount();
    const t = setInterval(fetchCount, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <button className="nav-notif" title="Messages" onClick={() => navigate('/admin/messages')}>
      <span className="bell">🔔</span>
      {count > 0 && <span className="notif-badge">{count}</span>}
    </button>
  );
}
