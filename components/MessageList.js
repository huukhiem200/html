export function MessageList(messages) {
  if (!messages || messages.length === 0) {
    // Trả về rỗng để SuggestionList xử lý
    return '';
  }
  // Thêm dấu ngoặc đơn quanh 'msg' để tuân thủ quy tắc ESLint về arrow function
  return messages.map((msg) => `
    <div class="message message--${msg.sender}">
      ${msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
    </div>
  `).join('');
}
// Đảm bảo có một dòng trống cuối file
// Sửa: Thêm dòng trống cuối file