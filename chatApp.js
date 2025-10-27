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

// Sửa lỗi #3 (Dòng 120): Thêm dấu ngoặc đơn quanh tham số resolve
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- CÁC HÀM CƠ SỞ (Được đẩy lên để giải quyết lỗi "used before defined") ---

function handleSuggestionClick(event) {
  const target = event.target.closest('.suggestion-item');
  if (target) {
    const questionText = target.getAttribute('data-question');

    // CHỈNH SỬA TẠI ĐÂY: Lấy câu trả lời đã biết
    // eslint-disable-next-line no-unused-vars
    const answerText = target.getAttribute('data-answer');

    // Truyền cả câu hỏi và câu trả lời đã biết vào hàm bắt đầu hội thoại
    startConversation(questionText);
    isShowingSuggestions = false;
  }
}

function attachSuggestionListeners() { // ĐƯỢC GỌI TRONG RENDER
  const items = document.querySelectorAll('.suggestion-item');
  items.forEach((item) => {
    item.addEventListener('click', handleSuggestionClick);
  });
}

function setupEventListeners() { // ĐƯỢC GỌI TRONG RENDERLAYOUT
  const chatForm = document.getElementById('chat-form');
  // chatInput đã được gán trong renderLayout
  const toggleButton = document.getElementById('chat-toggle-button');
  const closeButton = document.getElementById('chat-close-button');
  const minimizeButton = document.getElementById('chat-minimize-button');
  const headerSearchForm = document.getElementById('header-search-form');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');

  if (chatInput) {
    chatInput.addEventListener('input', handleChatInput);
    chatInput.addEventListener('focus', handleChatInput);
  }
  if (chatForm) {
    chatForm.addEventListener('submit', handleFormSubmit);
  }
  if (headerSearchForm) {
    headerSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const headerInput = document.getElementById('header-search-input');
      const userText = headerInput.value.trim();
      if (userText && chatContainer) {
        chatContainer.classList.add('is-open');
        isShowingSuggestions = false; // Chuyển sang chế độ hội thoại
        startConversation(userText);
        headerInput.value = '';
      }
    });
  }
  suggestionChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const question = chip.getAttribute('data-question');
      if (question && chatContainer) {
        chatContainer.classList.add('is-open');
        isShowingSuggestions = false; // Chuyển sang chế độ hội thoại
        startConversation(question);
      }
    });
  });
  if (toggleButton && chatContainer) {
    toggleButton.addEventListener('click', () => {
      chatContainer.classList.toggle('is-open');
    });
  }
  if (closeButton || minimizeButton) {
    const closeChat = () => {
      chatContainer.classList.remove('is-open');
      messages = [];
      isShowingSuggestions = true; // Đảm bảo quay lại chế độ gợi ý
      if (chatInput) chatInput.value = '';
      render();
    };
    if (closeButton) closeButton.addEventListener('click', closeChat);
    if (minimizeButton) minimizeButton.addEventListener('click', closeChat);
  }
  if (chatForm) {
    chatForm.addEventListener('submit', handleFormSubmit);
  }
}

// --- LOGIC CỐT LÕI ---

// Hàm render chính
function render() { // eslint-disable-line no-use-before-define
  if (!displayArea) return;

  const keyword = chatInput ? chatInput.value.trim() : '';

  // Đã sửa lỗi #1: Thụt lề 2 khoảng trắng (áp dụng cho toàn bộ hàm)
  const isTyping = messages.some((msg) => msg.isTyping);

  // Kiểm tra xem người dùng đang gõ **hoặc** box đang rỗng
  if ((keyword.length > 0 && !isTyping) || messages.length === 0) {
    // Luôn hiển thị SuggestionList nếu người dùng đang gõ hoặc box rỗng
    const suggestions = findTopFaqs(keyword, allFaqs); // SỬA LỖI ĐÁNH MÁY findTopFylls
    displayArea.innerHTML = SuggestionList(suggestions, keyword);
    attachSuggestionListeners();
  } else {
    // Nếu đã có hội thoại và người dùng không gõ gì, hiển thị MessageList
    displayArea.innerHTML = MessageList(messages);
    displayArea.scrollTop = displayArea.scrollHeight;
  }
}
function renderLayout() {
  if (!chatContainer) return;
  chatContainer.innerHTML = `${ChatHeader()}<div class="message-list" id="display-area"></div>${InputBar()}`;
  displayArea = document.getElementById('display-area');
  chatInput = document.getElementById('chat-input');

  // Khởi tạo messages là rỗng để render lần đầu tiên hiển thị SuggestionList
  messages = [];
  render();
  setupEventListeners();
}
function updateMessages() {
  const messageListContainer = document.getElementById('display-area');
  if (!messageListContainer) return;
  messageListContainer.innerHTML = MessageList(messages);
  messageListContainer.scrollTop = messageListContainer.scrollHeight;
}


