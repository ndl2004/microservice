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
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState(emptyForm);
  const itemsPerPage = 8;

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
    const keyword = searchTerm.toLowerCase();
    return products.filter((product) => {
      const text = `${product.name || ''} ${product.category_name || ''} ${product.brand_name || ''}`.toLowerCase();
      return text.includes(keyword);
    });
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id || !formData.brand_id) {
      toast.warn('Vui lòng chọn danh mục và thương hiệu.');
      return;
    }

    try {
      const productRes = await api.post('/products', {
        name: formData.name,
        price: Number(formData.price),
        main_image: formData.main_image,
        description: formData.description,
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        status: 'ACTIVE',
      });

      const productId = productRes.data?.id;
      if (productId) {
        await api.put(`/inventory/${productId}`, {
          productId,
          quantity: Number(formData.quantity || 0),
        });
      }

      toast.success('Thêm sản phẩm mỹ phẩm và tồn kho thành công.');
      closeModal();
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

  const closeModal = () => {
    setShowModal(false);
    setFormData(emptyForm);
  };

  if (loading) {
    return <div style={loaderStyle}>Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerCard}>
        <h2 style={{ margin: 0 }}>Quản lý sản phẩm mỹ phẩm</h2>
        <button type="button" onClick={() => setShowModal(true)} style={btnAdd}>
          + Thêm sản phẩm
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
                  <img
                    src={product.main_image || fallbackImage}
                    width="50"
                    height="50"
                    style={imgStyle}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      if (e.currentTarget.src !== fallbackImage) {
                        e.currentTarget.src = fallbackImage;
                      }
                    }}
                  />
                </td>
                <td style={td}>
                  <strong>{product.name}</strong>
                  {product.description && <div style={descText}>{product.description}</div>}
                </td>
                <td style={td}>{product.category_name || 'Chưa phân loại'}</td>
                <td style={td}>{product.brand_name || 'Chưa có'}</td>
                <td style={td}>
                  <strong>{Number(product.price || 0).toLocaleString('vi-VN')}đ</strong>
                </td>
                <td style={td}>{inventoryMap[product.id] ?? 'Chưa cập nhật'}</td>
                <td style={td}>
                  <span style={statusBadge}>{product.status || 'ACTIVE'}</span>
                </td>
                <td style={td}>
                  <button type="button" onClick={() => handleDelete(product.id)} style={btnActionDel}>
                    Xóa
                  </button>
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

      {totalPages > 1 && (
        <div style={paginationWrapper}>
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={navBtn}>
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} type="button" onClick={() => setCurrentPage(i + 1)} style={i + 1 === currentPage ? pageBtnActive : pageBtn}>
              {i + 1}
            </button>
          ))}
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} style={navBtn}>
            Sau
          </button>
        </div>
      )}

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0 }}>Thêm sản phẩm mỹ phẩm</h3>
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
              <input
                type="text"
                placeholder="Link ảnh sản phẩm"
                value={formData.main_image}
                onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                style={inputStyle}
              />
              <textarea
                placeholder="Mô tả sản phẩm: công dụng, loại da, thành phần nổi bật..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={btnSubmit}>
                  Lưu
                </button>
                <button type="button" onClick={closeModal} style={btnCancel}>
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' };
const headerCard = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '16px', flexWrap: 'wrap' };
const filterBar = { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' };
const searchBox = { padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '340px', maxWidth: '100%', outline: 'none' };
const tableWrapper = { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1050px' };
const th = { padding: '15px', textAlign: 'left', color: '#475569', fontSize: '0.85rem', fontWeight: 600, borderBottom: '2px solid #f1f5f9', whiteSpace: 'nowrap', background: '#f8fafc' };
const td = { padding: '15px', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' };
const descText = { color: '#64748b', fontSize: '0.78rem', marginTop: '4px', maxWidth: '260px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const imgStyle = { objectFit: 'cover', borderRadius: '8px', background: '#f8fafc' };
const btnAdd = { background: '#0f172a', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 };
const btnActionDel = { color: '#ef4444', background: 'none', border: '1px solid #fee2e2', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 };
const statusBadge = { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700 };
const paginationWrapper = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '30px' };
const navBtn = { minWidth: '42px', height: '35px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' };
const pageBtn = { ...navBtn };
const pageBtnActive = { ...navBtn, background: '#0f172a', color: '#fff', border: 'none' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: '#fff', padding: '30px', borderRadius: '16px', width: '640px', maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '15px' };
const twoColumnGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', background: '#fff' };
const btnSubmit = { background: '#10b981', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, flex: 1 };
const btnCancel = { background: '#94a3b8', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, flex: 1 };
const loaderStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b', fontWeight: 500 };

export default Products;
