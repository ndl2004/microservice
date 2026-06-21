import React, { useEffect, useState } from 'react';
import api from '../api/axios';
// Import các thành phần của Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    pending_orders: 0,
    total_users: 0,
    recent_orders: []
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    // Gọi song song cả 2 API để tối ưu tốc độ tải
    Promise.all([
      api.get('/orders', config),
      Promise.resolve({ data: [] })
    ])
    .then(([statsRes, chartRes]) => {
      setStats(statsRes.data);
      setChartData(chartRes.data);
      setLoading(false);
    })
    .catch(err => {
      console.error("Lỗi tải dữ liệu Dashboard:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Đang tải dữ liệu tổng quan...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '24px', color: '#1e293b' }}>📊 Tổng quan hệ thống</h2>

      {/* 4 CARDS THỐNG KÊ */}
      <div style={statsGrid}>
        <div style={statCard('#3b82f6')}>
          <p style={label}>Doanh thu tổng</p>
          <h3 style={value}>{Number(stats.total_revenue || 0).toLocaleString()}đ</h3>
        </div>
        <div style={statCard('#10b981')}>
          <p style={label}>Tổng đơn hàng</p>
          <h3 style={value}>{stats.total_orders}</h3>
        </div>
        <div style={statCard('#f59e0b')}>
          <p style={label}>Đơn chờ xử lý</p>
          <h3 style={value}>{stats.pending_orders}</h3>
        </div>
        <div style={statCard('#8b5cf6')}>
          <p style={label}>Khách hàng</p>
          <h3 style={value}>{stats.total_users}</h3>
        </div>
      </div>

      {/* BIỂU ĐỒ DOANH THU */}
      <div style={chartBox}>
        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#1e293b' }}>📈 Xu hướng doanh thu (7 ngày gần nhất)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                tickFormatter={(value) => `${value >= 1000 ? value/1000 + 'k' : value}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value) => [new Intl.NumberFormat('vi-VN').format(value) + 'đ', 'Doanh thu']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BẢNG ĐƠN HÀNG GẦN ĐÂY */}
      <div style={recentBox}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#1e293b' }}>🕒 Đơn hàng mới nhất</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
              <th style={th}>Mã đơn</th>
              <th style={th}>Khách hàng</th>
              <th style={th}>Giá trị</th>
              <th style={th}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_orders && stats.recent_orders.length > 0 ? (
              stats.recent_orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>#{order.id}</td>
                  <td style={td}>{order.fullname}</td>
                  <td style={td}>{Number(order.total_amount).toLocaleString()}đ</td>
                  <td style={td}>
                    <span style={statusTag(order.status)}>{order.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Chưa có đơn hàng nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STYLES ---
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' };

const statCard = (color) => ({ 
  backgroundColor: '#fff', 
  padding: '24px', 
  borderRadius: '16px', 
  borderBottom: `4px solid ${color}`, // Đổi sang border bottom cho hiện đại
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s'
});

const chartBox = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  marginBottom: '32px'
};

const label = { color: '#64748b', fontSize: '0.9rem', margin: '0 0 8px 0', fontWeight: '500' };
const value = { color: '#1e293b', fontSize: '1.6rem', fontWeight: 'bold', margin: 0 };
const recentBox = { backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const th = { padding: '16px 12px', color: '#64748b', fontWeight: '600', fontSize: '0.85rem', borderBottom: '2px solid #f1f5f9' };
const td = { padding: '16px 12px', color: '#334155', fontSize: '0.9rem' };

const statusTag = (s) => {
  const isSuccess = s === 'completed' || s === 'đã giao' || s === 'thành công';
  return {
    padding: '6px 12px', 
    borderRadius: '8px', 
    fontSize: '0.75rem', 
    fontWeight: 'bold',
    backgroundColor: isSuccess ? '#dcfce7' : '#fef3c7',
    color: isSuccess ? '#16a34a' : '#d97706',
    textTransform: 'capitalize'
  };
};

export default Dashboard;
