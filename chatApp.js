// chatApp.js (Phiên bản Hoàn Chỉnh - LOCAL ONLY)

import { ChatHeader } from './components/ChatHeader.js';
import { MessageList } from './components/MessageList.js';
import { InputBar } from './components/InputBar.js';

const DATA_FILE = 'faqs.json';
let messages = [];
let allFaqs = [];

const chatContainer = document.getElementById('chat-container');
const getSearchInput = () => document.getElementById('header-search-input');
const getQuickSearchArea = () => document.getElementById('data-display-area');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function renderState(state, message, displayArea) {
    if (!displayArea) return;
    let icon = '', title = '';
    if (state === 'empty') {
        icon = '🤷'; title = 'Không tìm thấy kết quả nào.';
    } else { return; }
    displayArea.innerHTML = `<div class="state-message state-message--${state}"><div class="state-message__icon">${icon}</div><h3 class="state-message__title">${title}</h3><p class="state-message__details">${message}</p></div>`;
}

function renderFaqs(faqs, displayArea) {
    if (!displayArea) return;
    if (!faqs || faqs.length === 0) {
        renderState('empty', 'Không có câu hỏi nào khớp với từ khóa của bạn.', displayArea);
        return;
    }
    displayArea.innerHTML = faqs.map(faq => `<details class="faq-item"><summary class="faq-item__question">❓ ${faq.question}</summary><div class="faq-item__answer"><p>✅ ${faq.answer}</p></div></details>`).join('');
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
            if (word.length >= 3) {
                if (questionText.includes(word)) currentScore++;
                if (answerText.includes(word)) currentScore++;
            }
        });
        if (currentScore > bestMatch.score) { bestMatch = { faq: faq, score: currentScore }; }
    });
    if (bestMatch.score > 2) { return bestMatch.faq.answer; }
    return null;
}

function filterFaqs() {
    const searchInput = getSearchInput();
    const displayArea = getQuickSearchArea();
    const faqListSection = document.getElementById('faq-list');
    if (!searchInput || !displayArea || !faqListSection) return;
    
    const keyword = searchInput.value.toLowerCase().trim();
    if (!keyword) {
        faqListSection.classList.remove('search-active');
        return;
    }
    
    faqListSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    faqListSection.classList.add('search-active');

    const filteredFaqs = allFaqs.filter(faq => 
        faq.question.toLowerCase().includes(keyword) || 
        faq.answer.toLowerCase().includes(keyword)
    );
    renderFaqs(filteredFaqs, displayArea);
}

function renderApp() {
    if (!chatContainer) return;
    chatContainer.innerHTML = `${ChatHeader()}${MessageList(messages)}${InputBar()}`;
    setupEventListeners();
}

function updateMessages() {
    const messageListContainer = document.getElementById('message-list');
    if (!messageListContainer) return;

    // Cập nhật class 'typing' cho tin nhắn placeholder
    const messagesHTML = messages.map(msg => `
        <div class="message message--${msg.sender} ${msg.isTyping ? 'typing' : ''}">
            ${msg.text}
        </div>
    `).join('');
    
    messageListContainer.innerHTML = messagesHTML;
    messageListContainer.scrollTop = messageListContainer.scrollHeight;
}

async function handleSendMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-input');
    const submitBtn = document.getElementById('chat-submit');
    const userText = input.value.trim();

    if (userText) {
        input.disabled = true;
        submitBtn.disabled = true;
        messages.push({ sender: 'user', text: userText });
        updateMessages();
        input.value = '';

        messages.push({ sender: 'bot', text: '<span></span><span></span><span></span>', isTyping: true });
        updateMessages();
        
        let botReply = findAnswer(userText);
        
        if (!botReply) {
            botReply = "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi có trong dữ liệu FAQ của trường.";
        }

        await sleep(1000);

        messages.pop();
        messages.push({ sender: 'bot', text: botReply });
        updateMessages();
        input.disabled = false;
        submitBtn.disabled = false;
        input.focus();
    }
}

function setupEventListeners() {
    const chatForm = document.getElementById('chat-form');
    const searchInput = getSearchInput();
    const logoLink = document.getElementById('logo-link');
    
    if (chatForm) { chatForm.addEventListener('submit', handleSendMessage); }
    if (searchInput) {
        searchInput.addEventListener('input', filterFaqs);
        searchInput.addEventListener('blur', () => {
            if (searchInput.value.trim() === '') { filterFaqs(); }
        });
    }
    if (logoLink) {
        logoLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            window.location.reload(); 
        });
    }
}

async function main() {
    try {
        const response = await fetch(DATA_FILE);
        if (!response.ok) throw new Error('Failed to load FAQs.');
        allFaqs = await response.json();
        renderApp();
    } catch (error) {
        console.error("Initialization Error:", error);
        if(chatContainer) { chatContainer.innerHTML = "<p>Lỗi: Không thể tải dữ liệu FAQ.</p>"; }
    }
}

main();