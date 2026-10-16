// ---------- Math functions ----------
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) return null; // signals "can't divide by zero"
  return a / b;
}

function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
  }
}

// ---------- Calculator state ----------
let firstNumber = null; // number, or null if nothing stored yet
let operator = null; // "+", "-", "*", "/" or null
let currentInput = ""; // the number being typed, as a string (the "second number")
let justEvaluated = false; // true right after = was pressed
let hasError = false;

const currentDisplay = document.querySelector("#current");
const historyDisplay = document.querySelector("#history");
const decimalBtn = document.querySelector("#decimal");

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const MAX_DIGITS = 12;

// ---------- Display ----------
function formatNumber(n) {
  // toPrecision fixes things like 0.1 + 0.2 = 0.30000000000000004
  let text = String(parseFloat(n.toPrecision(10)));
  if (text.length > MAX_DIGITS) text = n.toExponential(4);
  return text;
}

function updateDisplay() {
  if (hasError) {
    currentDisplay.textContent = "Nice try. You can't divide by zero.";
    historyDisplay.textContent = "";
    decimalBtn.disabled = false;
    return;
  }

  if (currentInput !== "") {
    currentDisplay.textContent = currentInput;
  } else if (firstNumber !== null) {
    currentDisplay.textContent = formatNumber(firstNumber);
  } else {
    currentDisplay.textContent = "0";
  }

  historyDisplay.textContent =
    firstNumber !== null && operator !== null
      ? `${formatNumber(firstNumber)} ${symbols[operator]}`
      : "";

  // Disable "." if the number being typed already has one
  decimalBtn.disabled = currentInput.includes(".");
}

// ---------- Actions ----------
function clearAll() {
  firstNumber = null;
  operator = null;
  currentInput = "";
  justEvaluated = false;
  hasError = false;
  updateDisplay();
}

function inputDigit(digit) {
  // Typing after a result (or an error) starts a brand new calculation
  if (justEvaluated || hasError) clearAll();

  if (currentInput.replace(".", "").length >= MAX_DIGITS) return;

  currentInput = currentInput === "0" ? digit : currentInput + digit;
  updateDisplay();
}

function inputDecimal() {
  if (justEvaluated || hasError) clearAll();
  if (currentInput.includes(".")) return;

  currentInput = currentInput === "" ? "0." : currentInput + ".";
  updateDisplay();
}

function calculate() {
  const result = operate(operator, firstNumber, Number(currentInput));
  if (result === null) {
    hasError = true;
    firstNumber = null;
    operator = null;
    currentInput = "";
    return false;
  }
  firstNumber = result;
  currentInput = "";
  return true;
}

function chooseOperator(op) {
  if (hasError) return;

  if (currentInput === "") {
    // No new number typed yet: just swap the operator (no evaluation)
    if (firstNumber === null) firstNumber = 0;
    operator = op;
  } else if (firstNumber !== null && operator !== null) {
    // We have number, operator, number: evaluate that pair first
    if (calculate()) operator = op;
  } else {
    firstNumber = Number(currentInput);
    currentInput = "";
    operator = op;
  }

  justEvaluated = false;
  updateDisplay();
}

function equals() {
  // Need a first number, an operator, and a second number
  if (hasError || firstNumber === null || operator === null || currentInput === "") {
    return;
  }

  if (calculate()) {
    operator = null;
    justEvaluated = true;
  }
  updateDisplay();
}

function backspace() {
  if (hasError) return clearAll();
  if (justEvaluated || currentInput === "") return;

  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

// ---------- Button clicks ----------
document.querySelectorAll(".digit").forEach((button) => {
  button.addEventListener("click", () => inputDigit(button.textContent));
});

document.querySelectorAll(".operator").forEach((button) => {
  button.addEventListener("click", () => chooseOperator(button.dataset.op));
});

decimalBtn.addEventListener("click", inputDecimal);
document.querySelector("#equals").addEventListener("click", equals);
document.querySelector("#clear").addEventListener("click", clearAll);
document.querySelector("#backspace").addEventListener("click", backspace);

// ---------- Keyboard support ----------
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (key >= "0" && key <= "9") {
    inputDigit(key);
  } else if (key === ".") {
    inputDecimal();
  } else if ("+-*/".includes(key)) {
    event.preventDefault(); // stops "/" opening Firefox quick find
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault(); // stops Enter from re-clicking a focused button
    equals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape" || key === "Delete") {
    clearAll();
  }
});

updateDisplay();