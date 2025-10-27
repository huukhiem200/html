// chatApp.js (Phiên bản Hoàn Chỉnh: Đã sửa lỗi CI)

import { ChatHeader } from './components/ChatHeader.js';
import { InputBar } from './components/InputBar.js';
import { MessageList } from './components/MessageList.js';
import { SuggestionList } from './components/SuggestionList.js';
import { findTopFaqs } from './hooks/useFaqSearch.js';

// --- CONFIGURATION & STATE ---
const GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG3r7RZrpBrpDRtZCVo'; // KEY MỚI CỦA BẠN
const DATA_FILE = './assets/faqs.json';
let messages = [];
let allFaqs = [];
let isShowingSuggestions = true;

const chatContainer = document.getElementById('chat-container');
let displayArea = null;
let chatInput = null;

// Sửa lỗi ESLint (promise executor): Thêm dấu ngoặc đơn quanh 'resolve'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- CÁC HÀM CƠ SỞ (Được đẩy lên để giải quyết lỗi "used before defined") ---

function handleSuggestionClick(event) {
  const target = event.target.closest('.suggestion-item');
  if (target) {
    const questionText = target.getAttribute('data-question');
    startConversation(questionText);
    isShowingSuggestions = false;
  }
}

function attachSuggestionListeners() {
  const items = document.querySelectorAll('.suggestion-item');
  items.forEach((item) => {
    item.addEventListener('click', handleSuggestionClick);
  });
}

// --- LOGIC CỐT LÕI ---

// Hàm render chính
function render() {
  if (!displayArea) {
    return;
  }

  const keyword = chatInput ? chatInput.value.trim() : '';
  const isTyping = messages.some((msg) => msg.isTyping);

  // Sửa lỗi ESLint (unused var): Sử dụng 'isShowingSuggestions'
  if ((keyword.length > 0 && !isTyping) || (messages.length === 0 && isShowingSuggestions)) {
    const suggestions = findTopFaqs(keyword, allFaqs);
    displayArea.innerHTML = SuggestionList(suggestions, keyword);
    attachSuggestionListeners();
  } else {
    displayArea.innerHTML = MessageList(messages);
    displayArea.scrollTop = displayArea.scrollHeight;
  }
}

// Khi người dùng gõ, quay lại chế độ gợi ý
function handleChatInput() {
  // Sửa lỗi ESLint (unused var): Đặt lại isShowingSuggestions khi gõ
  isShowingSuggestions = true;
  render();
}

// Khi nhấn Enter hoặc nút Gửi
async function handleFormSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const userText = input.value.trim();
  if (userText) {
    isShowingSuggestions = false;
    await startConversation(userText);
  }
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
        isShowingSuggestions = false;
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
        isShowingSuggestions = false;
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
      isShowingSuggestions = true;
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

function renderLayout() {
  if (!chatContainer) {
    return;
  }
  chatContainer.innerHTML = `${ChatHeader()}<div class="message-list" id="display-area"></div>${InputBar()}`;
  displayArea = document.getElementById('display-area');
  chatInput = document.getElementById('chat-input');
  messages = [];
  render();
  setupEventListeners();
}

function updateMessages() {
  const messageListContainer = document.getElementById('display-area');
  if (!messageListContainer) {
    return;
  }
  messageListContainer.innerHTML = MessageList(messages);
  messageListContainer.scrollTop = messageListContainer.scrollHeight;
}

// --- LOGIC GỌI AI VÀ XỬ LÝ HỘI THOẠI ---

async function getGeminiAnswer(question) {
  const MODEL_NAME = 'gemini-2.5-flash';
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
      return `**Lỗi API (HTTP ${httpStatus})**: ${errorMessage}.`;
    }

    const data = await response.json();
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      const { reason } = data.promptFeedback;
      return `Rất tiếc, câu hỏi của bạn đã bị Gemini từ chối trả lời. Lý do: ${reason}`;
    }
    if (!data?.candidates?.[0]?.content?.parts?.[0]) {
      return 'Rất tiếc, AI không thể đưa ra phản hồi hợp lệ.';
    }
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return 'Rất tiếc, đã có lỗi mạng hoặc kết nối không ổn định.';
  }
}

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
    await sleep(1000);
    botReply = await getGeminiAnswer(userText);
  }

  messages.pop();
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

// --- CÁC HÀM CÒN LẠI ---

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
      if (word.length >= 4) {
        if (questionText.includes(word)) {
          currentScore += 2;
        } else if (answerText.includes(word)) {
          currentScore += 1;
        }
      }
    });

    // Sửa lỗi ESLint (property shorthand): { faq: faq } -> { faq }
    if (currentScore > bestMatch.score) {
      bestMatch = { faq, score: currentScore };
    }
  });

  if (bestMatch.score > 5) {
    return bestMatch.faq.answer;
  }
  return null;
}

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

main();
//