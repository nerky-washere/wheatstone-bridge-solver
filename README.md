# Wheatstone Bridge Circuit Solver

Author: Trinh Dinh Nhat Quang (Nerky)
School: Class 12D4, Nguyen Tat Thanh High School, Hanoi, Vietnam
Live web tool: https://nerky-washere.github.io/wheatstone-bridge-solver/

## About this project

I started this project while studying electricity and Kirchhoff's circuit laws in high school physics. When a Wheatstone bridge is unbalanced, finding the current through each of the five resistors by hand takes a lot of time, so I wanted to build a tool that could solve it accurately and help my classmates check their homework answers.

## What I wrote myself vs. What I used AI for

I want to be completely clear about how this project was built:

1. Core C++ Math Engine (`main.cpp`) - Written by me:
I wrote `main.cpp` myself in C++ without using external math libraries. I set up the circuit as a 5x6 matrix using 2 Kirchhoff's Current Law (KCL) node equations and 3 Kirchhoff's Voltage Law (KVL) loop equations. To solve the matrix safely, I implemented Gaussian elimination with partial pivoting (`solveGauss`) so the program avoids division by zero and reduces rounding errors. I also wrote a power conservation check at the end of the code (`P_source` vs. the sum of `I^2 * R` across all five resistors) and checked the outputs with a hand calculator.

2. Web Interface and Sensor Simulations (`index.html`, `style.css`, `script.js`) - Built with AI:
I wanted my classmates and physics study group to use this solver easily on their phones, and I also wanted to see how real physical sensors (like an NTC thermistor for building HVAC control or a strain gauge on a race car) behave when there is measurement noise. Because I did not know enough HTML, CSS, or JavaScript to build a full website from scratch, I used AI to generate the frontend code and the JavaScript sensor simulations based on my C++ math logic.

3. Visitor Counter Backend (`wheatstone-counter-backend`) - Built with AI:
When my classmates started using the site, the counter on the web page kept counting wrong or resetting itself. I prompted AI to help me set up a small backend service on Render to store the count properly.

## How to compile and run my C++ code locally

If you want to test the original C++ solver in the terminal:

```bash
g++ main.cpp -o solver
./solver
