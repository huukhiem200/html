// File: hooks/ChatContainer.js (Đã sửa lỗi this.sleep)

// Sửa lỗi ESLint: import/no-useless-path-segments
import { findTopFaqs } from '../hooks/useFaqSearch.js'; 

/**
 * HÀM HỖ TRỢ: Giả lập độ trễ (Sleep) - ĐÃ ĐƯỢC TÁCH KHỎI CLASS
 */
// eslint-disable-next-line arrow-body-style
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * ChatContainer (Lớp Logic: Xử lý State và Dữ liệu)
 */
export class ChatContainer {
  constructor(presenter) {
    this.presenter = presenter;
    this.GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG63r7RZrpBrpDRtZCVo'; 
    this.DATA_FILE = './assets/faqs.json';
    this.messages = [];
    this.allFaqs = [];
    this.isChatOpen = false;
    this.mode = 'suggestions'; 
    this.currentKeyword = '';
  }

  async init() {
    this.presenter.renderLayout(); 
    this.bindPresenterEvents();
    await this.loadFaqs();
    this.render();
  }

  async loadFaqs() {
    try {
      const response = await fetch(this.DATA_FILE);
      if (!response.ok) {
        throw new Error('Không thể tải file FAQs.');
      }
      this.allFaqs = await response.json();
    } catch (error) {
      console.error('Lỗi tải FAQs:', error);
    }
  }

  bindPresenterEvents() {
    const handlers = {
      onToggleChat: () => this.handleToggleChat(),
      onCloseChat: () => this.handleCloseChat(),
      onHeaderSearch: (text) => this.handleHeaderSearch(text),
      onPageSuggestion: (question) => this.handlePageSuggestion(question),
      onChatInput: (text) => this.handleChatInput(text),
      onSendMessage: (text) => this.handleSendMessage(text),
    };
    this.presenter.bindEvents(handlers);

    if (this.presenter.chatForm) { 
      this.presenter.chatForm.addEventListener('suggestionClicked', (e) => {
        this.handleSendMessage(e.detail);
      });
    }
  }

  handleToggleChat() {
    this.isChatOpen = !this.isChatOpen;
    console.log(`[DEBUG] Trạng thái chat: ${this.isChatOpen ? 'MỞ' : 'ĐÓNG'}`); 
    this.presenter.toggleChatWindow(this.isChatOpen);
    
    if (this.isChatOpen) {
      if (this.messages.length === 0) {
        this.mode = 'suggestions';
        this.currentKeyword = '';
        this.render();
      } else {
        this.mode = 'chat';
        this.render();
      }
    }
  }

  handleCloseChat() {
    this.isChatOpen = false;
    this.presenter.toggleChatWindow(false);
    
    this.messages = [];
    this.mode = 'suggestions';
    this.currentKeyword = '';
    this.presenter.resetChatUI();
    this.presenter.setUIBusy(false);
  }

  // eslint-disable-next-line class-methods-use-this
  handleHeaderSearch(text) {
    console.log('Tìm kiếm trên Header:', text);
  }

  handlePageSuggestion(question) {
    this.isChatOpen = true;
    this.presenter.toggleChatWindow(true);
    this.handleSendMessage(question);
  }

  handleChatInput(text) {
    if (this.messages.length === 0 || this.mode === 'suggestions') {
      this.mode = 'suggestions';
      this.currentKeyword = text.trim();
      this.render();
    }
  }

