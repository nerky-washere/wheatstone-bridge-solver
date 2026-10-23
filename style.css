let animationTimer = null;
let currentLang = localStorage.getItem('wb_lang') || 'en';
let isQuizMode = false;
let currentSolutions = { Req: 0, Vm: 0, Vn: 0, I5_mA: 0 };

// Bộ từ điển Đa ngôn ngữ (Bao gồm Modal Lý thuyết & Chế độ Luyện tập)
const i18n = {
    en: {
        app_title: "WHEATSTONE BRIDGE SOLVER",
        unique_visitors: "UNIQUE VISITORS:",
        circuit_params: "Circuit Parameters",
        load_preset: "Load Balanced",
        theory_btn: "📖 Cheat Sheet",
        quiz_btn: "🎯 Practice Quiz",
        source_voltage: "Source Voltage (Vs) [V]",
        r1_label: "R1 [Ω]",
        r2_label: "R2 [Ω]",
        r3_label: "R3 [Ω]",
        r4_label: "R4 [Ω]",
        r5_label: "R5 (Galvanometer) [Ω]",
        lab_notes_label: "📝 Lab Notes",
        lab_notes_placeholder: "Type formulas...",
        analysis_results: "Analysis Results",
        req_label: "Equivalent Resistance",
        itotal_label: "Total Current",
        vm_label: "Node M Voltage",
        vn_label: "Node N Voltage",
        ig_label: "Galvanometer Current",
        u5_label: "Voltage Drop",
        branch_th: "Branch",
        current_th: "Current (I)",
        voltage_th: "Voltage (U)",
        status_invalid: "Invalid Input",
        status_balanced: "Bridge Balanced",
        status_unbalanced: "Bridge Unbalanced",
        show_solution: "Show Step-by-Step Solution",
        hide_solution: "Hide Solution",
        step_1_title: "Step 1: System of Equations",
        kcl_nodes: "KCL at Nodes M & N:",
        kvl_loops: "KVL for 3 Loops:",
        step_2_title: "Step 2: Substitute Real Values",
        step_3_title: "Step 3: Solved Branch Currents",
        modal_title: "Wheatstone Bridge Theory (11th Grade)",
        modal_h1: "1. Circuit Identification and Classification",
        modal_p1: "A bridge circuit consists of two main nodes (M and N) with a resistor R5 connected between them.",
        modal_l1: "<strong>Balanced Bridge:</strong> When R1.R4 = R2.R3",
        modal_l2: "<strong>Unbalanced Bridge:</strong> When R1.R4 ≠ R2.R3",
        modal_h2: "2. Solving a Balanced Bridge",
        modal_p2: "When balanced, the voltage difference U5 = 0 and current I5 = 0.",
        modal_l3: "<strong>Step 1:</strong> Check condition R1.R4 = R2.R3.",
        modal_l4: "<strong>Step 2:</strong> Remove R5 from the circuit.",
        modal_l5: "<strong>Step 3:</strong> Redraw circuit: (R1 in series with R3) // (R2 in series with R4).",
        modal_l6: "<strong>Step 4:</strong> Calculate Req = (R13 * R24) / (R13 + R24).",
        modal_l7: "<strong>Step 5:</strong> Apply Ohm's law to find I, U.",
        modal_h3: "3. Solving an Unbalanced Bridge (Recommended)",
        modal_p3: "Using Kirchhoff's Circuit Laws (KCL & KVL):",
        modal_l8: "<strong>Step 1:</strong> Assign branch currents (I1 to I5). Use KCL at nodes to set up equations.",
        modal_l9: "<strong>Step 2:</strong> Write KVL equations for the closed loops.",
        modal_l10: "<strong>Step 3:</strong> Solve the 5-variable system of equations.",
        quiz_title: "🎯 Practice Challenge",
        quiz_exit: "Exit Quiz",
        quiz_desc: "Results are hidden! Calculate the circuit parameters using the random values on the left and enter your answers below (±2% tolerance):",
        quiz_ans_req: "R<sub>eq</sub> [Ω]",
        quiz_ans_vm: "V<sub>m</sub> [V]",
        quiz_ans_ig: "I<sub>5</sub> [mA] (+/-)",
        quiz_check: "Check Answer",
        quiz_new: "🎲 New Problem",
        quiz_reveal: "👁️ Give Up & Show Solution",
        quiz_msg_empty: "⚠️ Please enter all 3 values before checking!",
        quiz_msg_correct: "🎉 Excellent! All your calculations are accurate. Results unlocked!",
        quiz_msg_wrong: "❌ Not quite right. Check: ",
        quiz_msg_revealed: "💡 Solution unlocked! Review the step-by-step equations below to see how it's solved."
    },
    vi: {
        app_title: "BỘ GIẢI MẠCH CẦU WHEATSTONE",
        unique_visitors: "LƯỢT TRUY CẬP:",
        circuit_params: "Thông Số Mạch Điện",
        load_preset: "Tải Mạch Cân Bằng",
        theory_btn: "📖 Bí Kíp",
        quiz_btn: "🎯 Luyện Tập",
        source_voltage: "Điện Áp Nguồn (Vs) [V]",
        r1_label: "Điện trở R1 [Ω]",
        r2_label: "Điện trở R2 [Ω]",
        r3_label: "Điện trở R3 [Ω]",
        r4_label: "Điện trở R4 [Ω]",
        r5_label: "R5 (Điện kế / Nhánh M-N) [Ω]",
        lab_notes_label: "📝 Ghi Chú",
        lab_notes_placeholder: "Nhập công thức...",
        analysis_results: "Kết Quả Phân Tích",
        req_label: "Điện Trở Tương Đương",
        itotal_label: "Dòng Điện Tổng",
        vm_label: "Điện Thế Nút M",
        vn_label: "Điện Thế Nút N",
        ig_label: "Dòng Qua Điện Kế",
        u5_label: "Độ Sụt Áp",
        branch_th: "Nhánh",
        current_th: "Dòng điện (I)",
        voltage_th: "Điện áp (U)",
        status_invalid: "Đầu Vào Không Hợp Lệ",
        status_balanced: "Cầu Cân Bằng",
        status_unbalanced: "Cầu Lệch (Không Cân Bằng)",
        show_solution: "Hiển Thị Lời Giải Chi Tiết",
        hide_solution: "Ẩn Lời Giải",
        step_1_title: "Bước 1: Hệ phương trình Kirchhoff",
        kcl_nodes: "Định luật nút (KCL) tại M & N:",
        kvl_loops: "Định luật vòng (KVL) cho 3 vòng:",
        step_2_title: "Bước 2: Thay số vào hệ phương trình",
        step_3_title: "Bước 3: Kết quả Dòng điện các nhánh",
        modal_title: "Bí Kíp Giải Mạch Cầu (Vật Lý 11)",
        modal_h1: "1. Nhận dạng mạch cầu và phân loại",
        modal_p1: "Mạch cầu gồm 2 nút chính (M và N) mà điện trở R5 được mắc giữa 2 nút đó.",
        modal_l1: "<strong>Mạch cầu cân bằng:</strong> Khi R1.R4 = R2.R3",
        modal_l2: "<strong>Mạch cầu không cân bằng:</strong> Khi R1.R4 ≠ R2.R3",
        modal_h2: "2. Phương pháp giải mạch cầu cân bằng",
        modal_p2: "Khi mạch cân bằng, hiệu điện thế U5 = 0 và cường độ dòng điện I5 = 0.",
        modal_l3: "<strong>Bước 1:</strong> Kiểm tra điều kiện R1.R4 = R2.R3.",
        modal_l4: "<strong>Bước 2:</strong> Bỏ qua R5 khỏi mạch điện.",
        modal_l5: "<strong>Bước 3:</strong> Vẽ lại mạch: (R1 nt R3) // (R2 nt R4).",
        modal_l6: "<strong>Bước 4:</strong> Tính Rtđ = (R13 * R24) / (R13 + R24).",
        modal_l7: "<strong>Bước 5:</strong> Áp dụng định luật Ôm để tìm I, U.",
        modal_h3: "3. Phương pháp giải mạch cầu không cân bằng (Khuyên dùng)",
        modal_p3: "Sử dụng định luật Kiếc-sôp (Kirchhoff 1 & 2):",
        modal_l8: "<strong>Bước 1:</strong> Đặt ẩn cường độ dòng điện trên các nhánh (I1 đến I5). Dùng quy tắc nút (KCL) để lập phương trình.",
        modal_l9: "<strong>Bước 2:</strong> Viết phương trình hiệu điện thế (KVL) theo các vòng kín của mạch.",
        modal_l10: "<strong>Bước 3:</strong> Giải hệ phương trình 5 ẩn để tìm các dòng điện.",
        quiz_title: "🎯 Thử Thách Luyện Tập",
        quiz_exit: "Thoát Luyện Tập",
        quiz_desc: "Kết quả đã được ẩn! Hãy tự tính toán dựa trên bộ thông số đề bài bên trái và nhập đáp án vào dưới đây (sai số cho phép ±2%):",
        quiz_ans_req: "R<sub>tđ</sub> [Ω]",
        quiz_ans_vm: "V<sub>m</sub> [V]",
        quiz_ans_ig: "I<sub>5</sub> [mA] (+/-)",
        quiz_check: "Kiểm Tra Đáp Án",
        quiz_new: "🎲 Đổi Đề Khác",
        quiz_reveal: "👁️ Xem Đáp Án & Lời Giải",
        quiz_msg_empty: "⚠️ Vui lòng nhập đầy đủ cả 3 đáp án trước khi kiểm tra!",
        quiz_msg_correct: "🎉 Chính xác tuyệt đối! Bạn nắm bài rất chắc. Đã mở khóa bảng kết quả!",
        quiz_msg_wrong: "❌ Chưa chính xác. Hãy kiểm tra lại: ",
        quiz_msg_revealed: "💡 Đã mở khóa đáp án! Bạn có thể xem chi tiết từng bước giải ở phía dưới."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initI18n();
    fetchVisitorCount();
    setupSyncInputAndSlider('vs', null);
    setupSyncInputAndSlider('r1', 'r1-slider');
    setupSyncInputAndSlider('r2', 'r2-slider');
    setupSyncInputAndSlider('r3', 'r3-slider');
    setupSyncInputAndSlider('r4', 'r4-slider');
    setupSyncInputAndSlider('r5', 'r5-slider');
    document.getElementById('preset-balanced').addEventListener('click', loadPreset);
    
    initTheoryModal();
    initQuizMode();

    computeWheatstoneBridge();
    initThemeEngine();
    startAnimationLoop();
});

