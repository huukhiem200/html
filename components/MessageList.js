// components/MessageList.js
export function MessageList(messages) {
  if (!messages || messages.length === 0) {
    return `
      <div class="message-list" id="message-list">
        <div class="message message--bot">
          Xin chào! Bạn cần hỏi gì về các quy định của trường không?
        </div>
      </div>
    `;
  }

  const messagesHTML = messages.map(msg => `
    <div class="message message--${msg.sender}">
      ${msg.text}
    </div>
  `).join('');

  return `<div class="message-list" id="message-list">${messagesHTML}</div>`;
}