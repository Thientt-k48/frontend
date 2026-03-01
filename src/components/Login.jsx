import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Thay đổi URL này cho đúng với API Login trong Django của bạn
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
                username: username,
                password: password
            });

            // Sau khi login thành công, trả Token và Role về cho App.js
            const { access, role } = response.data;
            onLoginSuccess(access, role);

        } catch (err) {
            console.error(err);
            setError('Tên đăng nhập hoặc mật khẩu không đúng!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Đăng Nhập Hệ Thống</h2>
                {error && <p className="error-msg">{error}</p>}
                
                <div className="input-group">
                    <label>Tài khoản:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Mật khẩu:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
};

export default Login;