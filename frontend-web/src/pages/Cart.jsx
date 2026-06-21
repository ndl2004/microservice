import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import fallbackImage from '../assets/hero.png';

const Cart = () => {
  const { cartItems, removeFromCart, addToCart, setCartItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const increaseQty = (item) => {
    addToCart(item, 1, false);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      setCartItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
      );
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warn('Vui lòng đăng nhập để tiến hành thanh toán.');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (cartItems.length === 0) {
    return (
      <div style={emptyCartStyle}>
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p style={{ color: '#888', marginBottom: '20px' }}>Hãy chọn những sản phẩm yêu thích trước khi thanh toán.</p>
        <Link to="/san-pham" style={continueBtn}>TIẾP TỤC MUA SẮM</Link>
      </div>
    );
  }

  return (
    <div style={cartPageWrapper}>
      <div style={container}>
        <h1 style={titleStyle}>Giỏ hàng của bạn ({cartItems.length})</h1>

        <div style={cartContent}>
          <div style={cartItemsSection}>
            {cartItems.map((item) => (
              <div key={item.id} style={itemCard}>
                <img
                  src={item.main_image || fallbackImage}
                  alt={item.name}
                  style={itemImg}
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
                <div style={itemInfo}>
                  <Link to={`/product/${item.id}`} style={itemName}>{item.name}</Link>
                  <p style={itemPrice}>{formatPrice(item.price)}</p>
                  <div style={qtyActions}>
                    <div style={qtyBox}>
                      <button type="button" style={qtyBtn} onClick={() => decreaseQty(item)}>-</button>
                      <span style={qtyText}>{item.quantity}</span>
                      <button type="button" style={qtyBtn} onClick={() => increaseQty(item)}>+</button>
                    </div>
                    <button
                      type="button"
                      style={removeBtn}
                      onClick={() => {
                        removeFromCart(item.id);
                        toast.info('Đã xóa sản phẩm khỏi giỏ hàng.');
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                <div style={subtotal}>{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div style={summarySection}>
            <div style={summaryCard}>
              <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Tóm tắt đơn hàng</h3>
              <div style={summaryRow}>
                <span>Tạm tính:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div style={summaryRow}>
                <span>Phí vận chuyển:</span>
                <span style={{ color: '#5b8c00' }}>Miễn phí</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '15px 0' }} />
              <div style={totalRow}>
                <span>Tổng cộng:</span>
                <span style={{ color: '#e76f51' }}>{formatPrice(totalPrice)}</span>
              </div>
              <button type="button" style={checkoutBtn} onClick={handleCheckout}>TIẾN HÀNH THANH TOÁN</button>
              <Link to="/san-pham" style={backLink}>Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cartPageWrapper = { backgroundColor: '#fffcf2', minHeight: '90vh', padding: '50px 0' };
const container = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };
const titleStyle = { fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#432818' };
const cartContent = { display: 'flex', gap: '30px', flexWrap: 'wrap' };
const cartItemsSection = { flex: '1 1 700px' };
const itemCard = { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '20px', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' };
const itemImg = { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', flex: '0 0 100px' };
const itemInfo = { flex: 1, padding: '0 20px', minWidth: 0 };
const itemName = { fontSize: '1.1rem', fontWeight: 'bold', color: '#333', textDecoration: 'none', display: 'block', marginBottom: '5px' };
const itemPrice = { color: '#888', marginBottom: '10px' };
const qtyActions = { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' };
const qtyBox = { display: 'flex', border: '1px solid #ddd', borderRadius: '5px' };
const qtyBtn = { padding: '5px 12px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '1.2rem' };
const qtyText = { padding: '5px 15px', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', fontWeight: 'bold' };
const removeBtn = { color: '#ff4d4f', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '0.9rem' };
const subtotal = { fontSize: '1.2rem', fontWeight: 'bold', color: '#432818', minWidth: '120px', textAlign: 'right' };
const summarySection = { flex: '1 1 350px' };
const summaryCard = { backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' };
const summaryRow = { display: 'flex', justifyContent: 'space-between', margin: '15px 0', color: '#555' };
const totalRow = { display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontWeight: 'bold', fontSize: '1.3rem' };
const checkoutBtn = { width: '100%', padding: '15px', backgroundColor: '#d4a373', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' };
const backLink = { display: 'block', textAlign: 'center', marginTop: '15px', color: '#888', textDecoration: 'none', fontSize: '0.9rem' };
const emptyCartStyle = { textAlign: 'center', padding: '100px 20px', backgroundColor: '#fffcf2', minHeight: '70vh' };
const continueBtn = { display: 'inline-block', padding: '12px 30px', backgroundColor: '#333', color: '#fff', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', marginTop: '20px' };

export default Cart;
