// File: chatApp.js

// eslint-disable-next-line import/no-unresolved
import { ChatService } from './services/ChatService.js';
// eslint-disable-next-line import/no-unresolved
import { ChatPresenter } from './components/ChatPresenter.js';
/**
 * Entry Point (Lớp UI)
 */
document.addEventListener('DOMContentLoaded', () => {
  const presenter = new ChatPresenter();
  // 🚨 Sửa lỗi 13:1 (Trailing spaces)
  if (presenter.chatContainer) { // <-- Đảm bảo không có khoảng trắng sau dòng này
    const service = new ChatService(presenter);
    service.init();
  } else {
    // 🚨 Sửa lỗi 18:19 (Quotes)
    console.error('Lỗi: Không tìm thấy #chat-container. Không thể khởi tạo ứng dụng chat.');
  } // <-- Lỗi 20:4 sẽ được sửa khi bạn thêm dòng trống
});
