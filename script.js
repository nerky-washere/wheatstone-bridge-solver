let currentLang = localStorage.getItem('wb_lang') || 'en';
let isQuizMode = false;
let currentSolutions = { Req: 0, Vm: 0, Vn: 0, I5_mA: 0 };
let lastSolve = null;

// --- CẤU HÌNH CHẾ ĐỘ CẢM BIẾN CYBER-PHYSICAL & NHIỄU ĐO LƯỜNG ---
const N_EQ = 5;                // 5 ẩn dòng điện nhánh I1..I5 giống main.cpp
const T0_KELVIN = 298.15;      // Nhiệt độ chuẩn 25°C = 298.15K cho cảm biến NTC
const HVAC_DEADBAND_MV = 50;   // Vùng chết ±50 mV cho bộ điều khiển HVAC
const SPARK_CAPACITY = 60;     // Số mẫu lưu trên biểu đồ sparkline

let sensorMode = 'none';
let noiseSamples = [];
let noiseTimer = null;

const i18n = {
    en: {
        app_title: "WHEATSTONE BRIDGE SOLVER",
        unique_visitors: "UNIQUE VISITORS:",
        circuit_params: "Circuit Parameters",
        load_preset: "Load Balanced",
        theory_btn: "📖 Cheat Sheet",
        quiz_btn: "🎯 Practice Quiz",
        source_voltage: "Source Voltage (Vs) [V]",
        pmax_label: "Max Power Rating (P<sub>max</sub>)",
        pmax_opt1: "0.25 W (1/4 W Lab)",
        pmax_opt2: "0.50 W (1/2 W Standard)",
        pmax_opt3: "1.00 W (High Power)",
        pmax_opt4: "2.00 W (Industrial)",
        pmax_opt5: "∞ Unlimited (Ideal)",
        r1_label: "R1 [Ω]",
        r2_label: "R2 [Ω]",
        r3_label: "R3 [Ω]",
        r4_label: "R4 [Ω]",
        r5_label: "R5 (Galvanometer) [Ω]",
        lab_notes_label: "📝 Lab Notes",
        lab_notes_placeholder: "Type experimental notes or formulas...",
        heatmap_label: "🌡️ Voltage Heatmap:",
        particle_hint: "⚡ Dot speed & size ∝ Current (I)",
        analysis_results: "Analysis Results",
        req_label: "Equivalent Resistance",
        itotal_label: "Total Current",
        vm_label: "Node M Voltage",
        vn_label: "Node N Voltage",
        ig_label: "Galvanometer Current",
        u5_label: "Voltage Drop (U5)",
        branch_th: "Branch",
        current_th: "Current (I)",
        voltage_th: "Voltage (U)",
        power_th: "Power (P)",
        status_invalid: "Invalid Input",
        status_balanced: "Bridge Balanced",
        status_unbalanced: "Bridge Unbalanced",
        status_overloaded: "⚠️ Component Overloaded!",
        burnout_prefix: "THERMAL OVERLOAD: ",
        burnout_suffix: " exceeded max power rating and is overheating!",
        show_solution: "Show Step-by-Step Solution",
        hide_solution: "Hide Solution",
        step_1_title: "Step 1: System of Equations",
        kcl_nodes: "KCL at Nodes M & N:",
        kvl_loops: "KVL for 3 Loops:",
        step_2_title: "Step 2: Substitute Real Values",
        step_25_title: "Step 2.5: Augmented Matrix [A | b] & Partial Pivoting (main.cpp)",
        step_25_desc: "Exactly the 5×6 array passed to solveGauss() in main.cpp:",
        step_25_pivot: "Partial pivoting log (row swaps performed):",
        step_3_title: "Step 3: Solved Branch Currents",
        step_4_title: "Step 4: Law of Conservation of Energy Verification",
        step_4_desc: "The solution is only physically valid if generated power equals dissipated power:",
        step_4_residual: "Absolute residual |ΔP|",
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
        quiz_desc: "Results & heatmap are hidden! Calculate the circuit parameters using the random values on the left and enter your answers below (±2% tolerance):",
        quiz_ans_req: "R<sub>eq</sub> [Ω]",
        quiz_ans_vm: "V<sub>m</sub> [V]",
        quiz_ans_ig: "I<sub>5</sub> [mA] (+/-)",
        quiz_check: "Check Answer",
        quiz_new: "🎲 New Problem",
        quiz_reveal: "👁️ Give Up & Show Solution",
        quiz_msg_empty: "⚠️ Please enter all 3 values before checking!",
        quiz_msg_correct: "🎉 Excellent! All your calculations are accurate. Results unlocked!",
        quiz_msg_wrong: "❌ Not quite right. Check: ",
        quiz_msg_revealed: "💡 Solution unlocked! Review the step-by-step equations below.",

        // --- NÂNG CẤP 1: C++ CORE ENGINE INSPECTOR ---
        cpp_core_btn: "⚙️ C++ Core (main.cpp)",
        cpp_modal_title: "⚙️ C++ Core Engine & Architecture Inspector",
        cpp_modal_sub: "This application runs no 2×2 shortcut. Every value is computed by the exact 5×6 Gaussian Elimination with Partial Pivoting algorithm hand-written in main.cpp.",
        cpp_tab1: "Tab 1 — Live 5×6 Gaussian Trace",
        cpp_tab2: "Tab 2 — C++ CLI Terminal Simulator",
        cpp_tab3: "Tab 3 — Hand-Written C++ Source & Authorship",
        cpp_trace_params: "Current circuit parameters fed into solveGauss()",
        cpp_trace_initial: "1 — Initial augmented matrix [A | b] (5 rows × 6 cols)",
        cpp_trace_pivot: "2 — Partial pivoting: abs(matrix[r][c]) > abs(matrix[maxRow][c])",
        cpp_trace_upper: "3 — Upper-triangular matrix after forward elimination",
        cpp_trace_back: "4 — Back substitution → branch currents I1..I5",
        cpp_trace_power: "5 — Power conservation check (main.cpp lines 105–145)",
        cpp_cli_label: "Exact stdout of compiled main.cpp for the current parameters",
        cpp_run_btn: "▶ Run C++ CLI Simulation",
        cpp_running_btn: "⏳ Running...",
        cpp_copy_cli_btn: "📋 Copy C++ Output",
        cpp_download_btn: "⬇ Download main.cpp",
        cpp_copy_btn: "📋 Copy C++ Source",
        cpp_copied_btn: "✅ Copied!",
        cpp_copy_fail: "⚠️ Copy blocked by browser",
        cpp_source_label: "main.cpp — Hand-Written C++ Source Code",
        arch_title: "🏷️ Engineering Authorship & System Architecture Statement",
        arch_cpp_tag: "Core Mathematical & Physics Engine (main.cpp) — 100% Hand-Written in C++ by Trinh Dinh Nhat Quang",
        arch_cpp_body: "Independently formulated and implemented in C++ by Trinh Dinh Nhat Quang: 5×6 KCL/KVL linear system construction, Gaussian Elimination with Partial Pivoting (solveGauss), nodal potential derivation (V_M, V_N, V_MN), and rigorous verification of the Law of Conservation of Energy (P_source == P_consumed_total).",
        arch_web_tag: "Interactive Web UI & Cyber-Physical Telemetry Visualization",
        arch_web_body: "System architecture designed by Trinh Dinh Nhat Quang with AI-assisted frontend implementation (index.html, style.css, script.js), directly executing and visualizing the C++ mathematical core alongside transducer and sensor-noise models.",
        pivot_col: "Column",
        pivot_swap: "swap row {a} ↔ row {b} (largest |pivot| = {v})",
        pivot_noswap: "no swap needed, pivot already largest (|pivot| = {v})",
        pivot_none: "No row swaps were required for this parameter set.",
        power_src_label: "P_source = Vs · I_total",
        power_sum_label: "Σ P_k = Σ I_k² · R_k",
        power_res_label: "Residual |P_source − ΣP_k|",
        power_passed: "-> Power Conservation Check: PASSED (100% Exact)",
        power_failed: "-> Power Conservation Check: FAILED (Residual > 1e-4 W)",
        singular_matrix: "Singular matrix — solveGauss() returned false.",

        // --- NÂNG CẤP 2: CYBER-PHYSICAL SENSOR & NOISE LAB ---
        sensor_panel_title: "📡 Sensor & Lab Mode (Cyber-Physical Extension)",
        sensor_desc: "In real instrumentation, R4 is not a fixed resistor: it is a physical transducer exposed to temperature or mechanical strain.",
        sensor_mode_label: "Operation Mode on Branch R4",
        sensor_mode_none: "Mode 1 — Standard Fixed Resistor (Default)",
        sensor_mode_ntc: "Mode 2 — Smart Building HVAC: NTC Thermistor",
        sensor_mode_strain: "Mode 3 — Electric Race Car Telemetry: Strain Gauge (FSE)",
        sensor_locked: "🔒 Locked during Practice Quiz",
        ntc_formula: "R4(T) = R0 · exp[ B · (1/(T+273.15) − 1/(T0+273.15)) ], T0 = 25°C",
        ntc_temp_label: "Ambient Temperature T [°C]",
        ntc_r0_label: "R0 @ 25°C [Ω]",
        ntc_beta_label: "B constant [K]",
        strain_formula: "R4(ε) = R_nom · (1 + GF · ε),  ε = με × 10⁻⁶",
        strain_ue_label: "Mechanical Strain ε [με]",
        strain_rnom_label: "R_nominal [Ω]",
        strain_gf_label: "Gauge Factor (GF)",
        strain_gain_label: "Instr. Amp Gain (G)",
        sensor_live_r4: "Live transducer resistance R4",
        sensor_signal: "Bridge differential signal V_MN (U5)",
        sensor_gain_out: "Amplified output V_out = G · V_MN",
        sensor_balance_btn: "⚖️ Null the bridge at nominal (R1=R2=R3)",
        verdict_cooling: "🧊 V_MN = +{v} mV (> +{t} mV threshold) → Building zone warm: HVAC controller activates COOLING.",
        verdict_heating: "🔥 V_MN = {v} mV (< −{t} mV threshold) → Building zone cold: HVAC controller activates HEATING.",
        verdict_idle: "✅ |V_MN| = {v} mV (within ±{t} mV deadband) → Thermal equilibrium reached, HVAC idle.",
        verdict_tension: "🏎️ Tensile strain (+ε): R4 increased → V_MN = {v} mV. FSE telemetry logs suspension/chassis TENSION load.",
        verdict_compression: "🏎️ Compressive strain (−ε): R4 decreased → V_MN = {v} mV. FSE telemetry logs COMPRESSION load.",
        verdict_unloaded: "✅ Zero mechanical strain (ε ≈ 0 με) → Bridge nulled, structural member unloaded.",
        noise_enable_label: "🔀 Simulate Sensor Noise (±1% ~ ±5%) & Lab Error Check",
        noise_pct_label: "Noise amplitude [± %]",
        noise_window_label: "Moving-average window [N]",
        adc_bits_label: "ADC resolution",
        adc_ideal: "Ideal (no quantisation)",
        noise_resample_btn: "🔄 Resample ADC",
        lab_card_title: "🔬 Theory vs. Measurement Verification",
        lab_theory: "V_MN Theory (C++ Gauss Solver)",
        lab_measured: "V_MN Measured (with sensor noise)",
        lab_filtered: "Moving-average filtered",
        lab_err_raw: "Relative Error |% Error| (Raw)",
        lab_err_filtered: "Relative Error |% Error| (Filtered)",
        lab_note_off: "Enable noise to compare calculated physics against a noisy instrument.",
        lab_note_on: "Live telemetry acquisition active. Moving-average filtering suppresses random noise for reliable control feedback.",
        lab_note_nearzero: "⚠️ V_MN is near 0 V (balanced bridge), so relative % error magnifies tiny microvolt noise. Engineers specify sensor accuracy as % of Full Scale (%FS).",
        lab_samples: "Moving-average filtered (N={n})",
        lab_na: "0.00 % (Null)"
    },
    vi: {
        app_title: "BỘ GIẢI MẠCH CẦU WHEATSTONE",
        unique_visitors: "LƯỢT TRUY CẬP:",
        circuit_params: "Thông Số Mạch Điện",
        load_preset: "Mạch Cân Bằng",
        theory_btn: "📖 Bí Kíp",
        quiz_btn: "🎯 Luyện Tập",
        source_voltage: "Điện Áp Nguồn (Vs) [V]",
        pmax_label: "Công Suất Chịu Tải (P<sub>max</sub>)",
        pmax_opt1: "0.25 W (1/4 W Phòng Lab)",
        pmax_opt2: "0.50 W (1/2 W Tiêu chuẩn)",
        pmax_opt3: "1.00 W (Công suất cao)",
        pmax_opt4: "2.00 W (Công nghiệp)",
        pmax_opt5: "∞ Vô hạn (Lý tưởng)",
        r1_label: "Điện trở R1 [Ω]",
        r2_label: "Điện trở R2 [Ω]",
        r3_label: "Điện trở R3 [Ω]",
        r4_label: "Điện trở R4 [Ω]",
        r5_label: "R5 (Điện kế / Nhánh M-N) [Ω]",
        lab_notes_label: "📝 Ghi Chú Thực Nghiệm",
        lab_notes_placeholder: "Nhập ghi chú hoặc công thức...",
        heatmap_label: "🌡️ Bản Đồ Nhiệt Điện Thế:",
        particle_hint: "⚡ Tốc độ & độ lớn hạt ∝ Dòng điện (I)",
        analysis_results: "Kết Quả Phân Tích",
        req_label: "Điện Trở Tương Đương",
        itotal_label: "Dòng Điện Tổng",
        vm_label: "Điện Thế Nút M",
        vn_label: "Điện Thế Nút N",
        ig_label: "Dòng Qua Điện Kế",
        u5_label: "Độ Sụt Áp (U5)",
        branch_th: "Nhánh",
        current_th: "Dòng điện (I)",
        voltage_th: "Điện áp (U)",
        power_th: "Công suất (P)",
        status_invalid: "Đầu Vào Không Hợp Lệ",
        status_balanced: "Cầu Cân Bằng",
        status_unbalanced: "Cầu Lệch (Không Cân Bằng)",
        status_overloaded: "⚠️ Quá Tải Linh Kiện!",
        burnout_prefix: "CẢNH BÁO CHÁY NỔ: Điện trở ",
        burnout_suffix: " vượt quá công suất chịu tải định mức và đang bốc khói!",
        show_solution: "Hiển Thị Lời Giải Chi Tiết",
        hide_solution: "Ẩn Lời Giải",
        step_1_title: "Bước 1: Hệ phương trình Kirchhoff",
        kcl_nodes: "Định luật nút (KCL) tại M & N:",
        kvl_loops: "Định luật vòng (KVL) cho 3 vòng:",
        step_2_title: "Bước 2: Thay số vào hệ phương trình",
        step_25_title: "Bước 2.5: Ma trận mở rộng [A | b] & Chọn phần tử trụ (main.cpp)",
        step_25_desc: "Chính xác ma trận 5×6 được nạp vào hàm solveGauss() trong main.cpp:",
        step_25_pivot: "Nhật ký chọn phần tử trụ từng phần (Partial Pivoting):",
        step_3_title: "Bước 3: Kết quả Dòng điện các nhánh",
        step_4_title: "Bước 4: Kiểm chứng Định luật Bảo toàn Năng lượng",
        step_4_desc: "Nghiệm vật lý chỉ chính xác tuyệt đối khi công suất nguồn bằng tổng công suất tỏa nhiệt:",
        step_4_residual: "Sai lệch tuyệt đối |ΔP|",
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
        quiz_desc: "Kết quả và màu nhiệt đã được ẩn! Hãy tự tính toán dựa trên thông số bên trái và nhập đáp án vào dưới đây (sai số ±2%):",
        quiz_ans_req: "R<sub>tđ</sub> [Ω]",
        quiz_ans_vm: "V<sub>m</sub> [V]",
        quiz_ans_ig: "I<sub>5</sub> [mA] (+/-)",
        quiz_check: "Kiểm Tra Đáp Án",
        quiz_new: "🎲 Đổi Đề Khác",
        quiz_reveal: "👁️ Xem Đáp Án & Lời Giải",
        quiz_msg_empty: "⚠️ Vui lòng nhập đầy đủ cả 3 đáp án trước khi kiểm tra!",
        quiz_msg_correct: "🎉 Chính xác tuyệt đối! Đã mở khóa bảng kết quả và mô phỏng dòng điện!",
        quiz_msg_wrong: "❌ Chưa chính xác. Hãy kiểm tra lại: ",
        quiz_msg_revealed: "💡 Đã mở khóa đáp án! Bạn có thể xem chi tiết từng bước giải ở phía dưới.",

        // --- NÂNG CẤP 1: TRÌNH KIỂM TRA LÕI C++ ---
        cpp_core_btn: "⚙️ Lõi C++ (main.cpp)",
        cpp_modal_title: "⚙️ Trình Kiểm Tra Lõi C++ & Kiến Trúc Hệ Thống",
        cpp_modal_sub: "Ứng dụng không dùng mẹo định thức 2×2. Mọi kết quả đều được giải trực tiếp bằng thuật toán Khử Gauss 5×6 có Chọn Phần Tử Trụ Từng Phần do tôi tự viết trong main.cpp.",
        cpp_tab1: "Tab 1 — Vết Khử Gauss 5×6 Trực Tiếp",
        cpp_tab2: "Tab 2 — Giả Lập Terminal C++ CLI",
        cpp_tab3: "Tab 3 — Mã Nguồn C++ Tự Viết & Tác Giả",
        cpp_trace_params: "Thông số mạch hiện tại đang nạp vào hàm solveGauss()",
        cpp_trace_initial: "1 — Ma trận mở rộng ban đầu [A | b] (5 hàng × 6 cột)",
        cpp_trace_pivot: "2 — Chọn phần tử trụ từng phần: abs(matrix[r][c]) > abs(matrix[maxRow][c])",
        cpp_trace_upper: "3 — Ma trận tam giác trên sau khi khử xuôi",
        cpp_trace_back: "4 — Thế ngược (Back-substitution) → dòng điện nhánh I1..I5",
        cpp_trace_power: "5 — Kiểm tra bảo toàn công suất (main.cpp dòng 105–145)",
        cpp_cli_label: "Output chuẩn (stdout) của file main.cpp ứng với bộ thông số hiện tại",
        cpp_run_btn: "▶ Chạy Mô Phỏng C++ CLI",
        cpp_running_btn: "⏳ Đang thực thi...",
        cpp_copy_cli_btn: "📋 Copy C++ Output",
        cpp_download_btn: "⬇ Tải file main.cpp",
        cpp_copy_btn: "📋 Copy Mã Nguồn C++",
        cpp_copied_btn: "✅ Đã copy!",
        cpp_copy_fail: "⚠️ Trình duyệt chặn copy",
        cpp_source_label: "main.cpp — Mã Nguồn C++ Tự Viết 100%",
        arch_title: "🏷️ Tuyên Bố Quyền Tác Giả Kỹ Thuật & Kiến Trúc Hệ Thống",
        arch_cpp_tag: "Lõi Toán Học & Vật Lý (main.cpp) — 100% Tự Viết Bằng C++ bởi Trịnh Đình Nhật Quang",
        arch_cpp_body: "Được Trịnh Đình Nhật Quang độc lập xây dựng và lập trình hoàn toàn bằng C++: Thiết lập hệ 5 phương trình tuyến tính KCL/KVL dưới dạng ma trận 5×6, tự viết thuật toán Khử Gauss có chọn phần tử trụ từng phần (solveGauss), suy xuất điện thế nút (V_M, V_N, V_MN) và kiểm chứng Định luật Bảo toàn Năng lượng (P_source == P_consumed_total).",
        arch_web_tag: "Giao Diện Web Tương Tác & Mô Phỏng Telemetry Cyber-Physical",
        arch_web_body: "Kiến trúc tổng thể do Trịnh Đình Nhật Quang thiết kế cùng sự hỗ trợ chuyển thể giao diện từ AI (index.html, style.css, script.js), thực thi trực tiếp thuật toán lõi C++ kết hợp mô phỏng cảm biến nhiệt NTC, cảm biến biến dạng Strain Gauge và nhiễu đo lường thực nghiệm.",
        pivot_col: "Cột",
        pivot_swap: "hoán đổi hàng {a} ↔ hàng {b} (|phần tử trụ| lớn nhất = {v})",
        pivot_noswap: "giữ nguyên, phần tử trụ đã lớn nhất (|trụ| = {v})",
        pivot_none: "Bộ thông số này không cần hoán đổi hàng nào.",
        power_src_label: "P_source = Vs · I_total",
        power_sum_label: "Σ P_k = Σ I_k² · R_k",
        power_res_label: "Sai số |P_source − ΣP_k|",
        power_passed: "-> Power Conservation Check: PASSED (100% Exact)",
        power_failed: "-> Power Conservation Check: FAILED (Sai số > 1e-4 W)",
        singular_matrix: "Ma trận suy biến — solveGauss() trả về false.",

        // --- NÂNG CẤP 2: CHẾ ĐỘ CẢM BIẾN CYBER-PHYSICAL & NHIỄU THỰC NGHIỆM ---
        sensor_panel_title: "📡 Chế Độ Cảm Biến & Thực Nghiệm (Cyber-Physical Lab)",
        sensor_desc: "Trong kỹ thuật thực tế, R4 không phải điện trở tĩnh mà là cảm biến vật lý (Transducer) biến thiên theo nhiệt độ hoặc biến dạng cơ học.",
        sensor_mode_label: "Chế độ hoạt động nhánh R4 (Operation Mode)",
        sensor_mode_none: "Mode 1 — Điện Trở Tĩnh Tiêu Chuẩn (Mặc định)",
        sensor_mode_ntc: "Mode 2 — Tòa Nhà Thông Minh HVAC: Cảm Biến Nhiệt NTC",
        sensor_mode_strain: "Mode 3 — Telemetry Xe Đua Điện FSE: Cảm Biến Biến Dạng (Strain Gauge)",
        sensor_locked: "🔒 Đã khóa trong chế độ Luyện Tập",
        ntc_formula: "R4(T) = R0 · exp[ B · (1/(T+273.15) − 1/(T0+273.15)) ], T0 = 25°C",
        ntc_temp_label: "Nhiệt độ môi trường T [°C]",
        ntc_r0_label: "R0 tại 25°C [Ω]",
        ntc_beta_label: "Hằng số nhiệt B [K]",
        strain_formula: "R4(ε) = R_nom · (1 + GF · ε),  ε = με × 10⁻⁶",
        strain_ue_label: "Biến dạng cơ học ε [με]",
        strain_rnom_label: "Điện trở chuẩn R_nom [Ω]",
        strain_gf_label: "Hệ số nhạy Gauge Factor (GF)",
        strain_gain_label: "Độ lợi khuếch đại đo lường (G)",
        sensor_live_r4: "Điện trở cảm biến R4 tức thời",
        sensor_signal: "Tín hiệu điện áp lệch cầu V_MN (U5)",
        sensor_gain_out: "Tín hiệu sau khuếch đại V_out = G · V_MN",
        sensor_balance_btn: "⚖️ Cân bằng cầu tại điểm chuẩn (R1=R2=R3=R_nom)",
        verdict_cooling: "🧊 V_MN = +{v} mV (vượt ngưỡng +{t} mV) → Nhiệt độ tăng cao: Hệ thống tòa nhà kích hoạt LÀM MÁT tự động.",
        verdict_heating: "🔥 V_MN = {v} mV (thấp hơn −{t} mV) → Nhiệt độ xuống thấp: Hệ thống tòa nhà kích hoạt SƯỞI ẤM.",
        verdict_idle: "✅ |V_MN| = {v} mV (trong vùng chết ±{t} mV) → Nhiệt độ đạt chuẩn, hệ thống HVAC nghỉ.",
        verdict_tension: "🏎️ Biến dạng kéo (+ε): R4 tăng → V_MN = {v} mV. Telemetry xe đua FSE ghi nhận lực KÉO trên khung/hệ thống treo.",
        verdict_compression: "🏎️ Biến dạng nén (−ε): R4 giảm → V_MN = {v} mV. Telemetry xe đua FSE ghi nhận lực NÉN.",
        verdict_unloaded: "✅ Biến dạng bằng 0 (ε ≈ 0 με) → Cầu cân bằng, chi tiết cơ khí không chịu tải.",
        noise_enable_label: "🔀 Mô phỏng Nhiễu Cảm Biến (±1% ~ ±5%) & Kiểm Tra Sai Số Thực Nghiệm",
        noise_pct_label: "Biên độ nhiễu [± %]",
        noise_window_label: "Cửa sổ lọc trung bình trượt [N]",
        adc_bits_label: "Độ phân giải ADC",
        adc_ideal: "Lý tưởng (không lượng tử hóa)",
        noise_resample_btn: "🔄 Lấy mẫu lại ADC",
        lab_card_title: "🔬 Đối Chiếu Lý Thuyết & Thực Nghiệm (Lab Error Check)",
        lab_theory: "Lý thuyết V_MN Theory (C++ Gauss)",
        lab_measured: "Thực đo V_MN Measured (có nhiễu)",
        lab_filtered: "Sau bộ lọc trung bình trượt",
        lab_err_raw: "Sai số tương đối |% Error| (Thô)",
        lab_err_filtered: "Sai số tương đối |% Error| (Đã lọc)",
        lab_note_off: "Bật mô phỏng nhiễu để đối chiếu kết quả tính toán lý thuyết với số liệu đo thực nghiệm có nhiễu.",
        lab_note_on: "Đang thu thập dữ liệu đo có nhiễu. Bộ lọc trung bình trượt giúp triệt tiêu nhiễu ngẫu nhiên trước khi đưa vào bộ điều khiển.",
        lab_note_nearzero: "⚠️ V_MN đang rất gần 0 V (cầu cân bằng), khiến phép chia % sai số tương đối phóng đại nhiễu vi sai nhỏ. Trong thực tế, kỹ sư đánh giá theo % Toàn thang đo (%FS).",
        lab_samples: "Sau bộ lọc trung bình trượt (N={n})",
        lab_na: "0.00 % (Cân bằng)"
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

    const pmaxEl = document.getElementById('pmax');
    if (pmaxEl) pmaxEl.addEventListener('change', computeWheatstoneBridge);

    document.getElementById('preset-balanced').addEventListener('click', loadPreset);

    initTheoryModal();
    initCppInspector();
    initSensorAndNoiseLab();
    initQuizMode();
    initThemeEngine();
    computeWheatstoneBridge();
});

