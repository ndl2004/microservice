import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import fallbackImage from '../assets/hero.png';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [inventoryQuantity, setInventoryQuantity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, inventoryRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/inventory/${id}`).catch(() => ({ data: null })),
        ]);

        setProduct(productRes.data);
        setInventoryQuantity(inventoryRes.data?.quantity ?? null);
      } catch (err) {
        console.error('Product detail error:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantity = (type) => {
    if (type === 'decrease' && quantity > 1) setQuantity(quantity - 1);
    if (type === 'increase') {
      if (inventoryQuantity !== null && quantity >= inventoryQuantity) {
        toast.info('Số lượng mua đã đạt mức tồn kho hiện tại.');
        return;
      }
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (inventoryQuantity !== null && inventoryQuantity <= 0) {
      toast.error('Sản phẩm hiện đã hết hàng.');
      return;
    }
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng.`);
    navigate('/cart');
  };

  if (loading) return <div style={centerMsgStyle}>Đang tải thông tin sản phẩm...</div>;
  if (!product) return <div style={centerMsgStyle}>Không tìm thấy sản phẩm.</div>;

  return (
    <div style={pageWrapper}>
      <div style={containerStyle}>
        <div style={breadcrumbStyle}>
          <Link to="/" style={linkStyle}>Trang chủ</Link>
          <span style={{ margin: '0 10px', color: '#888' }}>/</span>
          <Link to="/san-pham" style={linkStyle}>Sản phẩm</Link>
          <span style={{ margin: '0 10px', color: '#888' }}>/</span>
          <span style={{ color: '#d4a373', fontWeight: 'bold' }}>{product.name}</span>
        </div>

        <div style={contentWrapper}>
          <div style={imageSection}>
            <div style={imageBox}>
              {product.main_image ? (
                <img
                  src={product.main_image}
                  alt={product.name}
                  style={bigImgStyle}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
              ) : (
                <div style={fallbackImageStyle}>{product.name?.charAt(0)?.toUpperCase() || 'L'}</div>
              )}
            </div>
          </div>

          <div style={infoSection}>
            <span style={categoryBadge}>{product.category_name || 'Microservices Product Service'}</span>
            <h1 style={nameStyle}>{product.name}</h1>
            <div style={priceContainer}>
              <span style={priceStyle}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price * quantity)}</span>
              <span style={stockStatus}>
                {inventoryQuantity === null ? 'Chưa cập nhật tồn kho' : `Còn ${inventoryQuantity} sản phẩm`}
              </span>
            </div>
            <hr style={dividerStyle} />
            <div style={descBoxStyle}>
              <h3 style={{ color: '#555', marginBottom: '10px' }}>Chi tiết sản phẩm</h3>
              <p style={descParagraphStyle}>
                {product.description || 'Sản phẩm được đọc từ Product Service qua API Gateway. Redis cache đang được áp dụng cho danh sách sản phẩm.'}
              </p>
              {product.brand_name && <p style={metaLineStyle}>Thương hiệu: <strong>{product.brand_name}</strong></p>}
            </div>
            <div style={actionRow}>
              <div style={quantityWrapper}>
                <button style={qtyBtn} onClick={() => handleQuantity('decrease')}>-</button>
                <input type="text" value={quantity} readOnly style={qtyInput} />
                <button style={qtyBtn} onClick={() => handleQuantity('increase')}>+</button>
              </div>
              <button style={addCartBtn} onClick={handleAddToCart}>MUA NGAY</button>
            </div>
            <div style={trustBox}>
              <p>Giao hàng toàn quốc</p>
              <p>Tạo đơn hàng qua Order Service</p>
              <p>Order Service gọi Product/User bằng OpenFeign và gửi RabbitMQ xử lý tồn kho</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const pageWrapper = { backgroundColor: '#fffcf2', minHeight: '80vh', padding: '40px 0' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' };
const centerMsgStyle = { textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#555' };
const breadcrumbStyle = { marginBottom: '30px', fontSize: '0.9rem' };
const linkStyle = { color: '#555', textDecoration: 'none' };
const contentWrapper = { display: 'flex', gap: '60px', flexWrap: 'wrap', backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' };
const imageSection = { flex: '1 1 400px' };
const imageBox = { borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#fafafa' };
const bigImgStyle = { width: '100%', aspectRatio: '1 / 1', display: 'block', objectFit: 'cover' };
const fallbackImageStyle = { width: '100%', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f7eadc, #e5f0dc)', color: '#432818', fontSize: '6rem', fontWeight: '800' };
const infoSection = { flex: '1 1 500px', display: 'flex', flexDirection: 'column' };
const categoryBadge = { padding: '5px 15px', backgroundColor: '#f4e6d9', color: '#d4a373', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '15px', width: 'fit-content' };
const nameStyle = { fontSize: '2.2rem', color: '#432818', margin: '0 0 15px 0', lineHeight: '1.3' };
const priceContainer = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' };
const priceStyle = { fontSize: '2.1rem', color: '#e76f51', fontWeight: 'bold' };
const stockStatus = { padding: '5px 10px', backgroundColor: '#eef8e6', color: '#5b8c00', fontSize: '0.85rem', borderRadius: '5px', border: '1px solid #b7eb8f' };
const dividerStyle = { border: 'none', borderTop: '1px dashed #ddd', margin: '20px 0' };
const descBoxStyle = { marginBottom: '30px', flex: 1, textAlign: 'left' };
const descParagraphStyle = { lineHeight: '1.8', color: '#666', fontSize: '1rem', margin: 0, whiteSpace: 'pre-wrap' };
const metaLineStyle = { margin: '14px 0 0', color: '#555' };
const actionRow = { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' };
const quantityWrapper = { display: 'flex', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', height: '50px' };
const qtyBtn = { width: '40px', backgroundColor: '#fafafa', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#555' };
const qtyInput = { width: '60px', textAlign: 'center', border: 'none', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', fontSize: '1rem', fontWeight: 'bold', color: '#333' };
const addCartBtn = { flex: 1, padding: '0 30px', backgroundColor: '#d4a373', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', height: '50px', transition: '0.3s' };
const trustBox = { marginTop: '20px', padding: '20px', backgroundColor: '#fafafa', borderRadius: '10px', border: '1px dashed #ddd', fontSize: '0.9rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' };

export default ProductDetail;
