const API = "http://localhost:3000";
const username = localStorage.getItem("user");

if (!username) location.href = "login.html";
document.getElementById("user").textContent = username;

let transactions = [];

// DOM
const list = document.getElementById("transaction-list");
const form = document.getElementById("form");
const search = document.getElementById("search");
const sort = document.getElementById("sort");
const balanceEl = document.getElementById("balance");

const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

// Categories
const incomeCategories = ["Salary", "Pocket Money", "Scholarship", "Freelance"];
const expenseCategories = ["Food", "Travel", "Education", "Entertainment"];

function updateCategories() {
  categorySelect.innerHTML = "";
  const categories =
    typeSelect.value === "income" ? incomeCategories : expenseCategories;

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
}

updateCategories();
typeSelect.addEventListener("change", updateCategories);

// Load Transactions
function loadTransactions() {
  fetch(`${API}/transactions/${username}`)
    .then(res => res.json())
    .then(data => {
      transactions = data;
      updateUI();
    });
}

// Add Transaction
form.onsubmit = e => {
  e.preventDefault();

  const t = {
    username,
    title: title.value,
    amount: +amount.value,
    type: type.value,
    category: categorySelect.value,
    date: date.value,
    note: note.value
  };

  fetch(`${API}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  }).then(loadTransactions);

  form.reset();
  updateCategories();
};

// Update UI
function updateUI() {
  list.innerHTML = "";

  let income = 0;
  let expense = 0;
  let catData = {};
  let monthData = {};

  let filtered = transactions.filter(t =>
    t.title.toLowerCase().includes(search.value.toLowerCase())
  );

  if (sort.value === "amount") filtered.sort((a,b)=>b.amount-a.amount);
  if (sort.value === "date") filtered.sort((a,b)=>new Date(b.date)-new Date(a.date));

  filtered.forEach(t => {
    list.innerHTML += `
      <li class="${t.type}">
        <div>
          <strong>${t.title}</strong>
          <span class="tag">${t.category}</span>
          <div class="date">${t.date}</div>
        </div>
        <div class="amount">
          ${t.type === "income" ? "+" : "-"}₹${t.amount}
        </div>
      </li>
    `;

    if (t.type === "income") income += t.amount;
    else expense += t.amount;

    catData[t.category] = (catData[t.category] || 0) + t.amount;
    const m = t.date.slice(0,7);
    monthData[m] = (monthData[m] || 0) + t.amount;
  });

  // Balance
  balanceEl.textContent = income - expense;

  drawCharts(catData, monthData);
}

// Charts
function drawCharts(catData, monthData) {
  pieChart.width = 300;
  pieChart.height = 300;

  // Pie Chart – Category-wise
  new Chart(pieChart, {
    type: "pie",
    data: {
      labels: Object.keys(catData),
      datasets: [{
        label: "Category-wise Spending",
        data: Object.values(catData)
      }]
    },
    options: {
      responsive: false
    }
  });

  // Bar Chart – Monthly Summary
  new Chart(barChart, {
    type: "bar",
    data: {
      labels: Object.keys(monthData),
      datasets: [{
        label: "Monthly Cash Flow (₹)",   // ✅ FIXED
        data: Object.values(monthData)
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}


// Utils
function exportCSV() {
  let csv = "Title,Amount,Type,Category,Date,Note\n";
  transactions.forEach(t=>{
    csv += `${t.title},${t.amount},${t.type},${t.category},${t.date},${t.note}\n`;
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv]));
  a.download = "finance.csv";
  a.click();
}

function toggleDark(){document.body.classList.toggle("dark")}
function toggleSidebar(){sidebar.classList.toggle("show")}
function logout(){localStorage.clear();location.href="login.html"}

search.oninput = updateUI;
sort.onchange = updateUI;

loadTransactions();
