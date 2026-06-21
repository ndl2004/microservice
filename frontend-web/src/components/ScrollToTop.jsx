import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Lệnh này sẽ ép trình duyệt cuộn lên đầu mỗi khi đường dẫn (URL) thay đổi
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;