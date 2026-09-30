const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const size = canvas.width;
const center = size / 2;
const R_PX = 150;

function drawArea() {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'blue';

  ctx.fillRect(center, center, R_PX, R_PX);

  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.lineTo(center + R_PX / 2, center);
  ctx.lineTo(center, center - R_PX / 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(center, center);
  ctx.arc(center, center, R_PX, Math.PI / 2, Math.PI);
  ctx.closePath();
  ctx.fill();

  drawAxes();
}

function drawAxes() {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(0, center);
  ctx.lineTo(size, center);
  ctx.moveTo(center, size);
  ctx.lineTo(center, 0);
  ctx.stroke();

  ctx.fillStyle = 'black';
  ctx.font = '12px Arial';
  ctx.fillText('x', size - 12, center - 6);
  ctx.fillText('y', center + 6, 12);

  const labels = [
    { text: 'R',   px: R_PX },
    { text: 'R/2', px: R_PX / 2 }
  ];

  labels.forEach(label => {
    ctx.fillText(label.text,       center + label.px - 6,  center - 6);
    ctx.fillText('-' + label.text, center - label.px - 10, center - 6);
    ctx.fillText(label.text,       center + 6,             center - label.px + 4);
    ctx.fillText('-' + label.text, center + 6,             center + label.px + 4);
  });
}

drawArea();

const y_values = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
let selectedY = null;

const yContainer = document.getElementById('y-buttons');

y_values.forEach(value => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = value;

  button.addEventListener('click', () => {
    selectedY = value;

    yContainer.querySelectorAll('button').forEach(b => {
      b.classList.remove('active');
    });
    button.classList.add('active');
  });

  yContainer.appendChild(button);
});

const form = document.getElementById('point-form');
const xInput = document.getElementById('x-input');
const rSelect = document.getElementById('r-select');
const errorBox = document.getElementById('error');

function parseX(text) {
  const cleaned = text.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const x = Number(cleaned);
  if (x <= -5 || x >= 3) return null;
  return x;
}

function isHit(x, y, r) {
  if (x >= 0 && y >= 0) return x + y <= r / 2;
  if (x <= 0 && y <= 0) return x * x + y * y <= r * r;
  if (x >= 0 && y <= 0) return x <= r && y >= -r;
  return false;
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const x = parseX(xInput.value);
  const r = Number(rSelect.value);

  if (x === null) {
    errorBox.textContent = 'X должен быть числом строго от −5 до 3';
    return;
  }
  if (selectedY === null) {
    errorBox.textContent = 'выберите значение Y';
    return;
  }
  errorBox.textContent = '';

  const results = loadResults();
  results.unshift({
    x: x,
    y: selectedY,
    r: r,
    hit: isHit(x, selectedY, r),
    time: Date.now()
  });
  saveResults(results);
  renderTable();
});

const STORAGE_KEY = 'lab1-results';

function loadResults() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveResults(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderTable() {
  const tbody = document.querySelector('#results-table tbody');
  tbody.innerHTML = '';

  loadResults().forEach(item => {
    const row = document.createElement('tr');
    const cells = [
      item.x,
      item.y,
      item.r,
      item.hit ? 'попадание' : 'непопадание',
      new Date(item.time).toLocaleString('ru-RU')
    ];
    cells.forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

renderTable();
