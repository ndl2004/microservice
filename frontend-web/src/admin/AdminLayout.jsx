import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xử lý đăng xuất admin
    localStorage.removeItem('admin_id');
    navigate('/login');
  };

  return (
    <div style={layoutWrapper}>
      {/* SIDEBAR BÊN TRÁI */}
      <aside style={sidebarStyle}>
        <div style={logoSection}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>LUNA ADMIN</h2>
        </div>
        
        <nav style={navLinksGroup}>
          <Link to="/admin" style={navItem}>📊 Tổng quan</Link>
          <Link to="/admin/orders" style={navItem}>📜 Quản lý đơn hàng</Link>
          <Link to="/admin/products" style={navItem}>📦 Quản lý sản phẩm</Link>
          <Link to="/admin/users" style={navItem}>👥 Người dùng</Link>
          <Link to="/admin/news" style={navItem}>📰 Tin tức</Link>
        </nav>

        <button onClick={handleLogout} style={btnLogout}>Đăng xuất</button>
      </aside>

      {/* NỘI DUNG BÊN PHẢI */}
      <div style={mainBody}>
        <header style={topHeader}>
          <h3 style={{ margin: 0 }}>Hệ thống quản trị website</h3>
          <div style={{ color: '#666' }}>Xin chào, <strong>Quản trị viên</strong></div>
        </header>

        <div style={contentArea}>
          {/* Outlet là nơi nội dung các trang con sẽ hiện ra */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const layoutWrapper = { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' };

const sidebarStyle = {
  width: '260px', backgroundColor: '#001529', color: '#fff',
  position: 'fixed', height: '100vh', display: 'flex', flexDirection: 'column'
};

const logoSection = { padding: '24px', textAlign: 'center', borderBottom: '1px solid #002140' };

const navLinksGroup = { display: 'flex', flexDirection: 'column', padding: '15px 0', flex: 1 };

const navItem = {
  padding: '16px 24px', color: '#a6adb4', textDecoration: 'none',
  fontSize: '1rem', transition: '0.3s', borderLeft: '4px solid transparent'
};

const mainBody = { flex: 1, marginLeft: '260px' };

const topHeader = {
  height: '64px', backgroundColor: '#fff', padding: '0 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
};

const contentArea = { padding: '24px' };

const btnLogout = {
  margin: '20px', padding: '10px', backgroundColor: '#ff4d4f', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
};

export default AdminLayout;