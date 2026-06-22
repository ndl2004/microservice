import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { getCategoryLabel, newsCategories } from '../data/newsStore';

const News = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = searchParams.get('category') || '';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/news?status=PUBLISHED');
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('News page load error:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedPost = id ? posts.find((post) => String(post.id) === String(id)) : null;

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const keyword = searchTerm.trim().toLowerCase();
      const text = `${post.title || ''} ${post.summary || ''} ${post.content || ''}`.toLowerCase();
      const matchesSearch = text.includes(keyword);
      const matchesCategory = !category || post.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, category]);

  if (loading) {
    return <div style={pageStyle}><div style={containerStyle}>Dang tai tin tuc...</div></div>;
  }

  if (id) {
    if (!selectedPost) {
      return (
        <div style={pageStyle}>
          <div style={containerStyle}>
            <h1 style={titleStyle}>Khong tim thay bai viet</h1>
            <Link to="/tin-tuc" style={readMoreStyle}>Quay lai tin tuc</Link>
          </div>
        </div>
      );
    }

    return (
      <div style={pageStyle}>
        <article style={articleContainer}>
          {selectedPost.image ? (
            <img src={selectedPost.image} alt={selectedPost.title} style={heroImageStyle} />
          ) : (
            <div style={detailImagePlaceholder}>{selectedPost.title?.charAt(0)}</div>
          )}
          <div style={detailMetaRow}>
            <span>{getCategoryLabel(selectedPost.category)}</span>
            <span>{selectedPost.date ? new Date(selectedPost.date).toLocaleDateString('vi-VN') : ''}</span>
            <span>{selectedPost.author}</span>
          </div>
          <h1 style={detailTitleStyle}>{selectedPost.title}</h1>
          <p style={detailSummaryStyle}>{selectedPost.summary}</p>
          <div style={contentStyle}>
            {(selectedPost.content || '').split('\n').map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            ))}
          </div>
          <Link to="/tin-tuc" style={readMoreStyle}>Quay lai danh sach tin</Link>
        </article>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Tin tuc Luna Cosmetics</h1>
          <p style={subtitleStyle}>Cap nhat meo lam dep, xu huong va thong bao moi tu cua hang.</p>
        </div>

        <div style={toolbarStyle}>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim bai viet..."
            style={searchBox}
          />
          <div style={categoryBarStyle}>
            {newsCategories.map((item) => (
              <button
                key={item.value}
                type="button"
                style={category === item.value ? activeCategoryBtn : categoryBtn}
                onClick={() => {
                  if (item.value) setSearchParams({ category: item.value });
                  else setSearchParams({});
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={gridStyle}>
          {filteredPosts.map((article) => (
            <article key={article.id} style={cardStyle}>
              {article.image ? (
                <img src={article.image} alt={article.title} style={cardImageStyle} />
              ) : (
                <div style={imagePlaceholderStyle}>{article.title?.charAt(0)}</div>
              )}
              <div style={cardBodyStyle}>
                <div style={cardMetaStyle}>
                  <span>{getCategoryLabel(article.category)}</span>
                  <span>{article.date ? new Date(article.date).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <h2 style={cardTitleStyle}>{article.title}</h2>
                <p style={summaryStyle}>{article.summary}</p>
                <Link to={`/tin-tuc/${article.id}`} style={readMoreStyle}>Doc tiep</Link>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div style={emptyStyle}>Chua co bai viet phu hop.</div>
        )}

        <section style={faqSectionStyle}>
          <h2 style={{ marginBottom: '20px' }}>Cau hoi thuong gap</h2>
          {[
            ['Tin tuc co duoc quan ly tu admin khong?', 'Co. Admin them, sua, an/dang va xoa bai viet tai muc Tin tuc.'],
            ['Bai viet nhap co hien ngoai frontend khong?', 'Khong. Chi bai viet co trang thai PUBLISHED moi hien thi cho khach hang.'],
            ['Tin tuc hien lay du lieu tu dau?', 'Du lieu duoc doc tu News Service thong qua API Gateway.']
          ].map(([question, answer], index) => (
            <div key={question} style={faqItemStyle} onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
              <div style={faqQuestionStyle}>
                <strong>{question}</strong>
                <span>{activeFaq === index ? '-' : '+'}</span>
              </div>
              {activeFaq === index && <p style={faqAnswerStyle}>{answer}</p>}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

const pageStyle = { minHeight: '100vh', backgroundColor: '#f9fafb', padding: '60px 0' };
const containerStyle = { maxWidth: '1120px', margin: '0 auto', padding: '0 20px' };
const headerStyle = { textAlign: 'center', marginBottom: '28px' };
const titleStyle = { fontSize: '2.5rem', color: '#111827', margin: '0 0 12px' };
const subtitleStyle = { color: '#6b7280', fontSize: '1rem', margin: 0 };
const toolbarStyle = { display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' };
const searchBox = { padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', minWidth: '260px', flex: '1 1 260px' };
const categoryBarStyle = { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' };
const categoryBtn = { border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', padding: '10px 14px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600' };
const activeCategoryBtn = { ...categoryBtn, backgroundColor: '#326e51', color: '#fff', borderColor: '#326e51' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' };
const imagePlaceholderStyle = { height: '180px', background: '#e8f3ed', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '900' };
const cardImageStyle = { width: '100%', height: '180px', objectFit: 'cover', display: 'block' };
const cardBodyStyle = { padding: '22px' };
const cardMetaStyle = { display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#9ca3af', fontSize: '0.82rem', marginBottom: '10px' };
const cardTitleStyle = { color: '#111827', fontSize: '1.25rem', margin: '10px 0' };
const summaryStyle = { color: '#4b5563', lineHeight: 1.6, minHeight: '76px' };
const readMoreStyle = { color: '#326e51', textDecoration: 'none', fontWeight: '700' };
const emptyStyle = { textAlign: 'center', color: '#6b7280', padding: '40px 0' };
const faqSectionStyle = { marginTop: '60px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '28px' };
const faqItemStyle = { borderTop: '1px solid #eef2f7', padding: '16px 0', cursor: 'pointer' };
const faqQuestionStyle = { display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#111827' };
const faqAnswerStyle = { color: '#4b5563', lineHeight: 1.6, marginBottom: 0 };
const articleContainer = { maxWidth: '880px', margin: '0 auto', padding: '0 20px' };
const heroImageStyle = { width: '100%', maxHeight: '420px', objectFit: 'cover', borderRadius: '8px', marginBottom: '22px' };
const detailImagePlaceholder = { height: '320px', borderRadius: '8px', background: '#e8f3ed', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', fontWeight: 900, marginBottom: '22px' };
const detailMetaRow = { display: 'flex', gap: '14px', color: '#6b7280', flexWrap: 'wrap', marginBottom: '14px' };
const detailTitleStyle = { color: '#111827', fontSize: '2.4rem', margin: '0 0 12px' };
const detailSummaryStyle = { color: '#4b5563', fontSize: '1.1rem', lineHeight: 1.7 };
const contentStyle = { color: '#1f2937', lineHeight: 1.8, fontSize: '1rem', margin: '24px 0' };

export default News;