function initI18n() {
    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = currentLang === 'en' ? '🌐 EN' : '🌐 VN';

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'vi' : 'en';
        langToggle.textContent = currentLang === 'en' ? '🌐 EN' : '🌐 VN';
        localStorage.setItem('wb_lang', currentLang);
        applyTranslations();
        computeWheatstoneBridge();
    });

    const toggleBtn = document.getElementById('toggle-solution-btn');
    const solutionPanel = document.getElementById('solution-panel');

    toggleBtn.addEventListener('click', () => {
        if (isQuizMode) return;
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

/* ============================================================================
   NÂNG CẤP 1 — LÕI C++ GAUSSIAN ELIMINATION 5×6 & TRÌNH KIỂM TRA KIẾN TRÚC
   Chuyển thể nguyên bản 1:1 từ hàm solveGauss(double matrix[5][6], double I[5], int N)
   trong file main.cpp của Trịnh Đình Nhật Quang.
   ============================================================================ */

function buildKirchhoffMatrix(R1, R2, R3, R4, R5, Vs) {
    return [
        [ 1.0, -1.0,  0.0,  0.0, -1.0, 0.0 ], // KCL Node M: I1 - I2 - I5 = 0
        [ 0.0,  0.0,  1.0, -1.0,  1.0, 0.0 ], // KCL Node N: I3 - I4 + I5 = 0
        [  R1,  0.0,  -R3,  0.0,   R5, 0.0 ], // KVL Vòng trái (A-M-N-A): R1*I1 - R3*I3 + R5*I5 = 0
        [ 0.0,  -R2,  0.0,   R4,   R5, 0.0 ], // KVL Vòng phải (M-B-N-M): -R2*I2 + R4*I4 + R5*I5 = 0
        [  R1,   R2,  0.0,  0.0,  0.0,  Vs ]  // KVL Nhánh trên (A-M-B): R1*I1 + R2*I2 = Vs
    ];
}

function solveGauss(matrix, I, N) {
    const trace = { ok: false, steps: [], upper: null, backSub: [] };

    for (let c = 0; c < N; c++) {
        let maxRow = c;
        for (let r = c + 1; r < N; r++) {
            if (Math.abs(matrix[r][c]) > Math.abs(matrix[maxRow][c])) {
                maxRow = r;
            }
        }

        const step = { col: c, maxRow: maxRow, swapped: maxRow !== c, pivot: 0 };

        if (maxRow !== c) {
            for (let q = c; q <= N; q++) {
                const tmp = matrix[c][q];
                matrix[c][q] = matrix[maxRow][q];
                matrix[maxRow][q] = tmp;
            }
        }

        step.pivot = matrix[c][c];

        if (Math.abs(matrix[c][c]) < 1e-9) {
            trace.steps.push(step);
            return trace;
        }

        step.factors = [];
        for (let r = c + 1; r < N; r++) {
            const factor = matrix[r][c] / matrix[c][c];
            step.factors.push({ row: r, factor: factor });
            for (let q = c; q <= N; q++) {
                matrix[r][q] -= factor * matrix[c][q];
            }
        }

        step.snapshot = matrix.map(row => row.slice());
        trace.steps.push(step);
    }

    trace.upper = matrix.map(row => row.slice());

    for (let k = N - 1; k >= 0; k--) {
        let sum = matrix[k][N];
        const terms = [];
        for (let m = k + 1; m < N; m++) {
            sum -= matrix[k][m] * I[m];
            terms.push({ col: m, coeff: matrix[k][m], value: I[m] });
        }
        I[k] = sum / matrix[k][k];
        trace.backSub.unshift({ k: k, terms: terms, divisor: matrix[k][k], result: I[k] });
    }

    trace.ok = true;
    return trace;
}

function solveBridgeViaCppEngine(R1, R2, R3, R4, R5, Vs) {
    const initial = buildKirchhoffMatrix(R1, R2, R3, R4, R5, Vs);
    const work = initial.map(row => row.slice());
    const I = new Array(N_EQ).fill(0);
    const trace = solveGauss(work, I, N_EQ);

    if (!trace.ok) return { ok: false, initial: initial, trace: trace };

    const R = [R1, R2, R3, R4, R5];
    const I_total = I[0] + I[2];
    const Req = I_total > 0 ? Vs / I_total : 0;

    const V_M = Vs - (I[0] * R1);
    const V_N = Vs - (I[2] * R3);
    const V_MN = V_M - V_N;

    const P = R.map((r, idx) => I[idx] * I[idx] * r);
    const P_consumed_total = P.reduce((a, b) => a + b, 0);
    const P_source = Vs * I_total;
    const residual = Math.abs(P_source - P_consumed_total);

    return {
        ok: true,
        initial: initial,
        trace: trace,
        I: I,
        R: R,
        Vs: Vs,
        U: [Vs - V_M, V_M, Vs - V_N, V_N, V_MN],
        P: P,
        I_total: I_total,
        Req: Req,
        V_M: V_M,
        V_N: V_N,
        V_MN: V_MN,
        P_source: P_source,
        P_consumed_total: P_consumed_total,
        residual: residual,
        powerOk: residual < 1e-4
    };
}

const ROW_TAGS = ['KCL M', 'KCL N', 'KVL L1', 'KVL L2', 'KVL L3'];

function fmtCell(v) {
    if (Math.abs(v) < 1e-12) return '0';
    if (Number.isInteger(v) && Math.abs(v) < 1e6) return String(v);
    if (Math.abs(v) >= 1e5 || Math.abs(v) < 1e-3) return v.toExponential(2);
    return Number(v.toFixed(3)).toString();
}

function renderMatrix(hostId, matrix, opts) {
    const host = document.getElementById(hostId);
    if (!host || !matrix) return;
    const o = opts || {};
    const swapped = o.swappedRows || [];
    const showTags = o.showTags !== false;

    const headerCols = ['I₁', 'I₂', 'I₃', 'I₄', 'I₅', 'b'].map((lbl, c) =>
        `<td class="${c === N_EQ ? 'bar-col' : ''}" style="font-weight:700; color:var(--accent);">${lbl}</td>`
    ).join('');
    const headerRow = `<tr style="border-bottom:1px solid var(--border-color);">${showTags ? '<td class="row-tag">Eq</td>' : ''}${headerCols}</tr>`;

    const rows = matrix.map((row, r) => {
        const cells = row.map((v, c) => {
            const cls = [];
            if (c === N_EQ) cls.push('bar-col');
            else if (Math.abs(v) < 1e-12) cls.push('zero-val');
            if (o.markPivots && r === c) cls.push('pivot-cell');
            return `<td class="${cls.join(' ')}">${fmtCell(v)}</td>`;
        }).join('');
        const tag = showTags ? `<td class="row-tag">${o.tags ? o.tags[r] : ROW_TAGS[r]}</td>` : '';
        return `<tr class="${swapped.indexOf(r) !== -1 ? 'swapped-row' : ''}">${tag}${cells}</tr>`;
    }).join('');

    host.innerHTML = `<table class="matrix-table">${headerRow}${rows}</table>`;
}

function renderPivotLog(hostId, trace) {
    const host = document.getElementById(hostId);
    if (!host || !trace) return;
    const dict = i18n[currentLang];

    const lines = trace.steps.map(s => {
        const pv = Math.abs(s.pivot);
        if (s.swapped) {
            const msg = dict.pivot_swap
                .replace('{a}', s.col)
                .replace('{b}', s.maxRow)
                .replace('{v}', fmtCell(pv));
            return `<div class="pivot-line swap"><b>${dict.pivot_col} ${s.col}:</b> ${msg}</div>`;
        }
        const msg = dict.pivot_noswap.replace('{v}', fmtCell(pv));
        return `<div class="pivot-line noswap"><b>${dict.pivot_col} ${s.col}:</b> ${msg}</div>`;
    });

    if (trace.steps.every(s => !s.swapped)) {
        lines.push(`<div class="pivot-line noswap">${dict.pivot_none}</div>`);
    }
    host.innerHTML = lines.join('');
}

function renderBackSub(hostId, sol) {
    const host = document.getElementById(hostId);
    if (!host || !sol || !sol.ok) return;
    host.innerHTML = sol.trace.backSub.map(b => {
        const terms = b.terms.length
            ? ' − ' + b.terms.map(t => `(${fmtCell(t.coeff)} · I${t.col + 1})`).join(' − ')
            : '';
        return `<div class="back-sub-line">I<sub>${b.k + 1}</sub> = [ b<sub>${b.k}</sub>${terms} ] / ${fmtCell(b.divisor)} = ` +
               `<b>${sol.I[b.k].toFixed(6)} A</b> (${(sol.I[b.k] * 1000).toFixed(3)} mA)</div>`;
    }).join('');
}

function renderPowerCheck(hostId, sol) {
    const host = document.getElementById(hostId);
    if (!host || !sol || !sol.ok) return;
    const dict = i18n[currentLang];
    const verdictCls = sol.powerOk ? 'passed' : 'failed';
    const verdictTxt = sol.powerOk ? dict.power_passed : dict.power_failed;

    host.innerHTML =
        `<div class="power-check-row"><span>${dict.power_src_label}</span><strong>${sol.P_source.toFixed(6)} W</strong></div>` +
        `<div class="power-check-row"><span>${dict.power_sum_label}</span><strong>${sol.P_consumed_total.toFixed(6)} W</strong></div>` +
        `<div class="power-check-row"><span>${dict.power_res_label}</span><strong>${sol.residual.toExponential(3)} W</strong></div>` +
        `<div class="power-verdict ${verdictCls}">${verdictTxt}</div>`;
}

const CPP_BAR = '================================================================';

function f4(v) { return Number(v).toFixed(4); }
function echoNum(v) { return String(Math.round(Number(v) * 1000) / 1000); }

function buildTerminalLines(R1, R2, R3, R4, R5, Vs, sol) {
    const L = [];
    L.push(CPP_BAR);
    L.push('                WHEATSTONE BRIDGE CIRCUIT SOLVER                ');
    L.push(CPP_BAR);
    L.push('                       CIRCUIT SCHEMATIC                        ');
    L.push('       +----------[ R1 ]----------+----------[ R2 ]----------+  ');
    L.push('       |                          |                          |  ');
    L.push('  o----+                          |                          +----o');
    L.push(' (+Vs) |                        [ R5 ]                       |   (GND)');
    L.push('       |                          |                          |  ');
    L.push('       +----------[ R3 ]----------+----------[ R4 ]----------+  ');
    L.push(CPP_BAR);
    L.push('');
    L.push('Enter R1 (Ohm)  : ' + echoNum(R1));
    L.push('Enter R2 (Ohm)  : ' + echoNum(R2));
    L.push('Enter R3 (Ohm)  : ' + echoNum(R3));
    L.push('Enter R4 (Ohm)  : ' + echoNum(R4));
    L.push('Enter R5 (Ohm)  : ' + echoNum(R5));
    L.push('Enter Vs (Volt) : ' + echoNum(Vs));

    if (R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0 || Vs <= 0) {
        L.push('');
        L.push('[Error]: All resistance values and source voltage must be greater than 0!');
        return L;
    }

    if (!sol || !sol.ok) {
        L.push('');
        L.push('[Error]: Unable to solve system of equations (Singular matrix)!');
        return L;
    }

    L.push('');
    L.push(CPP_BAR);
    L.push('                        ANALYSIS RESULTS                        ');
    L.push(CPP_BAR);
    L.push('BRANCH CURRENTS:');
    for (let i = 0; i < N_EQ; i++) {
        L.push(' - I' + (i + 1) + ' = ' + f4(sol.I[i]) + ' A (' + f4(sol.I[i] * 1000) + ' mA)');
    }
    L.push('');
    L.push('NODE VOLTAGES & BRIDGE DIFFERENTIAL:');
    L.push(' - Node M Potential (V_M) = ' + f4(sol.V_M) + ' V');
    L.push(' - Node N Potential (V_N) = ' + f4(sol.V_N) + ' V');
    L.push(' - Voltage Difference V_MN = ' + f4(sol.V_MN) + ' V');
    L.push('');
    L.push('BRIDGE STATE:');
    if (Math.abs(sol.I[4]) < 1e-6) {
        L.push(' -> BALANCED WHEATSTONE BRIDGE (I5 = 0 A, V_MN = 0 V)');
    } else {
        L.push(' -> UNBALANCED WHEATSTONE BRIDGE');
    }
    L.push('');
    L.push('TOTAL CIRCUIT & ENERGY PARAMETERS:');
    L.push(' - Total Current (I_total) = ' + f4(sol.I_total) + ' A');
    L.push(' - Equivalent Resistance (Req) = ' + f4(sol.Req) + ' Ohm');
    L.push(' - Source Power (P_source) = ' + f4(sol.P_source) + ' Watt');
    L.push(' - Total Power Dissipating on Resistors = ' + f4(sol.P_consumed_total) + ' Watt');
    if (sol.powerOk) {
        L.push(' -> Power Conservation Check: PASSED (100% Exact)');
    }
    L.push(CPP_BAR);
    return L;
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderTerminal(lines) {
    const host = document.getElementById('terminal-body');
    if (!host) return;
    host.textContent = lines.join('\n');
}

let cliAnimToken = 0;

function runCliAnimation(lines) {
    const host = document.getElementById('terminal-body');
    const btn = document.getElementById('run-cli-btn');
    if (!host) return;

    const token = ++cliAnimToken;
    const dict = i18n[currentLang];
    if (btn) { btn.disabled = true; btn.textContent = dict.cpp_running_btn; }

    host.textContent = '';
    let idx = 0;

    const tick = () => {
        if (token !== cliAnimToken) return;
        if (idx >= lines.length) {
            host.innerHTML = escapeHtml(lines.join('\n')) + '<span class="term-cursor"> </span>';
            if (btn) { btn.disabled = false; btn.textContent = i18n[currentLang].cpp_run_btn; }
            return;
        }
        host.textContent = lines.slice(0, idx + 1).join('\n');
        host.scrollTop = host.scrollHeight;
        const isPrompt = lines[idx].indexOf('Enter ') === 0;
        idx++;
        setTimeout(tick, isPrompt ? 75 : 18);
    };
    tick();
}

const CPP_KEYWORDS = ['bool', 'for', 'if', 'else', 'return', 'true', 'false', 'using', 'namespace'];
const CPP_TYPES = ['double', 'int', 'void', 'const', 'std'];
const CPP_FNS = ['cout', 'cin', 'endl', 'swap', 'abs', 'fixed', 'setprecision', 'solveGauss', 'main'];

function getCppSource() {
    const el = document.getElementById('cpp-source-raw');
    if (!el) return '';
    return el.textContent.replace(/^\s*\n/, '').replace(/\s+$/, '') + '\n';
}

function highlightCpp(src) {
    const esc = escapeHtml(src);
    const kw = CPP_KEYWORDS.join('|');
    const ty = CPP_TYPES.join('|');
    const fn = CPP_FNS.join('|');

    const re = new RegExp(
        '(\\/\\/[^\\n]*)' +
        '|(^[ \\t]*#[^\\n]*)' +
        '|("(?:[^"\\\\]|\\\\.)*")' +
        '|\\b(\\d+\\.?\\d*(?:[eE]-?\\d+)?)\\b' +
        '|\\b(' + kw + ')\\b' +
        '|\\b(' + ty + ')\\b' +
        '|\\b(' + fn + ')\\b',
        'gm'
    );

    return esc.replace(re, (m, com, pre, str, num, key, type, func) => {
        if (com)  return `<span class="tok-com">${com}</span>`;
        if (pre)  return `<span class="tok-pre">${pre}</span>`;
        if (str)  return `<span class="tok-str">${str}</span>`;
        if (num)  return `<span class="tok-num">${num}</span>`;
        if (key)  return `<span class="tok-key">${key}</span>`;
        if (type) return `<span class="tok-type">${type}</span>`;
        if (func) return `<span class="tok-fn">${func}</span>`;
        return m;
    });
}

function downloadCppSource() {
    const blob = new Blob([getCppSource()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.cpp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyTextWithFeedback(text, btn, defaultI18nKey) {
    const dict = i18n[currentLang];
    let ok = false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            ok = true;
        }
    } catch (e) { ok = false; }

    if (!ok) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.top = '-1000px';
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand('copy');
            document.body.removeChild(ta);
        } catch (e) { ok = false; }
    }

    if (btn) {
        btn.textContent = ok ? dict.cpp_copied_btn : dict.cpp_copy_fail;
        setTimeout(() => { btn.textContent = i18n[currentLang][defaultI18nKey]; }, 1800);
    }
}

function initCppInspector() {
    const openBtn = document.getElementById('open-cpp-btn');
    const modal = document.getElementById('cpp-modal');
    const closeBtn = document.getElementById('close-cpp-btn');
    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        if (isQuizMode) return;
        modal.classList.add('show');
        refreshCppInspector();
    });
    closeBtn.addEventListener('click', () => modal.classList.remove('show'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('show');
            const theory = document.getElementById('theory-modal');
            if (theory) theory.classList.remove('show');
        }
    });

    document.querySelectorAll('.cpp-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            document.querySelectorAll('.cpp-tab').forEach(t => t.classList.toggle('active', t === tab));
            document.querySelectorAll('.cpp-pane').forEach(p => {
                p.classList.toggle('active', p.id === 'cpp-pane-' + target);
            });
            if (target === 'cli') {
                runCliAnimation(lastSolve ? lastSolve.lines : []);
            }
        });
    });

    const runCliBtn = document.getElementById('run-cli-btn');
    if (runCliBtn) {
        runCliBtn.addEventListener('click', () => {
            runCliAnimation(lastSolve ? lastSolve.lines : []);
        });
    }

    const copyCliBtn = document.getElementById('copy-cli-btn');
    if (copyCliBtn) {
        copyCliBtn.addEventListener('click', (e) => {
            const outText = lastSolve ? lastSolve.lines.join('\n') : '';
            copyTextWithFeedback(outText, e.currentTarget, 'cpp_copy_cli_btn');
        });
    }

    const dlBtn1 = document.getElementById('download-cpp-btn');
    const dlBtn2 = document.getElementById('download-cpp-btn2');
    if (dlBtn1) dlBtn1.addEventListener('click', downloadCppSource);
    if (dlBtn2) dlBtn2.addEventListener('click', downloadCppSource);

    const cpBtn2 = document.getElementById('copy-cpp-btn2');
    if (cpBtn2) {
        cpBtn2.addEventListener('click', (e) => {
            copyTextWithFeedback(getCppSource(), e.currentTarget, 'cpp_copy_btn');
        });
    }

    const codeHost = document.getElementById('cpp-code-host');
    if (codeHost) codeHost.innerHTML = highlightCpp(getCppSource());
}

