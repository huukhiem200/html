// components/SearchResults.js

/**
 * Render danh sách kết quả tìm kiếm (Top 3)
 */
export function SearchResults(faqs) {
  if (!faqs || faqs.length === 0) {
    // Sửa: Dùng single quote và 2 khoảng trắng
    return '<div class="search-results__initial">Vui lòng nhập từ khóa để tìm kiếm...</div>';
  }

  // Sửa: Thêm dấu ngoặc đơn quanh (faq) và dùng 2 khoảng trắng
  return faqs.map((faq) => `
    <details class="faq-item" data-question="${faq.question}">
      <summary class="faq-item__question">❓ ${faq.question}</summary>
      <div class="faq-item__answer"><p>✅ ${faq.answer}</p></div>
    </details>
  `).join('');
}