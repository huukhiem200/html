import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại theo chuẩn ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Cấu hình để phục vụ các file tĩnh (CSS, JS, JSON)
app.use(express.static(path.join(__dirname)));

// Endpoint chính phục vụ file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index4.html'));
});

// Endpoint Health Check: Bắt buộc không được cache (loại bỏ lỗi 304 Not Modified)
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.status(200).send('OK');
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