function refreshCppInspector() {
    if (!lastSolve) return;
    const dict = i18n[currentLang];
    const s = lastSolve;
    const sol = s.sol;

    const chips = [
        ['R1', echoNum(s.R1) + ' Ω'],
        ['R2', echoNum(s.R2) + ' Ω'],
        ['R3', echoNum(s.R3) + ' Ω'],
        ['R4', echoNum(s.R4) + ' Ω'],
        ['R5', echoNum(s.R5) + ' Ω'],
        ['Vs', echoNum(s.Vs) + ' V']
    ];
    const paramsHost = document.getElementById('cpp-params');
    if (paramsHost) {
        paramsHost.innerHTML = chips
            .map(c => `<span class="cpp-param-chip"><b>${c[0]}</b> = ${c[1]}</span>`)
            .join('');
    }

    renderMatrix('cpp-matrix-initial', sol.initial, { markPivots: false });

    if (!sol.ok) {
        const upper = document.getElementById('cpp-matrix-upper');
        const back = document.getElementById('cpp-back-sub');
        const power = document.getElementById('cpp-power-check');
        renderPivotLog('cpp-pivot-log', sol.trace);
        if (upper) upper.innerHTML = `<div class="pivot-line swap">${dict.singular_matrix}</div>`;
        if (back) back.innerHTML = '';
        if (power) power.innerHTML = '';
        renderTerminal(s.lines);
        return;
    }

    const swappedRows = [];
    sol.trace.steps.forEach(st => {
        if (st.swapped) {
            if (swappedRows.indexOf(st.col) === -1) swappedRows.push(st.col);
            if (swappedRows.indexOf(st.maxRow) === -1) swappedRows.push(st.maxRow);
        }
    });

    renderPivotLog('cpp-pivot-log', sol.trace);
    renderMatrix('cpp-matrix-upper', sol.trace.upper, { markPivots: true, swappedRows: swappedRows });
    renderBackSub('cpp-back-sub', sol);
    renderPowerCheck('cpp-power-check', sol);
    renderTerminal(s.lines);
}

