import React, { useState } from 'react';
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

    const navigate = useNavigate();

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
    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Quản lý Sách Giáo Khoa</h2>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        padding: '8px 15px', 
                        background: '#dc3545', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer' 
                    }}
                >
                    Đăng xuất
                </button>
                <hr style={{ margin: '30px 0' }} />

                {/* THÊM PHẦN HIỂN THỊ DANH SÁCH TÀI LIỆU */}
                <h3>Danh sách Sách Giáo Khoa trên hệ thống</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
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
                                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', 
                                    color: doc.status === 'processing' ? 'orange' : (doc.status === 'completed' ? 'green' : 'black') 
                                }}>
                                    {doc.status.toUpperCase()}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    {doc.status === 'uploaded' && (
                                        <button 
                                            onClick={() => handleProcess(doc.id)}
                                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}
                                        >
                                            Chạy Xử Lý (ETL)
                                        </button>
                                    )}
                                    {doc.status === 'processing' && <span>⏳ Đang xử lý...</span>}
                                    {doc.status === 'completed' && <span>✅ Đã nạp</span>}
                                </td>
                            </tr>
                        ))}
                        {documents.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>Chưa có tài liệu nào.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

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
                        {/* Gọi hàm handleGradeChange thay vì setGrade trực tiếp */}
                        <select value={grade} onChange={handleGradeChange} style={{ width: '100%', padding: '8px' }}>
                            <option value="10">Lớp 10</option>
                            <option value="11">Lớp 11</option>
                            <option value="12">Lớp 12</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Định hướng:</label><br/>
                        {/* Ẩn hiện Option linh hoạt dựa vào biến grade */}
                        <select 
                            value={orientation} 
                            onChange={(e) => setOrientation(e.target.value)} 
                            style={{ width: '100%', padding: '8px', backgroundColor: grade === '10' ? '#e9ecef' : '#fff' }}
                            disabled={grade === '10'} // Khóa ô chọn nếu là lớp 10
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