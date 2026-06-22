import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getCategoryLabel, getNewsPosts, newsCategories, saveNewsPosts } from '../data/newsStore';

const emptyForm = {
  title: '',
  category: 'beauty_tips',
  summary: '',
  content: '',
  author: 'Admin',
  status: 'PUBLISHED',
  date: new Date().toISOString().slice(0, 10),
  image: '',
};

const itemsPerPage = 6;

const News = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    setPosts(getNewsPosts());
  }, []);

  const persistPosts = (nextPosts) => {
    setPosts(nextPosts);
    saveNewsPosts(nextPosts);
  };

  const filteredPosts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      const text = `${post.title} ${post.summary} ${post.author}`.toLowerCase();
      const matchesSearch = text.includes(keyword);
      const matchesCategory = !categoryFilter || post.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPosts = filteredPosts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setFormData(emptyForm);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warn('Vui lòng chọn file ảnh.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, image: reader.result }));
    reader.onerror = () => toast.error('Không thể đọc ảnh.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...formData,
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
    };

    if (editingPost) {
      persistPosts(posts.map((post) => (post.id === editingPost.id ? { ...payload, id: editingPost.id } : post)));
      toast.success('Đã cập nhật bài viết.');
    } else {
      const nextId = Math.max(0, ...posts.map((post) => Number(post.id))) + 1;
      persistPosts([{ ...payload, id: nextId }, ...posts]);
      toast.success('Đã thêm bài viết.');
    }

    closeModal();
  };

  const deletePost = (id) => {
    if (!window.confirm('Bạn muốn xóa bài viết này?')) return;
    persistPosts(posts.filter((post) => post.id !== id));
    toast.success('Đã xóa bài viết.');
  };

  const toggleStatus = (post) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    persistPosts(posts.map((item) => (item.id === post.id ? { ...item, status: nextStatus } : item)));
  };

  return (
    <div style={pageStyle}>
      <div style={headerRow}>
        <div>
          <h2 style={titleStyle}>Quản lý tin tức</h2>
          <p style={subtitleStyle}>Bài viết ở đây sẽ hiển thị trên trang Tin tức ngoài frontend</p>
        </div>
        <button type="button" onClick={openCreateModal} style={btnAdd}>Thêm bài viết</button>
      </div>

      <div style={filterBar}>
        <input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Tìm tiêu đề, mô tả, tác giả..."
          style={searchBox}
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={selectBox}
        >
          {newsCategories.map((category) => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>
        <span style={pageInfo}>Trang {safeCurrentPage}/{totalPages}</span>
      </div>

      <div style={tableWrapper}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Bài viết</th>
              <th style={th}>Danh mục</th>
              <th style={th}>Ngày</th>
              <th style={th}>Tác giả</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((post) => (
              <tr key={post.id}>
                <td style={td}>
                  <div style={postCell}>
                    <div style={postThumb}>{post.image ? <img src={post.image} alt={post.title} style={postImage} /> : post.title.charAt(0)}</div>
                    <div>
                      <strong>{post.title}</strong>
                      <div style={summaryText}>{post.summary}</div>
                    </div>
                  </div>
                </td>
                <td style={td}>{getCategoryLabel(post.category)}</td>
                <td style={td}>{new Date(post.date).toLocaleDateString('vi-VN')}</td>
                <td style={td}>{post.author}</td>
                <td style={td}><span style={post.status === 'PUBLISHED' ? badgePublished : badgeDraft}>{post.status}</span></td>
                <td style={td}>
                  <div style={actionGroup}>
                    <button type="button" onClick={() => toggleStatus(post)} style={btnStatus}>{post.status === 'PUBLISHED' ? 'Ẩn' : 'Đăng'}</button>
                    <button type="button" onClick={() => openEditModal(post)} style={btnEdit}>Sửa</button>
                    <button type="button" onClick={() => deletePost(post.id)} style={btnDelete}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPosts.length > itemsPerPage && (
        <div style={paginationWrapper}>
          <button type="button" disabled={safeCurrentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} style={safeCurrentPage === 1 ? navBtnDisabled : navBtn}>Trước</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button key={page} type="button" onClick={() => setCurrentPage(page)} style={page === safeCurrentPage ? pageBtnActive : pageBtn}>{page}</button>
          ))}
          <button type="button" disabled={safeCurrentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} style={safeCurrentPage === totalPages ? navBtnDisabled : navBtn}>Sau</button>
        </div>
      )}

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <div style={modalHeader}>
              <h3 style={{ margin: 0 }}>{editingPost ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
              <button type="button" onClick={closeModal} style={btnClose}>Đóng</button>
            </div>
            <form onSubmit={handleSubmit} style={formGrid}>
              <input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Tiêu đề" style={inputStyle} />
              <div style={twoColumnGrid}>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                  {newsCategories.filter((item) => item.value).map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={inputStyle} />
              </div>
              <div style={twoColumnGrid}>
                <input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} placeholder="Tác giả" style={inputStyle} />
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={inputStyle}>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
              <textarea required value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} placeholder="Mô tả ngắn" rows="3" style={inputStyle} />
              <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Nội dung bài viết" rows="8" style={inputStyle} />
              <div style={uploadBox}>
                {formData.image && <img src={formData.image} alt="Preview" style={previewImage} />}
                <label style={fileLabel}>
                  Chọn ảnh bài viết
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={modalActions}>
                <button type="submit" style={btnSave}>{editingPost ? 'Cập nhật' : 'Lưu'}</button>
                <button type="button" onClick={closeModal} style={btnCancel}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const pageStyle = { padding: '20px', background: '#f8fafc', minHeight: '100vh' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' };
const titleStyle = { margin: 0, color: '#0f172a' };
const subtitleStyle = { margin: '6px 0 0', color: '#64748b' };
const filterBar = { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' };
const searchBox = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '340px', maxWidth: '100%' };
const selectBox = { padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' };
const pageInfo = { color: '#64748b', fontWeight: 700 };
const tableWrapper = { background: '#fff', borderRadius: '8px', boxShadow: '0 4px 8px rgba(15,23,42,0.06)', overflow: 'auto' };
const tableStyle = { width: '100%', minWidth: '1050px', borderCollapse: 'collapse' };
const th = { padding: '14px', textAlign: 'left', color: '#475569', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' };
const td = { padding: '14px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', verticalAlign: 'middle' };
const postCell = { display: 'flex', alignItems: 'center', gap: '12px' };
const postThumb = { width: '54px', height: '54px', borderRadius: '8px', background: '#e8f3ed', color: '#326e51', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: '0 0 54px' };
const postImage = { width: '100%', height: '100%', objectFit: 'cover' };
const summaryText = { color: '#64748b', fontSize: '0.84rem', marginTop: '4px', maxWidth: '360px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const actionGroup = { display: 'flex', gap: '8px', flexWrap: 'wrap' };
const btnAdd = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#0f172a', color: '#fff', fontWeight: 700, cursor: 'pointer' };
const btnStatus = { padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 700 };
const btnEdit = { padding: '6px 10px', border: '1px solid #fde68a', borderRadius: '6px', background: '#fef3c7', color: '#92400e', cursor: 'pointer', fontWeight: 700 };
const btnDelete = { padding: '6px 10px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 };
const badgePublished = { padding: '4px 10px', borderRadius: '999px', background: '#dcfce7', color: '#15803d', fontSize: '0.76rem', fontWeight: 800 };
const badgeDraft = { ...badgePublished, background: '#e2e8f0', color: '#475569' };
const paginationWrapper = { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '22px', flexWrap: 'wrap' };
const navBtn = { minWidth: '38px', height: '36px', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 700 };
const navBtnDisabled = { ...navBtn, color: '#94a3b8', cursor: 'not-allowed' };
const pageBtn = { ...navBtn };
const pageBtnActive = { ...navBtn, background: '#0f172a', color: '#fff', border: 'none' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '18px' };
const modalContent = { background: '#fff', borderRadius: '8px', padding: '24px', width: '760px', maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' };
const btnClose = { padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700 };
const formGrid = { display: 'flex', flexDirection: 'column', gap: '12px' };
const twoColumnGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' };
const inputStyle = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '0.92rem' };
const uploadBox = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' };
const previewImage = { width: '96px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' };
const fileLabel = { display: 'inline-block', padding: '10px 14px', background: '#334155', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const modalActions = { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' };
const btnSave = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const btnCancel = { padding: '10px 16px', border: 'none', borderRadius: '8px', background: '#94a3b8', color: '#fff', fontWeight: 800, cursor: 'pointer' };

export default News;