/* ============================================================================
   NÂNG CẤP 2 — CHẾ ĐỘ CẢM BIẾN CYBER-PHYSICAL & NHIỄU THỰC NGHIỆM
   ============================================================================ */

function ntcResistance(tempC, R0, B) {
    const T = tempC + 273.15;
    if (T <= 0) return R0;
    return R0 * Math.exp(B * (1 / T - 1 / T0_KELVIN));
}

function strainResistance(microstrain, Rnom, GF) {
    return Rnom * (1 + GF * (microstrain * 1e-6));
}

function readNum(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return fallback;
    const v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
}

function getTransducerR4() {
    if (sensorMode === 'ntc') {
        const R0 = Math.max(1, readNum('ntc-r0', 100));
        const B = Math.max(1, readNum('ntc-beta', 3950));
        const T = readNum('ntc-temp', 25);
        return Math.max(0.1, ntcResistance(T, R0, B));
    }
    if (sensorMode === 'strain') {
        const Rnom = Math.max(1, readNum('strain-rnom', 350));
        const GF = Math.max(0.1, readNum('strain-gf', 2.0));
        const ue = readNum('strain-ue', 0);
        return Math.max(0.1, strainResistance(ue, Rnom, GF));
    }
    return null;
}

function gaussianNoise() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(-3, Math.min(3, z));
}

