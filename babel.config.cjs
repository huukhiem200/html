// babel.config.cjs
module.exports = {
  presets: [
    // Bắt buộc để chuyển đổi cú pháp ESM (import/export) sang CommonJS (require/module.exports) cho Jest.
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // Preset này được thiết kế để hoạt động tốt nhất với Jest.
    'babel-preset-jest', 
  ],
};
// Đã thêm newline ở cuối file