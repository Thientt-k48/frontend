import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // 2. KHỞI TẠO navigate
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Gọi API đăng nhập tới Backend Django của bạn
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { username, password });
            

            // Lấy token và thông tin user từ kết quả trả về
            const { access, role } = response.data; // GIẢ SỬ backend trả về biến role

            // Lưu token vào bộ nhớ trình duyệt để dùng cho các request sau
            localStorage.setItem('accessToken', access);
            localStorage.setItem('userRole', role);

            // 3. ĐIỀU HƯỚNG THEO ROLE
            if (role === 'admin') {
                navigate('/admin'); // Admin vào trang quản lý
            } else {
                navigate('/chat');  // Học sinh vào khung chat
            }

        } catch (err) {
            setError('Sai tài khoản hoặc mật khẩu!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="Tên đăng nhập" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Mật khẩu" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none' }}>
                    Đăng Nhập
                </button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;