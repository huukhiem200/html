// File: MessageList.js

export function MessageList(messages) {
  if (!messages || messages.length === 0) {
    return '';
  }
  // Thêm dấu ngoặc đơn quanh (msg) và sử dụng tag template string
  return messages.map((msg) => `
    <div class="message message--${msg.sender}">
      ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </div>
  `).join('');
}
