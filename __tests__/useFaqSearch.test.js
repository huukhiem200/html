import { findTopFaqs } from '../useFaqSearch.js'; // Đường dẫn tương đối từ __tests__

// Mock dữ liệu FAQ
const mockFaqs = [
  { id: 1, question: 'Lịch thi cuối kỳ là khi nào?', answer: 'Thứ Năm, ngày 20/12/2025.' },
  { id: 2, question: 'Tôi cần bao nhiêu tín chỉ để tốt nghiệp?', answer: 'Sinh viên cần 130 tín chỉ.' },
  { id: 3, question: 'Làm lại thẻ sinh viên bị mất ở đâu?', answer: 'Phòng Công tác Sinh viên.' },
  { id: 4, question: 'Lịch học chính trị?', answer: 'Ngày 10/11/2025.' },
  { id: 5, question: 'Tôi muốn làm lại thẻ.', answer: 'Liên hệ Phòng Công tác Sinh viên để làm lại.' },
];

describe('findTopFaqs', () => {
  test('Should return top FAQs matching the keyword (prioritizing question matches)', () => {
    const keyword = 'làm lại thẻ';
    const results = findTopFaqs(keyword, mockFaqs);

    // Expecting 2 results (ID 3 and ID 5)
    expect(results).toHaveLength(2);
    
    // Check sorting and scores
    // ID 3: 'Làm lại thẻ sinh viên' (4 points)
    // ID 5: 'Tôi muốn làm lại thẻ' (4 points)
    expect(results.some(r => r.id === 3)).toBe(true);
    expect(results.some(r => r.id === 5)).toBe(true);
    
    // Check score of the first item (ID 3: 'làm lại thẻ')
    expect(results[0].score).toBe(4); 
  });

  test('Should return empty array if no keyword or data is provided', () => {
    expect(findTopFaqs(null, mockFaqs)).toHaveLength(0);
    expect(findTopFaqs('test', null)).toHaveLength(0);
    expect(findTopFaqs('', mockFaqs)).toHaveLength(0);
  });

  test('Should sort by score in descending order', () => {
    const keyword = 'tín chỉ'; // Matches ID 2
    const results = findTopFaqs(keyword, mockFaqs);

    expect(results).toHaveLength(1);
    expect(results[0].question).toContain('tốt nghiệp');
    // Score calculation: 'tín' (2) + 'chỉ' (2) = 4 points.
    expect(results[0].score).toBe(4); 
  });
});