 // File: containers/ChatContainer.js (Hàm handleSendMessage đã sửa)

async handleSendMessage(text) {
  this.mode = 'chat';
  this.currentKeyword = ''; 
  
  // 1. Gửi tin nhắn người dùng và đặt trạng thái bận
  this.messages.push({ sender: 'user', text });
  this.presenter.displayMessages(this.messages);
  this.presenter.setUIBusy(true);

  // 2. Thêm chỉ báo đang gõ
  this.messages.push({ sender: 'bot', text: '<span></span><span></span><span></span>' });
  this.presenter.displayMessages(this.messages);
  
  let answerText = '';
  
  // 3. 🚨 BƯỚC MỚI: Gọi Gemini trước để trả lời câu hỏi CHUNG (General Knowledge)
  const geminiAnswer = await this.getGeminiAnswer(text);

  if (!geminiAnswer.includes('[REFUSAL_UNIFORM]')) {
    // Kịch bản 1: Gemini ĐÃ TRẢ LỜI CÂU HỎI CHUNG (ví dụ: Sơn Tùng, Faker, lịch sử)
    answerText = geminiAnswer;

  } else {
    // 🚨 Kịch bản 2: Gemini TỪ CHỐI TRẢ LỜI (vì nó nghĩ đó là câu hỏi nội bộ/UniFAQ)
    
    // 4. Tìm kiếm FAQ có sẵn (Offline search)
    const faqAnswer = this.findAnswer(text);

    if (faqAnswer) {
      // 4a. Tìm thấy FAQ: Trả lời nội bộ
      answerText = `Dựa trên câu hỏi thường gặp, câu trả lời là: **${faqAnswer}**`;
    } else {
      // 4b. Không tìm thấy FAQ: Trả lời từ chối cuối cùng
      answerText = 'Xin lỗi, tôi chưa tìm thấy câu trả lời chính xác nào trong hệ thống FAQ của trường hoặc cơ sở dữ liệu chung. Vui lòng liên hệ Phòng Công tác Sinh viên.';
    }
  }
  
  // 5. Cập nhật UI
  this.messages.pop(); // Xóa tin nhắn đang gõ
  this.messages.push({ sender: 'bot', text: answerText });
  
  this.presenter.displayMessages(this.messages);
  this.presenter.setUIBusy(false);
}

  findAnswer(question) {
    const topFaqs = findTopFaqs(question, this.allFaqs);
    
    if (topFaqs.length > 0) {
      const bestMatch = topFaqs[0];
      // Ngưỡng điểm tối thiểu là 6 (tức 2 từ khóa khớp trong câu hỏi)
      if (bestMatch.score >= 6) { 
          return bestMatch.answer; 
      }
    }
    
    return null; 
  }
  
  /**
   * HÀM GỌI API GEMINI THỰC TẾ (Không cần THIS)
   */
  // eslint-disable-next-line class-methods-use-this, max-len
  async getGeminiAnswer(question) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.GEMINI_API_KEY}`;
    
    const systemInstruction = `Bạn là UniFAQ, một trợ lý AI hữu ích. Hãy trả lời câu hỏi của sinh viên một cách ngắn gọn, thân thiện và chuyên nghiệp. Câu hỏi: ${question}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('LỖI GỌI API GEMINI (HTTP ERROR):', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (answer && answer.includes('[REFUSAL_UNIFORM]')) {
          // Nếu Gemini trả về chuỗi từ chối, chúng ta sẽ xử lý nó trong handleSendMessage
          return '[REFUSAL_UNIFORM]';
      }
      if (answer) {
        return answer; // Trả lời câu hỏi chung
      }
      
      return 'Xin lỗi, Gemini không tạo ra câu trả lời cho câu hỏi này. Vui lòng thử lại câu hỏi khác hoặc liên hệ Phòng Công tác Sinh viên.';

    } catch (error) {
      console.error('LỖI KẾT NỐI API GEMINI (NETWORK/LOGIC):', error);
      // Fallback message khi có lỗi kết nối hoặc lỗi logic
      return 'Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống AI. Vui lòng kiểm tra lại **GEMINI_API_KEY** hoặc thử lại sau.';
    }
  }

  render() {
    if (this.mode === 'suggestions') {
      const suggestions = findTopFaqs(this.currentKeyword, this.allFaqs);
      this.presenter.displaySuggestions(suggestions, this.currentKeyword);
    } else {
      this.presenter.displayMessages(this.messages);
    }
  }
}