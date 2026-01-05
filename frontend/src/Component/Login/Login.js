import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const URL = `${API_BASE}/users/login`;

function Login() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: '', password: '' });
	const [status, setStatus] = useState({ loading: false, error: '', success: '' });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setStatus({ loading: true, error: '', success: '' });
		try {
			const res = await axios.post(URL, formData);
			const user = res.data.user;
			setStatus({ loading: false, error: '', success: `Welcome back, ${user.name}!` });
			
			// Store user info in localStorage
			localStorage.setItem('user', JSON.stringify(user));
			
			// Redirect based on role
			setTimeout(() => {
				if (user.role === 'admin') {
					navigate('/admin');
				} else if (user.role === 'teacher') {
					navigate('/teachers');
				} else if (user.role === 'student') {
					navigate('/students');
				}
			}, 1000);
		} catch (err) {
			console.error(err);
			const msg = err?.response?.data?.message || 'Login failed. Please try again.';
			setStatus({ loading: false, error: msg, success: '' });
		}
	};

	return (
		<div className="login-container">
			<div className="login-card">
				<h1>Login</h1>
				<p className="subtitle">Access your dashboard with your account.</p>

				<form className="login-form" onSubmit={handleSubmit}>
					<label>
						Email
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</label>

					<label>
						Password
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</label>

					<button type="submit" disabled={status.loading}>
						{status.loading ? 'Signing in...' : 'Login'}
					</button>
				</form>

				{status.error && <p className="status error">{status.error}</p>}
				{status.success && <p className="status success">{status.success}</p>}
			</div>
		</div>
	);
}

export default Login;
