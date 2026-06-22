const STORAGE_KEY = 'luna_news_posts';

export const newsCategories = [
  { value: '', label: 'Tất cả' },
  { value: 'promotion', label: 'Khuyến mãi' },
  { value: 'beauty_tips', label: 'Mẹo làm đẹp' },
  { value: 'trends', label: 'Xu hướng' },
  { value: 'company_news', label: 'Tin công ty' },
];

export const defaultNewsPosts = [
  {
    id: 1,
    title: 'Quy trình chăm sóc da cơ bản',
    category: 'beauty_tips',
    summary: 'Gợi ý các bước chăm sóc da đơn giản cho buổi sáng và buổi tối.',
    content: 'Một quy trình chăm sóc da cơ bản thường gồm làm sạch, cân bằng, serum, dưỡng ẩm và chống nắng vào ban ngày. Người mới bắt đầu nên chọn sản phẩm dịu nhẹ, theo dõi phản ứng của da và duy trì đều đặn trước khi thêm quá nhiều hoạt chất.',
    author: 'Luna Team',
    status: 'PUBLISHED',
    date: '2026-06-19',
    image: '',
  },
  {
    id: 2,
    title: 'Xu hướng trang điểm tự nhiên',
    category: 'trends',
    summary: 'Lớp nền mỏng nhẹ và màu son tự nhiên vẫn được nhiều khách hàng yêu thích.',
    content: 'Trang điểm tự nhiên ưu tiên lớp nền mỏng, má hồng nhẹ và son có sắc gần màu môi. Phong cách này phù hợp đi học, đi làm và giúp khách hàng dễ chọn sản phẩm khi mua online.',
    author: 'Beauty Editor',
    status: 'PUBLISHED',
    date: '2026-06-18',
    image: '',
  },
  {
    id: 3,
    title: 'Ưu đãi thành viên Luna',
    category: 'promotion',
    summary: 'Khách hàng đăng ký tài khoản có thể nhận thông báo ưu đãi mới.',
    content: 'Chương trình thành viên giúp cửa hàng giữ liên hệ với khách hàng cũ, giới thiệu sản phẩm mới và tạo các mã ưu đãi theo mùa. Đây là nội dung phù hợp để demo trang tin tức trong hệ thống e-commerce.',
    author: 'Admin',
    status: 'PUBLISHED',
    date: '2026-06-17',
    image: '',
  },
];

export const getNewsPosts = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNewsPosts));
    return defaultNewsPosts;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultNewsPosts;
  } catch (error) {
    return defaultNewsPosts;
  }
};

export const saveNewsPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getCategoryLabel = (value) => {
  return newsCategories.find((category) => category.value === value)?.label || 'Tin tức';
};
