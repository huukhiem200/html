import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Vô hiệu hóa ETag cho toàn bộ ứng dụng để ngăn chặn 304 Not Modified
// Điều này rất quan trọng để đảm bảo health check luôn trả về 200 OK.
// NOTE: Cần chạy lại Docker compose up --build để áp dụng
const app = express();
app.disable('etag'); 

const PORT = 3000;

// Cấu hình __dirname cho môi trường ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. HEALTHCHECK ENDPOINT ---
// Endpoint này được sử dụng để kiểm tra trạng thái hoạt động của server
app.get('/health', (req, res) => {
    // Thêm các header vô hiệu hóa cache (cần thiết nếu app.disable('etag') không đủ)
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    // Luôn trả về 200 OK và JSON payload
    res.status(200).json({
        status: "ok",
        service: "UniFAQ Web Server"
    });
});

// --- 2. STATIC FILES & API MOCK ---
// Phục vụ các file tĩnh (HTML, CSS, JS, Assets)
app.use(express.static(path.join(__dirname)));

// --- 3. START SERVER ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Healthcheck available at http://localhost:${PORT}/health`);
});
