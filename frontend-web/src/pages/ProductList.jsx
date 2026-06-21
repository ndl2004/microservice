import { useEffect, useState } from 'react';
import api from '../api/axios';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Hàm lấy dữ liệu từ Backend
    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setLoading(false);
        }
    };

    // 2. Chạy hàm lấy dữ liệu ngay khi trang được load
    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading) return <div className="container mt-5">Đang tải dữ liệu...</div>;

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Quản lý Sản phẩm</h2>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Mô tả</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.price} $</td>
                                <td>{item.description}</td>
                                <td>
                                    <button className="btn btn-sm btn-danger">Xóa</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="text-center">Chưa có sản phẩm nào.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;