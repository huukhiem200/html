// tests.test.js

// Import module app để có thể truy cập và thay đổi các biến module
const app = require('./app'); 

// Import trực tiếp các hàm từ app để gọi chúng
const { 
    renderState, 
    renderFaqs, 
    fetchDataAndRender,
    filterFaqs
} = app; 


// --- KHU VỰC THIẾT LẬP (SETUP) ---

// 1. Giả lập DOM: Tạo mock elements cần thiết
const mockDisplayArea = document.createElement('div');
mockDisplayArea.id = 'data-display-area';
document.body.appendChild(mockDisplayArea); 

const mockSearchInput = document.createElement('input');
mockSearchInput.id = 'header-search-input';
mockSearchInput.value = ''; 
document.body.appendChild(mockSearchInput); 

// Giả lập dữ liệu thành công
const mockSuccessData = [
    { id: 1, question: "Lịch thi cuối kỳ", answer: "Ngày 20/12/2025." },
    { id: 2, question: "Quy chế bảo lưu", answer: "Nộp đơn tại Văn phòng Khoa." }
];

// 2. Mocking Global Fetch API 
global.fetch = jest.fn((url) => {
    if (url.includes('faqs.json')) {
        if (global.mockFetchState === 'SUCCESS') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockSuccessData),
            });
        }
        if (global.mockFetchState === 'EMPTY') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            });
        }
        if (global.mockFetchState === 'ERROR_404') {
            return Promise.resolve({
                ok: false,
                status: 404,
                json: () => Promise.resolve({}),
            });
        }
    }
    return Promise.reject(new Error('unhandled fetch'));
});

// 3. SpyOn/Mocking các hàm getter để chúng luôn trả về mock objects
jest.spyOn(app, 'getDisplayArea').mockReturnValue(mockDisplayArea);
jest.spyOn(app, 'getSearchInput').mockReturnValue(mockSearchInput);


// --- KHỐI TEST JEST ---

describe('UniFAQ Core Functionality Tests', () => {

    beforeEach(() => {
        // Gán mock elements vào các biến module để các hàm test trực tiếp sử dụng
        app.displayArea = mockDisplayArea;
        app.searchInput = mockSearchInput;
        
        // GÁN DỮ LIỆU GỐC TRỰC TIẾP VÀO MODULE DÙ CHỈ CHO TEST 4 & 5 (FIX LOGIC)
        app.allFaqsData = mockSuccessData;

        // Reset nội dung và giá trị
        mockDisplayArea.innerHTML = '';
        mockSearchInput.value = ''; 
        
        fetch.mockClear(); 
        global.mockFetchState = 'SUCCESS'; 
    });

    // TEST 1: Kiểm tra Render Dữ liệu thành công
    test('1. Should render data items correctly using renderFaqs', () => {
        renderFaqs(mockSuccessData, mockDisplayArea); 
        
        expect(mockDisplayArea.innerHTML).toContain('Lịch thi cuối kỳ');
        expect(mockDisplayArea.innerHTML).toContain('Nộp đơn tại Văn phòng Khoa');
        expect(mockDisplayArea.querySelectorAll('.faq-item').length).toBe(mockSuccessData.length);
    });

    // TEST 2: Kiểm tra Trạng thái Lỗi
    test('2. Should display the Error State correctly using renderState', () => {
        renderState('error', 'Test Error Message', mockDisplayArea); 
        const content = mockDisplayArea.innerHTML;
        
        expect(content).toContain('Lỗi Tải Dữ liệu!');
        expect(content).toContain('Test Error Message');
        expect(content).toContain('state-message--error');
    });
    
    // TEST 3: Kiểm tra luồng fetchDataAndRender (Lỗi 404)
    test('3. Should handle 404 ERROR from fetch correctly', async () => {
        global.mockFetchState = 'ERROR_404';
        await fetchDataAndRender(); 
        const content = mockDisplayArea.innerHTML;
        
        expect(content).toContain('Lỗi Tải Dữ liệu!');
        expect(content).toContain('Lỗi HTTP: 404');
    });

    // TEST 4: Kiểm tra chức năng Lọc (FilterFaqs)
    test('4. Should filter FAQ items based on keyword (Live Search)', () => {
        // Dữ liệu gốc đã được gán trong beforeEach
        
        // Giả lập người dùng gõ từ khóa
        mockSearchInput.value = 'quy chế';
        filterFaqs(); 
        
        expect(mockDisplayArea.innerHTML).toContain('Quy chế bảo lưu');
        expect(mockDisplayArea.innerHTML).not.toContain('Lịch thi cuối kỳ');
        expect(mockDisplayArea.querySelectorAll('.faq-item').length).toBe(1);
    });

    // TEST 5: Kiểm tra trạng thái Empty khi không có kết quả tìm kiếm
    test('5. Should show empty state when filter finds no results', () => {
        // Dữ liệu gốc đã được gán trong beforeEach
        
        // Giả lập người dùng gõ từ khóa không tồn tại
        mockSearchInput.value = 'blockchain';
        filterFaqs(); 
        
        expect(mockDisplayArea.innerHTML).toContain('Không tìm thấy kết quả nào.');
        expect(mockDisplayArea.innerHTML).toContain('Không tìm thấy câu hỏi nào phù hợp với từ khóa bạn tìm kiếm.');
        expect(mockDisplayArea.innerHTML).toContain('state-message--empty');
    });
});