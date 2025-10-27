export function SuggestionList(suggestions, keyword) {
  if (!keyword) {
    return `<div class="search-results__initial">Nhập từ khóa để xem các câu hỏi gợi ý...</div>`;
  }
  if (suggestions.length === 0) {
    return `<div class="search-results__initial">Không tìm thấy gợi ý nào.</div>`;
  }
  // Tạo regex để làm nổi bật từ khóa
  // eslint-disable-next-line max-len
  const keywordRegex = new RegExp(`(${keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  return `
    <div class="suggestion-list">
      ${suggestions.map((faq) => `
        <div class="suggestion-item" data-question="${faq.question}">
          ${faq.question.replace(keywordRegex, '<mark>$1</mark>')}
        </div>
      `).join('')}
    </div>
  `;
}