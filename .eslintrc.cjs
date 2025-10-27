/**
 * Cấu hình ESLint cho dự án UniFAQ.
 * Sử dụng cho môi trường Node.js (server.js) và Trình duyệt (chatApp.js).
 */
module.exports = {
  // Bật môi trường trình duyệt (cho chatApp.js và các component) và Node (cho server.js)
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true, // Thêm môi trường Jest cho các file test
  // Sử dụng cấu hình tiêu chuẩn của Airbnb và Jest
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:jest/recommended',
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'jest',
  ],
  rules: {
    'linebreak-style': 'off',
    // Cho phép console.log và console.error trong môi trường phát triển
    'no-console': 'off',
    // TẮT: Giải quyết lỗi 'Imported file extensions' cho các file .js trong import.
    // Thường xảy ra với cấu hình module của AirBnB.
    'import/extensions': 'off', 
    // Cho phép sử dụng các biến như 'messages', 'allFaqs' chưa được định nghĩa
    // vì chúng là các biến toàn cục trong scope của chatApp.js.
    'no-unused-vars': ['error', { argsIgnorePattern: '^_|faq|keyword|allFaqs|messages' }],
    // Cho phép sử dụng cú pháp function declaration thay vì arrow function
    'prefer-arrow-callback': 'off',
    // Cho phép sử dụng 'let' và 'const' không bị xếp nhóm.
    'vars-on-top': 'off',
    // Cho phép sử dụng __dirname trong môi trường ES Module (đã được định nghĩa lại trong server.js)
    'no-underscore-dangle': 'off',
    // Tắt yêu cầu đặt import đầu file để phù hợp với các file module.
    'import/first': 'off',
    // Tắt yêu cầu đặt default export
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    // Bắt buộc phải có khoảng trắng trước '}'
    'object-curly-spacing': ['error', 'always'], 
    // Cho phép các dòng có tối đa 120 ký tự
    'max-len': ['error', {
      code: 120,
      ignoreStrings: true,
      ignoreUrls: true,
    }],
  },
}
};