function initI18n() {
    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = currentLang === 'en' ? 'EN' : 'VN';
    
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'vi' : 'en';
        langToggle.textContent = currentLang === 'en' ? 'EN' : 'VN';
        localStorage.setItem('wb_lang', currentLang);
        applyTranslations();
        computeWheatstoneBridge(); 
    });

    const toggleBtn = document.getElementById('toggle-solution-btn');
    const solutionPanel = document.getElementById('solution-panel');
    
    toggleBtn.addEventListener('click', () => {
        if (isQuizMode) return; // Không cho mở lời giải khi đang giấu đáp án
        const isVisible = solutionPanel.classList.toggle('visible');
        toggleBtn.setAttribute('data-i18n', isVisible ? 'hide_solution' : 'show_solution');
        applyTranslations();
    });
    
    applyTranslations();
}

function applyTranslations() {
    const dict = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
}

function initTheoryModal() {
    const theoryBtn = document.getElementById('open-theory-btn');
    const theoryModal = document.getElementById('theory-modal');
    const closeTheoryBtn = document.getElementById('close-theory-btn');

    theoryBtn.addEventListener('click', () => theoryModal.classList.add('show'));
    closeTheoryBtn.addEventListener('click', () => theoryModal.classList.remove('show'));
    window.addEventListener('click', (e) => {
        if (e.target === theoryModal) theoryModal.classList.remove('show');
    });
}

