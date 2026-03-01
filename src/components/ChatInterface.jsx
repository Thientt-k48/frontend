import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css'; 

const ChatInterface = ({ token, onLogout, role }) => {
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Xin chào! Tôi là trợ lý AI. Bạn cần giúp gì về môn Tin học?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/chat/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSessions(res.data);
        } catch (err) { console.error("Lỗi tải lịch sử"); }
    };

    const handleSelectSession = async (sessionId) => {
    if (!sessionId || sessionId === 'undefined') return;
    setCurrentSessionId(sessionId);
    setLoading(true);
    try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/history?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Mapping lại cho đúng (Giả sử Backend trả về: role, content)
        const history = res.data.map(m => ({
            role: m.role,      // 'user' hoặc 'assistant'
            content: m.content, // Nội dung chữ
            source: m.sources?.source,
            doc_link: m.sources?.doc_link,
        }));

        setMessages(history);
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        setLoading(false);
    }
};

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([{ role: 'assistant', content: 'Sẵn sàng cho đoạn chat mới!' }]);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/chat/', {
                message: input,
                session_id: currentSessionId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!currentSessionId) {
                setCurrentSessionId(res.data.session_id);
                fetchSessions();
            }

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: res.data.data,
                source: res.data.meta?.source,
                doc_link: res.data.doc_link, 
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Lỗi kết nối server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <button className="new-chat-btn" onClick={handleNewChat}>
                    <span>+</span> Cuộc trò chuyện mới
                </button>
                
                <div className="history-section">
                    <p className="section-title">Gần đây</p>
                    <div className="session-list">
                        {sessions.map(s => (
                            <div 
                                key={s.session_id} 
                                className={`session-item ${currentSessionId === s.session_id ? 'active' : ''}`}
                                onClick={() => handleSelectSession(s.session_id)}
                            >
                                <span className="icon-msg">💬</span>
                                <span className="session-title-text">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">{role === 'admin' ? 'A' : 'U'}</div>
                        <span>Người dùng</span>
                    </div>
                    <button className="logout-btn" onClick={onLogout}>Đăng xuất</button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                <header className="chat-header">
                    <h2>Chatbot</h2>
                    {currentSessionId && <span className="session-status">ID: {currentSessionId}</span>}
                </header>

                <div className="messages-list">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message-wrapper ${msg.role}`}>
                            <div className="message-bubble">
                                <div className="text-content">{msg.content}</div>
                                {msg.source && (
                                    <>
                                    <div className="source-label">
                                        {msg.source === 'database' ? '📚 Sách giáo khoa' : '✨ AI'}
                                    </div>
                                    {msg.doc_link && (
                                        <a 
                                            href={msg.doc_link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="doc-link"
                                            style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}
                                        >
                                            📄 Xem tài liệu gốc
                                        </a>
                                    )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-wrapper assistant">
                            <div className="message-bubble loading">
                                <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="input-area">
                    <form className="input-container" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Hỏi tôi bất cứ điều gì về Tin học..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                        </button>
                    </form>
                    <p className="footer-note">Hệ thống có thể đưa ra câu trả lời nhầm lẫn. Hãy kiểm tra lại thông tin quan trọng.</p>
                </footer>
            </main>
        </div>
    );
};

export default ChatInterface;