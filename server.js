import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// 🔹 Đường dẫn tuyệt đối tới file dữ liệu FAQs
const DATA_FILE = path.join(__dirname, 'assets', 'faqs.json');
// Hàm đọc dữ liệu FAQs
function loadFaqs() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading faqs.json:', err);
    return [];
  }
}

// Hàm lưu dữ liệu FAQs
function saveFaqs(faqs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(faqs, null, 2), 'utf8');
}

// 🟢 CREATE
app.post('/faqs', (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ message: 'Missing question or answer.' });
  }

  const faqs = loadFaqs();
  const newId = faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1;
  const newFaq = { id: newId, question, answer };

  faqs.push(newFaq);
  saveFaqs(faqs);
  // 💡 SỬA LỖI 1: Thêm 'return' ở đây
  return res.status(201).json({ message: 'FAQ created successfully.', faq: newFaq });
});

// 🔵 READ ALL
app.get('/faqs', (req, res) => {
  const faqs = loadFaqs();
  return res.status(200).json(faqs);
});

// 🔵 READ ONE
app.get('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const faqs = loadFaqs();

  // ⚠️ Kiểm tra id có phải là số hợp lệ không
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid FAQ id.' });
  }

  const faq = faqs.find((f) => f.id === id);

  if (!faq) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }

  return res.status(200).json(faq);
});

// 🟡 UPDATE
app.put('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const { question, answer } = req.body;
  const faqs = loadFaqs();
  const index = faqs.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(44).json({ message: 'FAQ not found.' });
  }
  if (!question || !answer) {
    return res.status(400).json({ message: 'Missing fields for update.' });
  }

  faqs[index] = { id, question, answer };
  saveFaqs(faqs);

  return res.status(200).json({ message: 'FAQ updated successfully.', faq: faqs[index] });
});

// 🔴 DELETE
app.delete('/faqs/:id', (req, res) => {
  const id = Number(req.params.id);
  const faqs = loadFaqs();
  const index = faqs.findIndex((f) => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'FAQ not found.' });
  }

  const deleted = faqs.splice(index, 1)[0];
  saveFaqs(faqs);
  return res.status(200).json({ message: 'FAQ deleted successfully.', deleted });
});

// 🩵 HEALTH CHECK
app.get('/health', (req, res) => {
  // 👇 SỬA DÒNG NÀY (để khớp với test)
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.type('text/plain');
  return res.status(200).send('OK');
});
// 🏠 TRANG CHÍNH HTML
app.use(express.static(__dirname));
app.use('/hooks', express.static(path.join(__dirname, 'hooks')));
// 👇 THÊM DÒNG NÀY ĐỂ PHỤC VỤ CÁC TỆP TRONG THƯ MỤC 'components'
app.use('/components', express.static(path.join(__dirname, 'components')))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index4.html'));
});
// 🚀 Start server
app.listen(port, () => console.log(`✅ UniFAQ server running at http://localhost:${port}`));