// --- LOGIC CHẾ ĐỘ LUYỆN TẬP (QUIZ MODE) ---
function initQuizMode() {
    const startBtn = document.getElementById('start-quiz-btn');
    const exitBtn = document.getElementById('exit-quiz-btn');
    const newBtn = document.getElementById('new-quiz-btn');
    const checkBtn = document.getElementById('check-quiz-btn');
    const revealBtn = document.getElementById('reveal-quiz-btn');

    startBtn.addEventListener('click', () => {
        startNewQuiz();
    });

    newBtn.addEventListener('click', () => {
        startNewQuiz();
    });

    exitBtn.addEventListener('click', () => {
        setQuizState(false);
    });

    checkBtn.addEventListener('click', () => {
        checkQuizAnswers();
    });

    revealBtn.addEventListener('click', () => {
        const dict = i18n[currentLang];
        const feedback = document.getElementById('quiz-feedback');
        
        // Mở khóa kết quả và tự động bung bảng lời giải chi tiết
        document.getElementById('results-card').classList.remove('blind-mode');
        isQuizMode = false;
        
        const solutionPanel = document.getElementById('solution-panel');
        const toggleBtn = document.getElementById('toggle-solution-btn');
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
        solutionPanel.classList.add('visible');
        toggleBtn.setAttribute('data-i18n', 'hide_solution');
        applyTranslations();

        feedback.textContent = dict.quiz_msg_revealed;
        feedback.className = 'quiz-feedback show correct';
    });
}

