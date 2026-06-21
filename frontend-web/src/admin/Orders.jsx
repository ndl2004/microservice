import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const money = new Intl.NumberFormat('vi-VN');

const normalizeStatus = (status) => (status || 'pending').toLowerCase();

const statusLabel = (status) => {
  const value = normalizeStatus(status);
  if (value === 'completed') return 'Đã hoàn tất';
  if (value === 'paid') return 'Đã thanh toán';
  if (value === 'cancelled') return 'Đã hủy';
  return 'Chờ xử lý';
};

const paymentLabel = (method) => {
  const value = (method || 'cod').toLowerCase();
  if (value === 'vnpay') return 'VNPAY';
  return 'COD';
};

const paymentStatusLabel = (order) => {
  const paymentStatus = normalizeStatus(order.paymentStatus ?? order.payment_status);
  const orderStatus = normalizeStatus(order.status);
  return paymentStatus === 'paid' || paymentStatus === 'completed' || orderStatus === 'paid'
    ? 'Đã thanh toán'
    : 'Chưa thanh toán';
};

const getTotal = (order) => Number(order.totalAmount ?? order.total_amount ?? 0);

const getCreatedDate = (order) => {
  const value = order.createdAt ?? order.created_at;
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN');
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
      toast.error('Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders;
    return orders.filter((order) => normalizeStatus(order.status) === filterStatus);
  }, [filterStatus, orders]);

  const cancelOrder = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;

    try {
      await api.put(`/orders/${id}/cancel`, {});
      toast.success('Đã hủy đơn hàng thành công.');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Lỗi hủy đơn hàng:', err);
      toast.error('Không thể hủy đơn hàng.');
    }
  };

  const completeOrder = () => {
    toast.info('Backend Spring hiện chưa có API cập nhật đơn sang trạng thái hoàn tất.');
  };

  if (loading) {
    return <div style={loadingBox}>Đang tải danh sách đơn hàng...</div>;
  }

  return (
    <div style={page}>
      <div style={headerAction}>
        <h2 style={title}>Quản lý đơn hàng</h2>
        <select
          onChange={(e) => setFilterStatus(e.target.value)}
          style={filterSelect}
          value={filterStatus}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="paid">Đã thanh toán</option>
          <option value="completed">Đã hoàn tất</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div style={tableContainer}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Mã đơn</th>
              <th style={th}>Ngày đặt</th>
              <th style={th}>Khách hàng</th>
              <th style={th}>Thanh toán</th>
              <th style={th}>Tổng tiền</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} style={trStyle}>
                  <td style={td}>
                    <strong>#{order.id}</strong>
                  </td>
                  <td style={td}>{getCreatedDate(order)}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{order.fullName ?? order.full_name ?? 'Chưa có tên'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{order.phone ?? `User ID: ${order.userId ?? order.user_id ?? 'Chưa có'}`}</div>
                  </td>
                  <td style={td}>
                    <div style={paymentMethodTag(order.paymentMethod ?? order.payment_method)}>
                      {paymentLabel(order.paymentMethod ?? order.payment_method)}
                    </div>
                    <div style={paymentStatusText(paymentStatusLabel(order))}>
                      {paymentStatusLabel(order)}
                    </div>
                  </td>
                  <td style={td}>
                    <span style={priceText}>{money.format(getTotal(order))}đ</span>
                  </td>
                  <td style={td}>
                    <span style={getStatusStyle(order.status)}>{statusLabel(order.status)}</span>
                  </td>
                  <td style={td}>
                    <div style={actionGroup}>
                      <button onClick={() => setSelectedOrder(order)} style={btnDetail}>
                        Xem
                      </button>
                      {normalizeStatus(order.status) === 'pending' && (
                        <>
                          <button onClick={completeOrder} style={btnApprove}>
                            Duyệt
                          </button>
                          <button onClick={() => cancelOrder(order.id)} style={btnCancel}>
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={emptyCell}>
                  Không có đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h2 style={modalTitle}>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={btnCloseX}>
                &times;
              </button>
            </div>

            <div style={modalBody}>
              <div style={infoSection}>
                <h4 style={sectionTitle}>Thông tin đơn hàng</h4>
                <div style={infoGrid}>
                  <p>
                    <strong>Khách hàng:</strong> {selectedOrder.fullName ?? selectedOrder.full_name ?? 'Chưa có'}
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong> {getCreatedDate(selectedOrder)}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {selectedOrder.phone ?? 'Chưa có'}
                  </p>
                  <p>
                    <strong>User ID:</strong> {selectedOrder.userId ?? selectedOrder.user_id ?? 'Chưa có'}
                  </p>
                  <p>
                    <strong>Hình thức:</strong> {paymentLabel(selectedOrder.paymentMethod ?? selectedOrder.payment_method)}
                  </p>
                  <p>
                    <strong>Thanh toán:</strong>{' '}
                    <span style={paymentStatusText(paymentStatusLabel(selectedOrder))}>
                      {paymentStatusLabel(selectedOrder)}
                    </span>
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {statusLabel(selectedOrder.status)}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong> {money.format(getTotal(selectedOrder))}đ
                  </p>
                  <p style={{ gridColumn: '1 / -1' }}>
                    <strong>Địa chỉ:</strong> {selectedOrder.address ?? 'Chưa có'}
                  </p>
                  <p style={{ gridColumn: '1 / -1' }}>
                    <strong>Ghi chú:</strong> {selectedOrder.note ?? 'Không có'}
                  </p>
                </div>
              </div>

              <div style={infoSection}>
                <h4 style={sectionTitle}>Sản phẩm trong đơn</h4>
                {selectedOrder.items?.length > 0 ? (
                  <table style={miniTable}>
                    <thead>
                      <tr>
                        <th style={miniThLeft}>Sản phẩm</th>
                        <th style={miniThCenter}>Số lượng</th>
                        <th style={miniThRight}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => {
                        const name = item.product?.name ?? item.productName ?? item.product_name ?? `Sản phẩm #${item.productId ?? index + 1}`;
                        const quantity = Number(item.quantity ?? 1);
                        const price = Number(item.price ?? 0);

                        return (
                          <tr key={`${name}-${index}`}>
                            <td style={miniTdLeft}>
                              <span style={productThumb}>{name.charAt(0).toUpperCase()}</span>
                              <span>{name}</span>
                            </td>
                            <td style={miniTdCenter}>{quantity}</td>
                            <td style={miniTdRight}>{money.format(price * quantity)}đ</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={emptyItems}>Backend hiện chưa trả chi tiết sản phẩm cho đơn hàng này.</div>
                )}
              </div>

              <div style={totalSection}>
                <div style={finalTotal}>
                  <span>Tổng thanh toán:</span>
                  <span style={priceText}>{money.format(getTotal(selectedOrder))}đ</span>
                </div>
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={() => setSelectedOrder(null)} style={btnCloseMain}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const page = { padding: '20px' };
const loadingBox = { padding: '20px', color: '#475569' };
const headerAction = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' };
const title = { margin: 0, color: '#1e293b', fontSize: '1.35rem' };
const filterSelect = { padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#fff' };
const tableContainer = { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)', overflowX: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '900px' };
const th = { padding: '14px 15px', textAlign: 'left', color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', background: '#f8fafc', whiteSpace: 'nowrap' };
const td = { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', verticalAlign: 'middle', color: '#334155' };
const trStyle = { transition: 'background 0.2s' };
const emptyCell = { padding: '40px', textAlign: 'center', color: '#64748b' };
const actionGroup = { display: 'flex', gap: '6px', flexWrap: 'wrap' };
const priceText = { color: '#ef4444', fontWeight: 700 };
const btnDetail = { padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' };
const btnApprove = { padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnCancel = { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' };
const modalContent = { background: '#fff', borderRadius: '12px', width: '720px', maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' };
const modalHeader = { padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const modalTitle = { margin: 0, fontSize: '1.15rem', color: '#1e293b' };
const modalBody = { padding: '24px' };
const modalFooter = { padding: '16px 24px', borderTop: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#f8fafc' };
const infoSection = { marginBottom: '24px' };
const sectionTitle = { margin: '0 0 14px 0', color: '#334155', borderLeft: '4px solid #2563eb', paddingLeft: '12px', fontSize: '1rem' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 20px', fontSize: '0.9rem', color: '#475569' };
const miniTable = { width: '100%', borderCollapse: 'collapse' };
const miniThLeft = { textAlign: 'left', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const miniThCenter = { textAlign: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const miniThRight = { textAlign: 'right', padding: '10px 0', borderBottom: '1px solid #e2e8f0', color: '#64748b' };
const miniTdLeft = { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const miniTdCenter = { textAlign: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const miniTdRight = { textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #f1f5f9' };
const productThumb = { width: '36px', height: '36px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, flex: '0 0 auto' };
const emptyItems = { padding: '14px', borderRadius: '8px', background: '#f8fafc', color: '#64748b' };
const totalSection = { borderTop: '2px solid #f1f5f9', paddingTop: '15px' };
const finalTotal = { display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' };
const btnCloseMain = { padding: '8px 20px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' };
const btnCloseX = { background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' };

const paymentMethodTag = (method) => {
  const isCod = (method || 'cod').toLowerCase() === 'cod';
  return {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '0.72rem',
    fontWeight: 700,
    background: isCod ? '#f1f5f9' : '#e0f2fe',
    color: isCod ? '#475569' : '#0369a1',
    border: `1px solid ${isCod ? '#cbd5e1' : '#7dd3fc'}`,
  };
};

const paymentStatusText = (label) => ({
  color: label === 'Đã thanh toán' ? '#16a34a' : '#ef4444',
  fontSize: '0.78rem',
  marginTop: '4px',
  fontWeight: 600,
});

const getStatusStyle = (status) => {
  const value = normalizeStatus(status);
  const base = {
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  };

  if (value === 'paid' || value === 'completed') {
    return { ...base, background: '#dcfce7', color: '#15803d' };
  }

  if (value === 'cancelled') {
    return { ...base, background: '#fee2e2', color: '#b91c1c' };
  }

  return { ...base, background: '#fef9c3', color: '#a16207' };
};

export default Orders;
