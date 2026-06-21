import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Checkout = () => {
  const { cartItems, totalPrice, setCartItems } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: localStorage.getItem('user_name') || '',
    phone: '',
    address: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = Number(localStorage.getItem('user_id'));

    if (!formData.fullname.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.warn('Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }

    if (!token || !userId) {
      toast.error('Vui lòng đăng nhập để thanh toán.');
      navigate('/login');
      return;
    }

    if (paymentMethod === 'vnpay') {
      toast.warn('VNPAY chưa được triển khai trong Spring backend. Vui lòng chọn COD để demo.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/orders', {
        userId,
        fullName: formData.fullname,
        phone: formData.phone,
        address: formData.address,
        note: formData.note,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      });

      toast.success('Đặt hàng thành công. Đơn hàng đã được gửi sang RabbitMQ xử lý tồn kho.');
      setCartItems([]);
      navigate('/order-history');
    } catch (err) {
      console.error('Order error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (cartItems.length === 0) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Giỏ hàng trống, không thể thanh toán.</div>;
  }

  return (
    <div style={checkoutWrapper}>
      <div style={container}>
        <h2 style={titleStyle}>THANH TOÁN ĐƠN HÀNG</h2>
        <form style={checkoutFlex} onSubmit={handleOrder} noValidate>
          <div style={formSection}>
            <h3 style={subTitle}>Thông tin giao hàng</h3>
            <div style={inputGroup}>
              <label style={labelStyle}>Họ và tên *</label>
              <input type="text" name="fullname" value={formData.fullname} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Số điện thoại *</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Địa chỉ nhận hàng *</label>
              <textarea name="address" rows="3" value={formData.address} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={inputGroup}>
              <label style={labelStyle}>Ghi chú</label>
              <textarea name="note" rows="2" value={formData.note} onChange={handleChange} style={inputStyle} />
            </div>

            <h3 style={{ ...subTitle, marginTop: '30px' }}>Phương thức thanh toán</h3>
            <div style={paymentMethodsContainer}>
              <label style={paymentOption(paymentMethod === 'cod')}>
                <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span style={{ marginLeft: '10px' }}>Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label style={paymentOption(paymentMethod === 'vnpay')}>
                <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} />
                <span style={{ marginLeft: '10px' }}>VNPAY (chưa bật trong backend Spring)</span>
              </label>
            </div>
          </div>

          <div style={orderSection}>
            <h3 style={subTitle}>Đơn hàng của bạn</h3>
            <div style={orderBox}>
              {cartItems.map((item) => (
                <div key={item.id} style={itemSummary}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={qtyBadge}>{item.quantity}</span>
                    <span style={itemName}>{item.name}</span>
                  </div>
                  <span style={itemPrice}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr style={divider} />
              <div style={summaryLine}>
                <span>Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div style={summaryLine}>
                <span>Phí vận chuyển</span>
                <span style={{ color: '#5b8c00' }}>Miễn phí</span>
              </div>
              <div style={totalLine}>
                <span>TỔNG CỘNG</span>
                <span style={{ color: '#e76f51' }}>{formatPrice(totalPrice)}</span>
              </div>
              <button type="submit" style={loading ? { ...orderBtn, opacity: 0.6 } : orderBtn} disabled={loading}>
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const paymentMethodsContainer = { display: 'flex', flexDirection: 'column', gap: '12px' };
const paymentOption = (isActive) => ({ display: 'flex', alignItems: 'center', padding: '15px', borderRadius: '10px', border: isActive ? '2px solid #d4a373' : '1px solid #ddd', backgroundColor: isActive ? '#fffcf2' : '#fff', cursor: 'pointer', transition: '0.3s' });
const checkoutWrapper = { backgroundColor: '#fffcf2', minHeight: '90vh', padding: '50px 0' };
const container = { maxWidth: '1100px', margin: '0 auto', padding: '0 20px' };
const titleStyle = { textAlign: 'center', marginBottom: '40px', fontWeight: '800', letterSpacing: '1px' };
const checkoutFlex = { display: 'flex', gap: '40px', flexWrap: 'wrap' };
const formSection = { flex: '1 1 500px', backgroundColor: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' };
const orderSection = { flex: '1 1 400px' };
const subTitle = { fontSize: '1.2rem', marginBottom: '25px', color: '#432818', borderBottom: '2px solid #d4a373', paddingBottom: '10px', width: 'fit-content' };
const inputGroup = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#555' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' };
const orderBox = { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' };
const itemSummary = { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.95rem' };
const qtyBadge = { backgroundColor: '#d4a373', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', height: 'fit-content' };
const itemName = { color: '#555', fontWeight: '500' };
const itemPrice = { fontWeight: '600' };
const divider = { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' };
const summaryLine = { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' };
const totalLine = { display: 'flex', justifyContent: 'space-between', marginTop: '15px', fontWeight: 'bold', fontSize: '1.2rem' };
const orderBtn = { width: '100%', padding: '15px', backgroundColor: '#432818', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '20px' };

export default Checkout;
