import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import fallbackImage from '../assets/hero.png';

const itemsPerPage = 8;

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productRes, inventoryRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory').catch(() => ({ data: [] })),
      ]);

      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch (err) {
      console.error('Inventory admin load error:', err);
      toast.error('Không thể tải dữ liệu tồn kho.');
    } finally {
      setLoading(false);
    }
  };

  const inventoryMap = useMemo(() => {
    return inventory.reduce((map, item) => {
      map[item.productId] = item;
      return map;
    }, {});
  }, [inventory]);

  const rows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return products
      .map((product) => {
        const stock = inventoryMap[product.id]?.quantity ?? 0;
        let stockStatus = 'available';
        if (stock <= 0) stockStatus = 'out';
        else if (stock <= 10) stockStatus = 'low';

        return { product, stock, stockStatus };
      })
      .filter(({ product, stockStatus }) => {
        const text = `${product.name || ''} ${product.category_name || ''} ${product.brand_name || ''}`.toLowerCase();
        const matchesSearch = text.includes(keyword);
        const matchesStatus = statusFilter === 'all' || stockStatus === statusFilter;
        return matchesSearch && matchesStatus;
      });
  }, [products, inventoryMap, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentRows = rows.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const summary = useMemo(() => {
    return rows.reduce(
      (result, row) => {
        result.total += row.stock;
        if (row.stockStatus === 'out') result.out += 1;
        if (row.stockStatus === 'low') result.low += 1;
        return result;
      },
      { total: 0, out: 0, low: 0 }
    );
  }, [rows]);

  const openEditModal = (product, stock) => {
    setEditingProduct(product);
    setQuantity(stock);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setQuantity('');
  };

  const saveQuantity = async (productId, nextQuantity) => {
    try {
      const safeQuantity = Math.max(0, Number(nextQuantity || 0));
      await api.put(`/inventory/${productId}`, {
        productId,
        quantity: safeQuantity,
      });
      toast.success('Đã cập nhật tồn kho.');
      closeEditModal();
      loadData();
    } catch (err) {
      console.error('Inventory save error:', err);
      toast.error(err.response?.data?.message || 'Không thể cập nhật tồn kho.');
    }
  };

  const adjustStock = (productId, currentStock, amount) => {
    saveQuantity(productId, currentStock + amount);
  };

  const deleteInventory = async (productId) => {
    if (!window.confirm('Bạn muốn xóa bản ghi tồn kho của sản phẩm này?')) return;

    try {
      await api.delete(`/inventory/${productId}`);
      toast.success('Đã xóa bản ghi tồn kho.');
      loadData();
    } catch (err) {
      console.error('Inventory delete error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa tồn kho.');
    }
  };

  if (loading) {
    return <div style={loaderStyle}>Đang tải tồn kho...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h2 style={titleStyle}>Quản lý tồn kho</h2>
          <p style={subtitleStyle}>Theo dõi và cập nhật số lượng sản phẩm trong Inventory Service</p>
        </div>
        <button type="button" onClick={loadData} style={btnRefresh}>Làm mới</button>
      </div>

      <div style={summaryGrid}>
        <SummaryCard label="Sản phẩm hiển thị" value={rows.length} />
        <SummaryCard label="Tổng tồn kho" value={summary.total} />
        <SummaryCard label="Sắp hết hàng" value={summary.low} tone="warning" />
        <SummaryCard label="Hết hàng" value={summary.out} tone="danger" />
      </div>

      <div style={filterBar}>
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên sản phẩm, danh mục, thương hiệu..."
          style={searchBox}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={selectBox}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn hàng</option>
          <option value="low">Sắp hết hàng</option>
          <option value="out">Hết hàng</option>
        </select>
        <span style={pageInfo}>Trang {safeCurrentPage}/{totalPages}</span>
      </div>

      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Sản phẩm</th>
              <th style={th}>Danh mục</th>
              <th style={th}>Thương hiệu</th>
              <th style={th}>Giá</th>
              <th style={th}>Tồn kho</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map(({ product, stock, stockStatus }) => (
              <tr key={product.id}>
                <td style={td}>
                  <div style={productCell}>
                    <img
                      src={product.main_image || fallbackImage}
                      alt={product.name}
                      style={thumbStyle}
                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <div style={mutedText}>Mã #{product.id}</div>
                    </div>
                  </div>
                </td>
                <td style={td}>{product.category_name || 'Chưa phân loại'}</td>
                <td style={td}>{product.brand_name || 'Chưa có'}</td>
                <td style={td}>{Number(product.price || 0).toLocaleString('vi-VN')}đ</td>
                <td style={td}><strong>{stock}</strong></td>
                <td style={td}><StockBadge status={stockStatus} /></td>
                <td style={td}>
                  <div style={actionGroup}>
                    <button type="button" style={btnMini} onClick={() => adjustStock(product.id, stock, -1)}>-1</button>
                    <button type="button" style={btnMini} onClick={() => adjustStock(product.id, stock, 1)}>+1</button>
                    <button type="button" style={btnEdit} onClick={() => openEditModal(product, stock)}>Cập nhật</button>
                    <button type="button" style={btnDelete} onClick={() => deleteInventory(product.id)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan="7" style={{ ...td, textAlign: 'center', color: '#64748b' }}>Không có dữ liệu phù hợp.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > itemsPerPage && (
        <div style={paginationWrapper}>
          <button type="button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} style={safeCurrentPage === 1 ? navBtnDisabled : navBtn}>Trước</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button key={page} type="button" onClick={() => setCurrentPage(page)} style={page === safeCurrentPage ? pageBtnActive : pageBtn}>{page}</button>
          ))}
          <button type="button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} style={safeCurrentPage === totalPages ? navBtnDisabled : navBtn}>Sau</button>
        </div>
      )}

      {editingProduct && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0 }}>Cập nhật tồn kho</h3>
            <p style={mutedText}>{editingProduct.name}</p>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
            />
            <div style={modalActions}>
              <button type="button" onClick={() => saveQuantity(editingProduct.id, quantity)} style={btnSave}>Lưu</button>
              <button type="button" onClick={closeEditModal} style={btnCancel}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value, tone }) => (
  <div style={summaryCard}>
    <div style={summaryLabel}>{label}</div>
    <div style={tone === 'danger' ? summaryDanger : tone === 'warning' ? summaryWarning : summaryValue}>{value}</div>
  </div>
);

