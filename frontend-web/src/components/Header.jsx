import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const { totalQuantity } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const hotSearch = ['Kem chống nắng', 'Tẩy trang', 'Sữa rửa mặt'];
  const quickCategories = ['Chăm sóc da', 'Trang điểm', 'Nước hoa', 'Chăm sóc tóc'];
  const topBrands = ['LunaCos', 'La Roche-Posay', 'Maybelline', 'Innisfree', 'MAC'];

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('user_name');
    setIsLoggedIn(Boolean(token && storedName));
    setUserName(storedName || '');
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('authChange', checkLoginStatus);

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('authChange', checkLoginStatus);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user');
    toast.info('Đã đăng xuất. Hẹn gặp lại bạn!');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/login');
  };

  const submitSearch = (value = searchKey) => {
    const keyword = value.trim();
    if (!keyword) return;
    setIsSearchFocused(false);
    navigate(`/san-pham?search=${encodeURIComponent(keyword)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <header style={headerWrapper}>
      <div style={topBarStyle}>
        <div style={containerStyle}>
          <div style={quickCatGroup}>
            {hotSearch.map((cat) => (
              <button key={cat} type="button" onClick={() => submitSearch(cat)} style={topButton}>{cat}</button>
            ))}
          </div>
          <div style={topRightInfo}>
            <span>Hotline: 1800 6324</span>
            <Link to="/lien-he" style={topNavLink}>Hệ thống cửa hàng</Link>
          </div>
        </div>
      </div>

      <div style={mainHeaderStyle}>
        <div style={containerStyle}>
          <Link to="/" style={logoWrapper}>
            <div style={logoMark}>L</div>
            <div style={logoTextGroupStyle}>
              <div style={logoMain}>LUNA<span style={{ color: '#fff' }}>COSMETICS</span></div>
              <div style={logoSlogan}>Chất lượng thật - Giá trị thật</div>
            </div>
          </Link>

          <div style={{ position: 'relative', flex: '0 1 450px' }} ref={searchRef}>
            <form onSubmit={handleSearch} style={{ ...searchFormStyle, borderRadius: isSearchFocused ? '20px 20px 0 0' : '30px' }}>
              <input
                type="text"
                placeholder="Tìm sản phẩm, thương hiệu bạn mong muốn..."
                style={searchInputStyle}
                value={searchKey}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button type="submit" style={searchBtnStyle}>Tìm</button>
            </form>

            {isSearchFocused && (
              <div style={suggestionWrapper}>
                <div style={suggestionSection}>
                  {hotSearch.map((item) => (
                    <button key={item} type="button" style={hotSearchTag} onClick={() => submitSearch(item)}>
                      {item}
                    </button>
                  ))}
                </div>

                <div style={suggestionGrid}>
                  {quickCategories.map((cat) => (
                    <button key={cat} type="button" style={catItemStyle} onClick={() => submitSearch(cat)}>
                      <span style={catIconStyle}>{cat.charAt(0)}</span>
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>

                <div style={brandRowStyle}>
                  {topBrands.map((brand) => (
                    <button key={brand} type="button" style={brandItemStyle} onClick={() => submitSearch(brand)}>
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={iconGroupStyle}>
            {isLoggedIn ? (
              <div
                style={userMenuWrapper}
                onMouseEnter={(e) => { e.currentTarget.querySelector('.account-dropdown').style.display = 'block'; }}
                onMouseLeave={(e) => { e.currentTarget.querySelector('.account-dropdown').style.display = 'none'; }}
              >
                <div style={actionBlock}>
                  <div style={avatarCircle}>{userName.charAt(0).toUpperCase()}</div>
                  <div style={actionText}>
                    <span style={actionSubText}>Chào, {userName}</span>
                    <span style={actionMainText}>Tài khoản</span>
                  </div>
                </div>
                <div className="account-dropdown" style={dropdownStyle}>
                  {localStorage.getItem('user_role') === 'admin' && (
                    <Link to="/admin" style={dropdownItem}>Bảng điều khiển Admin</Link>
                  )}
                  <Link to="/profile" style={dropdownItem}>Hồ sơ của tôi</Link>
                  <Link to="/order-history" style={dropdownItem}>Lịch sử mua hàng</Link>
                  <button type="button" onClick={handleLogout} style={logoutItem}>Đăng xuất</button>
                </div>
              </div>
            ) : (
              <Link to="/login" style={loginLinkStyle}>
                <div style={avatarCircle}>U</div>
                <div style={actionText}>
                  <span style={actionSubText}>Đăng nhập / Đăng ký</span>
                  <span style={actionMainText}>Tài khoản</span>
                </div>
              </Link>
            )}

            <Link to="/cart" style={cartWrapperStyle}>
              <div style={cartIconBlock}>
                🛒
                {totalQuantity > 0 && <span style={cartBadgeStyle}>{totalQuantity}</span>}
              </div>
              <div style={actionText}>
                <span style={actionSubText}>Giỏ hàng</span>
                <span style={actionMainText}>Của bạn</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <nav style={subNavBarStyle}>
        <div style={containerStyle}>
          <div style={navLinksLeft}>
            <Link to="/" style={navLinkItem}>TRANG CHỦ</Link>
            <Link to="/san-pham" style={navLinkItem}>SẢN PHẨM</Link>
            <Link to="/tin-tuc" style={navLinkItem}>TIN TỨC</Link>
            <Link to="/lien-he" style={navLinkItem}>LIÊN HỆ</Link>
          </div>
          <div style={flashSaleText}>FLASH DEAL 2H</div>
        </div>
      </nav>
    </header>
  );
};

const headerWrapper = { width: '100%', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' };
const topBarStyle = { backgroundColor: '#2b5a42', color: '#fff', padding: '6px 0', fontSize: '12px' };
const containerStyle = { maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px', gap: '20px' };
const quickCatGroup = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
const topRightInfo = { display: 'flex', gap: '20px', alignItems: 'center' };
const topNavLink = { color: '#fff', textDecoration: 'none', opacity: 0.9 };
const topButton = { color: '#fff', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: '12px', opacity: 0.9 };
const mainHeaderStyle = { backgroundColor: '#326e51', padding: '15px 0' };
const logoWrapper = { textDecoration: 'none', display: 'flex', alignItems: 'center', minWidth: '210px' };
const logoMark = { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffc107', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', marginRight: '10px' };
const logoTextGroupStyle = { display: 'flex', flexDirection: 'column' };
const logoMain = { fontSize: '24px', fontWeight: '900', color: '#ffc107', letterSpacing: '1px', lineHeight: '1' };
const logoSlogan = { fontSize: '10px', color: '#fff', opacity: 0.8, marginTop: '2px' };
const searchFormStyle = { flex: 1, display: 'flex', backgroundColor: '#fff', overflow: 'hidden', padding: '2px', transition: '0.2s' };
const searchInputStyle = { flex: 1, padding: '10px 20px', border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', minWidth: 0 };
const searchBtnStyle = { padding: '0 18px', backgroundColor: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', color: '#326e51' };
const suggestionWrapper = { position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: '#fff', borderRadius: '0 0 15px 15px', boxShadow: '0 15px 30px rgba(0,0,0,0.2)', padding: '15px', zIndex: 999, boxSizing: 'border-box' };
const suggestionSection = { marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' };
const hotSearchTag = { padding: '8px 15px', backgroundColor: '#f1f8f5', color: '#326e51', fontSize: '12px', borderRadius: '20px', cursor: 'pointer', border: 'none', textAlign: 'left' };
const suggestionGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' };
const catItemStyle = { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: 'none', textAlign: 'left' };
const catIconStyle = { width: '35px', height: '35px', borderRadius: '4px', backgroundColor: '#e8f3ed', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flex: '0 0 35px' };
const brandRowStyle = { borderTop: '1px solid #eee', paddingTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px' };
const brandItemStyle = { fontSize: '12px', color: '#666', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 };
const iconGroupStyle = { display: 'flex', alignItems: 'center', gap: '22px' };
const actionBlock = { display: 'flex', alignItems: 'center', color: '#fff', textDecoration: 'none', cursor: 'default' };
const actionText = { display: 'flex', flexDirection: 'column', marginLeft: '8px' };
const actionSubText = { fontSize: '11px', opacity: 0.85, lineHeight: '1.2' };
const actionMainText = { fontSize: '13px', fontWeight: 'bold' };
const loginLinkStyle = { display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff' };
const avatarCircle = { width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700' };
const cartWrapperStyle = { display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff' };
const cartIconBlock = { fontSize: '22px', position: 'relative' };
const cartBadgeStyle = { position: 'absolute', top: '-5px', right: '-10px', backgroundColor: '#ffc107', color: '#333', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const subNavBarStyle = { backgroundColor: '#fff', borderBottom: '1px solid #eee', padding: '12px 0' };
const navLinksLeft = { display: 'flex', gap: '30px' };
const navLinkItem = { textDecoration: 'none', color: '#333', fontWeight: '700', fontSize: '13px' };
const flashSaleText = { color: '#326e51', fontWeight: 'bold', fontSize: '13px' };
const userMenuWrapper = { position: 'relative' };
const dropdownStyle = { display: 'none', position: 'absolute', top: '100%', right: 0, backgroundColor: '#fff', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', minWidth: '200px', padding: '10px 0', borderRadius: '4px', zIndex: 1001 };
const dropdownItem = { display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' };
const logoutItem = { ...dropdownItem, color: '#e74c3c', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'transparent', width: '100%', textAlign: 'left' };

export default Header;
