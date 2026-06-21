import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const initialName = localStorage.getItem('user_name') || '';
  const [formData, setFormData] = useState({
    name: initialName,
    email: '',
    subject: '',
    priority: 'medium',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      setStatus({
        type: 'success',
        msg: 'Yêu cầu hỗ trợ đã được ghi nhận ở frontend. Backend Spring hiện chưa có API support-ticket.'
      });
      setFormData((prev) => ({ ...prev, subject: '', message: '' }));
    } catch (err) {
      setStatus({ type: 'error', msg: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={pageTitle}>Trung tâm hỗ trợ</h1>
          <p style={pageSubtitle}>Gặp vấn đề? Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
        </div>

        <div style={methodsGrid}>
          <InfoCard title="Email" value="support@lunacos.vn" />
          <InfoCard title="Hotline" value="1900-xxxx" />
          <InfoCard title="Live Chat" value="Trò chuyện trực tiếp" />
        </div>

        <div style={formCardStyle}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '30px' }}>Gửi yêu cầu hỗ trợ</h2>

          {status.msg && (
            <div style={statusBadge(status.type)}>
              {status.type === 'success' ? '✓ ' : '✕ '} {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={formGrid}>
            <div style={inputRow}>
              <div style={inputGroup}>
                <label style={labelStyle}>Họ và tên *</label>
                <input type="text" name="name" required style={inputStyle} value={formData.name} onChange={handleChange} placeholder="Nhập họ và tên" />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Email *</label>
                <input type="email" name="email" required style={inputStyle} value={formData.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
            </div>

            <div style={inputRow}>
              <div style={inputGroup}>
                <label style={labelStyle}>Tiêu đề *</label>
                <input type="text" name="subject" required style={inputStyle} value={formData.subject} onChange={handleChange} placeholder="Vấn đề bạn gặp phải" />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Độ ưu tiên</label>
                <select name="priority" style={inputStyle} value={formData.priority} onChange={handleChange}>
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Nội dung chi tiết *</label>
              <textarea name="message" required rows="6" style={{ ...inputStyle, resize: 'vertical' }} value={formData.message} onChange={handleChange} placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button type="submit" disabled={loading} style={submitBtnStyle}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
              </button>
              <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Quay lại trang chủ</Link>
            </div>
          </form>
        </div>

        <div style={{ marginTop: '60px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '30px' }}>Câu hỏi thường gặp</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <FaqItem question="Làm thế nào để theo dõi đơn hàng?" answer="Bạn có thể theo dõi đơn hàng tại trang Lịch sử mua hàng sau khi đăng nhập." />
            <FaqItem question="Chính sách đổi trả như thế nào?" answer="Sản phẩm có thể đổi trả trong vòng 7 ngày nếu còn nguyên tem và chưa qua sử dụng." />
            <FaqItem question="Thời gian giao hàng bao lâu?" answer="Thời gian giao hàng thường từ 2-5 ngày tùy theo khu vực." />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ title, value }) => (
  <div style={methodCard}>
    <div style={iconWrapper}>{title.charAt(0)}</div>
    <h3 style={methodTitle}>{title}</h3>
    <p style={methodValue}>{value}</p>
  </div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={faqCard} onClick={() => setIsOpen(!isOpen)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
        <span style={{ fontWeight: '600', color: '#111827' }}>{question}</span>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && <p style={{ marginTop: '15px', color: '#4b5563', lineHeight: '1.6' }}>{answer}</p>}
    </div>
  );
};

const pageStyle = { minHeight: '100vh', backgroundColor: '#f9fafb', padding: '60px 0' };
const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '0 20px' };
const pageTitle = { fontSize: '2.5rem', fontWeight: '800', color: '#111827', marginBottom: '15px' };
const pageSubtitle = { fontSize: '1.1rem', color: '#6b7280' };
const methodsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '50px' };
const methodCard = { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const iconWrapper = { width: '56px', height: '56px', backgroundColor: '#ebf5ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 15px', fontWeight: '800' };
const methodTitle = { fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' };
const methodValue = { color: '#6b7280', fontSize: '0.95rem' };
const formCardStyle = { backgroundColor: '#fff', padding: '40px', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '25px' };
const inputRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.9rem', fontWeight: '600', color: '#374151' };
const inputStyle = { padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' };
const statusBadge = (type) => ({ padding: '15px', borderRadius: '10px', marginBottom: '25px', backgroundColor: type === 'success' ? '#f0fdf4' : '#fef2f2', color: type === 'success' ? '#16a34a' : '#dc2626', border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`, fontSize: '0.95rem' });
const submitBtnStyle = { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '14px 35px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' };
const faqCard = { backgroundColor: '#fff', padding: '20px 25px', borderRadius: '12px', border: '1px solid #e5e7eb' };

export default Contact;
