import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Thiết lập đường dẫn hiện tại (ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Middleware để đọc JSON từ body
app.use(express.json());

// Cấu hình phục vụ file tĩnh (HTML, CSS, JS)
app.use(express.static(__dirname));

// Đường dẫn file dữ liệu FAQs
const DATA_FILE = path.join(__dirname, 'faqs.json');

// 🧩 Hàm đọc dữ liệu từ file JSON
function loadFaqs() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// 🧩 Hàm ghi dữ liệu vào file JSON
function saveFaqs(faqs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(faqs, null, 2), 'utf-8');
}

// 🟢 CREATE FAQ
app.post('/faqs', (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ message: '❌ Both question and answer are required.' });
  }

  const faqs = loadFaqs();
  const newId = faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1;

  const newFaq = { id: newId, question, answer };
  faqs.push(newFaq);
  saveFaqs(faqs);

  return res.status(201).json({ message: '✅ FAQ created successfully.', faq: newFaq });
});

// 🔵 READ ALL FAQs
app.get('/faqs', (req, res) => {
  const faqs = loadFaqs();
  return res.status(200).json(faqs);
});

// 🔵 READ ONE FAQ
app.get('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const faqs = loadFaqs();
  const faq = faqs.find((f) => f.id === id);

  if (!faq) {
    return res.status(404).json({ message: '⚠️ FAQ not found.' });
  }

  return res.status(200).json(faq);
});

// 🟡 UPDATE FAQ
app.put('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const { question, answer } = req.body;

  const faqs = loadFaqs();
  const index = faqs.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: '⚠️ FAQ not found.' });
  }

  if (!question || !answer) {
    return res.status(400).json({ message: '❌ Both question and answer are required for update.' });
  }

  faqs[index] = { id, question, answer };
  saveFaqs(faqs);

  return res.status(200).json({ message: '✅ FAQ updated successfully.', faq: faqs[index] });
});

// 🔴 DELETE FAQ
app.delete('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const faqs = loadFaqs();
  const index = faqs.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: '⚠️ FAQ not found.' });
  }

  const deleted = faqs.splice(index, 1)[0];
  saveFaqs(faqs);

  return res.status(200).json({ message: '🗑️ FAQ deleted successfully.', deleted });
});

// 🩵 HEALTH CHECK
app.get('/health', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.status(200).send('OK');
});

// 🏠 Trang chính (HTML)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index4.html'));
});

// 🚀 Chạy server
app.listen(port, () => {
  console.log(`✅ UniFAQ server running at http://localhost:${port}`);
});
