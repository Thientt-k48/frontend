import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [grade, setGrade] = useState('10');
    // Mặc định vào web là Lớp 10 nên định hướng sẽ là 'Chung'
    const [orientation, setOrientation] = useState('Chung'); 
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [documents, setDocuments] = useState([]);
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };
    
    // LẤY TOKEN GẮN VÀO HEADER DÙNG CHUNG
    const getAuthHeaders = () => ({
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    });

    // HÀM LẤY DANH SÁCH TÀI LIỆU KHI VÀO TRANG
    const fetchDocuments = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/docs/', getAuthHeaders());
            setDocuments(res.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách tài liệu:", error);
        }
    };

    // Chạy 1 lần khi load trang
    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // THÊM HÀM XỬ LÝ KHI THAY ĐỔI LỚP
    const handleGradeChange = (e) => {
        const selectedGrade = e.target.value;
        setGrade(selectedGrade);
        
        // Nếu chọn lớp 10, ép định hướng thành 'Chung'
        if (selectedGrade === '10') {
            setOrientation('Chung');
        } 
        // Nếu chọn 11 hoặc 12, mặc định chọn 'ICT' nếu đang ở trạng thái 'Chung'
        else if (orientation === 'Chung') {
            setOrientation('ICT');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Vui lòng chọn file sách giáo khoa (PDF).');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title || file.name);
        formData.append('grade', grade);
        formData.append('orientation', orientation);

        setLoading(true);
        setMessage('');

        try {
            await axios.post('http://localhost:8000/api/docs/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    ...getAuthHeaders().headers
                }
            });
            setMessage(`Upload thành công!`);
            setFile(null);
            setTitle('');
            fetchDocuments(); // GỌI LẠI HÀM NÀY ĐỂ CẬP NHẬT DANH SÁCH MỚI
        } catch (error) {
            setMessage('Lỗi khi upload: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    // HÀM XỬ LÝ KHI BẤM NÚT "XỬ LÝ DỮ LIỆU"
    const handleProcess = async (docId) => {
        try {
            await axios.post(`http://localhost:8000/api/docs/process/${docId}/`, {}, getAuthHeaders());
            alert("Đã gửi yêu cầu xử lý thành công! Hệ thống đang chạy ngầm.");
            fetchDocuments(); // Tải lại để cập nhật status thành 'processing'
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn dừng quá trình xử lý tài liệu này?")) return;
        
        try {
            await axios.post(`http://localhost:8000/api/docs/cancel/${id}/`, {}, getAuthHeaders());
            setMessage('Đã gửi lệnh dừng tiến trình xử lý.');
            fetchDocuments(); // Tải lại danh sách ngay lập tức để cập nhật trạng thái
        } catch (error) {
            console.error("Lỗi khi hủy xử lý:", error);
            setMessage('Lỗi khi hủy tiến trình xử lý. ' + (error.response?.data?.error || ''));
        }
    };
    const handleDelete = async (docId) => {
        if (window.confirm("🚨 CẢNH BÁO: Bạn có chắc chắn muốn xóa hoàn toàn sách này cùng mọi kiến thức của nó?")) {
            try {
                // Đã chuyển sang dùng axios và gắn Token (getAuthHeaders)
                const response = await axios.delete(`http://localhost:8000/api/docs/delete/${docId}/`, getAuthHeaders());
                
                if (response.status === 200) {
                    alert("Xóa thành công!");
                    fetchDocuments(); // Gọi lại hàm để cập nhật giao diện
                }
            } catch (error) {
                console.error("Lỗi:", error);
                alert("Có lỗi xảy ra khi xóa: " + (error.response?.data?.error || error.message));
            }
        }
    };
    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
            
            {/* --- 1. PHẦN HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Quản lý Sách Giáo Khoa</h2>
                <button 
                    onClick={handleLogout}
                    style={{ padding: '8px 15px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Đăng xuất
                </button>
            </div> 

            <hr style={{ margin: '30px 0' }} />

            {/* --- 2. PHẦN BẢNG DANH SÁCH TÀI LIỆU --- */}
            <h3>Danh sách Sách Giáo Khoa trên hệ thống</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên Sách</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Trạng thái</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.id}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{doc.title}</td>
                            
                            {/* Cột Trạng thái (Đã gộp từ 2 cột bị trùng của bạn) */}
                            <td style={{ 
                                padding: '10px', 
                                border: '1px solid #ddd', 
                                fontWeight: 'bold', 
                                color: doc.status === 'processing' ? 'orange' : 
                                      (doc.status === 'completed' ? 'green' : 
                                      (doc.status === 'failed' ? 'red' : 
                                      (doc.status === 'cancelled' ? 'gray' : 'black'))) 
                            }}>
                                {doc.status === 'cancelled' ? 'ĐÃ HỦY' : doc.status.toUpperCase()}
                            </td>
                            
                            {/* Cột Hành động (Đã gộp chức năng: Xử lý, Thử lại, Dừng, XÓA) */}
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    
                                    {/* Nhóm Nút Xử lý / Thử lại */}
                                    {(doc.status === 'uploaded' || doc.status === 'failed' || doc.status === 'cancelled') && (
                                        <button 
                                            onClick={() => handleProcess(doc.id)}
                                            style={{ 
                                                background: doc.status === 'failed' ? '#dc3545' : '#28a745', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '5px 10px', 
                                                cursor: 'pointer', 
                                                borderRadius: '3px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {doc.status === 'failed' ? '🔄 Thử lại (Retry)' : '▶️ Chạy Xử Lý (ETL)'}
                                        </button>
                                    )}

                                    {/* Đang xử lý -> Hiện chữ và Nút Dừng */}
                                    {doc.status === 'processing' && (
                                        <>
                                            <span style={{ fontStyle: 'italic', color: 'orange' }}>⏳ Đang xử lý...</span>
                                            <button 
                                                onClick={() => handleCancel(doc.id)}
                                                style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold' }}
                                            >
                                                🛑 Dừng
                                            </button>
                                        </>
                                    )}

                                    {/* Hoàn tất -> Hiện text xác nhận */}
                                    {doc.status === 'completed' && <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Đã nạp</span>}

                                    {/* NÚT XÓA SÁCH - Luôn hiện trừ lúc đang processing để tránh xung đột Database */}
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        disabled={doc.status === 'processing'}
                                        style={{ 
                                            background: doc.status === 'processing' ? '#cccccc' : '#6c757d', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '5px 10px', 
                                            cursor: doc.status === 'processing' ? 'not-allowed' : 'pointer', 
                                            borderRadius: '3px',
                                            fontWeight: 'bold',
                                            marginLeft: 'auto' // Đẩy nút Xóa về góc phải
                                        }}
                                        title={doc.status === 'processing' ? "Đang xử lý không thể xóa" : "Xóa hoàn toàn sách khỏi hệ thống"}
                                    >
                                        🗑️ Xóa
                                    </button>

                                </div>
                            </td>
                        </tr>
                    ))}
                    {documents.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>Chưa có tài liệu nào.</td></tr>
                    )}
                </tbody>
            </table>

            <hr style={{ margin: '30px 0' }} />
            
            {/* --- 3. PHẦN FORM UPLOAD --- */}
            <h3>Thêm tài liệu mới</h3>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Tiêu đề (Tùy chọn):</label><br/>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="VD: Tin học 12 - Kết nối tri thức"
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Lớp:</label><br/>
                        <select value={grade} onChange={handleGradeChange} style={{ width: '100%', padding: '8px' }}>
                            <option value="10">Lớp 10</option>
                            <option value="11">Lớp 11</option>
                            <option value="12">Lớp 12</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Định hướng:</label><br/>
                        <select 
                            value={orientation} 
                            onChange={(e) => setOrientation(e.target.value)} 
                            style={{ width: '100%', padding: '8px', backgroundColor: grade === '10' ? '#e9ecef' : '#fff' }}
                            disabled={grade === '10'}
                        >
                            {grade === '10' ? (
                                <option value="Chung">Chung (Không phân ban)</option>
                            ) : (
                                <>
                                    <option value="ICT">Tin học ứng dụng (ICT)</option>
                                    <option value="CS">Khoa học máy tính (CS)</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div>
                    <label>File sách (PDF):</label><br/>
                    <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
                >
                    {loading ? 'Đang tải lên và xử lý...' : 'Upload Sách'}
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', fontWeight: 'bold', color: message.includes('Lỗi') ? 'red' : 'green' }}>{message}</p>}
        </div>
    );
};

export default DocumentUpload;