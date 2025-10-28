// File: chatApp.js

// eslint-disable-next-line import/no-unresolved
import { ChatService } from './services/ChatService.js'; // 🚨 SỬ DỤNG CHATSERVICE
// eslint-disable-next-line import/no-unresolved
import { ChatPresenter } from './components/ChatPresenter.js';

/**
 * Entry Point (Lớp UI)
 */
document.addEventListener('DOMContentLoaded', () => {
  const presenter = new ChatPresenter();
  
  if (presenter.chatContainer) {
    const service = new ChatService(presenter); // 🚨 KHỞI TẠO SERVICE
    service.init();
  } else {
    console.error("Lỗi: Không tìm thấy #chat-container. Không thể khởi tạo ứng dụng chat.");
  }
});