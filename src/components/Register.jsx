import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    
    // 1. Khởi tạo State lưu dữ liệu form
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'member' // Mặc định là member
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 2. Hàm xử lý khi người dùng nhập liệu
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 3. Hàm xử lý khi bấm nút Đăng ký
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // GỌI API ĐĂNG KÝ (Nhớ check lại đường dẫn trong config/urls.py của bạn)
            const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', formData);
            
            if (response.status === 201) {
                setSuccess('Đăng ký thành công! Đang chuyển trang...');
                // Đợi 1.5s rồi chuyển sang trang login
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            // Xử lý lỗi trả về từ Backend
            if (err.response && err.response.data) {
                // Ví dụ: Lỗi trùng username
                setError(JSON.stringify(err.response.data)); 
            } else {
                setError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="register-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Đăng ký tài khoản</h2>
            
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Tên đăng nhập:</label>
                    <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Mật khẩu:</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label>Vai trò (Role):</label>
                    <select 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    >
                        <option value="member">Thành viên (Member)</option>
                        <option value="manager">Quản lý (Manager)</option>
                        <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Đăng ký ngay
                </button>
            </form>
        </div>
    );
};

export default Register;