function startNewQuiz() {
    // Tạo bộ số ngẫu nhiên chẵn chục để học sinh dễ bấm máy tính
    const voltages = [6, 9, 12, 15, 18, 24, 30];
    const randVs = voltages[Math.floor(Math.random() * voltages.length)];
    const randR = () => (Math.floor(Math.random() * 19) + 2) * 10; // Từ 20 đến 200 Ohm

    const r1 = randR(), r2 = randR(), r3 = randR(), r4 = randR(), r5 = randR();

    document.getElementById('vs').value = randVs;
    document.getElementById('r1').value = r1; document.getElementById('r1-slider').value = r1;
    document.getElementById('r2').value = r2; document.getElementById('r2-slider').value = r2;
    document.getElementById('r3').value = r3; document.getElementById('r3-slider').value = r3;
    document.getElementById('r4').value = r4; document.getElementById('r4-slider').value = r4;
    document.getElementById('r5').value = r5; document.getElementById('r5-slider').value = r5;

    // Xóa trắng ô nhập cũ
    document.getElementById('ans-req').value = '';
    document.getElementById('ans-vm').value = '';
    document.getElementById('ans-ig').value = '';
    document.getElementById('quiz-feedback').className = 'quiz-feedback';

    setQuizState(true);
    computeWheatstoneBridge();
}

function setQuizState(active) {
    isQuizMode = active;
    const quizPanel = document.getElementById('quiz-panel');
    const resultsCard = document.getElementById('results-card');
    const solutionPanel = document.getElementById('solution-panel');
    const toggleBtn = document.getElementById('toggle-solution-btn');

    if (active) {
        quizPanel.classList.add('active');
        resultsCard.classList.add('blind-mode');
        solutionPanel.classList.remove('visible');
        toggleBtn.setAttribute('data-i18n', 'show_solution');
        toggleBtn.disabled = true;
        toggleBtn.style.opacity = '0.4';
        applyTranslations();
    } else {
        quizPanel.classList.remove('active');
        resultsCard.classList.remove('blind-mode');
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
    }
}

function checkQuizAnswers() {
    const dict = i18n[currentLang];
    const feedback = document.getElementById('quiz-feedback');

    const userReq = parseFloat(document.getElementById('ans-req').value);
    const userVm = parseFloat(document.getElementById('ans-vm').value);
    const userIg = parseFloat(document.getElementById('ans-ig').value);

    if (isNaN(userReq) || isNaN(userVm) || isNaN(userIg)) {
        feedback.textContent = dict.quiz_msg_empty;
        feedback.className = 'quiz-feedback show wrong';
        return;
    }

    // Kiểm tra dung sai 2% hoặc sai số làm tròn ±0.05
    const isClose = (userVal, trueVal) => {
        const tol = Math.max(Math.abs(trueVal) * 0.02, 0.05);
        return Math.abs(userVal - trueVal) <= tol;
    };

    const okReq = isClose(userReq, currentSolutions.Req);
    const okVm = isClose(userVm, currentSolutions.Vm);
    const okIg = isClose(userIg, currentSolutions.I5_mA);

    if (okReq && okVm && okIg) {
        feedback.textContent = dict.quiz_msg_correct;
        feedback.className = 'quiz-feedback show correct';
        // Mở khóa bảng kết quả khi làm đúng
        document.getElementById('results-card').classList.remove('blind-mode');
        isQuizMode = false;
        const toggleBtn = document.getElementById('toggle-solution-btn');
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
    } else {
        let wrongList = [];
        if (!okReq) wrongList.push(currentLang === 'en' ? 'Req' : 'Rtđ');
        if (!okVm) wrongList.push('Vm');
        if (!okIg) wrongList.push('I5');
        feedback.textContent = dict.quiz_msg_wrong + wrongList.join(', ');
        feedback.className = 'quiz-feedback show wrong';
    }
}