function sampleNoisyVmn(vTheory, Vs, pct, bits) {
    const refScale = Math.max(Math.abs(vTheory), Math.abs(Vs) * 0.05, 1e-4);
    const sigma = (pct / 100) * refScale / 2;
    let v = vTheory + gaussianNoise() * sigma;

    if (bits > 0) {
        const lsb = (2 * Math.abs(Vs)) / Math.pow(2, bits);
        if (lsb > 0) v = Math.round(v / lsb) * lsb;
    }
    return v;
}

function formatVolts(v) {
    const a = Math.abs(v);
    if (a < 1e-9) return '0.000 V (0.00 mV)';
    if (a < 1.0) return `${(v * 1000).toFixed(2)} mV (${v.toFixed(4)} V)`;
    return `${v.toFixed(4)} V (${(v * 1000).toFixed(1)} mV)`;
}

function errClass(pct) {
    if (!isFinite(pct)) return 'err-good';
    if (pct < 1.5) return 'err-good';
    if (pct < 5.0) return 'err-warn';
    return 'err-bad';
}

function renderSparkline(theory, samples) {
    const poly = document.getElementById('spark-trace');
    const line = document.getElementById('spark-theory-line');
    if (!poly || !line) return;

    if (!samples.length) {
        poly.setAttribute('points', '');
        line.setAttribute('y1', '27');
        line.setAttribute('y2', '27');
        return;
    }

    const W = 300, H = 54, pad = 5;
    const all = samples.concat([theory]);
    let lo = Math.min.apply(null, all);
    let hi = Math.max.apply(null, all);
    if (hi - lo < 1e-6) { hi += 1e-3; lo -= 1e-3; }

    const y = v => pad + (H - 2 * pad) * (1 - (v - lo) / (hi - lo));
    const step = samples.length > 1 ? W / (samples.length - 1) : W;

    poly.setAttribute('points', samples.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' '));
    const ty = y(theory).toFixed(1);
    line.setAttribute('y1', ty);
    line.setAttribute('y2', ty);
}

