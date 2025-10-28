// File: chatApp.js (Đã refactor)

// (Đảm bảo đường dẫn import chính xác tới nơi bạn lưu 2 file mới)
// eslint-disable-next-line import/no-unresolved
import { ChatContainer } from './containers/ChatContainer.js';
import { ChatPresenter } from './components/ChatPresenter.js';

/**
 * Entry Point (Điểm khởi đầu)
 * Chỉ chịu trách nhiệm khởi tạo 2 lớp và kết nối chúng.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Tạo Presenter (UI) trước
  const presenter = new ChatPresenter();

  // 2. Tạo Container (Logic) và tiêm Presenter vào
  const container = new ChatContainer(presenter);

  // 3. Khởi động ứng dụng
  container.init();
});
