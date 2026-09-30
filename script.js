// Calculator Core State
class Calculator {
  constructor(prevDisplayEl, currDisplayEl) {
    this.prevDisplayEl = prevDisplayEl;
    this.currDisplayEl = currDisplayEl;
    this.angleMode = 'DEG'; // 'DEG' or 'RAD'
    this.memoryValue = 0;
    this.history = [];
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  delete() {
    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      this.updateDisplay();
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.currentOperand === 'Error' || this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      this.currentOperand += number.toString();
    }
    this.updateDisplay();
  }

  toggleSign() {
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
    this.updateDisplay();
  }

  applyPercent() {
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;
    this.currentOperand = (current / 100).toString();
    this.updateDisplay();
  }

  chooseOperation(op) {
    if (this.currentOperand === 'Error') return;
    if (this.currentOperand === '' && this.previousOperand !== '') {
      this.operation = op;
      this.previousOperand = this.previousOperand.slice(0, -1) + ' ' + op;
      this.updateDisplay();
      return;
    }
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = op;
    this.previousOperand = `${this.currentOperand} ${op}`;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  compute() {
    if (!this.operation || this.shouldResetScreen) return;
    const prev = parseFloat(this.previousOperand);
    const curr = parseFloat(this.currentOperand);
    if (isNaN(prev) || isNaN(curr)) return;

    let computation;
    switch (this.operation) {
      case '+':
        computation = prev + curr;
        break;
      case '-':
        computation = prev - curr;
        break;
      case '×':
      case '*':
        computation = prev * curr;
        break;
      case '÷':
      case '/':
        if (curr === 0) {
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = undefined;
          this.updateDisplay();
          return;
        }
        computation = prev / curr;
        break;
      case '^':
        computation = Math.pow(prev, curr);
        break;
      case 'mod':
        computation = prev % curr;
        break;
      default:
        return;
    }

    const formattedResult = this.formatResult(computation);
    this.recordHistory(`${this.previousOperand} ${this.currentOperand} =`, formattedResult);

    this.currentOperand = formattedResult.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  applyScientific(func) {
    let curr = parseFloat(this.currentOperand);
    if (isNaN(curr) && func !== 'pi' && func !== 'e') return;

    let res;
    let label = '';
    const toRadians = (deg) => (deg * Math.PI) / 180;

    switch (func) {
      case 'sin':
        res = Math.sin(this.angleMode === 'DEG' ? toRadians(curr) : curr);
        label = `sin(${curr})`;
        break;
      case 'cos':
        res = Math.cos(this.angleMode === 'DEG' ? toRadians(curr) : curr);
        label = `cos(${curr})`;
        break;
      case 'tan':
        if (this.angleMode === 'DEG' && (curr % 180 === 90 || curr % 180 === -90)) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = Math.tan(this.angleMode === 'DEG' ? toRadians(curr) : curr);
        label = `tan(${curr})`;
        break;
      case 'sqrt':
        if (curr < 0) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = Math.sqrt(curr);
        label = `√(${curr})`;
        break;
      case 'sqr':
        res = Math.pow(curr, 2);
        label = `sqr(${curr})`;
        break;
      case 'inv':
        if (curr === 0) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = 1 / curr;
        label = `1/(${curr})`;
        break;
      case 'log':
        if (curr <= 0) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = Math.log10(curr);
        label = `log(${curr})`;
        break;
      case 'ln':
        if (curr <= 0) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = Math.log(curr);
        label = `ln(${curr})`;
        break;
      case 'fact':
        if (curr < 0 || !Number.isInteger(curr) || curr > 100) {
          this.currentOperand = 'Error';
          this.updateDisplay();
          return;
        }
        res = this.factorial(curr);
        label = `${curr}!`;
        break;
      case 'pi':
        this.currentOperand = Math.PI.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
        return;
      case 'e':
        this.currentOperand = Math.E.toString();
        this.shouldResetScreen = true;
        this.updateDisplay();
        return;
      default:
        return;
    }

    const formatted = this.formatResult(res);
    this.recordHistory(label, formatted);
    this.currentOperand = formatted.toString();
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  formatResult(num) {
    if (!isFinite(num) || isNaN(num)) return 'Error';
    // Clean floating point errors like 0.1 + 0.2 = 0.30000000000000004
    const rounded = Number(Math.round(num + 'e+12') + 'e-12');
    if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
      return rounded.toExponential(6);
    }
    return rounded;
  }

  recordHistory(expression, result) {
    this.history.unshift({ expression, result });
    if (this.history.length > 30) this.history.pop();
    renderHistory();
  }

  // Memory functions
  memoryClear() {
    this.memoryValue = 0;
  }

  memoryRecall() {
    this.currentOperand = this.memoryValue.toString();
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  memoryAdd() {
    const curr = parseFloat(this.currentOperand);
    if (!isNaN(curr)) this.memoryValue += curr;
  }

  memorySubtract() {
    const curr = parseFloat(this.currentOperand);
    if (!isNaN(curr)) this.memoryValue -= curr;
  }

  updateDisplay() {
    this.currDisplayEl.innerText = this.currentOperand;
    this.prevDisplayEl.innerText = this.previousOperand;
    // Dynamic font resizing for long numbers
    if (this.currentOperand.length > 12) {
      this.currDisplayEl.style.fontSize = '22px';
    } else if (this.currentOperand.length > 8) {
      this.currDisplayEl.style.fontSize = '28px';
    } else {
      this.currDisplayEl.style.fontSize = '34px';
    }
  }
}

// DOM Setup
const prevDisplayEl = document.getElementById('previous-operand');
const currDisplayEl = document.getElementById('current-operand');
const calculator = new Calculator(prevDisplayEl, currDisplayEl);

// Buttons
document.querySelectorAll('[data-number]').forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.getAttribute('data-number'));
  });
});

