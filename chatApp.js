// File: chatApp.js (Đã sửa lỗi đường dẫn)

// eslint-disable-next-line import/no-unresolved
import { ChatContainer } from './hooks/ChatContainer.js';
// eslint-disable-next-line import/no-unresolved
import { ChatPresenter } from './components/ChatPresenter.js';

/**
 * Entry Point (Điểm khởi đầu)
 */
document.addEventListener('DOMContentLoaded', () => {
  const presenter = new ChatPresenter();

  // Chỉ khởi tạo container nếu tìm thấy phần tử chat container
  if (presenter.chatContainer) {
    const container = new ChatContainer(presenter);
    container.init();
  } else {
    console.error('Lỗi: Không tìm thấy #chat-container. Không thể khởi tạo ứng dụng chat.');
  }
});
