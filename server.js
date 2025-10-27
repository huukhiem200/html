import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy __dirname trong môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// THAY ĐỔI QUAN TRỌNG: Vô hiệu hóa ETag cho toàn bộ ứng dụng.
// ETag là thứ gây ra phản hồi 304 Not Modified.
app.disable('etag');

// Middleware để ghi log các yêu cầu (logging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Endpoint HEALTH CHECK
// Đã vô hiệu hóa ETag nên headers này chỉ là bổ sung.
app.get('/health', (req, res) => {
    res.set({
        // Thêm headers để đảm bảo trình duyệt/proxy không cache response
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
    });
    // Tiêu chí yêu cầu status 200
    res.status(200).json({ status: 'ok', service: 'UniFAQ Web Server' });
});

// Mock API endpoint cho chat bot (giả định)
app.post('/api/chat', (req, res) => {
    // Logic xử lý chat sẽ nằm ở đây, nhưng hiện tại chỉ là mock
    res.json({ message: 'Đây là phản hồi từ Mock Chat API.', source: 'API' });
});

// Phục vụ các tệp tin tĩnh từ thư mục hiện tại (bao gồm index4.html, chatApp.js, style.css, v.v.)
// Đảm bảo Express phục vụ chính xác index4.html khi truy cập root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index4.html'));
});

// Phục vụ tất cả các tệp tĩnh khác
app.use(express.static(__dirname));

// Khởi động server
app.listen(port, () => {
    console.log(`UniFAQ Web Server đang chạy tại http://localhost:${port}`);
    console.log(`Health Check có thể truy cập tại http://localhost:${port}/health`);
});
