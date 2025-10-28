// File: containers/ChatContainer.js
// eslint-disable-next-line import/no-useless-path-segments
import { findTopFaqs } from '../hooks/useFaqSearch.js';

/**
 * ChatContainer (Lớp Logic)
 * Chịu trách nhiệm QUẢN LÝ STATE và XỬ LÝ LOGIC NGHIỆP VỤ.
 * Không truy cập DOM.
 */
export class ChatContainer {
  constructor(presenter) {
    this.presenter = presenter; // Nhận Presenter từ bên ngoài

    // 1. Toàn bộ State (trạng thái) của ứng dụng
    this.GEMINI_API_KEY = 'AIzaSyCYZOtTycH6N5lOG63r7RZrpBrpDRtZCVo'; //
    this.DATA_FILE = './assets/faqs.json';
    this.messages = [];
    this.allFaqs = [];
    this.isChatOpen = false;
    this.mode = 'suggestions'; // 'suggestions' hoặc 'chat'
    this.currentKeyword = '';
  }

  /**
   * 1. Khởi tạo
   */
  async init() {
    // Render layout HTML trước
    this.presenter.renderLayout();

    // Gắn tất cả các hàm xử lý sự kiện
    this.bindPresenterEvents();

    // Tải dữ liệu
    await this.loadFaqs();

    // Render lần đầu
    this.render();
  }

  /**
   * 2. Tải dữ liệu ban đầu
   */
  async loadFaqs() {
    try {
      const response = await fetch(this.DATA_FILE);
      if (!response.ok) throw new Error('Không thể tải file FAQs.');
      this.allFaqs = await response.json();
    } catch (error) {
      console.error(error);
      // Hiển thị lỗi (nếu cần)
      this.presenter.displayMessages([{ sender: 'bot', text: 'Lỗi: Không thể tải dữ liệu.' }]);
    }
  }

  /**
   * 3. Gắn các hàm xử lý logic vào Presenter
   */
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

    // Xử lý sự kiện 'suggestionClicked' tùy chỉnh từ Presenter
    this.presenter.chatForm.addEventListener('suggestionClicked', (e) => {
      this.handleSendMessage(e.detail);
    });
  }

  /**
   * 4. Hàm Render logic (Quyết định SẼ hiển thị cái gì)
   */
  render() {
    if (this.mode === 'suggestions') {
      const suggestions = findTopFaqs(this.currentKeyword, this.allFaqs);
      this.presenter.displaySuggestions(suggestions, this.currentKeyword);
    } else {
      this.presenter.displayMessages(this.messages);
    }
  }

  /**
   * 5. Các hàm xử lý logic nghiệp vụ
   */

  // Bật/tắt chat
  handleToggleChat() {
    this.isChatOpen = !this.isChatOpen;
    this.presenter.toggleChatWindow(this.isChatOpen);
    if (this.isChatOpen) {
      // Reset về màn hình gợi ý khi mở
      this.mode = 'suggestions';
      this.render();
    }
  }

  // Đóng chat
  handleCloseChat() {
    this.isChatOpen = false;
    this.presenter.toggleChatWindow(false);
    // Reset state
    this.messages = [];
    this.currentKeyword = '';
    this.presenter.resetChatUI();
  }

  // Gõ vào ô chat
  handleChatInput(text) {
    this.currentKeyword = text;
    this.mode = 'suggestions'; // Luôn chuyển về mode gợi ý khi gõ
    this.render();
  }

  // Bấm nút tìm kiếm trên Header
  handleHeaderSearch(text) {
    this.isChatOpen = true;
    this.presenter.toggleChatWindow(true);
    this.handleSendMessage(text); // Gửi tin nhắn luôn
  }

  // Bấm nút gợi ý trên trang
  handlePageSuggestion(question) {
    this.isChatOpen = true;
    this.presenter.toggleChatWindow(true);
    this.handleSendMessage(question); // Gửi tin nhắn luôn
  }

  // Gửi một tin nhắn (từ form, gợi ý, header)
  async handleSendMessage(userText) {
    this.mode = 'chat'; // Chuyển sang chế độ chat
    this.presenter.setUIBusy(true);

    // Thêm tin nhắn người dùng và render
    this.messages.push({ sender: 'user', text: userText });
    this.render();

    // Thêm chỉ báo "đang gõ" và render
    const typingMessage = { sender: 'bot', isTyping: true, text: '<span></span><span></span><span></span>' };
    this.messages.push(typingMessage);
    this.render();

    // Tìm câu trả lời (logic từ chatApp.js)
    let botReply = this.findAnswer(userText);

    if (!botReply) {
      // Nếu không tìm thấy, gọi Gemini
      await this.sleep(1000); // Giả lập tìm kiếm
      botReply = await this.getGeminiAnswer(userText);
    }

    // Xóa "đang gõ", thêm câu trả lời thật, và render
    this.messages.pop(); // Xóa tin nhắn 'isTyping'
    this.messages.push({ sender: 'bot', text: botReply });
    this.render();

    this.presenter.setUIBusy(false);
  }

  // --- 6. Logic nghiệp vụ (Copy từ chatApp.js) ---
  // eslint-disable-next-line class-methods-use-this
  sleep(ms) {
    // eslint-disable-next-line arrow-body-style
    return new Promise((resolve) => { setTimeout(resolve, ms); });
  }

  findAnswer(question) {
    // (Logic y hệt từ chatApp.js)
    const userWords = question.toLowerCase().trim().split(/\s+/);
    if (userWords.length === 0) return null;
    let bestMatch = { faq: null, score: 0 };

    this.allFaqs.forEach((faq) => {
      let currentScore = 0;
      const questionText = faq.question.toLowerCase();
      const answerText = faq.answer.toLowerCase();

      userWords.forEach((word) => {
        if (word.length >= 4) {
          if (questionText.includes(word)) currentScore += 2;
          else if (answerText.includes(word)) currentScore += 1;
        }
      });
      if (currentScore > bestMatch.score) {
        bestMatch = { faq, score: currentScore };
      }
    });
    if (bestMatch.score >= 4) return bestMatch.faq.answer;
    return null;
  }

  async getGeminiAnswer(question) {
    // (Logic y hệt từ chatApp.js)
    const MODEL_NAME = 'gemini-2.5-flash';
    // eslint-disable-next-line max-len
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${this.GEMINI_API_KEY}`;
    const systemInstruction = 'Bạn là UniFAQ, một trợ lý AI thân thiện. Hãy trả lời câu hỏi bằng tiếng Việt ngắn gọn và chính xác.';

    const requestBody = {
      contents: [{ parts: [{ text: `${systemInstruction} Câu hỏi: ${question}` }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    };
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return `**Lỗi API (HTTP ${response.status})**: ${errorData.error?.message || 'Không thể xử lý'}.`;
      }
      const data = await response.json();
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        return `Rất tiếc, câu hỏi bị từ chối. Lý do: ${data.promptFeedback.reason}`;
      }
      if (!data?.candidates?.[0]?.content?.parts?.[0]) {
        return 'Rất tiếc, AI không thể trả lời câu hỏi này.';
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      return 'Rất tiếc, đã có lỗi mạng hoặc kết nối không ổn định.';
    }
  }
}
