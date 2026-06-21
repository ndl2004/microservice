import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Khởi tạo giỏ hàng từ localStorage nếu có
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lưu vào localStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Hàm thêm sản phẩm vào giỏ
  // File: src/context/CartContext.js

// Thêm tham số quantity với giá trị mặc định là 1
const addToCart = (product, quantity = 1, showToast = true) => {
  setCartItems((prevItems) => {
    const isProductInCart = prevItems.find((item) => item.id === product.id);

    if (isProductInCart) {
      // Nếu đã có trong giỏ, cộng dồn số lượng mới vào số lượng cũ
      return prevItems.map((item) =>
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    }
    
    // Nếu chưa có, thêm mới với số lượng được truyền vào
    return [...prevItems, { ...product, quantity: quantity }];
  });

  if (showToast) {
    // Tùy chọn: Hiện toast tại đây nếu bạn muốn
  }
};
  // Hàm xóa sản phẩm
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Tính tổng số lượng và tổng tiền
  const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, totalQuantity, totalPrice, setCartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);