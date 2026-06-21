import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages (User)
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AllProducts from './pages/AllProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import UserDashboard from './pages/Dashboard';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import PaymentReturn from './VNPAY/PaymentReturn';
// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Products from './admin/Products';
import Users from './admin/Users';
// Toast & Styles
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { CartProvider } from './context/CartContext';

/* ================= 1. PROTECTED ROUTE (BẢO VỆ ĐƯỜNG DẪN) ================= */
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" />;

  try {
    const user = JSON.parse(userStr);
    
    // Kiểm tra quyền nếu có yêu cầu role
    if (role === 'admin' && user.role !== 'admin') {
      return <Navigate to="/" />;
    }
  } catch (error) {
    return <Navigate to="/login" />;
  }

  return children;
};

/* ================= 2. USER LAYOUT WRAPPER (CÓ HEADER/FOOTER) ================= */
const UserPage = ({ children }) => {
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#fffcf2' 
    }}>
      <Header />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};

/* ================= 3. MAIN APP COMPONENT ================= */
function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <Routes>
          
          {/* --- KHU VỰC ADMIN (ƯU TIÊN LÊN ĐẦU) --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Các Route con nằm bên trong thẻ đóng của Route cha */}
            <Route index element={<AdminDashboard />} /> 
            <Route path="dashboard" element={<AdminDashboard />} /> 
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />

          </Route> 
          {/* Thẻ đóng </Route> nằm ở cuối cùng sau khi đã khai báo hết các con */} 

          {/* --- KHU VỰC USER (CÓ HEADER & FOOTER) --- */}
          <Route path="/" element={<UserPage><Home /></UserPage>} />
          <Route path="/product/:id" element={<UserPage><ProductDetail /></UserPage>} />
          <Route path="/san-pham" element={<UserPage><AllProducts /></UserPage>} />
          <Route path="/cart" element={<UserPage><Cart /></UserPage>} />
          <Route path="/tin-tuc" element={<UserPage><NewsDetail /></UserPage>} />
          <Route path="/lien-he" element={<UserPage><Contact /></UserPage>} />
          <Route path="/payment-return" element={<PaymentReturn />} />
          {/* User Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><UserPage><Profile /></UserPage></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><UserPage><Checkout /></UserPage></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute><UserPage><OrderHistory /></UserPage></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserPage><UserDashboard /></UserPage></ProtectedRoute>} />

          {/* Auth Routes (Không có Header/Footer) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </Router>
  );
}

export default App;