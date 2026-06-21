import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.png';

const HeroBanner = () => {
  return (
    <section style={bannerSection}>
      <div style={container}>
        <div style={contentBox}>
          <div style={badgeContainer}>
            <span style={subTitle}>LUNA COSMETICS PREMIUM</span>
          </div>
          <h1 style={mainTitle}>
            Nâng niu vẻ đẹp <br />
            <span style={{ color: '#d4a373' }}>thuần khiết nhất</span>
          </h1>
          <p style={description}>
            Mỗi làn da đều xứng đáng được chăm sóc bằng những sản phẩm tinh tế,
            an toàn và phù hợp. Khám phá bộ sưu tập mỹ phẩm Luna ngay hôm nay.
          </p>
          <div style={buttonGroup}>
            <Link to="/san-pham" style={primaryBtn}>MUA SẮM NGAY</Link>
            <Link to="/tin-tuc" style={secondaryBtn}>KHÁM PHÁ THÊM</Link>
          </div>
          <div style={trustIndicators}>
            <div style={trustItem}><strong>10k+</strong> Khách hàng tin dùng</div>
            <div style={{ height: '20px', width: '1px', backgroundColor: '#ddd' }} />
            <div style={trustItem}><strong>100%</strong> Chính hãng</div>
          </div>
        </div>

        <div style={imageContainer}>
          <div style={floatingBadge}>Best Seller</div>
          <div style={mainImageWrapper}>
            <img src={heroImage} alt="Mỹ phẩm Luna" style={imageStyle} />
          </div>
          <div style={circleDecor} />
          <div style={squareDecor} />
        </div>
      </div>
    </section>
  );
};

const bannerSection = { backgroundColor: '#fdfcf0', padding: '80px 0', overflow: 'hidden', position: 'relative' };
const container = { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px', flexWrap: 'wrap' };
const contentBox = { flex: '1 1 520px', zIndex: 10 };
const badgeContainer = { marginBottom: '20px' };
const subTitle = { fontSize: '0.85rem', fontWeight: '800', color: '#a98467', letterSpacing: '2px', backgroundColor: '#faedcd', padding: '6px 15px', borderRadius: '50px' };
const mainTitle = { fontSize: '3.4rem', fontWeight: '900', color: '#432818', lineHeight: '1.1', margin: '0 0 25px 0' };
const description = { fontSize: '1.05rem', color: '#555', lineHeight: '1.7', marginBottom: '36px', maxWidth: '520px' };
const buttonGroup = { display: 'flex', gap: '16px', marginBottom: '34px', flexWrap: 'wrap' };
const primaryBtn = { backgroundColor: '#432818', color: 'white', padding: '16px 34px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', boxShadow: '0 10px 25px rgba(67, 40, 24, 0.25)' };
const secondaryBtn = { backgroundColor: 'transparent', color: '#432818', padding: '16px 34px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', border: '2px solid #432818' };
const trustIndicators = { display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem', color: '#777' };
const trustItem = { display: 'flex', gap: '5px' };
const imageContainer = { flex: '1 1 420px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const mainImageWrapper = { position: 'relative', zIndex: 5, borderRadius: '32px 80px 32px 80px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.12)', width: '100%', maxWidth: '460px', aspectRatio: '1 / 1' };
const imageStyle = { width: '100%', height: '100%', display: 'block', objectFit: 'cover' };
const floatingBadge = { position: 'absolute', top: '40px', right: '-10px', backgroundColor: '#d4a373', color: 'white', padding: '12px 25px', borderRadius: '12px', fontWeight: 'bold', zIndex: 10, transform: 'rotate(5deg)' };
const circleDecor = { position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: '#faedcd', zIndex: 1, right: '-60px', bottom: '-60px' };
const squareDecor = { position: 'absolute', width: '90px', height: '90px', border: '10px solid #faedcd', borderRadius: '20px', zIndex: 6, left: '-30px', bottom: '40px', transform: 'rotate(-15deg)' };

export default HeroBanner;
