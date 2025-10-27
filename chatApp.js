// chatApp.js (Phiên bản Hoàn Chỉnh: Đã kích hoạt Gemini)
import { ChatHeader } from './components/ChatHeader.js';
import { InputBar } from './components/InputBar.js';
import { MessageList } from './components/MessageList.js';
import { SuggestionList } from './components/SuggestionList.js';
import { findTopFaqs } from './hooks/useFaqSearch.js'; // SỬA LỖI ĐÁNH MÁY NẾU CÓ
// --- CONFIGURATION & STATE ---
const GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG3r7RZrpBrpDRtZCVo'; // KEY MỚI CỦA BẠN
const DATA_FILE = './assets/faqs.json';
let messages = [];
let allFaqs = [];
let isShowingSuggestions = true;
const chatContainer = document.getElementById('chat-container');
let displayArea = null;
let chatInput = null;
// Thêm dấu ngoặc đơn quanh tham số resolve cho Promise
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// --- CÁC HÀM CƠ SỞ ---
function handleSuggestionClick(event) {
  const target = event.target.closest('.suggestion-item');
  if (target) {
    const questionText = target.getAttribute('data-question');
    // Gửi câu hỏi đã chọn như một tin nhắn của người dùng
    handleUserMessage(questionText);
  }
}
// Hàm xử lý việc gửi tin nhắn của người dùng
async function handleUserMessage(text) {
  const userMessage = text.trim();
  if (userMessage === '') return;
  // 1. Thêm tin nhắn người dùng vào danh sách
  messages.push({ sender: 'user', text: userMessage });
  // 2. Tắt gợi ý và render lại
  isShowingSuggestions = false;
  render();
  // 3. Hiển thị tin nhắn chờ (typing indicator)
  const typingMessage = { sender: 'bot', text: '...' };
  messages.push(typingMessage);
  render();
  scrollToBottom(displayArea);
  // 4. Tìm câu trả lời (FAQS)
  let botAnswer = findAnswer(userMessage);
  if (!botAnswer) {
    // 5. Nếu không tìm thấy, gọi Gemini API
    const geminiResponse = await callGeminiAPI(userMessage);
    botAnswer = geminiResponse;
  }
  // 6. Xóa tin nhắn chờ và thêm câu trả lời của bot
  messages.pop(); // Xóa tin nhắn "..."
  messages.push({ sender: 'bot', text: botAnswer });
  // 7. Render lại UI và cuộn xuống
  render();
  scrollToBottom(displayArea);
  // 8. Sau khi có phản hồi, bật lại gợi ý nếu không có văn bản trong input
  if (chatInput.value.trim() === '') {
      isShowingSuggestions = true;
      render();
  }
}
// Hàm gọi API Gemini
async function callGeminiAPI(prompt) {
    const systemPrompt = "Bạn là UniFAQ AI Assistant, một trợ lý thân thiện và chuyên nghiệp, chuyên trả lời các câu hỏi về quy tắc, chính sách, lịch học của trường đại học. Vui lòng trả lời bằng tiếng Việt. Nếu bạn không chắc chắn, hãy trả lời một cách lịch sự rằng bạn không có thông tin và mời người dùng hỏi thêm câu hỏi liên quan đến trường.";
    // Xây dựng lịch sử chat cho API
    // Loại trừ tin nhắn cuối cùng (tin nhắn "...")
    const history = messages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    // Thêm prompt hiện tại
    history.push({ 
        role: "user", 
        parts: [{ text: prompt }] 
    });
    const payload = {
        contents: history,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };
    const apiKey = GEMINI_API_KEY; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API Error Response:', errorText);
            throw new Error(`Gemini API responded with status ${response.status}`);
        }
        const result = await response.json();
        const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
            return generatedText;
        } 
        // Trường hợp response OK nhưng không có nội dung (ví dụ: bị chặn)
        return 'Xin lỗi, tôi gặp sự cố khi tạo phản hồi. Vui lòng thử lại sau.';    
    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        return 'Xin lỗi, tôi gặp lỗi kết nối với trợ lý AI. Vui lòng kiểm tra lại KEY hoặc kết nối mạng.';
    }
}
// Hàm render chính
function render() {
    if (!displayArea) return;
    const keyword = chatInput ? chatInput.value.trim() : '';
    const isChatting = messages.length > 0;
    const lastMessage = isChatting ? messages[messages.length - 1] : null;
    const isTyping = lastMessage && lastMessage.sender === 'bot' && lastMessage.text === '...';
    const suggestions = findTopFaqs(keyword, allFaqs);
    displayArea.innerHTML = ''; 
    if (isChatting) {
        // Nếu đang chat, hiển thị MessageList
        displayArea.innerHTML = MessageList(messages);
        
        // Nếu không phải đang typing và input rỗng HOẶC input có nội dung, hiển thị gợi ý
        if (!isTyping) {
            if (keyword === '' && isShowingSuggestions) {
                 // Sau khi bot trả lời xong, hiển thị gợi ý nếu input rỗng
                displayArea.insertAdjacentHTML('beforeend', SuggestionList(suggestions, keyword));
            } else if (keyword !== '') {
                // Khi người dùng gõ, hiển thị SuggestionList
                displayArea.insertAdjacentHTML('beforeend', SuggestionList(suggestions, keyword));
            }
        }
    } else {
        // Nếu chưa có tin nhắn nào, hiển thị SuggestionList ban đầu
        displayArea.innerHTML = SuggestionList(suggestions, keyword);
    }
    // Luôn cuộn xuống cuối khi render
    scrollToBottom(displayArea);
    // Gắn lại sự kiện lắng nghe cho các gợi ý sau mỗi lần render
    attachSuggestionListeners();
}
// Hàm cuộn xuống cuối danh sách tin nhắn
function scrollToBottom(element) {
    // Đợi 50ms để DOM kịp cập nhật trước khi cuộn
    setTimeout(() => {
        element.scrollTop = element.scrollHeight;
    }, 50);
}
// Hàm tìm câu trả lời FAQS (Tìm kiếm nâng cao)
function findAnswer(question) {
  const userWords = question.toLowerCase().trim().split(/\s+/);
  if (userWords.length === 0) return null;
  let bestMatch = { faq: null, score: 0 };
  allFaqs.forEach((faq) => {
    let currentScore = 0;
    const questionText = faq.question.toLowerCase();
    const answerText = faq.answer.toLowerCase();
    userWords.forEach((word) => {
      if (word.length >= 4) { // Chỉ tính điểm cho từ khóa có 4 ký tự trở lên
        // Ưu tiên khớp trong câu hỏi
        if (questionText.includes(word)) {
          currentScore += 2;
        }
        // Ít ưu tiên hơn nếu chỉ khớp trong câu trả lời
        else if (answerText.includes(word)) {
          currentScore += 1;
        }
      }
    });
    if (currentScore > bestMatch.score) {
      bestMatch = { faq, score: currentScore };
    }
  });
  // Nâng ngưỡng điểm lên 4 để tăng độ chính xác
  if (bestMatch.score > 5) {
    return bestMatch.faq.answer;
  }
  // Trả về null nếu không đạt ngưỡng, để Gemini xử lý
  return null;
}
// Gắn sự kiện click cho các item gợi ý
function attachSuggestionListeners() {
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('click', handleSuggestionClick);
    });
}
// Hàm khởi tạo
async function main() {
    try {
        // Tải FAQs
        const response = await fetch(DATA_FILE);
        if (!response.ok) throw new Error('Không thể tải file FAQs.');
        allFaqs = await response.json();
        // Khởi tạo UI
        renderLayout();
        // Gắn sự kiện cho nút đóng/mở chat
        document.getElementById('chat-toggle-button').addEventListener('click', toggleChatWidget);
        document.getElementById('chat-close-button').addEventListener('click', toggleChatWidget);
        document.getElementById('chat-minimize-button').addEventListener('click', minimizeChatWidget);
        // Gắn sự kiện cho form chat
        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            handleUserMessage(chatInput.value);
            chatInput.value = ''; // Xóa input sau khi gửi
            
            // Đảm bảo gợi ý được hiển thị sau khi gửi tin nhắn nếu input rỗng
            isShowingSuggestions = true;
            render();
        });
        // Gắn sự kiện lắng nghe cho sự thay đổi của input
        document.getElementById('chat-input').addEventListener('input', () => {
            // Render lại để cập nhật SuggestionList theo từ khóa gõ
            render(); 
        });
        
    } catch (error) {
        console.error("Initialization Error:", error);
    }
}
// Hàm hiển thị layout khung chat
function renderLayout() {
    chatContainer.innerHTML = `
        ${ChatHeader()}
        <div class="message-list-area" id="display-area">
            ${SuggestionList([], '')}
        </div>
        ${InputBar()}
    `;
    // Gán các phần tử DOM sau khi render
    displayArea = document.getElementById('display-area');
    chatInput = document.getElementById('chat-input');
    // Render lần đầu để hiển thị SuggestionList ban đầu (nếu có)
    render();
}
// Hàm đóng/mở cửa sổ chat
function toggleChatWidget() {
    const chatWidgetContainer = document.getElementById('chat-widget-container');
    chatWidgetContainer.classList.toggle('chat-widget-container--open');
    chatWidgetContainer.classList.remove('chat-widget-container--minimized'); // Đảm bảo không ở trạng thái thu nhỏ
    
    // Đặt lại trạng thái ban đầu của chat khi mở lại
    if (chatWidgetContainer.classList.contains('chat-widget-container--open') && messages.length === 0) {
        isShowingSuggestions = true;
        chatInput.value = '';
        render();
    }
}
// Hàm thu nhỏ cửa sổ chat
function minimizeChatWidget() {
    const chatWidgetContainer = document.getElementById('chat-widget-container');
    chatWidgetContainer.classList.add('chat-widget-container--minimized');
    chatWidgetContainer.classList.remove('chat-widget-container--open');
}
// Khởi động ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', main);