function setupSyncInputAndSlider(id, sliderId) {
    const input = document.getElementById(id);
    const slider = sliderId ? document.getElementById(sliderId) : null;
    input.addEventListener('input', () => {
        if (slider) slider.value = input.value;
        computeWheatstoneBridge();
    });
    if (slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            computeWheatstoneBridge();
        });
    }
}

async function fetchVisitorCount() {
    const counterSpan = document.querySelector('#visitor-counter .count-value');
    try {
        const response = await fetch('https://wheatstone-counter-backend.onrender.com/api/visitor-count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) counterSpan.textContent = data.count;
        else counterSpan.textContent = 'Offline';
    } catch (err) {
        counterSpan.textContent = 'Error';
    }
}

let currentStates = { I1: 0, I2: 0, I3: 0, I4: 0, I5: 0, I_total: 0 };

function computeWheatstoneBridge() {
    const Vs = parseFloat(document.getElementById('vs').value);
    const R1 = parseFloat(document.getElementById('r1').value);
    const R2 = parseFloat(document.getElementById('r2').value);
    const R3 = parseFloat(document.getElementById('r3').value);
    const R4 = parseFloat(document.getElementById('r4').value);
    const R5 = parseFloat(document.getElementById('r5').value);

    const dict = i18n[currentLang];

    if (isNaN(Vs) || isNaN(R1) || isNaN(R2) || isNaN(R3) || isNaN(R4) || isNaN(R5) ||
        R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0) {
        document.getElementById('status-badge').textContent = dict.status_invalid;
        document.getElementById('status-badge').className = 'status-badge unbalanced';
        return;
    }

    const a11 = (1 / R1) + (1 / R2) + (1 / R5);
    const a12 = -1 / R5;
    const b1 = Vs / R1;
    const a21 = -1 / R5;
    const a22 = (1 / R3) + (1 / R4) + (1 / R5);
    const b2 = Vs / R3;
    
    const D = (a11 * a22) - (a12 * a21);
    if (Math.abs(D) < 1e-12) return;
    
    const Vm = ((b1 * a22) - (b2 * a12)) / D;
    const Vn = ((a11 * b2) - (a21 * b1)) / D;

    const U1 = Vs - Vm; const I1 = U1 / R1;
    const U3 = Vs - Vn; const I3 = U3 / R3;
    const U5 = Vm - Vn; const I5 = U5 / R5;
    const U2 = Vm;      const I2 = U2 / R2;
    const U4 = Vn;      const I4 = U4 / R4;

    const I_total = I1 + I3;
    const Req = I_total > 0 ? Vs / I_total : 0;
    
    currentStates = { I1, I2, I3, I4, I5, I_total };
    currentSolutions = { Req: Req, Vm: Vm, Vn: Vn, I5_mA: I5 * 1000 };
    
    const isBalanced = Math.abs(I5 * 1000) < 0.01;

    document.getElementById('vc-result').textContent = Vm.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vn.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = (I5 * 1000).toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';
    document.getElementById('itotal-result').textContent = I_total.toFixed(3) + ' A';
    document.getElementById('u5-result').textContent = Math.abs(U5).toFixed(3) + ' V';

    const statusBadge = document.getElementById('status-badge');
    if (isBalanced) {
        statusBadge.textContent = dict.status_balanced;
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = dict.status_unbalanced;
        statusBadge.className = 'status-badge unbalanced';
    }

    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = `
        <tr><td><strong>R1</strong></td><td>${I1.toFixed(4)} A</td><td>${Math.abs(U1).toFixed(3)} V</td></tr>
        <tr><td><strong>R2</strong></td><td>${I2.toFixed(4)} A</td><td>${Math.abs(U2).toFixed(3)} V</td></tr>
        <tr><td><strong>R3</strong></td><td>${I3.toFixed(4)} A</td><td>${Math.abs(U3).toFixed(3)} V</td></tr>
        <tr><td><strong>R4</strong></td><td>${I4.toFixed(4)} A</td><td>${Math.abs(U4).toFixed(3)} V</td></tr>
        <tr><td><strong>R5 (M-N)</strong></td><td>${(I5 * 1000).toFixed(3)} mA</td><td>${Math.abs(U5).toFixed(3)} V</td></tr>
    `;

    document.getElementById('sys-eq1').innerHTML = `I<sub>1</sub> - I<sub>2</sub> - I<sub>5</sub> = 0`;
    document.getElementById('sys-eq2').innerHTML = `I<sub>3</sub> - I<sub>4</sub> + I<sub>5</sub> = 0`;
    document.getElementById('sys-eq3').innerHTML = `${R1}*I<sub>1</sub> - ${R3}*I<sub>3</sub> + ${R5}*I<sub>5</sub> = 0`;
    document.getElementById('sys-eq4').innerHTML = `-${R2}*I<sub>2</sub> + ${R4}*I<sub>4</sub> + ${R5}*I<sub>5</sub> = 0`;
    document.getElementById('sys-eq5').innerHTML = `${R1}*I<sub>1</sub> + ${R2}*I<sub>2</sub> = ${Vs}`;

    document.getElementById('step-i1').textContent = I1.toFixed(5);
    document.getElementById('step-i2').textContent = I2.toFixed(5);
    document.getElementById('step-i3').textContent = I3.toFixed(5);
    document.getElementById('step-i4').textContent = I4.toFixed(5);
    document.getElementById('step-i5').textContent = I5.toFixed(5);
}

function startAnimationLoop() {
    if (animationTimer) clearInterval(animationTimer);
    animationTimer = setInterval(() => { triggerCurrentFlowPulse(); }, 2500);
    triggerCurrentFlowPulse();
}

function triggerCurrentFlowPulse() {
    if (isQuizMode) return; // Tạm ẩn xung dòng điện khi đang làm bài tập để không lộ chiều dòng I5
    const tolerance = 1e-5; 
    applyFlow('flow-input', currentStates.I_total > tolerance, true);
    applyFlow('flow-r1', Math.abs(currentStates.I1) > tolerance, currentStates.I1 >= 0);
    applyFlow('flow-r3', Math.abs(currentStates.I3) > tolerance, currentStates.I3 >= 0);
    applyFlow('flow-r5', Math.abs(currentStates.I5) > tolerance, currentStates.I5 >= 0);
    applyFlow('flow-r2', Math.abs(currentStates.I2) > tolerance, currentStates.I2 >= 0);
    applyFlow('flow-r4', Math.abs(currentStates.I4) > tolerance, currentStates.I4 >= 0);
    applyFlow('flow-output', currentStates.I_total > tolerance, true);
}

function applyFlow(elementId, isActive, isForward) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('active-forward', 'active-reverse');
    void el.offsetWidth; 
    if (isActive) el.classList.add(isForward ? 'active-forward' : 'active-reverse');
}

function loadPreset() {
    setQuizState(false);
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100; document.getElementById('r1-slider').value = 100;
    document.getElementById('r2').value = 100; document.getElementById('r2-slider').value = 100;
    document.getElementById('r3').value = 150; document.getElementById('r3-slider').value = 150;
    document.getElementById('r4').value = 150; document.getElementById('r4-slider').value = 150;
    document.getElementById('r5').value = 282; document.getElementById('r5-slider').value = 282;
    computeWheatstoneBridge();
}

function initThemeEngine() {
    const htmlEl = document.documentElement;
    const themeToggle = document.getElementById('theme-toggle');
    const accentDots = document.querySelectorAll('.accent-pickers .dot');
    const savedTheme = localStorage.getItem('wb_theme') || 'dark';
    const savedAccent = localStorage.getItem('wb_accent') || 'cyan';

    htmlEl.setAttribute('data-theme', savedTheme);
    htmlEl.setAttribute('data-accent', savedAccent);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';

    themeToggle.addEventListener('click', () => {
        const newTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
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
