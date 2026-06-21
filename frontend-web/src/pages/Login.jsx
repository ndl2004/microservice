import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post('/auth/login', { email, password });
            const isAdmin = email.trim().toLowerCase().includes('admin');
            const user = {
                id: response.data.userId,
                name: response.data.fullName,
                email: response.data.email,
                role: isAdmin ? 'admin' : 'user'
            };

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_name', user.name);
            localStorage.setItem('user_email', user.email);
            localStorage.setItem('user_role', user.role);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user', JSON.stringify(user));

            window.dispatchEvent(new Event('authChange'));
            toast.success(`Chào mừng ${user.name} đã quay trở lại!`);
            navigate(isAdmin ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || 'Đăng nhập thất bại!');
        }
    };

    return (
        <div style={formContainer}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>ĐĂNG NHẬP</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    required
                />
                <button type="submit" style={btnStyle}>ĐĂNG NHẬP</button>
            </form>
        </div>
    );
};

const formContainer = { maxWidth: '400px', margin: '100px auto', padding: '30px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#ccd5ae', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#333', marginTop: '10px' };

export default Login;
