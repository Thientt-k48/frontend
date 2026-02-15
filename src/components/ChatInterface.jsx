import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatInterface = ({ token, onLogout, role }) => {
    const [messages, setMessages] = useState([]); // Bỏ tin nhắn mặc định để chờ load lịch sử
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Tự động cuộn xuống cuối
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // --- MỚI: TỰ ĐỘNG TẢI LỊCH SỬ CHAT KHI VÀO TRANG ---
    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;
            try {
                // Gọi API lấy lịch sử (Lưu ý: đường dẫn không có dấu / ở cuối theo urls.py của bạn)
                const res = await axios.get('http://127.0.0.1:8000/api/chat/history', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Xử lý dữ liệu trả về từ Server để khớp với giao diện
                // Giả sử server trả về mảng: [{ message: "...", is_user: true }, ...]
                // Nếu cấu trúc khác, bạn cần sửa lại đoạn map bên dưới nhé
                if (Array.isArray(res.data)) {
                    const formattedHistory = res.data.map(item => ({
                        role: item.is_user ? 'user' : 'assistant', // Kiểm tra xem server trả về cờ gì để biết ai chat
                        content: item.message || item.content // Lấy nội dung tin nhắn
                    }));
                    setMessages(formattedHistory);
                } else {
                    // Nếu không có lịch sử thì hiện câu chào
                    setMessages([{ role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bạn?' }]);
                }
            } catch (err) {
                console.error("Lỗi tải lịch sử:", err);
                // Nếu lỗi thì vẫn hiện câu chào
                setMessages([{ role: 'assistant', content: 'Xin chào! (Không tải được lịch sử cũ)' }]);
            }
        };

        fetchHistory();
        // eslint-disable-next-line
    }, [token]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Gọi API dự đoán (predict)
            const res = await axios.post('http://127.0.0.1:8000/api/chat/predict', {
                message: input 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const botMsg = { role: 'assistant', content: res.data.response || res.data.message };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lỗi kết nối server!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto', border: '1px solid #ddd', borderRadius: '10px', display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <div style={{ padding: '15px', background: '#007bff', color: 'white', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Chatbot Hỗ trợ</h3>
                <div>
                    {(role === 'admin' || role === 'manager') && (
                        <button 
                            onClick={() => navigate('/documents')} 
                            style={{ marginRight: '10px', background: 'white', color: '#007bff', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                        >
                            ⚙️ Quản lý
                        </button>
                    )}
                    <button onClick={onLogout} style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
                        Đăng xuất
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f9f9f9' }}>
                {messages.map((msg, index) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '10px'
                    }}>
                        <div style={{ 
                            maxWidth: '70%', 
                            padding: '10px 15px', 
                            borderRadius: '15px', 
                            background: msg.role === 'user' ? '#007bff' : '#e9ecef',
                            color: msg.role === 'user' ? 'white' : 'black'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <div style={{ color: '#aaa', fontStyle: 'italic' }}>Bot đang suy nghĩ...</div>}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ padding: '15px', borderTop: '1px solid #ddd', display: 'flex' }}>
                <input 
                    type="text" value={input} onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập câu hỏi..." 
                    style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', outline: 'none' }}
                />
                <button type="submit" style={{ marginLeft: '10px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
                    Gửi
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;