import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from './HeroBanner';
import api from '../api/axios';
import fallbackImage from '../assets/hero.png';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        const data = response.data.data ? response.data.data : response.data;
        setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        setError('Không thể kết nối với máy chủ backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <div style={statusStyle}>Đang tải sản phẩm...</div>;
  if (error) return <div style={{ ...statusStyle, color: 'red' }}>{error}</div>;

  return (
    <div style={pageStyle}>
      <HeroBanner />

      <section style={featureSectionStyle}>
        <div style={containerStyle}>
          <div style={featureGridStyle}>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>✓</span>
              <div>
                <h4 style={featureTitleStyle}>MIỄN PHÍ VẬN CHUYỂN</h4>
                <p style={featureSubStyle}>Cho mọi đơn hàng từ 500k</p>
              </div>
            </div>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>★</span>
              <div>
                <h4 style={featureTitleStyle}>CAM KẾT CHÍNH HÃNG</h4>
                <p style={featureSubStyle}>Sản phẩm được kiểm tra rõ nguồn gốc</p>
              </div>
            </div>
            <div style={featureItemStyle}>
              <span style={featureIconStyle}>%</span>
              <div>
                <h4 style={featureTitleStyle}>ƯU ĐÃI THÀNH VIÊN</h4>
                <p style={featureSubStyle}>Nhiều chương trình dành riêng cho khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={containerStyle}>
        <h2 style={headerStyle}>Danh mục phổ biến</h2>
        <div style={categoryGridStyle}>
          {['Chăm sóc da', 'Trang điểm', 'Nước hoa', 'Chăm sóc tóc'].map((cat) => (
            <Link key={cat} to={`/san-pham?search=${encodeURIComponent(cat)}`} style={categoryCardStyle}>
              <div style={categoryCircleStyle}>{cat[0]}</div>
              <h4 style={{ color: '#432818', marginTop: '15px' }}>{cat}</h4>
            </Link>
          ))}
        </div>
      </section>

      <section style={containerStyle}>
        <h2 style={headerStyle}>Sản phẩm nổi bật</h2>
        <div style={gridStyle}>
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={cardStyle}>
                <div style={imageWrapperStyle}>
                  <img
                    src={product.main_image || fallbackImage}
                    alt={product.name}
                    style={imgStyle}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackImage) {
                        e.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                </div>
                <div style={infoStyle}>
                  <div>
                    <h3 style={titleStyle}>{product.name}</h3>
                    <p style={priceStyle}>{formatPrice(product.price)}</p>
                  </div>
                  <button type="button" style={btnStyle}>XEM CHI TIẾT</button>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Link to="/san-pham" style={allProductsBtnStyle}>XEM TẤT CẢ SẢN PHẨM</Link>
        </div>
      </section>

      <section style={promoBannerStyle}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Gia nhập cộng đồng Luna</h2>
          <p style={{ fontSize: '1.05rem', opacity: '0.9', marginBottom: '30px' }}>
            Đăng ký để nhận thông báo về sản phẩm mới và các ưu đãi dành riêng cho bạn.
          </p>
          <Link to="/register" style={subscribeBtnStyle}>ĐĂNG KÝ NGAY</Link>
        </div>
      </section>
    </div>
  );
};

const pageStyle = { width: '100%', minHeight: '100vh', backgroundColor: '#fdfdfd', overflowX: 'hidden' };
const statusStyle = { textAlign: 'center', padding: '100px', fontSize: '1.2rem' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' };
const headerStyle = { textAlign: 'center', marginBottom: '40px', fontSize: '28px', color: '#432818', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' };
const featureSectionStyle = { backgroundColor: '#fff', padding: '34px 0', borderBottom: '1px solid #eee' };
const featureGridStyle = { display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '24px' };
const featureItemStyle = { display: 'flex', alignItems: 'center', gap: '15px', textAlign: 'left' };
const featureIconStyle = { width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e8f3ed', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' };
const featureTitleStyle = { margin: 0, fontSize: '0.9rem', color: '#432818', fontWeight: 'bold' };
const featureSubStyle = { margin: 0, fontSize: '0.8rem', color: '#888' };
const categoryGridStyle = { display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' };
const categoryCardStyle = { textAlign: 'center', cursor: 'pointer', textDecoration: 'none' };
const categoryCircleStyle = { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fcfaf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#d4a373', border: '1px solid #faedcd' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px', width: '100%' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease', height: '100%' };
const imageWrapperStyle = { width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: '#f8f9fa' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' };
const infoStyle = { padding: '20px', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const titleStyle = { fontSize: '1.05rem', fontWeight: '600', color: '#2c3e50', margin: '0 0 10px 0', minHeight: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' };
const priceStyle = { fontSize: '1.25rem', fontWeight: 'bold', color: '#d4a373', margin: '10px 0' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#faedcd', color: '#432818', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };
const allProductsBtnStyle = { display: 'inline-block', padding: '14px 40px', backgroundColor: '#432818', color: '#fff', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(67, 40, 24, 0.2)' };
const promoBannerStyle = { backgroundColor: '#432818', color: '#fff', padding: '70px 20px', marginTop: '60px' };
const subscribeBtnStyle = { display: 'inline-block', padding: '15px 40px', borderRadius: '30px', border: 'none', backgroundColor: '#d4a373', color: '#fff', fontWeight: 'bold', textDecoration: 'none' };

export default Home;
