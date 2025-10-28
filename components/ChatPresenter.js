// File: components/ChatPresenter.js
import { ChatHeader } from './ChatHeader.js';
import { InputBar } from './InputBar.js';
import { MessageList } from './MessageList.js';
import { SuggestionList } from './SuggestionList.js';

/**
 * ChatPresenter (Lớp Giao diện - UI)
 * Chịu trách nhiệm CẬP NHẬT GIAO DIỆN và GẮN SỰ KIỆN.
 * Không chứa bất kỳ logic nghiệp vụ nào.
 */
export class ChatPresenter {
  constructor() {
    // 1. Query tất cả các phần tử DOM một lần
    this.chatContainer = document.getElementById('chat-container');
    this.toggleButton = document.getElementById('chat-toggle-button');
    this.headerSearchForm = document.getElementById('header-search-form');
    this.headerSearchInput = document.getElementById('header-search-input');
    this.suggestionChips = document.querySelectorAll('.suggestion-chip');

    // Các phần tử con (sẽ được tạo sau khi renderLayout)
    this.displayArea = null;
    this.chatInput = null;
    this.chatForm = null;
    this.submitBtn = null;
    this.closeButton = null;
    this.minimizeButton = null;
  }

  /**
   * 1. Tiêm HTML ban đầu vào widget
   */
  renderLayout() {
    if (!this.chatContainer) return;
    // Dùng các component đã import để xây dựng HTML
    this.chatContainer.innerHTML = `
      ${ChatHeader()}
      <div class="message-list" id="display-area"></div>
      ${InputBar()}
    `;

    // 2. Query các phần tử con sau khi đã render
    this.displayArea = document.getElementById('display-area');
    this.chatInput = document.getElementById('chat-input');
    this.chatForm = document.getElementById('chat-form');
    this.submitBtn = document.getElementById('chat-submit');
    this.closeButton = document.getElementById('chat-close-button');
    this.minimizeButton = document.getElementById('chat-minimize-button');
  }

  /**
   * 2. Gắn các hàm xử lý (handlers) từ Container vào các sự kiện DOM
   */
  bindEvents(handlers) {
    // Sự kiện nút bật/tắt chính
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', handlers.onToggleChat);
    }
    // Sự kiện tìm kiếm trên Header
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
    // Sự kiện các nút gợi ý trên trang chính
    this.suggestionChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const question = chip.getAttribute('data-question');
        if (question) {
          handlers.onPageSuggestion(question);
        }
      });
    });

    // --- Các sự kiện bên trong cửa sổ chat ---
    if (this.chatForm) {
      this.chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.chatInput.value.trim();
        if (text) {
          handlers.onSendMessage(text);
          this.chatInput.value = ''; // Xóa input sau khi gửi
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
    if (this.closeButton) {
      this.closeButton.addEventListener('click', handlers.onCloseChat);
    }
    if (this.minimizeButton) {
      // Dùng chung logic với nút close
      this.minimizeButton.addEventListener('click', handlers.onCloseChat);
    }
  }

  /**
   * 3. Các hàm cập nhật UI (được gọi bởi Container)
   */

  // Hiển thị danh sách tin nhắn
  displayMessages(messages) {
    if (!this.displayArea) return;
    this.displayArea.innerHTML = MessageList(messages);
    this.scrollToBottom();
  }

  // Hiển thị danh sách gợi ý
  displaySuggestions(suggestions, keyword) {
    if (!this.displayArea) return;
    this.displayArea.innerHTML = SuggestionList(suggestions, keyword);
    // Phải gắn lại listener cho các gợi ý MỚI
    this.attachSuggestionListeners();
  }

  // Bật/tắt trạng thái bận (loading)
  setUIBusy(isBusy) {
    if (this.chatInput) {
      this.chatInput.disabled = isBusy;
    }
    if (this.submitBtn) {
      this.submitBtn.disabled = isBusy;
    }
    if (isBusy && this.chatInput) {
      this.chatInput.focus();
    }
  }

  // Bật/tắt cửa sổ chat
  toggleChatWindow(isOpen) {
    if (this.chatContainer) {
      this.chatContainer.classList.toggle('is-open', isOpen);
    }
  }

  // Reset UI khi đóng chat
  resetChatUI() {
    if (this.chatInput) {
      this.chatInput.value = '';
    }
    this.displayArea.innerHTML = ''; // Xóa tin nhắn
  }

  // Tự cuộn xuống
  scrollToBottom() {
    if (this.displayArea) {
      this.displayArea.scrollTop = this.displayArea.scrollHeight;
    }
  }

  // Gắn listener cho các suggestion-item (phải gọi sau khi displaySuggestions)
  attachSuggestionListeners() {
    const items = this.displayArea.querySelectorAll('.suggestion-item');
    items.forEach((item) => {
      // Tránh gắn lặp lại
      if (!item.dataset.listenerAttached) {
        // eslint-disable-next-line no-param-reassign
        item.dataset.listenerAttached = 'true';
        item.addEventListener('click', (e) => {
          const question = e.currentTarget.getAttribute('data-question');
          if (question) {
            // Lấy handler từ DOM (hơi hack một chút nhưng hiệu quả)
            this.chatForm.dispatchEvent(new CustomEvent('suggestionClicked', { detail: question }));
          }
        });
      }
    });
  }
}
