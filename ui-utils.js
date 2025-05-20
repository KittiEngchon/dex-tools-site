// ui-utils.js

// ปรับขนาดปุ่ม Connect Wallet ให้เท่ากับปุ่มเลือก Chain ตอนโหลดหน้าเว็บ
window.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectBtn');
  const chainSelector = document.getElementById('chainSelector');
  if (connectBtn && chainSelector) {
    connectBtn.style.width = `${chainSelector.offsetWidth}px`;
  }
});

// ถ้าต้องการให้ปรับขนาดอัตโนมัติเมื่อ resize หน้าจอด้วย ก็เพิ่ม event listener นี้ได้
window.addEventListener('resize', () => {
  const connectBtn = document.getElementById('connectBtn');
  const chainSelector = document.getElementById('chainSelector');
  if (connectBtn && chainSelector) {
    connectBtn.style.width = `${chainSelector.offsetWidth}px`;
  }
});
