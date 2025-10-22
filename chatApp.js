// chatApp.js (Phiên bản Hoàn Chỉnh: Đã kích hoạt Gemini)

import { ChatHeader } from './components/ChatHeader.js';
import { InputBar } from './components/InputBar.js';
import { MessageList } from './components/MessageList.js';
import { SuggestionList } from './components/SuggestionList.js';
import { findTopFaqs } from './hooks/useFaqSearch.js';

// --- CONFIGURATION & STATE ---
const GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG63r7RZrpBrpDRtZCVo'; // KEY MỚI CỦA BẠN
const DATA_FILE = './assets/faqs.json';
let messages = [];
let allFaqs = [];
let isShowingSuggestions = true;

const chatContainer = document.getElementById('chat-container');
let displayArea = null; 
let chatInput = null;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm render chính
function render() {
    if (!displayArea) return;
    if (isShowingSuggestions) {
        const keyword = chatInput ? chatInput.value : '';
        const suggestions = findTopFaqs(keyword, allFaqs);
        displayArea.innerHTML = SuggestionList(suggestions, keyword);
        attachSuggestionListeners();
    } else {
        displayArea.innerHTML = MessageList(messages);
        displayArea.scrollTop = displayArea.scrollHeight;
    }
}
function renderLayout() {
    if (!chatContainer) return;
    chatContainer.innerHTML = `${ChatHeader()}<div class="message-list" id="display-area"></div>${InputBar()}`;
    updateMessages();
    setupEventListeners();
}
function updateMessages() {
    const messageListContainer = document.getElementById('display-area');
    if (!messageListContainer) return;
    messageListContainer.innerHTML = MessageList(messages);
    messageListContainer.scrollTop = messageListContainer.scrollHeight;
}


// Khi người dùng gõ, quay lại chế độ gợi ý
function handleChatInput() {
    if (!isShowingSuggestions) {
        messages = [];
        isShowingSuggestions = true;
    }
    render();
}

// Khi click vào một gợi ý
function handleSuggestionClick(event) {
    let target = event.target.closest('.suggestion-item');
    if (target) {
        const questionText = target.getAttribute('data-question');
        startConversation(questionText);
    }
}

// Khi nhấn Enter hoặc nút Gửi
function handleFormSubmit(event) {
    event.preventDefault(); 
    const input = document.getElementById('chat-input');
    const userText = input.value.trim();
    if (userText) {
        startConversation(userText);
    }
}

// --- LOGIC GỌI AI VÀ XỬ LÝ HỘI THOẠI ---

async function getGeminiAnswer(question) {
    const MODEL_NAME = 'gemini-2.5-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    const systemInstruction = "Bạn là UniFAQ, một trợ lý AI thân thiện. Hãy trả lời câu hỏi bằng tiếng Việt ngắn gọn.";
    const requestBody = {
        contents: [{ parts: [{ text: systemInstruction + " Câu hỏi: " + question }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
    };
    try {
        const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            return `Lỗi kết nối AI: ${errorData.error.message || 'Không thể xử lý yêu cầu.'}`;
        }
        const data = await response.json();
        if (!data.candidates || data.candidates.length === 0) {
            return "Rất tiếc, câu hỏi này bị AI từ chối trả lời.";
        }
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "Rất tiếc, đã có lỗi mạng hoặc kết nối không ổn định.";
    }
}

async function startConversation(userText) {
    const input = document.getElementById('chat-input');
    const submitBtn = document.getElementById('chat-submit');
    
    if(input) input.disabled = true;
    if(submitBtn) submitBtn.disabled = true;

    messages.push({ sender: 'user', text: userText });
    updateMessages();
    if(input) input.value = '';

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

    if(input) {
        input.disabled = false;
        input.focus();
    }
    if(submitBtn) submitBtn.disabled = false;
}

// --- CÁC HÀM CÒN LẠI ---

function setupEventListeners() {
    const chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
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
                startConversation(userText);
                headerInput.value = '';
            }
        });
    }
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.getAttribute('data-question');
            if (question && chatContainer) {
                chatContainer.classList.add('is-open');
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
            if (chatInput) chatInput.value = '';
            render();
        };
        if(closeButton) closeButton.addEventListener('click', closeChat);
        if(minimizeButton) minimizeButton.addEventListener('click', closeChat);
    }
    if (chatForm) {
        chatForm.addEventListener('submit', handleFormSubmit);
    }
}

function findAnswer(question) {
    const userWords = question.toLowerCase().trim().split(/\s+/);
    if (userWords.length === 0) return null;
    let bestMatch = { faq: null, score: 0 };

    allFaqs.forEach(faq => {
        let currentScore = 0;
        const questionText = faq.question.toLowerCase();
        const answerText = faq.answer.toLowerCase();

        userWords.forEach(word => {
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
            bestMatch = { faq: faq, score: currentScore };
        }
    });

    // Nâng ngưỡng điểm lên 4 để tăng độ chính xác
    if (bestMatch.score > 4) {
        return bestMatch.faq.answer;
    }
    
    // Trả về null nếu không đạt ngưỡng, để Gemini xử lý
    return null;
}

function attachSuggestionListeners() {
    const items = document.querySelectorAll('.suggestion-item');
    items.forEach(item => {
        item.addEventListener('click', handleSuggestionClick);
    });
}

async function main() {
    try {
        const response = await fetch(DATA_FILE);
        if (!response.ok) throw new Error('Không thể tải file FAQs.');
        allFaqs = await response.json();
        renderLayout();
    } catch (error) {
        console.error("Initialization Error:", error);
        if (chatContainer) {
            chatContainer.innerHTML = `<p>Lỗi: Không thể tải dữ liệu.</p>`;
        }
    }
}

main();