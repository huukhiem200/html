export function InputBar() {
  return `
    <form class="input-bar" id="chat-form">
      <input type="text" id="chat-input" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
      <button type="submit" id="chat-submit"><i class="fa-solid fa-paper-plane"></i></button>
    </form>
  `;
}
// Đã thêm newline ở cuối file