function buildSensorVerdict(vmn) {
    const dict = i18n[currentLang];
    const mv = vmn * 1000;
    const mvStr = mv.toFixed(2);

    if (sensorMode === 'ntc') {
        if (mv > HVAC_DEADBAND_MV) {
            return { cls: 'cooling', text: dict.verdict_cooling.replace('{v}', mvStr).replace('{t}', HVAC_DEADBAND_MV) };
        }
        if (mv < -HVAC_DEADBAND_MV) {
            return { cls: 'heating', text: dict.verdict_heating.replace('{v}', mvStr).replace('{t}', HVAC_DEADBAND_MV) };
        }
        return { cls: 'idle', text: dict.verdict_idle.replace('{v}', Math.abs(mv).toFixed(2)).replace('{t}', HVAC_DEADBAND_MV) };
    }

    const ue = readNum('strain-ue', 0);
    if (Math.abs(ue) < 1) return { cls: 'idle', text: dict.verdict_unloaded };
    if (ue > 0) return { cls: 'tension', text: dict.verdict_tension.replace('{v}', mvStr) };
    return { cls: 'compression', text: dict.verdict_compression.replace('{v}', mvStr) };
}

function updateSensorAndLabPanels(sol) {
    const sensorPanel = document.getElementById('sensor-panel');
    const blockNtc = document.getElementById('sensor-block-ntc');
    const blockStrain = document.getElementById('sensor-block-strain');
    const readout = document.getElementById('sensor-readout');
    const gainRow = document.getElementById('sensor-gain-row');
    const noiseParams = document.getElementById('noise-params');
    const noiseEnabled = !!(document.getElementById('noise-enable') || {}).checked;
    const r4Card = document.getElementById('r4-group-card');
    const boxR4 = document.getElementById('box-r4');
    const svgR4Label = document.getElementById('svg-r4-label');

    if (blockNtc) blockNtc.style.display = sensorMode === 'ntc' ? 'flex' : 'none';
    if (blockStrain) blockStrain.style.display = sensorMode === 'strain' ? 'flex' : 'none';
    if (sensorPanel) sensorPanel.classList.toggle('sensor-active', sensorMode !== 'none' || noiseEnabled);
    if (r4Card) r4Card.classList.toggle('transducer-driven', sensorMode !== 'none');
    if (boxR4) boxR4.classList.toggle('sensor-highlight', sensorMode !== 'none');

    if (svgR4Label) {
        if (sensorMode === 'ntc') svgR4Label.textContent = 'R4 (NTC)';
        else if (sensorMode === 'strain') svgR4Label.textContent = 'R4 (ε)';
        else svgR4Label.textContent = 'R4';
    }

    if (noiseParams) noiseParams.style.display = noiseEnabled ? 'grid' : 'none';
    if (readout) readout.style.display = sensorMode === 'none' ? 'none' : 'flex';

    if (sensorMode !== 'none' && sol && sol.ok) {
        const r4El = document.getElementById('sensor-r4-value');
        const vmnEl = document.getElementById('sensor-vmn-value');
        if (r4El) r4El.textContent = sol.R[3].toFixed(3) + ' Ω';
        if (vmnEl) vmnEl.textContent = formatVolts(sol.V_MN);

        const showGain = sensorMode === 'strain';
        if (gainRow) gainRow.style.display = showGain ? 'flex' : 'none';
        if (showGain) {
            const G = Math.max(1, readNum('strain-gain', 100));
            const gEl = document.getElementById('sensor-gain-value');
            if (gEl) gEl.textContent = formatVolts(G * sol.V_MN) + ` (G = ${G}×)`;
        }

        const verdict = buildSensorVerdict(sol.V_MN);
        const vEl = document.getElementById('sensor-verdict');
        if (vEl) {
            vEl.textContent = verdict.text;
            vEl.className = 'sensor-verdict ' + verdict.cls;
        }
    }

    const dict = i18n[currentLang];
    const theoryEl = document.getElementById('lab-theory');
    const measEl = document.getElementById('lab-measured');
    const filtEl = document.getElementById('lab-filtered');
    const errRawEl = document.getElementById('lab-err-raw');
    const errFiltEl = document.getElementById('lab-err-filtered');
    const noteEl = document.getElementById('lab-note');
    const filtLabel = document.getElementById('lab-filtered-label');

    if (!theoryEl || !sol || !sol.ok) return;

    const vTheory = sol.V_MN;
    theoryEl.textContent = formatVolts(vTheory);

    if (!noiseEnabled || isQuizMode) {
        noiseSamples = [];
        const dash = '—';
        measEl.textContent = dash;
        filtEl.textContent = dash;
        errRawEl.textContent = dash;
        errFiltEl.textContent = dash;
        errRawEl.className = '';
        errFiltEl.className = '';
        if (filtLabel) filtLabel.textContent = dict.lab_filtered;
        if (noteEl) noteEl.textContent = dict.lab_note_off;
        renderSparkline(vTheory, []);
        return;
    }

    const pct = Math.max(0.1, readNum('noise-pct', 2));
    const bits = parseInt((document.getElementById('adc-bits') || {}).value || '12', 10) || 0;
    const windowN = Math.max(1, Math.min(200, Math.round(readNum('noise-window', 16))));

    const measured = sampleNoisyVmn(vTheory, sol.Vs, pct, bits);
    noiseSamples.push(measured);
    while (noiseSamples.length > Math.max(windowN, SPARK_CAPACITY)) noiseSamples.shift();

    const windowSlice = noiseSamples.slice(-windowN);
    const filtered = windowSlice.reduce((a, b) => a + b, 0) / windowSlice.length;

    const denom = Math.abs(vTheory);
    const errRaw = denom > 1e-4 ? Math.abs((measured - vTheory) / vTheory) * 100 : Infinity;
    const errFilt = denom > 1e-4 ? Math.abs((filtered - vTheory) / vTheory) * 100 : Infinity;

    measEl.textContent = formatVolts(measured);
    filtEl.textContent = formatVolts(filtered);
    if (filtLabel) filtLabel.textContent = dict.lab_samples.replace('{n}', windowSlice.length);

    errRawEl.textContent = isFinite(errRaw) ? errRaw.toFixed(2) + ' %' : dict.lab_na;
    errFiltEl.textContent = isFinite(errFilt) ? errFilt.toFixed(2) + ' %' : dict.lab_na;
    errRawEl.className = errClass(errRaw);
    errFiltEl.className = errClass(errFilt);

    if (noteEl) {
        noteEl.textContent = denom <= 1e-4 ? dict.lab_note_nearzero : dict.lab_note_on;
    }
    renderSparkline(vTheory, noiseSamples.slice(-SPARK_CAPACITY));
}

function syncTransducerToR4Input() {
    if (sensorMode === 'none') return;
    const r4Val = getTransducerR4();
    if (r4Val === null) return;

    const r4Input = document.getElementById('r4');
    const r4Slider = document.getElementById('r4-slider');
    if (r4Input) r4Input.value = Number(r4Val.toFixed(2));
    if (r4Slider) r4Slider.value = Math.max(1, Math.min(1000, Math.round(r4Val)));
}

