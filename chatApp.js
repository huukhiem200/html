// chatApp.js (Phiên bản Hoàn Chỉnh: Search-to-Chat + Bong bóng nổi)

import { ChatHeader } from './components/ChatHeader.js';
import { InputBar } from './components/InputBar.js';
import { MessageList } from './components/MessageList.js';
import { SuggestionList } from './components/SuggestionList.js';
import { findTopFaqs } from './hooks/useFaqSearch.js';

const DATA_FILE = './assets/faqs.json';
let messages = [];
let allFaqs = [];
let isShowingSuggestions = true;

const chatContainer = document.getElementById('chat-container');
let displayArea = null; 
let chatInput = null;

// Hàm render chính, quyết định hiển thị Gợi ý hay Cuộc hội thoại
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

// Khi người dùng gõ, luôn hiển thị gợi ý
function handleChatInput() {
    if (!isShowingSuggestions) {
        messages = []; // Xóa lịch sử chat cũ khi người dùng bắt đầu gõ lại
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
    if (!chatInput) return;
    const userText = chatInput.value.trim();
    if (userText) {
        startConversation(userText);
    }
}

// Hàm xử lý chung cho việc bắt đầu cuộc hội thoại
function startConversation(userText) {
    const botReply = findAnswer(userText) || "Xin lỗi, tôi chưa có thông tin về câu hỏi này. Bạn có thể thử một từ khóa khác.";
    messages.push({ sender: 'user', text: userText });
    messages.push({ sender: 'bot', text: botReply });
    isShowingSuggestions = false;
    if (chatInput) chatInput.value = '';
    render();
}

function setupEventListeners() {
    const chatForm = document.getElementById('chat-form');
    chatInput = document.getElementById('chat-input');
    const toggleButton = document.getElementById('chat-toggle-button');
    const closeButton = document.getElementById('chat-close-button');
    const minimizeButton = document.getElementById('chat-minimize-button');
    const headerSearchForm = document.getElementById('header-search-form');

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
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.getAttribute('data-question');
            if (question && chatContainer) {
                chatContainer.classList.add('is-open'); // Mở cửa sổ chat
                startConversation(question); // Bắt đầu hội thoại
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
}

function findAnswer(question) {
    const scoredFaqs = findTopFaqs(question, allFaqs);
    return scoredFaqs.length > 0 ? scoredFaqs[0].answer : null;
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

        if (chatContainer) {
            chatContainer.innerHTML = `${ChatHeader()}<div class="message-list" id="display-area"></div>${InputBar()}`;
            displayArea = document.getElementById('display-area');
            render();
            setupEventListeners();
        }
    } catch (error) {
        console.error("Initialization Error:", error);
        if (chatContainer) chatContainer.innerHTML = `<p>Lỗi: Không thể tải dữ liệu.</p>`;
    }
}

main();