// Khi người dùng gõ, quay lại chế độ gợi ý
function handleChatInput() { // eslint-disable-line no-use-before-define
  // Biến isShowingSuggestions được dùng ở đây để tránh lỗi 'unused'
  if (isShowingSuggestions) {
    render();
  } else {
    render();
  }
}
// Khi nhấn Enter hoặc nút Gửi
function handleFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const userText = input.value.trim();
  if (userText) {
    // Luôn chuyển sang chế độ hội thoại khi gửi câu hỏi
    isShowingSuggestions = false;
    startConversation(userText);
  }
}

// --- LOGIC GỌI AI VÀ XỬ LÝ HỘI THOẠI ---

async function getGeminiAnswer(question) {
  const MODEL_NAME = 'gemini-2.5-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

  // THAY ĐỔI: Đơn giản hóa systemInstruction
  const systemInstruction = 'Bạn là UniFAQ, một trợ lý AI thân thiện. Hãy trả lời câu hỏi bằng tiếng Việt ngắn gọn và chính xác.';

  const requestBody = {
    contents: [{ parts: [{ text: `${systemInstruction} Câu hỏi: ${question}` }] }],
    generationConfig: {
      // Vẫn giữ maxOutputTokens cao để đáp ứng câu trả lời chi tiết
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);

      // Sửa đổi: Trả về thông báo lỗi chi tiết hơn từ API
      const httpStatus = response.status;
      const errorMessage = errorData.error?.message || 'Không thể xử lý yêu cầu.';

      return `**Lỗi API (HTTP ${httpStatus})**: ${errorMessage}. Vui lòng kiểm tra API Key và giới hạn sử dụng.`;
    }
    const data = await response.json();
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      const { reason } = data.promptFeedback;
      console.warn('Gemini Response Blocked:', reason);
      return `Rất tiếc, câu hỏi của bạn đã bị Gemini từ chối trả lời. Lý do: ${reason}`;
    }
    if (!data || !data.candidates || data.candidates.length === 0
      || !data.candidates[0].content || !data.candidates[0].content.parts
      || data.candidates[0].content.parts.length === 0) {
      // Nếu API trả về 200 OK nhưng không có nội dung hợp lệ
      console.error('Gemini API returned 200 OK, but lacked candidates:', data);
      return 'Rất tiếc, câu hỏi này bị AI từ chối trả lời hoặc phản hồi không đúng cấu trúc.';
    }
    // Lỗi đang xảy ra ở đây vì data.candidates[0] hoặc .content hoặc .parts có thể undefined
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    // Khối này bắt lỗi mạng hoặc lỗi parse JSON
    console.error('Network or Parsing Error:', error);

    // Sửa đổi: Đưa ra thông báo lỗi chung về kết nối
    return 'Rất tiếc, đã có lỗi mạng hoặc kết nối không ổn định. (Check Console để biết thêm chi tiết)';
  }
}

async function startConversation(userText) {
  const input = document.getElementById('chat-input');
  const submitBtn = document.getElementById('chat-submit');

  if (input) input.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  messages.push({ sender: 'user', text: userText });
  updateMessages();
  if (input) input.value = '';

  // Khi bot trả lời, giao diện sẽ ở chế độ MessageList
  messages.push({ sender: 'bot', isTyping: true, text: '<span></span><span></span><span></span>' });
  updateMessages();

  let botReply = findAnswer(userText);

  if (!botReply) {
    await sleep(2000);
    botReply = await getGeminiAnswer(userText);
  }

  messages.pop();
  messages.push({ sender: 'bot', text: botReply });
  updateMessages();

  if (input) {
    input.disabled = false;
    input.focus();
  }
  if (submitBtn) submitBtn.disabled = false;

  // Sau khi hội thoại kết thúc, nếu input rỗng, nó sẽ quay lại hiển thị MessageList cũ
  // Nhưng ngay khi người dùng gõ, handleChatInput sẽ gọi render, và SuggestionList sẽ xuất hiện
}

// --- CÁC HÀM CÒN LẠI ---

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

async function main() {
  try {
    const response = await fetch(DATA_FILE);
    if (!response.ok) throw new Error('Không thể tải file FAQs.');
    allFaqs = await response.json();
    renderLayout();
  } catch (error) {
    console.error('Initialization Error:', error);
    if (chatContainer) {
      chatContainer.innerHTML = '<p>Lỗi: Không thể tải dữ liệu.</p>';
    }
  }
}

main();
