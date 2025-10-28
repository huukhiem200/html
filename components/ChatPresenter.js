// File: components/ChatPresenter.js

import { ChatHeader } from './ChatHeader.js';
import { InputBar } from './InputBar.js';
import { MessageList } from './MessageList.js';
import { SuggestionList } from './SuggestionList.js';

export class ChatPresenter {
  constructor() {
    this.chatContainer = document.getElementById('chat-container');
    this.toggleButton = document.getElementById('chat-toggle-button'); 
    this.headerSearchForm = document.getElementById('header-search-form');
    this.headerSearchInput = document.getElementById('header-search-input');
    this.suggestionChips = document.querySelectorAll('.suggestion-chip');
    
    this.displayArea = null;
    this.chatInput = null;
    this.chatForm = null;
    this.submitBtn = null;
    this.closeButton = null;
    this.minimizeButton = null;
  }

  /**
   * 1. Tiêm HTML ban đầu và Query các phần tử con
   */
  renderLayout() {
    if (!this.chatContainer) return;
    try {
        // Render nội dung HTML từ các component
        this.chatContainer.innerHTML = `
          ${ChatHeader()}
          <div class="message-list" id="display-area"></div>
          ${InputBar()}
        `; 
    } catch (e) {
        console.error("LỖI CÚ PHÁP COMPONENT KHI RENDER HTML (FATAL):", e);
        return; 
    }

    // 🚨 QUAN TRỌNG: Query các phần tử con sau khi chúng được tạo
    this.displayArea = document.getElementById('display-area');
    this.chatInput = document.getElementById('chat-input');
    this.chatForm = document.getElementById('chat-form');
    this.submitBtn = document.getElementById('chat-submit');
    this.closeButton = document.getElementById('chat-close-button');
    this.minimizeButton = document.getElementById('chat-minimize-button');
    
    if (!this.toggleButton) {
        console.error("LỖI KHỞI TẠO: Không tìm thấy #chat-toggle-button.");
    }
  }

  /**
   * 2. Gắn các hàm xử lý (handlers)
   */
  bindEvents(handlers) {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', handlers.onToggleChat);
      console.log("✅ Sự kiện bật/tắt chính đã được gắn.");
    }
    
    if (this.closeButton) {
      this.closeButton.addEventListener('click', handlers.onCloseChat);
    }
    if (this.minimizeButton) {
      this.minimizeButton.addEventListener('click', handlers.onCloseChat);
    }
    
    if (this.headerSearchForm) {
      this.headerSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.headerSearchInput.value.trim();
        if (text) {
          handlers.onHeaderSearch(text);
          this.headerSearchInput.value = '';
        }
      });
    }

    this.suggestionChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        if (question) {
          handlers.onPageSuggestion(question);
        }
      });
    });

    if (this.chatForm) {
      this.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.chatInput.value.trim();
        if (text) {
          handlers.onSendMessage(text);
          this.chatInput.value = '';
        }
      });
    }
    
    if (this.chatInput) {
      this.chatInput.addEventListener('input', () => {
        handlers.onChatInput(this.chatInput.value);
      });
      this.chatInput.addEventListener('focus', () => {
        handlers.onChatInput(this.chatInput.value);
      });
    }
  }

  /**
   * 🚨 HÀM BỊ LỖI (Đã sửa)
   */
  displaySuggestions(suggestions, keyword) {
    if (!this.displayArea) return;
    this.displayArea.innerHTML = SuggestionList(suggestions, keyword);
    this.attachSuggestionListeners();
  } 

  displayMessages(messages) {
    if (!this.displayArea) return;
    this.displayArea.innerHTML = MessageList(messages);
    this.scrollToBottom();
  } 
  setUIBusy(isBusy) {
    // Kiểm tra xem các phần tử input có tồn tại không
    if (this.chatInput) {
      this.chatInput.disabled = isBusy;
    }
    if (this.submitBtn) {
      this.submitBtn.disabled = isBusy;
      // Có thể thêm icon loading ở đây nếu bạn muốn
      // this.submitBtn.innerHTML = isBusy ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fa-solid fa-paper-plane"></i>';
    }
    if (isBusy && this.chatInput) {
      this.chatInput.focus();
    }
  }

  toggleChatWindow(isOpen) {
    if (this.chatContainer) {
      this.chatContainer.classList.toggle('is-open', isOpen);
    }
  }
  
  //--- HÀM UTILITY ---
  
  resetChatUI() {
    if (this.chatInput) {
      this.chatInput.value = '';
    }
    if (this.displayArea) {
      this.displayArea.innerHTML = '';
    }
  }
  
  scrollToBottom() {
    if (this.displayArea) {
      this.displayArea.scrollTop = this.displayArea.scrollHeight;
    }
  }
  
  attachSuggestionListeners() {
    const items = this.displayArea.querySelectorAll('.suggestion-item');
    items.forEach((item) => {
      const currentItem = item;
      if (!currentItem.dataset.listenerAttached) {
        // eslint-disable-next-line no-param-reassign
        currentItem.dataset.listenerAttached = 'true';
        item.addEventListener('click', (e) => {
          const question = e.currentTarget.getAttribute('data-question');
          if (question) {
            this.chatForm.dispatchEvent(new CustomEvent('suggestionClicked', { detail: question }));
          }
        });
      }
    });
  }
}