// File: SuggestionList.js

export function SuggestionList(suggestions, keyword) {
  if (!keyword) {
    // Sửa: Dùng single quote nhất quán
    return '<div class="search-results__initial">Nhập từ khóa để xem các câu hỏi gợi ý...</div>';
  }
  if (suggestions.length === 0) {
    // Sửa: Dùng single quote nhất quán
    return '<div class="search-results__initial">Không tìm thấy gợi ý nào.</div>';
  }

  // Tạo regex để làm nổi bật từ khóa (Đã sửa lỗi escape)
  // eslint-disable-next-line max-len
  const escapedKeyword = keyword.replace(/[-/^$*+?.()|[\]{}]/g, '\\$&');
  const keywordRegex = new RegExp(`(${escapedKeyword})`, 'gi');

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
