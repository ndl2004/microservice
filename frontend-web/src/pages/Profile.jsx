import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      toast.warning('Vui lòng đăng nhập để xem thông tin.');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setFormData({
          name: response.data.fullName || response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (error) {
        toast.error('Không thể tải thông tin tài khoản. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend hiện chưa có API PUT /users/{id}; cập nhật local để UI demo không bị đứt luồng.
      localStorage.setItem('user_name', formData.name);
      localStorage.setItem('user_email', formData.email);
      window.dispatchEvent(new Event('authChange'));
      toast.success('Đã cập nhật thông tin hiển thị trên frontend.');
    } catch (err) {
      toast.error('Cập nhật thất bại, vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.2rem' }}>Đang tải thông tin...</div>;
  }

  return (
    <div style={pageWrapper}>
      <div style={mainContainer}>
        <div style={headerSection}>
          <h2 style={{ color: '#432818', fontSize: '2rem', margin: 0 }}>HỒ SƠ CỦA TÔI</h2>
          <p style={{ color: '#777', marginTop: '5px' }}>Quản lý thông tin tài khoản và địa chỉ giao hàng</p>
        </div>

        <form onSubmit={handleUpdate}>
          <div style={formFlexContainer}>
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Thông tin cơ bản</h3>
              <hr style={dividerStyle} />

              <div style={inputGroup}>
                <label style={labelStyle}>Họ và tên <span style={requiredStar}>*</span></label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} style={inputStyle} required />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Email <span style={requiredStar}>*</span></label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} style={inputStyle} required />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Số điện thoại</label>
                <input name="phone" type="text" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="Ví dụ: 0912345678" />
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>Địa chỉ giao hàng</label>
                <textarea name="address" value={formData.address} onChange={handleChange} style={{ ...inputStyle, height: '95px', resize: 'none' }} placeholder="Nhập địa chỉ nhận hàng chi tiết..." />
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>Trạng thái tài khoản</h3>
              <hr style={dividerStyle} />
              <div style={infoBox}>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Vai trò:</strong> {localStorage.getItem('user_role') || 'user'}</p>
                <p><strong>JWT:</strong> Đã đăng nhập</p>
              </div>
              <p style={{ color: '#777', lineHeight: 1.6 }}>
                Phần đổi mật khẩu và cập nhật hồ sơ vào database cần bổ sung API trong User Service.
                Hiện tại màn này phục vụ demo đọc thông tin người dùng qua Gateway.
              </p>
            </div>
          </div>

          <div style={actionContainer}>
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const pageWrapper = { backgroundColor: '#fffcf2', minHeight: '80vh', padding: '50px 20px', display: 'flex', justifyContent: 'center' };
const mainContainer = { width: '100%', maxWidth: '1000px' };
const headerSection = { textAlign: 'center', marginBottom: '40px' };
const formFlexContainer = { display: 'flex', gap: '30px', flexWrap: 'wrap' };
const cardStyle = { flex: '1', minWidth: '350px', backgroundColor: '#ffffff', padding: '35px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' };
const cardTitleStyle = { color: '#d4a373', fontSize: '1.2rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' };
const dividerStyle = { border: 'none', borderTop: '2px solid #f5f5f5', margin: '15px 0 25px 0' };
const inputGroup = { marginBottom: '20px', textAlign: 'left' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: '#444' };
const requiredStar = { color: '#e76f51' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #e0e0e0', fontSize: '1rem', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' };
const infoBox = { backgroundColor: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '18px', marginBottom: '20px', color: '#444' };
const actionContainer = { textAlign: 'center', marginTop: '40px' };
const btnStyle = { padding: '16px 40px', backgroundColor: '#d4a373', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(212, 163, 115, 0.4)' };

export default Profile;
