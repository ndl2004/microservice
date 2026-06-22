import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import fallbackImage from '../assets/hero.png';

const emptyForm = {
  name: '',
  price: '',
  main_image: '',
  description: '',
  category_id: '',
  brand_id: '',
  quantity: '',
  status: 'ACTIVE',
};

const itemsPerPage = 6;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const [imageFileName, setImageFileName] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productRes, inventoryRes, categoryRes, brandRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/brands').catch(() => ({ data: [] })),
      ]);

      const productData = Array.isArray(productRes.data) ? productRes.data : [];
      const inventoryData = Array.isArray(inventoryRes.data) ? inventoryRes.data : [];

      setProducts(productData);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
      setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
      setInventoryMap(
        inventoryData.reduce((map, item) => {
          map[item.productId] = item.quantity;
          return map;
        }, {})
      );
    } catch (err) {
      console.error('Product admin load error:', err);
      toast.error('Lỗi tải danh sách sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const text = `${product.name || ''} ${product.category_name || ''} ${product.brand_name || ''}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentItems = filteredProducts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const openAddModal = () => {
    setEditingProduct(null);
    setImageFileName('');
    setFormData(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setImageFileName(product.main_image ? 'Ảnh hiện tại' : '');
    setFormData({
      name: product.name || '',
      price: product.price || '',
      main_image: product.main_image || '',
      description: product.description || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      quantity: inventoryMap[product.id] ?? '',
      status: product.status || 'ACTIVE',
    });
    setShowFormModal(true);
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageFileName('');
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warn('Vui lòng chọn đúng file ảnh.');
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.warn('Ảnh nên nhỏ hơn 1MB để lưu demo ổn định.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, main_image: reader.result }));
      setImageFileName(file.name);
    };
    reader.onerror = () => toast.error('Không thể đọc file ảnh.');
    reader.readAsDataURL(file);
  };

  const buildProductPayload = () => ({
    name: formData.name.trim(),
    price: Number(formData.price),
    main_image: formData.main_image,
    description: formData.description,
    category_id: Number(formData.category_id),
    brand_id: Number(formData.brand_id),
    status: formData.status || 'ACTIVE',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id || !formData.brand_id) {
      toast.warn('Vui lòng chọn danh mục và thương hiệu.');
      return;
    }

    try {
      const payload = buildProductPayload();
      const productRes = editingProduct
        ? await api.put(`/products/${editingProduct.id}`, payload)
        : await api.post('/products', payload);

      const productId = editingProduct?.id || productRes.data?.id;
      if (productId) {
        await api.put(`/inventory/${productId}`, {
          productId,
          quantity: Number(formData.quantity || 0),
        });
      }

      toast.success(editingProduct ? 'Đã cập nhật sản phẩm thành công.' : 'Đã thêm sản phẩm thành công.');
      closeFormModal();
      loadData();
    } catch (err) {
      console.error('Product admin save error:', err);
      toast.error(err.response?.data?.message || 'Không thể lưu sản phẩm.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Đã xóa sản phẩm thành công.');
      loadData();
    } catch (err) {
      console.error('Product admin delete error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa sản phẩm.');
    }
  };

  const formatPrice = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

  if (loading) {
    return <div style={loaderStyle}>Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h2 style={titleStyle}>Quản lý sản phẩm</h2>
          <p style={subtitleStyle}>{filteredProducts.length} sản phẩm trong hệ thống</p>
        </div>
        <button type="button" onClick={openAddModal} style={btnAdd}>
          Thêm sản phẩm
        </button>
      </div>

      <div style={filterBar}>
        <input
          type="text"
          placeholder="Tìm sản phẩm, danh mục, thương hiệu..."
          style={searchBox}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <span style={pageInfo}>
          Trang {safeCurrentPage}/{totalPages}
        </span>
      </div>

      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Ảnh</th>
              <th style={th}>Tên sản phẩm</th>
              <th style={th}>Danh mục</th>
              <th style={th}>Thương hiệu</th>
              <th style={th}>Giá</th>
              <th style={th}>Tồn kho</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((product) => (
              <tr key={product.id}>
                <td style={td}>
                  <ProductImage src={product.main_image} name={product.name} />
                </td>
                <td style={td}>
                  <strong>{product.name}</strong>
                  {product.description && <div style={descText}>{product.description}</div>}
                </td>
                <td style={td}>{product.category_name || 'Chưa phân loại'}</td>
                <td style={td}>{product.brand_name || 'Chưa có'}</td>
                <td style={td}>
                  <strong>{formatPrice(product.price)}</strong>
                </td>
                <td style={td}>{inventoryMap[product.id] ?? 'Chưa cập nhật'}</td>
                <td style={td}>
                  <span style={product.status === 'INACTIVE' ? inactiveBadge : statusBadge}>
                    {product.status || 'ACTIVE'}
                  </span>
                </td>
                <td style={td}>
                  <div style={actionGroup}>
                    <button type="button" onClick={() => openDetailModal(product)} style={btnActionView}>
                      Chi tiết
                    </button>
                    <button type="button" onClick={() => openEditModal(product)} style={btnActionEdit}>
                      Sửa
                    </button>
                    <button type="button" onClick={() => handleDelete(product.id)} style={btnActionDel}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="8" style={{ ...td, textAlign: 'center', color: '#64748b' }}>
                  Không có sản phẩm phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredProducts.length > itemsPerPage && (
        <div style={paginationWrapper}>
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            style={safeCurrentPage === 1 ? navBtnDisabled : navBtn}
          >
            Trước
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              style={page === safeCurrentPage ? pageBtnActive : pageBtn}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            style={safeCurrentPage === totalPages ? navBtnDisabled : navBtn}
          >
            Sau
          </button>
        </div>
      )}

      {showFormModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
              <button type="button" onClick={closeFormModal} style={btnClose}>
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit} style={formGrid}>
              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={inputStyle}
              />

              <div style={twoColumnGrid}>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  style={inputStyle}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                  required
                  style={inputStyle}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={twoColumnGrid}>
                <input
                  type="number"
                  placeholder="Giá bán"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Số lượng tồn kho"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="0"
                  style={inputStyle}
                />
              </div>

              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={inputStyle}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              <div style={uploadRow}>
                <ProductImage src={formData.main_image} name={formData.name || 'Ảnh sản phẩm'} large />
                <div style={{ flex: 1 }}>
                  <label style={fileLabel}>
                    Chọn ảnh từ máy
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                  <p style={fileHint}>{imageFileName || 'Chưa chọn ảnh mới. Nên dùng ảnh dưới 1MB.'}</p>
                </div>
              </div>

              <textarea
                placeholder="Mô tả sản phẩm: công dụng, loại da, thành phần nổi bật..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                style={inputStyle}
              />

              <div style={modalActions}>
                <button type="submit" style={btnSubmit}>
                  {editingProduct ? 'Cập nhật' : 'Lưu'}
                </button>
                <button type="button" onClick={closeFormModal} style={btnCancel}>
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedProduct && (
        <div style={modalOverlay}>
          <div style={detailModalContent}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>Chi tiết sản phẩm</h3>
              <button type="button" onClick={closeDetailModal} style={btnClose}>
                Đóng
              </button>
            </div>

            <div style={detailGrid}>
              <ProductImage src={selectedProduct.main_image} name={selectedProduct.name} detail />
              <div>
                <h2 style={detailName}>{selectedProduct.name}</h2>
                <p style={detailPrice}>{formatPrice(selectedProduct.price)}</p>
                <div style={detailMeta}>Mã sản phẩm: #{selectedProduct.id}</div>
                <div style={detailMeta}>Danh mục: {selectedProduct.category_name || 'Chưa phân loại'}</div>
                <div style={detailMeta}>Thương hiệu: {selectedProduct.brand_name || 'Chưa có'}</div>
                <div style={detailMeta}>Tồn kho: {inventoryMap[selectedProduct.id] ?? 'Chưa cập nhật'}</div>
                <div style={detailMeta}>Trạng thái: {selectedProduct.status || 'ACTIVE'}</div>
              </div>
            </div>

            <div style={detailDescription}>
              {selectedProduct.description || 'Sản phẩm chưa có mô tả.'}
            </div>

            <div style={modalActions}>
              <button
                type="button"
                style={btnActionEditWide}
                onClick={() => {
                  closeDetailModal();
                  openEditModal(selectedProduct);
                }}
              >
                Sửa sản phẩm này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductImage = ({ src, name, large = false, detail = false }) => (
  <img
    src={src || fallbackImage}
    width={detail ? 220 : large ? 96 : 54}
    height={detail ? 220 : large ? 96 : 54}
    style={detail ? detailImageStyle : large ? previewImageStyle : imgStyle}
    alt={name}
    loading="lazy"
    onError={(e) => {
      if (e.currentTarget.src !== fallbackImage) {
        e.currentTarget.src = fallbackImage;
      }
    }}
  />
);

const pageStyle = { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', gap: '16px', flexWrap: 'wrap' };
const titleStyle = { margin: 0, color: '#0f172a', fontSize: '1.5rem' };
const subtitleStyle = { margin: '6px 0 0', color: '#64748b', fontSize: '0.9rem' };
const filterBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' };
const searchBox = { padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '360px', maxWidth: '100%', outline: 'none' };
const pageInfo = { color: '#64748b', fontSize: '0.88rem', fontWeight: 600 };
const tableWrapper = { background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)', overflow: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1120px' };
const th = { padding: '14px', textAlign: 'left', color: '#475569', fontSize: '0.84rem', fontWeight: 700, borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap', background: '#f8fafc' };
const td = { padding: '14px', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' };
const descText = { color: '#64748b', fontSize: '0.78rem', marginTop: '4px', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const imgStyle = { objectFit: 'cover', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' };
const previewImageStyle = { ...imgStyle, width: '96px', height: '96px' };
const detailImageStyle = { ...imgStyle, width: '220px', height: '220px' };
const btnAdd = { background: '#0f172a', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const actionGroup = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const btnActionView = { color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 };
const btnActionEdit = { color: '#92400e', background: '#fef3c7', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 };
const btnActionDel = { color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 };
const btnActionEditWide = { ...btnActionEdit, padding: '12px 16px' };
const statusBadge = { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 800 };
const inactiveBadge = { ...statusBadge, background: '#fee2e2', color: '#b91c1c' };
const paginationWrapper = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' };
const navBtn = { minWidth: '42px', height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700 };
const navBtnDisabled = { ...navBtn, color: '#94a3b8', cursor: 'not-allowed', background: '#f8fafc' };
const pageBtn = { ...navBtn };
const pageBtnActive = { ...navBtn, background: '#0f172a', color: '#fff', border: 'none' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '18px' };
const modalContent = { background: '#fff', padding: '26px', borderRadius: '8px', width: '680px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.12)' };
const detailModalContent = { ...modalContent, width: '780px' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' };
const modalTitle = { margin: 0, color: '#0f172a' };
const btnClose = { background: '#f1f5f9', color: '#334155', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '14px' };
const twoColumnGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: '#fff' };
const uploadRow = { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' };
const fileLabel = { display: 'inline-block', padding: '10px 14px', background: '#334155', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const fileHint = { margin: '8px 0 0', color: '#64748b', fontSize: '0.84rem' };
const modalActions = { display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' };
const btnSubmit = { background: '#10b981', color: '#fff', padding: '12px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 };
const btnCancel = { background: '#94a3b8', color: '#fff', padding: '12px 18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 };
const detailGrid = { display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '22px', alignItems: 'start' };
const detailName = { margin: '0 0 8px', color: '#0f172a', fontSize: '1.5rem' };
const detailPrice = { margin: '0 0 16px', color: '#b45309', fontSize: '1.35rem', fontWeight: 800 };
const detailMeta = { padding: '8px 0', color: '#475569', borderBottom: '1px solid #f1f5f9' };
const detailDescription = { marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', color: '#334155', lineHeight: 1.6 };
const loaderStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b', fontWeight: 600 };

export default Products;
