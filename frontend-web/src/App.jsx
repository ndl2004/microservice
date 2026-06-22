import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

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

import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import Orders from './admin/Orders';
import Products from './admin/Products';
import Users from './admin/Users';
import Inventory from './admin/Inventory';
import AdminNews from './admin/News';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartContext';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) return <Navigate to="/login" />;

  try {
    const user = JSON.parse(userStr);
    const storedRole = localStorage.getItem('user_role');

    if (role === 'admin' && user.role !== 'ADMIN' && storedRole !== 'ADMIN') {
      return <Navigate to="/" />;
    }
  } catch (error) {
    return <Navigate to="/login" />;
  }

  return children;
};

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

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CartProvider>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="users" element={<Users />} />
            <Route path="news" element={<AdminNews />} />
          </Route>

          <Route path="/" element={<UserPage><Home /></UserPage>} />
          <Route path="/product/:id" element={<UserPage><ProductDetail /></UserPage>} />
          <Route path="/san-pham" element={<UserPage><AllProducts /></UserPage>} />
          <Route path="/cart" element={<UserPage><Cart /></UserPage>} />
          <Route path="/tin-tuc" element={<UserPage><NewsDetail /></UserPage>} />
          <Route path="/tin-tuc/:id" element={<UserPage><NewsDetail /></UserPage>} />
          <Route path="/lien-he" element={<UserPage><Contact /></UserPage>} />
          <Route path="/payment-return" element={<PaymentReturn />} />

          <Route path="/profile" element={<ProtectedRoute><UserPage><Profile /></UserPage></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><UserPage><Checkout /></UserPage></ProtectedRoute>} />
          <Route path="/order-history" element={<ProtectedRoute><UserPage><OrderHistory /></UserPage></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserPage><UserDashboard /></UserPage></ProtectedRoute>} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </Router>
  );
}

export default App;
