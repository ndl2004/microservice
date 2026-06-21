import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error('Lỗi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.toLowerCase();
    return users.filter((user) => {
      const name = (user.fullName || user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentItems = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = () => {
    toast.info('Backend Spring hiện chưa có API xóa người dùng.');
  };

  if (loading) {
    return <div style={loaderStyle}>Đang tải danh sách người dùng...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerCard}>
        <h2 style={{ margin: 0 }}>Quản lý người dùng</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Danh sách tài khoản đọc từ User Service qua API Gateway.</p>
      </div>

      <div style={filterBar}>
        <input
          type="text"
          placeholder="Tìm tên hoặc email..."
          style={searchBox}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={th}>ID</th>
              <th style={th}>Họ tên</th>
              <th style={th}>Email</th>
              <th style={th}>Số điện thoại</th>
              <th style={th}>Địa chỉ</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user) => (
              <tr key={user.id} style={trStyle}>
                <td style={td}>#{user.id}</td>
                <td style={td}><strong>{user.fullName || user.name || 'Chưa cập nhật'}</strong></td>
                <td style={td}>{user.email}</td>
                <td style={td}>{user.phone || '-'}</td>
                <td style={td}>{user.address || '-'}</td>
                <td style={td}>
                  <button type="button" onClick={handleDelete} style={btnActionDel}>Xóa</button>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="6" style={{ ...td, textAlign: 'center', color: '#64748b' }}>Không có người dùng phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={paginationWrapper}>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={navBtn}>Trước</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} type="button" onClick={() => setCurrentPage(i + 1)} style={i + 1 === currentPage ? pageBtnActive : pageBtn}>{i + 1}</button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} style={navBtn}>Sau</button>
        </div>
      )}
    </div>
  );
};

const pageStyle = { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerCard = { marginBottom: '25px' };
const filterBar = { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' };
const searchBox = { padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', outline: 'none' };
const tableWrapper = { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const th = { padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: '600', borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap' };
const td = { padding: '15px', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' };
const trStyle = { transition: '0.2s' };
const btnActionDel = { color: '#ef4444', background: 'none', border: '1px solid #fee2e2', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' };
const paginationWrapper = { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' };
const navBtn = { minWidth: '42px', height: '35px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff' };
const pageBtn = { ...navBtn };
const pageBtnActive = { ...navBtn, background: '#0f172a', color: '#fff', border: 'none' };
const loaderStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' };

export default Users;
