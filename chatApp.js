// chatApp.js (Phiên bản Cuối cùng: Đã sửa lỗi CI)

import { ChatHeader } from './components/ChatHeader.js';
import { InputBar } from './components/InputBar.js';
import { MessageList } from './components/MessageList.js';
import { SuggestionList } from './components/SuggestionList.js';
import { findTopFaqs } from './hooks/useFaqSearch.js';

// --- CONFIGURATION & STATE ---
// eslint-disable-next-line max-len
const GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG3r7RZrpBrpDRtZCVo'; // THAY KEY BẰNG KEY CỦA BẠN
const DATA_FILE = './assets/faqs.json';
let messages = []; // Sửa: Dùng let vì messages sẽ được gán lại
let allFaqs = [];
let isShowingSuggestions = true;

const chatContainer = document.getElementById('chat-container');
let displayArea = null;
let chatInput = null;

// Sửa lỗi ESLint (promise executor): Loại bỏ return không cần thiết và sử dụng cú pháp gọn
// eslint-disable-next-line arrow-body-style
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// --- LOGIC GỌI AI VÀ XỬ LÝ HỘI THOẠI (PHẢI Ở TRÊN CÁC HÀM GỌI) ---

/**
 * Hàm tìm kiếm câu trả lời trong Mock DB
 * @param {string} question
 * @returns {string|null}
 */
function findAnswer(question) {
  const userWords = question.toLowerCase().trim().split(/\s+/);
  if (userWords.length === 0) {
    return null;
  }
  let bestMatch = { faq: null, score: 0 };

  allFaqs.forEach((faq) => {
    let currentScore = 0;
    const questionText = faq.question.toLowerCase();
    const answerText = faq.answer.toLowerCase();

    userWords.forEach((word) => {
      if (word.length >= 4) { // Chỉ tính điểm cho từ khóa có 4 ký tự trở lên
        if (questionText.includes(word)) {
          currentScore += 2;
        } else if (answerText.includes(word)) {
          currentScore += 1;
        }
      }
    });

    if (currentScore > bestMatch.score) {
      bestMatch = { faq, score: currentScore }; // Sửa shorthand
    }
  });

  if (bestMatch.score > 5) {
    return bestMatch.faq.answer;
  }
  return null;
}

/**
 * Gọi API Gemini để lấy câu trả lời
 * @param {string} question
 * @returns {Promise<string>}
 */
async function getGeminiAnswer(question) {
  const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';
  // eslint-disable-next-line max-len
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
  const systemInstruction = 'Bạn là UniFAQ, một trợ lý AI thân thiện. Hãy trả lời câu hỏi bằng tiếng Việt ngắn gọn và chính xác.';

  const requestBody = {
    contents: [{ parts: [{ text: `${systemInstruction} Câu hỏi: ${question}` }] }],
    generationConfig: {
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
      const httpStatus = response.status;
      const errorMessage = errorData.error?.message || 'Không thể xử lý yêu cầu.';

      return `**Lỗi API (HTTP ${httpStatus})**: ${errorMessage}. Vui lòng kiểm tra API Key.`;
    }
    const data = await response.json();
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      const { reason } = data.promptFeedback;
      return `Rất tiếc, câu hỏi của bạn đã bị Gemini từ chối trả lời. Lý do: ${reason}`;
    }
    if (
      !data?.candidates?.[0]?.content?.parts?.[0] // Sử dụng optional chaining
    ) {
      return 'Rất tiếc, câu hỏi này bị AI từ chối trả lời hoặc phản hồi không đúng cấu trúc.';
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return 'Rất tiếc, đã có lỗi mạng hoặc kết nối không ổn định.';
  }
}

/**
 * Xử lý luồng hội thoại (Gửi tin nhắn, tìm kiếm, gọi AI)
 * @param {string} userText
 */
async function startConversation(userText) {
  const input = document.getElementById('chat-input');
  const submitBtn = document.getElementById('chat-submit');

  if (input) {
    input.disabled = true;
  }
  if (submitBtn) {
    submitBtn.disabled = true;
  }

  messages.push({ sender: 'user', text: userText });
  updateMessages();
  if (input) {
    input.value = '';
  }

  messages.push({ sender: 'bot', isTyping: true, text: '<span></span><span></span><span></span>' });
  updateMessages();

  let botReply = findAnswer(userText);

  if (!botReply) {
    await sleep(2000);
    botReply = await getGeminiAnswer(userText);
  }

  messages.pop(); // Xóa tin nhắn 'isTyping'
  messages.push({ sender: 'bot', text: botReply });
  updateMessages();

  if (input) {
    input.disabled = false;
    input.focus();
  }
  if (submitBtn) {
    submitBtn.disabled = false;
  }
}

// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

function handleSuggestionClick(event) {
  const target = event.target.closest('.suggestion-item');
  if (target) {
    const questionText = target.getAttribute('data-question');
    startConversation(questionText);
    isShowingSuggestions = false; // Đã sử dụng
  }
}

function handleChatInput() {
  render();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const userText = input.value.trim();
  if (userText) {
    isShowingSuggestions = false; // Đã sử dụng
    startConversation(userText);
  }
}

function attachSuggestionListeners() {
  const items = document.querySelectorAll('.suggestion-item');
  items.forEach((item) => {
    item.addEventListener('click', handleSuggestionClick);
  });
}

function setupEventListeners() {
  const chatForm = document.getElementById('chat-form');
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
        isShowingSuggestions = false; // Đã sử dụng
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
        isShowingSuggestions = false; // Đã sử dụng
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
      messages = []; // Gán lại mảng rỗng
      isShowingSuggestions = true; // Đã sử dụng
      if (chatInput) {
        chatInput.value = '';
      }
      render();
    };
    if (closeButton) {
      closeButton.addEventListener('click', closeChat);
    }
    if (minimizeButton) {
      minimizeButton.addEventListener('click', closeChat);
    }
  }
}

// --- HÀM RENDER ---

function updateMessages() {
  const messageListContainer = document.getElementById('display-area');
  if (!messageListContainer) {
    return;
  }
  messageListContainer.innerHTML = MessageList(messages);
  messageListContainer.scrollTop = messageListContainer.scrollHeight;
}

function render() {
  if (!displayArea) {
    return;
  }

  const keyword = chatInput ? chatInput.value.trim() : '';
  const shouldShowSuggestions = keyword.length > 0 || messages.length === 0;

  if (shouldShowSuggestions && isShowingSuggestions) { // Sử dụng isShowingSuggestions
    const suggestions = findTopFaqs(keyword, allFaqs);
    displayArea.innerHTML = SuggestionList(suggestions, keyword);
    attachSuggestionListeners();
  } else {
    displayArea.innerHTML = MessageList(messages);
    displayArea.scrollTop = displayArea.scrollHeight;
  }
}

function renderLayout() {
  if (!chatContainer) {
    return;
  }
  chatContainer.innerHTML = `${ChatHeader()}<div class="message-list" id="display-area"></div>${InputBar()}`;
  displayArea = document.getElementById('display-area');
  chatInput = document.getElementById('chat-input');

  messages = []; // Gán lại mảng rỗng
  render();
  setupEventListeners();
}
// --- ENTRY POINT ---
async function main() {
  try {
    const response = await fetch(DATA_FILE);
    if (!response.ok) {
      throw new Error('Không thể tải file FAQs.');
    }
    allFaqs = await response.json();
    renderLayout();
  } catch (error) {
    if (chatContainer) {
      chatContainer.innerHTML = '<p>Lỗi: Không thể tải dữ liệu.</p>';
    }
  }
}
document.addEventListener('DOMContentLoaded', main);