const StockBadge = ({ status }) => {
  if (status === 'out') return <span style={badgeOut}>Hết hàng</span>;
  if (status === 'low') return <span style={badgeLow}>Sắp hết</span>;
  return <span style={badgeOk}>Còn hàng</span>;
};

const pageStyle = { padding: '20px', background: '#f8fafc', minHeight: '100vh' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' };
const titleStyle = { margin: 0, color: '#0f172a' };
const subtitleStyle = { margin: '6px 0 0', color: '#64748b' };
const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: '14px', marginBottom: '18px' };
const summaryCard = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' };
const summaryLabel = { color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' };
const summaryValue = { color: '#0f172a', fontSize: '1.5rem', fontWeight: 800 };
const summaryWarning = { ...summaryValue, color: '#b45309' };
const summaryDanger = { ...summaryValue, color: '#b91c1c' };
const filterBar = { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' };
const searchBox = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '360px', maxWidth: '100%' };
const selectBox = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const pageInfo = { color: '#64748b', fontWeight: 700 };
const tableWrapper = { background: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(15,23,42,0.06)', overflow: 'auto' };
const tableStyle = { width: '100%', minWidth: '1040px', borderCollapse: 'collapse' };
const th = { padding: '14px', textAlign: 'left', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' };
const td = { padding: '14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', verticalAlign: 'middle' };
const productCell = { display: 'flex', alignItems: 'center', gap: '12px' };
const thumbStyle = { width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' };
const mutedText = { color: '#64748b', fontSize: '0.84rem', marginTop: '4px' };
const actionGroup = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const btnRefresh = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const btnMini = { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 800 };
const btnEdit = { padding: '6px 10px', border: '1px solid #bfdbfe', borderRadius: '6px', background: '#dbeafe', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 };
const btnDelete = { padding: '6px 10px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 };
const badgeOk = { padding: '4px 10px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontSize: '0.76rem', fontWeight: 800 };
const badgeLow = { ...badgeOk, background: '#fef3c7', color: '#b45309' };
const badgeOut = { ...badgeOk, background: '#fee2e2', color: '#b91c1c' };
const paginationWrapper = { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '22px', flexWrap: 'wrap' };
const navBtn = { minWidth: '38px', height: '36px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 700 };
const navBtnDisabled = { ...navBtn, color: '#94a3b8', cursor: 'not-allowed' };
const pageBtn = { ...navBtn };
const pageBtnActive = { ...navBtn, background: '#0f172a', color: '#fff', border: 'none' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '18px' };
const modalContent = { background: '#fff', borderRadius: '8px', padding: '24px', width: '420px', maxWidth: '100%' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box', marginTop: '12px' };
const modalActions = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' };
const btnSave = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const btnCancel = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#94a3b8', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const loaderStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#64748b', fontWeight: 700 };

export default Inventory;
