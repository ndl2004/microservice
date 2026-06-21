import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('vnp_TxnRef')?.split('_')[0];

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={iconStyle}>!</div>
        <h2 style={{ color: '#d97706', marginBottom: '12px' }}>VNPAY chưa được triển khai</h2>
        <p style={textStyle}>
          Backend Spring hiện chưa có API xác nhận thanh toán VNPAY. Luồng demo hiện tại dùng phương thức COD.
        </p>
        {orderCode && <p>Mã giao dịch nhận được: <strong>#{orderCode}</strong></p>}
        <div style={actionRow}>
          <Link to="/" style={primaryButton}>Quay về trang chủ</Link>
          <Link to="/order-history" style={secondaryButton}>Xem lịch sử đơn hàng</Link>
        </div>
      </div>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };
const cardStyle = { backgroundColor: '#fff', width: '100%', maxWidth: '520px', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', textAlign: 'center' };
const iconStyle = { width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: '900', margin: '0 auto 20px' };
const textStyle = { color: '#4b5563', lineHeight: 1.6 };
const actionRow = { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' };
const primaryButton = { backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '700' };
const secondaryButton = { backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: '700' };

export default PaymentReturn;
