document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch Unique Visitor Count từ Backend Render của bạn
    fetchVisitorCount();

    // 2. Gắn sự kiện tính toán và theme
    const calculateBtn = document.getElementById('calculate-btn');
    const presetBtn = document.getElementById('preset-balanced');
    
    calculateBtn.addEventListener('click', computeWheatstoneBridge);
    presetBtn.addEventListener('click', loadPreset);

    // Tự động tính toán lần đầu khi load trang
    computeWheatstoneBridge();

    // Khởi tạo Theme & Accent Switcher
    initThemeEngine();
});

async function fetchVisitorCount() {
    const counterSpan = document.querySelector('#visitor-counter .count-value');
    try {
        const response = await fetch('https://wheatstone-counter-backend.onrender.com/api/visitor-count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            counterSpan.textContent = data.count;
        } else {
            counterSpan.textContent = 'Offline';
        }
    } catch (err) {
        console.error("Lỗi kết nối bộ đếm:", err);
        counterSpan.textContent = 'Connection Error';
    }
}

// Thuật toán phân tích mạch cầu Wheatstone (Nodal Analysis / Phương pháp nút)
function computeWheatstoneBridge() {
    const Vs = parseFloat(document.getElementById('vs').value) || 0;
    const R1 = parseFloat(document.getElementById('r1').value) || 1e-6;
    const R2 = parseFloat(document.getElementById('r2').value) || 1e-6;
    const R3 = parseFloat(document.getElementById('r3').value) || 1e-6;
    const R4 = parseFloat(document.getElementById('r4').value) || 1e-6;
    const R5 = parseFloat(document.getElementById('r5').value) || 1e-6;

    // Thiết lập hệ phương trình nút cho 2 đỉnh C và D:
    // a11*Vc + a12*Vd = b1
    // a21*Vc + a22*Vd = b2
    const a11 = (1 / R1) + (1 / R2) + (1 / R5);
    const a12 = -1 / R5;
    const b1 = Vs / R1;

    const a21 = -1 / R5;
    const a22 = (1 / R3) + (1 / R4) + (1 / R5);
    const b2 = Vs / R3;

    // Giải định thức Cramer 2x2
    const D = (a11 * a22) - (a12 * a21);
    if (Math.abs(D) < 1e-12) {
        alert("Lỗi cấu hình mạch: Determinant gần bằng 0!");
        return;
    }

    const Vc = ((b1 * a22) - (b2 * a12)) / D;
    const Vd = ((a11 * b2) - (a21 * b1)) / D;

    // Dòng điện qua nhánh giữa R5 (Ig) từ C sang D
    const Ig = (Vc - Vd) / R5;
    const igAbsmA = Math.abs(Ig) * 1000;

    // Dòng tổng và điện trở tương đương Req
    const I1 = (Vs - Vc) / R1;
    const I3 = (Vs - Vd) / R3;
    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;

    // Kiểm tra trạng thái cầu cân bằng (Ig xấp xỉ 0 hoặc R1*R4 == R2*R3)
    const isBalanced = Math.abs(igAbsmA) < 0.01;

    // Cập nhật giao diện kết quả
    document.getElementById('vc-result').textContent = Vc.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vd.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = igAbsmA.toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';

    const statusBadge = document.getElementById('status-badge');
    if (isBalanced) {
        statusBadge.textContent = 'Bridge Balanced (Cân bằng)';
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = 'Bridge Unbalanced (Lệch)';
        statusBadge.className = 'status-badge unbalanced';
    }
}

function loadPreset() {
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100;
    document.getElementById('r2').value = 100;
    document.getElementById('r3').value = 200;
    document.getElementById('r4').value = 200;
    document.getElementById('r5').value = 50;
    computeWheatstoneBridge();
}

// Quản lý Dark/Light mode và Màu chủ đạo Accent
function initThemeEngine() {
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const accentDots = document.querySelectorAll('.accent-pickers .dot');

    // Load từ LocalStorage nếu có
    const savedTheme = localStorage.getItem('wb_theme') || 'dark';
    const savedAccent = localStorage.getItem('wb_accent') || 'cyan';

    htmlEl.setAttribute('data-theme', savedTheme);
    htmlEl.setAttribute('data-accent', savedAccent);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlEl.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('wb_theme', newTheme);
    });

    accentDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            htmlEl.setAttribute('data-accent', color);
            localStorage.setItem('wb_accent', color);
        });
    });
}