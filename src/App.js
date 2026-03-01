import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import ChatInterface from './components/ChatInterface';
import Login from './components/Login'; // Giả sử bạn đã có file này
import './App.css';

function App() {
    // 1. Lấy token từ localStorage khi vừa mở trang
    const [token, setToken] = useState(localStorage.getItem('access_token'));
    const [role, setRole] = useState(localStorage.getItem('user_role') || 'user');

    // 2. Hàm xử lý khi Đăng nhập thành công
    const handleLoginSuccess = (newToken, newRole) => {
        localStorage.setItem('access_token', newToken);
        localStorage.setItem('user_role', newRole);
        setToken(newToken);
        setRole(newRole);
    };

    // 3. Hàm xử lý Đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        setToken(null);
        setRole('user');
        // Chuyển hướng về trang login (tự động do logic render bên dưới)
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Nếu chưa có Token -> Luôn bắt vào trang Login */}
                    <Route 
                        path="/login" 
                        element={
                            !token ? 
                            <Login onLoginSuccess={handleLoginSuccess} /> : 
                            <Navigate to="/chat" />
                        } 
                    />

                    {/* Nếu đã có Token -> Cho vào trang Chat, nếu chưa có -> Đá ra Login */}
                    <Route 
                        path="/chat" 
                        element={
                            token ? 
                            <ChatInterface 
                                token={token} 
                                role={role} 
                                onLogout={handleLogout} 
                            /> : 
                            <Navigate to="/login" />
                        } 
                    />

                    {/* Đường dẫn mặc định */}
                    <Route path="*" element={<Navigate to={token ? "/chat" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;