import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFaq, setActiveFaq] = useState(null);
  const category = searchParams.get('category') || '';

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'promotion', label: 'Khuyến mãi' },
    { value: 'beauty_tips', label: 'Mẹo làm đẹp' },
    { value: 'trends', label: 'Xu hướng' },
    { value: 'company_news', label: 'Tin công ty' }
  ];

  const articles = [
    {
      id: 1,
      category: 'beauty_tips',
      title: 'Quy trình chăm sóc da cơ bản',
      summary: 'Gợi ý các bước chăm sóc da đơn giản, phù hợp để demo giao diện tin tức.',
      date: '2026-06-19'
    },
    {
      id: 2,
      category: 'trends',
      title: 'Xu hướng trang điểm tự nhiên',
      summary: 'Phong cách trang điểm nhẹ, trong trẻo đang được nhiều khách hàng quan tâm.',
      date: '2026-06-18'
    },
    {
      id: 3,
      category: 'promotion',
      title: 'Ưu đãi thành viên Luna',
      summary: 'Các chương trình ưu đãi có thể được mở rộng bằng một News Service riêng.',
      date: '2026-06-17'
    }
  ];

  const filteredArticles = category ? articles.filter((article) => article.category === category) : articles;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Tin tức Luna Cosmetics</h1>
          <p style={subtitleStyle}>
            Màn tin tức hiện dùng dữ liệu mẫu tại frontend vì backend Spring chưa có News Service.
          </p>
        </div>

        <div style={categoryBarStyle}>
          {categories.map((item) => (
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

        <div style={gridStyle}>
          {filteredArticles.map((article) => (
            <article key={article.id} style={cardStyle}>
              <div style={imagePlaceholderStyle}>{article.title.charAt(0)}</div>
              <div style={cardBodyStyle}>
                <small style={dateStyle}>{new Date(article.date).toLocaleDateString('vi-VN')}</small>
                <h2 style={cardTitleStyle}>{article.title}</h2>
                <p style={summaryStyle}>{article.summary}</p>
                <Link to="/san-pham" style={readMoreStyle}>Xem sản phẩm</Link>
              </div>
            </article>
          ))}
        </div>

        <section style={faqSectionStyle}>
          <h2 style={{ marginBottom: '20px' }}>Câu hỏi thường gặp</h2>
          {[
            ['Có thể thêm News Service không?', 'Có. Bạn có thể tách thành news-service riêng hoặc để trong product-service nếu đồ án cần đơn giản.'],
            ['Tin tức có ảnh thật không?', 'Hiện màn này dùng placeholder bằng CSS để tránh tải ảnh ngoài gây chậm giao diện.'],
            ['Có ảnh hưởng luồng mua hàng không?', 'Không. Luồng chính vẫn là đăng nhập, xem sản phẩm, giỏ hàng và tạo đơn COD.']
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
const headerStyle = { textAlign: 'center', marginBottom: '36px' };
const titleStyle = { fontSize: '2.5rem', color: '#111827', margin: '0 0 12px' };
const subtitleStyle = { color: '#6b7280', fontSize: '1rem', margin: 0 };
const categoryBarStyle = { display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' };
const categoryBtn = { border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', padding: '10px 18px', borderRadius: '999px', cursor: 'pointer', fontWeight: '600' };
const activeCategoryBtn = { ...categoryBtn, backgroundColor: '#326e51', color: '#fff', borderColor: '#326e51' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' };
const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' };
const imagePlaceholderStyle = { height: '180px', background: 'linear-gradient(135deg, #e8f3ed, #faedcd)', color: '#326e51', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '900' };
const cardBodyStyle = { padding: '22px' };
const dateStyle = { color: '#9ca3af' };
const cardTitleStyle = { color: '#111827', fontSize: '1.25rem', margin: '10px 0' };
const summaryStyle = { color: '#4b5563', lineHeight: 1.6, minHeight: '76px' };
const readMoreStyle = { color: '#326e51', textDecoration: 'none', fontWeight: '700' };
const faqSectionStyle = { marginTop: '60px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' };
const faqItemStyle = { borderTop: '1px solid #eef2f7', padding: '16px 0', cursor: 'pointer' };
const faqQuestionStyle = { display: 'flex', justifyContent: 'space-between', gap: '16px', color: '#111827' };
const faqAnswerStyle = { color: '#4b5563', lineHeight: 1.6, marginBottom: 0 };

export default News;