function initSensorAndNoiseLab() {
    const toggleBtn = document.getElementById('sensor-panel-toggle');
    const body = document.getElementById('sensor-panel-body');
    const chevron = document.getElementById('sensor-chevron');

    if (toggleBtn && body) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = body.classList.toggle('collapsed');
            if (chevron) chevron.classList.toggle('collapsed', isCollapsed);
            toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
        });
    }

    const modeSelect = document.getElementById('sensor-mode');
    if (modeSelect) {
        modeSelect.addEventListener('change', () => {
            sensorMode = modeSelect.value;
            noiseSamples = [];
            if (sensorMode === 'ntc') {
                const r0 = Math.max(1, readNum('ntc-r0', 100));
                ['r1', 'r2', 'r3'].forEach(id => {
                    document.getElementById(id).value = r0;
                    document.getElementById(id + '-slider').value = Math.min(1000, r0);
                });
            } else if (sensorMode === 'strain') {
                const rnom = Math.max(1, readNum('strain-rnom', 350));
                ['r1', 'r2', 'r3'].forEach(id => {
                    document.getElementById(id).value = rnom;
                    document.getElementById(id + '-slider').value = Math.min(1000, rnom);
                });
            }
            syncTransducerToR4Input();
            computeWheatstoneBridge();
        });
    }

    // Đồng bộ thanh trượt Nhiệt độ NTC và Biến dạng Strain Gauge
    setupSyncSensorPair('ntc-temp', 'ntc-temp-slider');
    setupSyncSensorPair('strain-ue', 'strain-ue-slider');

    ['ntc-r0', 'ntc-beta', 'strain-rnom', 'strain-gf', 'strain-gain'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                syncTransducerToR4Input();
                computeWheatstoneBridge();
            });
            el.addEventListener('change', () => {
                syncTransducerToR4Input();
                computeWheatstoneBridge();
            });
        }
    });

    // Nếu người dùng tự chỉnh tay thanh trượt R4 khi đang ở chế độ cảm biến, tự trả về Mode 1
    ['r4', 'r4-slider'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('pointerdown', () => {
                if (sensorMode !== 'none' && modeSelect) {
                    sensorMode = 'none';
                    modeSelect.value = 'none';
                }
            });
        }
    });

    const balanceBtn = document.getElementById('sensor-balance-btn');
    if (balanceBtn) {
        balanceBtn.addEventListener('click', () => {
            const targetR = sensorMode === 'ntc'
                ? Math.max(1, readNum('ntc-r0', 100))
                : Math.max(1, readNum('strain-rnom', 350));
            ['r1', 'r2', 'r3'].forEach(id => {
                document.getElementById(id).value = targetR;
                document.getElementById(id + '-slider').value = Math.min(1000, targetR);
            });
            noiseSamples = [];
            syncTransducerToR4Input();
            computeWheatstoneBridge();
        });
    }

    const noiseEnable = document.getElementById('noise-enable');
    if (noiseEnable) {
        noiseEnable.addEventListener('change', () => {
            noiseSamples = [];
            if (noiseTimer) { clearInterval(noiseTimer); noiseTimer = null; }
            if (noiseEnable.checked) {
                noiseTimer = setInterval(() => {
                    if (!isQuizMode && lastSolve && lastSolve.sol) {
                        updateSensorAndLabPanels(lastSolve.sol);
                    }
                }, 450);
            }
            computeWheatstoneBridge();
        });
    }

    ['noise-pct', 'noise-window', 'adc-bits'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                noiseSamples = [];
                if (lastSolve && lastSolve.sol) updateSensorAndLabPanels(lastSolve.sol);
            });
            el.addEventListener('change', () => {
                noiseSamples = [];
                if (lastSolve && lastSolve.sol) updateSensorAndLabPanels(lastSolve.sol);
            });
        }
    });

    const resampleBtn = document.getElementById('resample-noise-btn');
    if (resampleBtn) {
        resampleBtn.addEventListener('click', () => {
            if (lastSolve && lastSolve.sol) updateSensorAndLabPanels(lastSolve.sol);
        });
    }
}

function setupSyncSensorPair(inputId, sliderId) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    if (!input || !slider) return;

    input.addEventListener('input', () => {
        slider.value = input.value;
        syncTransducerToR4Input();
        computeWheatstoneBridge();
    });
    slider.addEventListener('input', () => {
        input.value = slider.value;
        syncTransducerToR4Input();
        computeWheatstoneBridge();
    });
}

/* ============================================================================
   CHẾ ĐỘ LUYỆN TẬP (QUIZ MODE)
   ============================================================================ */

function initQuizMode() {
    document.getElementById('start-quiz-btn').addEventListener('click', startNewQuiz);
    document.getElementById('new-quiz-btn').addEventListener('click', startNewQuiz);
    document.getElementById('exit-quiz-btn').addEventListener('click', () => {
        setQuizState(false);
        computeWheatstoneBridge();
    });
    document.getElementById('check-quiz-btn').addEventListener('click', checkQuizAnswers);

    document.getElementById('reveal-quiz-btn').addEventListener('click', () => {
        const dict = i18n[currentLang];
        const feedback = document.getElementById('quiz-feedback');

        setQuizState(false);
        document.getElementById('quiz-panel').classList.add('active');

        const solutionPanel = document.getElementById('solution-panel');
        const toggleBtn = document.getElementById('toggle-solution-btn');
        solutionPanel.classList.add('visible');
        toggleBtn.setAttribute('data-i18n', 'hide_solution');
        applyTranslations();
        computeWheatstoneBridge();

        feedback.textContent = dict.quiz_msg_revealed;
        feedback.className = 'quiz-feedback show correct';
    });
}

