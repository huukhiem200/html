import { findTopFaqs } from '../hooks/useFaqSearch';

const mockFaqs = [
  { question: 'Lịch thi cuối kỳ học phần A là khi nào?', answer: 'Thứ Năm' },
  { question: 'Tôi cần bao nhiêu tín chỉ để tốt nghiệp?', answer: '130 tín chỉ' },
  { question: 'Quy trình xin nghỉ học tạm thời (bảo lưu) như thế nào?', answer: 'Nộp đơn' },
  { question: 'Học phí bao nhiêu tiền?', answer: '400.000 VNĐ' },
  { question: 'Làm lại thẻ sinh viên bị mất ở đâu?', answer: 'Phòng Công tác Sinh viên' },
];

describe('findTopFaqs', () => {
  test('should return top 3 relevant FAQs based on keyword match', () => {
    const keyword = 'tín chỉ';
    const results = findTopFaqs(keyword, mockFaqs);

    // Kết quả phải có 1 mục chính xác liên quan đến 'tín chỉ'
    expect(results).toHaveLength(1);
    expect(results[0].question).toBe('Tôi cần bao nhiêu tín chỉ để tốt nghiệp?');
  });

  test('should return empty array if no keyword matches', () => {
    const keyword = 'bóng rổ';
    const results = findTopFaqs(keyword, mockFaqs);

    expect(results).toHaveLength(0);
  });

  test('should prioritize matches in question over answer', () => {
    // 'tiền' khớp trong cả câu 4 (Học phí bao nhiêu tiền?) và câu 5 (Tiền lệ phí)
    const keyword = 'bao nhiêu';
    const results = findTopFaqs(keyword, mockFaqs);

    // Câu 4 chứa cả 2 từ khóa 'bao nhiêu' -> điểm cao hơn
    expect(results[0].question).toBe('Học phí bao nhiêu tiền?');
  });

  test('should return empty array if keyword is too short (less than 2 chars)', () => {
    const keyword = 'là';
    const results = findTopFaqs(keyword, mockFaqs);

    expect(results).toHaveLength(0);
  });
});

// Đã thêm newline