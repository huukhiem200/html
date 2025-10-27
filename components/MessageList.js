export function MessageList(messages) {
  if (!messages || messages.length === 0) {
    // Trả về rỗng để SuggestionList xử lý
    return '';
  }
  // Sửa: Thêm dấu ngoặc đơn quanh (msg)
  return messages.map((msg) => `
    <div class="message message--${msg.sender}">
      ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </div>
  `).join('');
}
