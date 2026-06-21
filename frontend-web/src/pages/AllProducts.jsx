import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import fallbackImage from '../assets/hero.png';

const AllProducts = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setCurrentPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes, brandRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/brands').catch(() => ({ data: [] })),
        ]);

        const productData = productRes.data.data ? productRes.data.data : productRes.data;
        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
        setBrands(Array.isArray(brandRes.data) ? brandRes.data : []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu sản phẩm:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = searchTerm.toLowerCase();
      const searchableText = `${product.name || ''} ${product.category_name || ''} ${product.brand_name || ''}`.toLowerCase();
      const matchesName = searchableText.includes(keyword);
      const matchesCategory = selectedCategory === '' || String(product.category_id || '') === selectedCategory;
      const matchesBrand = selectedBrand === '' || String(product.brand_id || '') === selectedBrand;
      return matchesName && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  if (loading) {
    return <div style={statusStyle}>Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div style={pageStyle}>
      <h2 style={headerStyle}>Khám phá mỹ phẩm</h2>

      <div style={filterWrapperStyle}>
        <div style={filterGroupStyle}>
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, danh mục, thương hiệu..."
            style={largeInputStyle}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            style={largeSelectStyle}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            style={largeSelectStyle}
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        {currentProducts.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={cardStyle}>
              <div style={imageWrapperStyle}>
                <img
                  className="product-img"
                  src={product.main_image || fallbackImage}
                  alt={product.name}
                  style={imgStyle}
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src !== fallbackImage) {
                      e.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              </div>
              <div style={infoStyle}>
                <div>
                  <div style={metaRow}>
                    <span>{product.category_name || 'Mỹ phẩm'}</span>
                    <span>{product.brand_name || 'LunaCos'}</span>
                  </div>
                  <h3 style={titleStyle}>{product.name}</h3>
                  <p style={priceStyle}>{formatPrice(product.price)}</p>
                </div>
                <button type="button" style={btnStyle}>Xem chi tiết</button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {currentProducts.length === 0 && (
        <div style={emptyStyle}>Không tìm thấy sản phẩm phù hợp.</div>
      )}

      {totalPages > 1 && (
        <div style={paginationContainer}>
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={currentPage === 1 ? disabledPageBtn : pageBtnStyle}>
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => paginate(i + 1)} style={currentPage === i + 1 ? activePageBtn : pageBtnStyle}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={currentPage === totalPages ? disabledPageBtn : pageBtnStyle}>
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

const statusStyle = { textAlign: 'center', padding: '100px', color: '#555' };
const pageStyle = { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', backgroundColor: '#fdfdfd' };
const headerStyle = { textAlign: 'center', marginBottom: '42px', fontSize: '32px', color: '#333', fontWeight: 800, textTransform: 'uppercase' };
const filterWrapperStyle = { textAlign: 'center', marginBottom: '44px' };
const filterGroupStyle = { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' };
const largeInputStyle = { padding: '14px 20px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '340px', maxWidth: '100%', fontSize: '1rem', outline: 'none' };
const largeSelectStyle = { padding: '14px 16px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '210px', fontSize: '1rem', cursor: 'pointer', outline: 'none', backgroundColor: '#fff' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: '100%' };
const imageWrapperStyle = { width: '100%', aspectRatio: '1 / 1', overflow: 'hidden', backgroundColor: '#f8f9fa' };
const imgStyle = { width: '100%', height: '100%', objectFit: 'cover' };
const infoStyle = { padding: '18px', textAlign: 'left', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' };
const metaRow = { display: 'flex', justifyContent: 'space-between', gap: '8px', color: '#64748b', fontSize: '0.75rem', marginBottom: '8px' };
const titleStyle = { fontSize: '1.02rem', fontWeight: 700, color: '#2c3e50', margin: '0 0 10px 0', minHeight: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' };
const priceStyle = { fontSize: '1.18rem', fontWeight: 800, color: '#d97706', marginBottom: '15px' };
const btnStyle = { width: '100%', padding: '10px', backgroundColor: '#326e51', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' };
const emptyStyle = { textAlign: 'center', padding: '60px', color: '#777' };
const paginationContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '60px' };
const pageBtnStyle = { padding: '10px 20px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '8px', fontWeight: 600 };
const activePageBtn = { ...pageBtnStyle, backgroundColor: '#333', color: '#fff', border: '1px solid #333' };
const disabledPageBtn = { ...pageBtnStyle, color: '#ccc', cursor: 'not-allowed', backgroundColor: '#f9f9f9' };

export default AllProducts;
