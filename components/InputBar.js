export function MessageList(messages) {
  if (!messages || messages.length === 0) {
    // Trả về rỗng để SuggestionList xử lý
    return '';
  }
  // Sửa lỗi thụt lề từ 4 khoảng trắng sang 2
  return messages.map((msg) => `
    <div class="message message--${msg.sender}">
      ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </div>
  `).join('');
}