function startNewQuiz() {
    const modeSelect = document.getElementById('sensor-mode');
    if (modeSelect && sensorMode !== 'none') {
        sensorMode = 'none';
        modeSelect.value = 'none';
    }

    const voltages = [6, 9, 12, 15, 18, 24];
    const randVs = voltages[Math.floor(Math.random() * voltages.length)];
    const randR = () => (Math.floor(Math.random() * 19) + 2) * 10;

    const r1 = randR(), r2 = randR(), r3 = randR(), r4 = randR(), r5 = randR();

    document.getElementById('vs').value = randVs;
    document.getElementById('r1').value = r1; document.getElementById('r1-slider').value = r1;
    document.getElementById('r2').value = r2; document.getElementById('r2-slider').value = r2;
    document.getElementById('r3').value = r3; document.getElementById('r3-slider').value = r3;
    document.getElementById('r4').value = r4; document.getElementById('r4-slider').value = r4;
    document.getElementById('r5').value = r5; document.getElementById('r5-slider').value = r5;

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
    const cppBtn = document.getElementById('open-cpp-btn');
    const sensorPanel = document.getElementById('sensor-panel');

    if (active) {
        quizPanel.classList.add('active');
        resultsCard.classList.add('blind-mode');
        solutionPanel.classList.remove('visible');
        toggleBtn.setAttribute('data-i18n', 'show_solution');
        toggleBtn.disabled = true;
        toggleBtn.style.opacity = '0.4';
        if (cppBtn) cppBtn.disabled = true;
        if (sensorPanel) sensorPanel.classList.add('locked');
        applyTranslations();
    } else {
        quizPanel.classList.remove('active');
        resultsCard.classList.remove('blind-mode');
        toggleBtn.disabled = false;
        toggleBtn.style.opacity = '1';
        if (cppBtn) cppBtn.disabled = false;
        if (sensorPanel) sensorPanel.classList.remove('locked');
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
        setQuizState(false);
        document.getElementById('quiz-panel').classList.add('active');
        computeWheatstoneBridge();
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

// --- HÀM TÍNH MÀU BẢN ĐỒ NHIỆT ĐIỆN THẾ (VOLTAGE HEATMAP) ---
function getVoltageColor(v, vs) {
    if (vs <= 0) return '#3B82F6';
    const ratio = Math.max(0, Math.min(1, v / vs));
    const hue = Math.round((1 - ratio) * 220);
    return `hsl(${hue}, 90%, 55%)`;
}

// --- HÀM CẬP NHẬT HẠT DÒNG ĐIỆN TỶ LỆ THUẬN VỚI CƯỜNG ĐỘ I ---
function updateContinuousParticleFlow(elementId, currentAmp) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const absI = Math.abs(currentAmp);
    const tolerance = 1e-4;

    if (isQuizMode || absI < tolerance) {
        el.classList.remove('flowing-forward', 'flowing-reverse');
        el.style.opacity = '0';
        return;
    }

    el.classList.remove('flowing-forward', 'flowing-reverse');
    el.classList.add(currentAmp >= 0 ? 'flowing-forward' : 'flowing-reverse');

    const duration = Math.max(0.18, Math.min(2.2, 0.12 / absI));
    el.style.animationDuration = `${duration.toFixed(2)}s`;

    const strokeW = Math.max(3, Math.min(6.5, 2.8 + absI * 12));
    el.style.strokeWidth = `${strokeW.toFixed(1)}px`;
    el.style.opacity = '0.95';
}

/* ============================================================================
   HÀM TÍNH TOÁN CHÍNH — CHẠY TRỰC TIẾP QUA LÕI C++ GAUSS 5×6
   ============================================================================ */
function computeWheatstoneBridge() {
    if (sensorMode !== 'none') {
        syncTransducerToR4Input();
    }

    const Vs = parseFloat(document.getElementById('vs').value);
    const R1 = parseFloat(document.getElementById('r1').value);
    const R2 = parseFloat(document.getElementById('r2').value);
    const R3 = parseFloat(document.getElementById('r3').value);
    const R4 = sensorMode !== 'none'
        ? getTransducerR4()
        : parseFloat(document.getElementById('r4').value);
    const R5 = parseFloat(document.getElementById('r5').value);
    const pmaxEl = document.getElementById('pmax');
    const Pmax = pmaxEl ? parseFloat(pmaxEl.value) : 0.5;

    const dict = i18n[currentLang];

    if (isNaN(Vs) || isNaN(R1) || isNaN(R2) || isNaN(R3) || isNaN(R4) || isNaN(R5) ||
        Vs <= 0 || R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0) {
        document.getElementById('status-badge').textContent = dict.status_invalid;
        document.getElementById('status-badge').className = 'status-badge unbalanced';
        return;
    }

    // Giải mạch bằng chính thuật toán Khử Gauss 5×6 có chọn phần tử trụ từ main.cpp
    const sol = solveBridgeViaCppEngine(R1, R2, R3, R4, R5, Vs);
    const lines = buildTerminalLines(R1, R2, R3, R4, R5, Vs, sol);
    lastSolve = { R1, R2, R3, R4, R5, Vs, sol, lines };

    if (!sol.ok) {
        document.getElementById('status-badge').textContent = dict.status_invalid;
        document.getElementById('status-badge').className = 'status-badge unbalanced';
        refreshCppInspector();
        return;
    }

    const [I1, I2, I3, I4, I5] = sol.I;
    const [U1, U2, U3, U4, U5] = sol.U;
    const [P1, P2, P3, P4, P5] = sol.P;
    const Vm = sol.V_M;
    const Vn = sol.V_N;
    const I_total = sol.I_total;
    const Req = sol.Req;

    currentSolutions = { Req: Req, Vm: Vm, Vn: Vn, I5_mA: I5 * 1000 };
    const isBalanced = Math.abs(I5 * 1000) < 0.01;

    // 1. CẬP NHẬT BẢN ĐỒ NHIỆT ĐIỆN THẾ (VOLTAGE COLOR MAPPING)
    const legendMax = document.getElementById('legend-vs-max');
    if (legendMax) legendMax.textContent = `${Vs}V (A)`;

    if (isQuizMode) {
        ['a', 'm', 'n', 'b'].forEach(node => {
            const wire = document.getElementById(`wire-node-${node}`);
            const dot = document.getElementById(`node-dot-${node}`);
            if (wire) wire.style.stroke = 'var(--text-muted)';
            if (dot) dot.style.fill = 'var(--accent)';
        });
    } else {
        const colA = getVoltageColor(Vs, Vs);
        const colM = getVoltageColor(Vm, Vs);
        const colN = getVoltageColor(Vn, Vs);
        const colB = getVoltageColor(0, Vs);

        document.getElementById('wire-node-a').style.stroke = colA;
        document.getElementById('wire-node-m').style.stroke = colM;
        document.getElementById('wire-node-n').style.stroke = colN;
        document.getElementById('wire-node-b').style.stroke = colB;

        document.getElementById('node-dot-a').style.fill = colA;
        document.getElementById('node-dot-m').style.fill = colM;
        document.getElementById('node-dot-n').style.fill = colN;
        document.getElementById('node-dot-b').style.fill = colB;
    }

    // 2. CẬP NHẬT HẠT DÒNG ĐIỆN LIÊN TỤC THEO CƯỜNG ĐỘ I
    updateContinuousParticleFlow('flow-input', I_total);
    updateContinuousParticleFlow('flow-r1', I1);
    updateContinuousParticleFlow('flow-r2', I2);
    updateContinuousParticleFlow('flow-r3', I3);
    updateContinuousParticleFlow('flow-r4', I4);
    updateContinuousParticleFlow('flow-r5', I5);
    updateContinuousParticleFlow('flow-output', I_total);

    // 3. KIỂM TRA QUÁ TẢI CÔNG SUẤT & HIỆU ỨNG CHÁY ĐIỆN TRỞ
    const branches = [
        { id: 'r1', name: 'R1', I: I1, U: U1, P: P1 },
        { id: 'r2', name: 'R2', I: I2, U: U2, P: P2 },
        { id: 'r3', name: 'R3', I: I3, U: U3, P: P3 },
        { id: 'r4', name: sensorMode === 'ntc' ? 'R4 (NTC)' : sensorMode === 'strain' ? 'R4 (Strain)' : 'R4', I: I4, U: U4, P: P4 },
        { id: 'r5', name: 'R5 (M-N)', I: I5, U: U5, P: P5, isGalvano: true }
    ];

    let overloadedNames = [];
    branches.forEach(b => {
        const isOver = !isQuizMode && (b.P > Pmax);
        const boxEl = document.getElementById(`box-${b.id}`);
        const fireEl = document.getElementById(`fire-${b.id}`);
        if (boxEl && fireEl) {
            if (isOver) {
                boxEl.classList.add('overloaded');
                fireEl.classList.add('visible');
                fireEl.style.display = 'block';
                overloadedNames.push(`${b.id.toUpperCase()} (${b.P.toFixed(2)}W)`);
            } else {
                boxEl.classList.remove('overloaded');
                fireEl.classList.remove('visible');
                fireEl.style.display = 'none';
            }
        }
    });

    const burnoutBanner = document.getElementById('burnout-banner');
    const burnoutText = document.getElementById('burnout-text');
    if (burnoutBanner && burnoutText) {
        if (overloadedNames.length > 0) {
            burnoutBanner.classList.add('show');
            burnoutBanner.style.display = 'flex';
            burnoutText.textContent = dict.burnout_prefix + overloadedNames.join(', ') + dict.burnout_suffix;
        } else {
            burnoutBanner.classList.remove('show');
            burnoutBanner.style.display = 'none';
        }
    }

    // 4. CẬP NHẬT THẺ KẾT QUẢ & BẢNG CHI TIẾT
    document.getElementById('vc-result').textContent = Vm.toFixed(3) + ' V';
    document.getElementById('vd-result').textContent = Vn.toFixed(3) + ' V';
    document.getElementById('ig-result').textContent = (I5 * 1000).toFixed(3) + ' mA';
    document.getElementById('req-result').textContent = Req.toFixed(2) + ' Ω';
    document.getElementById('itotal-result').textContent = I_total.toFixed(3) + ' A';
    document.getElementById('u5-result').textContent = Math.abs(U5).toFixed(3) + ' V';

    const statusBadge = document.getElementById('status-badge');
    if (overloadedNames.length > 0) {
        statusBadge.textContent = dict.status_overloaded;
        statusBadge.className = 'status-badge unbalanced';
    } else if (isBalanced) {
        statusBadge.textContent = dict.status_balanced;
        statusBadge.className = 'status-badge balanced';
    } else {
        statusBadge.textContent = dict.status_unbalanced;
        statusBadge.className = 'status-badge unbalanced';
    }

    const tbody = document.getElementById('detailed-tbody');
    tbody.innerHTML = branches.map(b => {
        const isOver = b.P > Pmax;
        const currStr = b.isGalvano ? `${(b.I * 1000).toFixed(3)} mA` : `${b.I.toFixed(4)} A`;
        const fireBadge = isOver ? ' 🔥' : '';
        return `<tr class="${isOver ? 'overloaded-row' : ''}">
            <td><strong>${b.name}${fireBadge}</strong></td>
            <td>${currStr}</td>
            <td>${Math.abs(b.U).toFixed(3)} V</td>
            <td>${b.P.toFixed(3)} W</td>
        </tr>`;
    }).join('');

    // 5. CẬP NHẬT LỜI GIẢI CHI TIẾT (BAO GỒM NÂNG CẤP 3: MA TRẬN 5×6 & BẢO TOÀN CÔNG SUẤT)
    const r4Disp = echoNum(R4);
    document.getElementById('sys-eq1').innerHTML = `I<sub>1</sub> - I<sub>2</sub> - I<sub>5</sub> = 0`;
    document.getElementById('sys-eq2').innerHTML = `I<sub>3</sub> - I<sub>4</sub> + I<sub>5</sub> = 0`;
    document.getElementById('sys-eq3').innerHTML = `${R1}·I<sub>1</sub> - ${R3}·I<sub>3</sub> + ${R5}·I<sub>5</sub> = 0`;
    document.getElementById('sys-eq4').innerHTML = `-${R2}·I<sub>2</sub> + ${r4Disp}·I<sub>4</sub> + ${R5}·I<sub>5</sub> = 0`;
    document.getElementById('sys-eq5').innerHTML = `${R1}·I<sub>1</sub> + ${R2}·I<sub>2</sub> = ${Vs}`;

    renderMatrix('step-matrix-host', sol.initial, { markPivots: false });
    renderPivotLog('step-pivot-log', sol.trace);

    document.getElementById('step-i1').textContent = I1.toFixed(5);
    document.getElementById('step-i2').textContent = I2.toFixed(5);
    document.getElementById('step-i3').textContent = I3.toFixed(5);
    document.getElementById('step-i4').textContent = I4.toFixed(5);
    document.getElementById('step-i5').textContent = I5.toFixed(5);

    const pSrcEl = document.getElementById('step-psource');
    const pConEl = document.getElementById('step-pconsumed');
    const pResEl = document.getElementById('step-presidual');
    const pVerdictEl = document.getElementById('step-power-verdict');

    if (pSrcEl) pSrcEl.textContent = sol.P_source.toFixed(6);
    if (pConEl) pConEl.textContent = sol.P_consumed_total.toFixed(6);
    if (pResEl) pResEl.textContent = sol.residual.toExponential(3);
    if (pVerdictEl) {
        pVerdictEl.textContent = sol.powerOk ? dict.power_passed : dict.power_failed;
        pVerdictEl.className = 'power-verdict ' + (sol.powerOk ? 'passed' : 'failed');
    }

    // 6. CẬP NHẬT KHUNG CẢM BIẾN CYBER-PHYSICAL & MODAL C++ INSPECTOR
    updateSensorAndLabPanels(sol);
    refreshCppInspector();
}

function loadPreset() {
    setQuizState(false);
    const modeSelect = document.getElementById('sensor-mode');
    if (modeSelect) {
        sensorMode = 'none';
        modeSelect.value = 'none';
    }
    document.getElementById('vs').value = 12;
    document.getElementById('r1').value = 100; document.getElementById('r1-slider').value = 100;
    document.getElementById('r2').value = 100; document.getElementById('r2-slider').value = 100;
    document.getElementById('r3').value = 150; document.getElementById('r3-slider').value = 150;
    document.getElementById('r4').value = 150; document.getElementById('r4-slider').value = 150;
    document.getElementById('r5').value = 220; document.getElementById('r5-slider').value = 220;
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