document.querySelectorAll('[data-operator]').forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.getAttribute('data-operator'));
  });
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    switch (action) {
      case 'clear':
        calculator.clear();
        break;
      case 'delete':
        calculator.delete();
        break;
      case 'calculate':
        calculator.compute();
        break;
      case 'negate':
        calculator.toggleSign();
        break;
      case 'percent':
        calculator.applyPercent();
        break;
      case 'pow':
        calculator.chooseOperation('^');
        break;
      case 'mod':
        calculator.chooseOperation('mod');
        break;
      // Memory
      case 'mc':
        calculator.memoryClear();
        break;
      case 'mr':
        calculator.memoryRecall();
        break;
      case 'm-plus':
        calculator.memoryAdd();
        break;
      case 'm-minus':
        calculator.memorySubtract();
        break;
      // Scientific
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sqrt':
      case 'sqr':
      case 'inv':
      case 'log':
      case 'ln':
      case 'fact':
      case 'pi':
      case 'e':
        calculator.applyScientific(action);
        break;
    }
  });
});

// DEG / RAD Toggle
const degRadBtn = document.getElementById('deg-rad-btn');
degRadBtn.addEventListener('click', () => {
  if (calculator.angleMode === 'DEG') {
    calculator.angleMode = 'RAD';
    degRadBtn.innerText = 'RAD';
    degRadBtn.classList.add('active');
  } else {
    calculator.angleMode = 'DEG';
    degRadBtn.innerText = 'DEG';
    degRadBtn.classList.remove('active');
  }
});

// Scientific Drawer Toggle
const sciToggleBtn = document.getElementById('sci-toggle-btn');
const sciPad = document.getElementById('scientific-pad');
sciToggleBtn.addEventListener('click', () => {
  sciPad.classList.toggle('collapsed');
  sciToggleBtn.classList.toggle('active');
});

// History Toggle
const historyToggleBtn = document.getElementById('history-toggle-btn');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

historyToggleBtn.addEventListener('click', () => {
  historyPanel.classList.toggle('collapsed');
});

clearHistoryBtn.addEventListener('click', () => {
  calculator.history = [];
  renderHistory();
});

function renderHistory() {
  if (calculator.history.length === 0) {
    historyList.innerHTML = '<p class="empty-notice">No past calculations yet.</p>';
    return;
  }
  historyList.innerHTML = calculator.history.map(item => `
    <div class="history-item" onclick="loadHistoryItem('${item.result}')">
      <div class="expr">${item.expression}</div>
      <div class="res">${item.result}</div>
    </div>
  `).join('');
}

window.loadHistoryItem = (val) => {
  calculator.currentOperand = val.toString();
  calculator.shouldResetScreen = true;
  calculator.updateDisplay();
};

// Keyboard Support
window.addEventListener('keydown', (e) => {
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    calculator.appendNumber(e.key);
  } else if (e.key === '+' || e.key === '-') {
    calculator.chooseOperation(e.key);
  } else if (e.key === '*') {
    calculator.chooseOperation('×');
  } else if (e.key === '/') {
    e.preventDefault();
    calculator.chooseOperation('÷');
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculator.compute();
  } else if (e.key === 'Backspace') {
    calculator.delete();
  } else if (e.key === 'Escape') {
    calculator.clear();
  } else if (e.key === '%') {
    calculator.applyPercent();
  }
});
