#include <iostream>
#include <iomanip>
#include <cmath>

using namespace std;

// === GAUSS SOLVER WITH PARTIAL PIVOTING ===
bool solveGauss(double matrix[5][6], double I[5], int N) {
    for (int c = 0; c < N; c++) {
        int maxRow = c;
        for (int r = c + 1; r < N; r++) {
            if (abs(matrix[r][c]) > abs(matrix[maxRow][c])) {
                maxRow = r;
            }
        }

        if (maxRow != c) {
            for (int q = c; q <= N; q++) {
                swap(matrix[c][q], matrix[maxRow][q]);
            }
        }

        if (abs(matrix[c][c]) < 1e-9) {
            return false;
        }

        for (int r = c + 1; r < N; r++) {
            double factor = matrix[r][c] / matrix[c][c];
            for (int q = c; q <= N; q++) {
                matrix[r][q] -= factor * matrix[c][q];
            }
        }
    }

    for (int k = N - 1; k >= 0; k--) {
        double sum = matrix[k][N];
        for (int m = k + 1; m < N; m++) {
            sum -= matrix[k][m] * I[m];
        }
        I[k] = sum / matrix[k][k];
    }

    return true;
}

int main() {
    double R1, R2, R3, R4, R5, Vs;

    cout << "================================================================" << endl;
    cout << "                WHEATSTONE BRIDGE CIRCUIT SOLVER                " << endl;
    cout << "================================================================" << endl;

    // Display ASCII Circuit Schematic
    cout << "                       CIRCUIT SCHEMATIC                        " << endl;
    cout << "       +----------[ R1 ]----------+----------[ R2 ]----------+  " << endl;
    cout << "       |                          |                          |  " << endl;
    cout << "  o----+                          |                          +----o" << endl;
    cout << " (+Vs) |                        [ R5 ]                       |   (GND)" << endl;
    cout << "       |                          |                          |  " << endl;
    cout << "       +----------[ R3 ]----------+----------[ R4 ]----------+  " << endl;
    cout << "================================================================" << endl << endl;

    // Prompt user for input values (Aligned)
    cout << "Enter R1 (Ohm)  : "; cin >> R1;
    cout << "Enter R2 (Ohm)  : "; cin >> R2;
    cout << "Enter R3 (Ohm)  : "; cin >> R3;
    cout << "Enter R4 (Ohm)  : "; cin >> R4;
    cout << "Enter R5 (Ohm)  : "; cin >> R5;
    cout << "Enter Vs (Volt) : "; cin >> Vs;

    // Validate resistor and voltage values
    if (R1 <= 0 || R2 <= 0 || R3 <= 0 || R4 <= 0 || R5 <= 0 || Vs <= 0) {
        cout << "\n[Error]: All resistance values and source voltage must be greater than 0!" << endl;
        return 1;
    }

    // Kirchhoff System Matrix Formulation (5x6)
    double matrix[5][6] = {
        { 1.0, 0.0, -1.0,  0.0, -1.0, 0.0 }, // KCL Node B: I1 - I3 - I5 = 0
        { 0.0, 1.0,  0.0, -1.0,  1.0, 0.0 }, // KCL Node C: I2 - I4 + I5 = 0
        {  R1, -R2,  0.0,  0.0,   R5, 0.0 }, // KVL Loop 1: R1*I1 - R2*I2 + R5*I5 = 0
        { 0.0, 0.0,   R3,  -R4,  -R5, 0.0 }, // KVL Loop 2: R3*I3 - R4*I4 - R5*I5 = 0
        {  R1, 0.0,   R3,  0.0,  0.0,  Vs }  // KVL Loop 3: R1*I1 + R3*I3 = Vs
    };

    double I[5];
    int N = 5;

    // Solve system of equations
    if (!solveGauss(matrix, I, N)) {
        cout << "\n[Error]: Unable to solve system of equations (Singular matrix)!" << endl;
        return 1;
    }

    // Derived Parameters Calculation
    double I_total = I[0] + I[1];
    double Req = Vs / I_total;

    // Node voltages
    double V_A = Vs;
    double V_B = V_A - (I[0] * R1);
    double V_C = V_A - (I[1] * R2);
    double V_BC = V_B - V_C;

    // Power consumption calculations
    double P[5];
    double P_consumed_total = 0;
    for (int i = 0; i < 5; i++) {
        P[i] = I[i] * I[i] * (i == 0 ? R1 : i == 1 ? R2 : i == 2 ? R3 : i == 3 ? R4 : R5);
        P_consumed_total += P[i];
    }
    double P_source = Vs * I_total;

    // Display output results
    cout << "\n================================================================" << endl;
    cout << "                        ANALYSIS RESULTS                        " << endl;
    cout << "================================================================" << endl;
    cout << fixed << setprecision(4);

    cout << "BRANCH CURRENTS:" << endl;
    for (int i = 0; i < N; i++) {
        cout << " - I" << i + 1 << " = " << I[i] << " A (" << I[i] * 1000 << " mA)" << endl;
    }

    cout << "\nNODE VOLTAGES & BRIDGE DIFFERENTIAL:" << endl;
    cout << " - Node B Potential (V_B) = " << V_B << " V" << endl;
    cout << " - Node C Potential (V_C) = " << V_C << " V" << endl;
    cout << " - Voltage Difference V_BC = " << V_BC << " V" << endl;

    cout << "\nBRIDGE STATE:" << endl;
    if (abs(I[4]) < 1e-6) {
        cout << " -> BALANCED WHEATSTONE BRIDGE (I5 = 0 A, V_BC = 0 V)" << endl;
    } else {
        cout << " -> UNBALANCED WHEATSTONE BRIDGE" << endl;
    }

    cout << "\nTOTAL CIRCUIT & ENERGY PARAMETERS:" << endl;
    cout << " - Total Current (I_total) = " << I_total << " A" << endl;
    cout << " - Equivalent Resistance (Req) = " << Req << " Ohm" << endl;
    cout << " - Source Power (P_source) = " << P_source << " Watt" << endl;
    cout << " - Total Power Dissipating on Resistors = " << P_consumed_total << " Watt" << endl;

    if (abs(P_source - P_consumed_total) < 1e-4) {
        cout << " -> Power Conservation Check: PASSED (100% Exact)" << endl;
    }

    cout << "================================================================" << endl;

    return 0;
}