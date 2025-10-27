export function ChatHeader() {
  return `
    <div class="chat-header">
      UniFAQ AI Assistant
      <button id="chat-minimize-button" class="chat-header__btn" aria-label="Thu nhỏ cửa sổ chat">—</button>
      <button id="chat-close-button" class="chat-header__btn" aria-label="Đóng cửa sổ chat">&times;</button>
    </div>
  `;
}
