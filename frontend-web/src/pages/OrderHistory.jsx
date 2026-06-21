import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  const fullName = localStorage.getItem('user_name') || 'Khách hàng';

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        toast.warn('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/orders/user/${userId}`);
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
          navigate('/login');
        } else {
          toast.error('Không thể tải lịch sử đơn hàng.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.total_amount ?? 0), 0);
    const pending = orders.filter((order) => order.status?.toLowerCase() === 'pending').length;
    return { totalOrders: orders.length, totalSpent, pending };
  }, [orders]);

  const handleShowDetail = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      toast.error('Không thể lấy thông tin chi tiết đơn hàng.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;

    try {
      await api.put(`/orders/${orderId}/cancel`, {});
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: 'CANCELLED' } : order)));
      toast.success('Đã hủy đơn hàng thành công.');
    } catch (err) {
      console.error('Lỗi khi hủy đơn:', err.response?.data || err.message);
      toast.error('Không thể hủy đơn hàng vào lúc này.');
    }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const getStatusLabel = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'Chờ xử lý';
    if (s === 'paid') return 'Đã thanh toán';
    if (s === 'completed') return 'Hoàn tất';
    if (s === 'cancelled') return 'Đã hủy';
    return status || 'Không rõ';
  };

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return { backgroundColor: '#fef9c3', color: '#ca8a04' };
    if (s === 'paid' || s === 'completed' || s === 'processing') return { backgroundColor: '#dcfce7', color: '#16a34a' };
    if (s === 'cancelled') return { backgroundColor: '#fee2e2', color: '#ef4444' };
    return { backgroundColor: '#f3f4f6', color: '#374151' };
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div style={dashboardWrapper}>
      <div style={container}>
        <div style={welcomeBannerBlue}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={avatarCircleLarge}>{fullName.substring(0, 2).toUpperCase()}</div>
            <div>
              <h1 style={titleMain}>Chào mừng trở lại, {fullName}!</h1>
              <p style={subtitleMain}>Theo dõi đơn hàng của bạn tại Luna Cosmetics</p>
            </div>
          </div>
          <div style={bannerActionGroup}>
            <Link to="/san-pham" style={btnBannerAction}>Tiếp tục mua sắm</Link>
            <Link to="/dashboard" style={btnBannerAction}>Về trang tổng quan</Link>
          </div>
        </div>

        <div style={statsGridRow}>
          <StatCard label="Tổng đơn hàng" value={stats.totalOrders} />
          <StatCard label="Tổng chi tiêu" value={formatPrice(stats.totalSpent)} />
          <StatCard label="Đơn chờ xử lý" value={stats.pending} />
        </div>

        <div style={tableContentCard}>
          <div style={tableHeaderBox}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Lịch sử đơn hàng</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Bạn chưa có đơn hàng nào.</div>
            ) : (
              <table style={fullTableStyle}>
                <thead>
                  <tr style={tableHeadRow}>
                    <th style={thCellStyle}>Mã đơn</th>
                    <th style={thCellStyle}>Ngày đặt</th>
                    <th style={thCellStyle}>Trạng thái</th>
                    <th style={{ ...thCellStyle, textAlign: 'right' }}>Tổng tiền</th>
                    <th style={{ ...thCellStyle, textAlign: 'center' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={tableBodyRow}>
                      <td style={tdCellStyle}><span style={orderCodeText}>#{order.id}</span></td>
                      <td style={tdCellStyle}>{new Date(order.createdAt ?? order.created_at ?? Date.now()).toLocaleDateString('vi-VN')}</td>
                      <td style={tdCellStyle}>
                        <span style={{ ...statusBadgeMini, ...getStatusBadgeStyle(order.status) }}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td style={{ ...tdCellStyle, textAlign: 'right', fontWeight: '700' }}>{formatPrice(order.totalAmount ?? order.total_amount ?? 0)}</td>
                      <td style={{ ...tdCellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                          <button type="button" onClick={() => handleShowDetail(order.id)} style={btnViewDetail}>Chi tiết</button>
                          {order.status?.toLowerCase() === 'pending' && (
                            <button type="button" onClick={() => handleCancelOrder(order.id)} style={btnCancelAction}>Hủy đơn</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div style={modalOverlayFixed}>
          <div style={modalContainerLarge}>
            <div style={modalHeaderRow}>
              <h3 style={{ margin: 0 }}>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button type="button" onClick={() => setSelectedOrder(null)} style={closeIconBtn}>&times;</button>
            </div>
            <div style={modalBodyContent}>
              <div style={infoBoxGrid}>
                <p><strong>Mã người dùng:</strong> {selectedOrder.userId}</p>
                <p><strong>Trạng thái:</strong> {getStatusLabel(selectedOrder.status)}</p>
                <p><strong>Tổng tiền:</strong> {formatPrice(selectedOrder.totalAmount ?? selectedOrder.total_amount ?? 0)}</p>
              </div>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Backend hiện lưu tổng tiền và trạng thái đơn hàng. Chi tiết từng sản phẩm có trong response tạo đơn,
                nếu muốn xem lại ở lịch sử cần bổ sung bảng order_items trong Order Service.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div style={cardStatContainer}>
    <div>
      <p style={cardStatLabel}>{label}</p>
      <p style={cardStatValue}>{value}</p>
    </div>
  </div>
);

const dashboardWrapper = { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '40px 0', fontFamily: "'Inter', sans-serif" };
const container = { maxWidth: '1280px', margin: '0 auto', padding: '0 24px' };
const welcomeBannerBlue = { background: 'linear-gradient(to right, #2563eb, #1d4ed8)', borderRadius: '16px', padding: '40px', color: 'white', marginBottom: '32px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' };
const avatarCircleLarge = { width: '70px', height: '70px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)' };
const titleMain = { fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0' };
const subtitleMain = { fontSize: '1.1rem', opacity: 0.9, margin: 0 };
const bannerActionGroup = { display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' };
const btnBannerAction = { backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' };
const statsGridRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '32px' };
const cardStatContainer = { backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' };
const cardStatLabel = { color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', margin: '0 0 4px 0' };
const cardStatValue = { fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 };
const tableContentCard = { backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' };
const tableHeaderBox = { padding: '20px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fff' };
const fullTableStyle = { width: '100%', borderCollapse: 'collapse' };
const tableHeadRow = { backgroundColor: '#f9fafb' };
const thCellStyle = { padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tableBodyRow = { borderTop: '1px solid #f3f4f6' };
const tdCellStyle = { padding: '16px 24px', color: '#374151', fontSize: '0.95rem' };
const orderCodeText = { color: '#2563eb', fontWeight: '600' };
const statusBadgeMini = { padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' };
const btnViewDetail = { color: '#2563eb', background: 'none', border: '1px solid #2563eb', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' };
const btnCancelAction = { color: '#ef4444', background: 'none', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' };
const modalOverlayFixed = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContainerLarge = { backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' };
const modalHeaderRow = { padding: '20px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeIconBtn = { background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#9ca3af' };
const modalBodyContent = { padding: '32px' };
const infoBoxGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', marginBottom: '24px' };

export default OrderHistory;
