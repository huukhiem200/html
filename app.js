// app.js (Phiên bản Hoàn Chỉnh Cuối cùng: Ổn định trên Web và Test)

const DATA_FILE = 'faqs.json'; 
let allFaqsData = []; // Biến chính chứa dữ liệu, được sử dụng trong các hàm
let displayArea = null; 
let searchInput = null;

// Hàm getter để lấy phần tử DOM khi chạy trong trình duyệt
const getDisplayArea = () => document.getElementById('data-display-area');
const getSearchInput = () => document.getElementById('header-search-input');


/**
 * Hiển thị trạng thái (Loading, Error, Empty)
 */
function renderState(state, message, displayArea) {
    if (!displayArea) return; 
    
    let icon = '';
    let title = '';
    
    switch (state) {
        case 'loading':
            icon = '⏳';
            title = 'Đang Tải Dữ liệu...';
            break;
        case 'error':
            icon = '❌';
            title = 'Lỗi Tải Dữ liệu!';
            break;
        case 'empty':
            icon = '🤷';
            title = 'Không tìm thấy kết quả nào.'; 
            break;
        default:
            return;
    }

    displayArea.innerHTML = `
        <div class="state-message state-message--${state}" aria-live="polite">
            <div class="state-message__icon">${icon}</div>
            <h3 class="state-message__title">${title}</h3>
            <p class="state-message__details">${message}</p>
        </div>
    `;
}

/**
 * Hiển thị danh sách FAQ.
 */
function renderFaqs(faqs, displayArea) {
    if (!displayArea) return; 
    
    if (!faqs || faqs.length === 0) {
        renderState('empty', 'Không tìm thấy câu hỏi nào phù hợp với từ khóa bạn tìm kiếm.', displayArea);
        return;
    }
    
    const faqListHTML = faqs.map(faq => `
        <details class="faq-item">
            <summary class="faq-item__question">❓ ${faq.question}</summary>
            <div class="faq-item__answer">
                <p>✅ ${faq.answer}</p>
            </div>
        </details>
    `).join('');

    displayArea.innerHTML = faqListHTML;
}

/**
 * Lọc FAQ dựa trên từ khóa tìm kiếm (LIVE SEARCH)
 */
function filterFaqs() {
    // SỬ DỤNG BIẾN TOÀN CỤC allFaqsData (đã được gán giá trị trong Test hoặc fetchData)
    const dataToFilter = allFaqsData; 

    const searchInput = getSearchInput();
    const displayArea = getDisplayArea();

    if (!searchInput || !displayArea) return; 
    
    const keyword = searchInput.value.toLowerCase().trim();
    
    if (!keyword) {
        renderFaqs(dataToFilter, displayArea);
        return;
    }

    const filteredFaqs = dataToFilter.filter(faq => 
        faq.question.toLowerCase().includes(keyword) || 
        faq.answer.toLowerCase().includes(keyword)
    );

    renderFaqs(filteredFaqs, displayArea);
    
    // Cuộn đến phần FAQ (chỉ chạy trong trình duyệt thực)
    if (typeof document !== 'undefined') {
        const faqListSection = document.getElementById('faq-list');
        if (faqListSection) { 
            faqListSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}


/**
 * Hàm chính để tải và hiển thị dữ liệu.
 */
async function fetchDataAndRender() {
    if (typeof document === 'undefined') return;

    const displayArea = getDisplayArea();
    const searchInput = getSearchInput();
    
    if (!displayArea) return;

    renderState('loading', 'Vui lòng chờ trong giây lát, UniFAQ đang kết nối với máy chủ dữ liệu...', displayArea);

    try {
        const response = await fetch(DATA_FILE);
        
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            renderState('empty', `Tệp dữ liệu FAQ bị trống. Vui lòng kiểm tra ${DATA_FILE}.`, displayArea);
            return;
        }

        // GÁN CHO BIẾN TOÀN CỤC
        allFaqsData = data; 
        renderFaqs(allFaqsData, displayArea);

        if (searchInput) {
            searchInput.addEventListener('keyup', filterFaqs);
        }
        
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error); 
        renderState('error', `Không thể tải dữ liệu từ tệp **${DATA_FILE}**. Chi tiết: ${error.message}`, displayArea);
    }
}

// Chạy hàm chính khi DOM đã tải xong
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', fetchDataAndRender);
}


// --- BẢO VỆ CÚ PHÁP NODE.JS (module is not defined) ---

const exportsForTesting = {
    renderState,
    renderFaqs,
    fetchDataAndRender,
    filterFaqs,
    // Export allFaqsData để Jest có thể gán giá trị và test
    get allFaqsData() { return allFaqsData; },
    set allFaqsData(val) { allFaqsData = val; }, 
    
    displayArea, 
    searchInput, 
    getDisplayArea, 
    getSearchInput 
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportsForTesting;
}