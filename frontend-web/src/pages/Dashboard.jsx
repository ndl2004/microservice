import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    totalSpent: 0, 
    pending: 0, 
    lastOrderDate: null 
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fullName = localStorage.getItem('user_name') || 'Khách hàng';

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) { navigate('/login'); return; }

      try {
        setLoading(true);
        const res = await api.get(`/orders/user/${userId}`);
        const data = res.data;
        setOrders(data);

        // Tính toán thống kê tương tự logic PHP
        const totalSpent = data.reduce((sum, o) => sum + parseFloat((o.totalAmount ?? o.total_amount ?? 0)), 0);
        const pending = data.filter(o => o.status?.toLowerCase() === 'pending').length;
        const lastOrder = data.length > 0 ? (data[0].createdAt ?? data[0].created_at ?? null) : null;

        setStats({ 
          totalOrders: data.length, 
          totalSpent, 
          pending, 
          lastOrderDate: lastOrder 
        });
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ Đang tải dữ liệu...</div>;

  return (
    <div style={bodyStyle}>
      <div style={containerStyle}>
        
        {/* --- 1. WELCOME HEADER (Gradient Blue) --- */}
        <div style={welcomeHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={avatarCircle}>
              {fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={welcomeTitle}>Chào mừng trở lại, {fullName}!</h1>
              <p style={welcomeSub}>Quản lý tài khoản và đơn hàng của bạn tại Luna Cosmetics</p>
            </div>
          </div>
          <div style={{ mt: '24px', display: 'flex', gap: '16px', marginTop: '24px' }}>
            <Link to="/san-pham" style={bannerBtn}>🛍️ Mua sắm ngay</Link>
            <Link to="/order-history" style={bannerBtn}>📋 Xem đơn hàng</Link>
          </div>
        </div>

        {/* --- 2. STATS CARDS (4 Columns) --- */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div>
              <p style={statLabel}>Tổng đơn hàng</p>
              <p style={statValue}>{stats.totalOrders}</p>
            </div>
            <div style={iconBox('#ebf5ff', '#2563eb')}>📦</div>
          </div>

          <div style={statCardStyle}>
            <div>
              <p style={statLabel}>Tổng chi tiêu</p>
              <p style={statValue}>{formatPrice(stats.totalSpent)}</p>
            </div>
            <div style={iconBox('#f0fdf4', '#16a34a')}>💰</div>
          </div>

          <div style={statCardStyle}>
            <div>
              <p style={statLabel}>Đơn chờ xử lý</p>
              <p style={statValue}>{stats.pending}</p>
            </div>
            <div style={iconBox('#fef9c3', '#ca8a04')}>⏳</div>
          </div>

          <div style={statCardStyle}>
            <div>
              <p style={statLabel}>Lần mua cuối</p>
              <p style={statValueSmall}>
                {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString('vi-VN') : 'Chưa có'}
              </p>
            </div>
            <div style={iconBox('#f3e8ff', '#9333ea')}>✨</div>
          </div>
        </div>

        {/* --- 3. MAIN CONTENT GRID (2/3 - 1/3) --- */}
        <div style={mainContentGrid}>
          
          {/* Cột trái: Đơn hàng gần đây */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={contentBoxStyle}>
              <div style={boxHeaderStyle}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Đơn hàng gần đây</h3>
                <Link to="/order-history" style={linkBlue}>Xem tất cả →</Link>
              </div>
              <div style={{ padding: '24px' }}>
                {orders.length === 0 ? (
                   <div style={{ textAlign: 'center', py: '32px' }}>
                      <p style={{ color: '#6b7280' }}>Chưa có đơn hàng nào</p>
                   </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} style={orderItemStyle}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600', color: '#2563eb' }}>#{order.id}</span>
                            <span style={statusBadge}>{order.status}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                            Đặt ngày {new Date((order.createdAt ?? order.created_at ?? Date.now())).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontWeight: '700' }}>{formatPrice((order.totalAmount ?? order.total_amount ?? 0))}</p>
                          <Link to="/order-history" style={{ fontSize: '0.85rem', color: '#2563eb', textDecoration: 'none' }}>Chi tiết →</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Thao tác & Mẹo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={contentBoxStyle}>
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Thao tác nhanh</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Link to="/san-pham" style={quickActionItem}>🛍️ Mua sắm</Link>
                  <Link to="/profile" style={quickActionItem}>👤 Cập nhật hồ sơ</Link>
                  <Link to="/chat" style={quickActionItem}>💬 Chat hỗ trợ</Link>
                </div>
              </div>
            </div>

            <div style={tipBoxStyle}>
               <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Mẹo làm đẹp</h3>
               <div style={tipItem}>
                  <p style={{ fontWeight: '600', margin: '0 0 4px 0' }}>Chăm sóc da mùa đông</p>
                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: 0 }}>Bí quyết giữ ẩm cho da trong thời tiết hanh khô...</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES SYSTEM (Dựa trên Tailwind CSS từ file mẫu) ---
const bodyStyle = { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '32px 0' };
const containerStyle = { maxWidth: '1280px', margin: '0 auto', padding: '0 32px' };

const welcomeHeaderStyle = {
  background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
  borderRadius: '12px', padding: '32px', color: 'white', marginBottom: '32px'
};

const avatarCircle = {
  width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)',
  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '1.5rem', fontWeight: 'bold'
};

const welcomeTitle = { fontSize: '1.875rem', fontWeight: '700', margin: '0 0 8px 0' };
const welcomeSub = { fontSize: '1.125rem', color: '#dbeafe', margin: 0 };
const bannerBtn = { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', transition: '0.3s' };

const statsGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' };
const statCardStyle = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const statLabel = { color: '#4b5563', fontSize: '0.875rem', fontWeight: '500', margin: '0 0 4px 0' };
const statValue = { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 };
const statValueSmall = { fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 };

const iconBox = (bg, color) => ({ width: '48px', height: '48px', backgroundColor: bg, color: color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' });

const mainContentGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' };
const contentBoxStyle = { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };
const boxHeaderStyle = { padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const linkBlue = { color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' };

const orderItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' };
const statusBadge = { padding: '2px 8px', backgroundColor: '#fef9c3', color: '#ca8a04', fontSize: '0.75rem', borderRadius: '9999px', fontWeight: '600' };

const quickActionItem = { display: 'block', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', textDecoration: 'none', color: '#111827', fontWeight: '600', border: '1px solid transparent' };
const tipBoxStyle = { background: 'linear-gradient(to bottom right, #eff6ff, #f5f3ff)', padding: '24px', borderRadius: '12px', border: '1px solid #bfdbfe' };
const tipItem = { backgroundColor: 'white', padding: '12px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' };

export default Dashboard;
