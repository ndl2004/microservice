import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        passwordConfirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirmation) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password
            });

            toast.success('Đăng ký tài khoản thành công. Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={formCardStyle}>
                <h2 style={{ color: '#333', marginBottom: '20px' }}>ĐĂNG KÝ TÀI KHOẢN</h2>

                <form onSubmit={handleRegister}>
                    <div style={inputGroup}>
                        <input name="fullName" type="text" placeholder="Họ và tên" onChange={handleChange} style={inputStyle} required />
                    </div>

                    <div style={inputGroup}>
                        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={inputStyle} required />
                    </div>

                    <div style={inputGroup}>
                        <input name="phone" type="text" placeholder="Số điện thoại" onChange={handleChange} style={inputStyle} />
                    </div>

                    <div style={inputGroup}>
                        <input name="address" type="text" placeholder="Địa chỉ" onChange={handleChange} style={inputStyle} />
                    </div>

                    <div style={inputGroup}>
                        <input name="password" type="password" placeholder="Mật khẩu" onChange={handleChange} style={inputStyle} required />
                    </div>

                    <div style={inputGroup}>
                        <input name="passwordConfirmation" type="password" placeholder="Xác nhận mật khẩu" onChange={handleChange} style={inputStyle} required />
                    </div>

                    <button type="submit" style={btnStyle} disabled={loading}>
                        {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
                    </button>
                </form>

                <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                    Đã có tài khoản? <Link to="/login" style={{ color: '#b7c093', fontWeight: 'bold' }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#fffcf2' };
const formCardStyle = { width: '100%', maxWidth: '450px', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' };
const inputGroup = { marginBottom: '15px', textAlign: 'left' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' };
const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#ccd5ae', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' };

export default Register;
