import React from 'react';

const Footer = () => {
  return (
    <footer style={footerStyle}>
      <div style={footerContainerStyle}>
        {/* Cột 1: Giới thiệu */}
        <div style={columnStyle}>
          <h3 style={footerTitleStyle}>LUNA COSMETICS</h3>
          <p style={textStyle}>
            Vẻ đẹp tự nhiên từ thiên nhiên. Chúng tôi cung cấp các dòng mỹ phẩm 
            chính hãng, an toàn và hiệu quả nhất cho làn da của bạn.
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh */}
        <div style={columnStyle}>
          <h4 style={footerTitleStyle}>HỖ TRỢ KHÁCH HÀNG</h4>
          <ul style={listStyle}>
            <li>Chính sách bảo mật</li>
            <li>Điều khoản dịch vụ</li>
            <li>Hướng dẫn mua hàng</li>
            <li>Chính sách đổi trả</li>
          </ul>
        </div>

        {/* Cột 3: Liên hệ */}
        <div style={columnStyle}>
          <h4 style={footerTitleStyle}>THÔNG TIN LIÊN HỆ</h4>
          <p style={textStyle}>📍 Địa chỉ: 123 Đường ABC, Quận X, TP.HCM</p>
          <p style={textStyle}>📞 Hotline: 0123 456 789</p>
          <p style={textStyle}>✉️ Email: support@lunacos.com</p>
        </div>
      </div>

      <div style={copyrightStyle}>
        <p>© 2026 LUNA COSMETICS - Design for Mechanical Engineering Technology Industry</p>
      </div>
    </footer>
  );
};

// Styles cho Footer
const footerStyle = {
  backgroundColor: '#1a1a1a',
  color: '#f4f4f4',
  padding: '60px 0 20px 0',
  marginTop: 'auto',
};

const footerContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '40px',
  padding: '0 20px',
};

const columnStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const footerTitleStyle = {
  color: '#d4a373',
  marginBottom: '20px',
  fontSize: '1.2rem',
};

const textStyle = {
  fontSize: '0.9rem',
  lineHeight: '1.6',
  color: '#bbb',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  fontSize: '0.9rem',
  lineHeight: '2',
  color: '#bbb',
  cursor: 'pointer',
};

const copyrightStyle = {
  textAlign: 'center',
  borderTop: '1px solid #333',
  marginTop: '40px',
  paddingTop: '20px',
  fontSize: '0.8rem',
  color: '#777',
};

export default Footer;