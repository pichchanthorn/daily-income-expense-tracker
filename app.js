const STORAGE_KEY = "dailyTrackerEntries";
const LANGUAGE_KEY = "dailyTrackerLanguage";

const entryForm = document.getElementById("entryForm");
const languageToggleBtn = document.getElementById("languageToggle");
const typeInput = document.getElementById("type");
const currencyInput = document.getElementById("currency");
const amountInput = document.getElementById("amount");
const descriptionInput = document.getElementById("description");
const creditNameInput = document.getElementById("creditName");
const creditNameField = document.getElementById("creditNameField");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("formMessage");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

const entryTableBody = document.getElementById("entryTableBody");
const emptyState = document.getElementById("emptyState");
const tableWrap = document.getElementById("tableWrap");
const clearAllBtn = document.getElementById("clearAllBtn");

const translations = {
  en: {
    pageTitle: "Daily Income & Expense Tracker",
    headerTitle: "Daily Income & Expense Tracker",
    headerSubtitle: "Track your daily cash flow in seconds.",
    summaryAria: "Financial summary",
    addEntryAria: "Add entry form",
    entryListAria: "Entry list",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    balance: "Balance",
    addEntry: "Add Entry",
    type: "Type",
    income: "Income",
    expense: "Expense",
    credit: "Credit",
    amount: "Amount",
    currency: "Currency",
    description: "Description",
    descriptionPlaceholder: "e.g., Freelance work, Groceries",
    date: "Date",
    creditName: "Credit Name",
    creditNamePlaceholder: "e.g., Dara, Supplier A",
    addEntryBtn: "Add Entry",
    recentEntries: "Recent Entries",
    clearAll: "Clear All",
    emptyState: "No entries yet. Add your first income, expense, or credit.",
    action: "Action",
    delete: "Delete",
    notApplicable: "—",
    invalidEntry: "Please enter a valid description, amount, currency, and date.",
    creditNameRequired: "Credit Name is required when type is Credit.",
    addSuccess: "Entry added successfully.",
    clearConfirm: "Clear all entries? This cannot be undone.",
  },
  kh: {
    pageTitle: "កម្មវិធីកត់ត្រាចំណូល និងចំណាយប្រចាំថ្ងៃ",
    headerTitle: "កម្មវិធីកត់ត្រាចំណូល និងចំណាយប្រចាំថ្ងៃ",
    headerSubtitle: "កត់ត្រាលំហូរសាច់ប្រាក់ប្រចាំថ្ងៃរបស់អ្នកបានយ៉ាងរហ័ស។",
    summaryAria: "សេចក្តីសង្ខេបហិរញ្ញវត្ថុ",
    addEntryAria: "ទម្រង់បន្ថែមប្រតិបត្តិការ",
    entryListAria: "បញ្ជីប្រតិបត្តិការ",
    totalIncome: "ចំណូលសរុប",
    totalExpense: "ចំណាយសរុប",
    balance: "សមតុល្យ",
    addEntry: "បន្ថែមប្រតិបត្តិការ",
    type: "ប្រភេទ",
    income: "ចំណូល",
    expense: "ចំណាយ",
    credit: "ឥណទាន",
    amount: "ចំនួនទឹកប្រាក់",
    currency: "រូបិយប័ណ្ណ",
    description: "បរិយាយ",
    descriptionPlaceholder: "ឧ. ការងារសេរី, ទិញម្ហូប",
    date: "កាលបរិច្ឆេទ",
    creditName: "ឈ្មោះឥណទាន",
    creditNamePlaceholder: "ឧ. ដារ៉ា, អ្នកផ្គត់ផ្គង់ A",
    addEntryBtn: "បន្ថែម",
    recentEntries: "ប្រតិបត្តិការថ្មីៗ",
    clearAll: "លុបទាំងអស់",
    emptyState: "មិនទាន់មានទិន្នន័យទេ។ សូមបន្ថែមចំណូល ចំណាយ ឬឥណទាន។",
    action: "សកម្មភាព",
    delete: "លុប",
    notApplicable: "—",
    invalidEntry: "សូមបញ្ចូលបរិយាយ ចំនួនទឹកប្រាក់ រូបិយប័ណ្ណ និងកាលបរិច្ឆេទឱ្យត្រឹមត្រូវ។",
    creditNameRequired: "ឈ្មោះឥណទានត្រូវបានទាមទារ នៅពេលជ្រើសប្រភេទឥណទាន។",
    addSuccess: "បានបន្ថែមប្រតិបត្តិការដោយជោគជ័យ។",
    clearConfirm: "លុបទិន្នន័យទាំងអស់មែនទេ? មិនអាចស្ដារវិញបានទេ។",
  },
};

const supportedLanguages = ["en", "kh"];
const supportedCurrencies = ["USD", "KHR"];

let entries = getStoredEntries();
let currentLanguage = getStoredLanguage();

initialize();

function initialize() {
  dateInput.value = getTodayDate();
  applyLanguage(currentLanguage);
  updateCreditNameVisibility();
  renderAll();

  entryForm.addEventListener("submit", handleAddEntry);
  clearAllBtn.addEventListener("click", handleClearAll);
  entryTableBody.addEventListener("click", handleTableClick);
  typeInput.addEventListener("change", handleTypeChange);
  languageToggleBtn.addEventListener("click", handleLanguageToggle);
}

function handleAddEntry(event) {
  event.preventDefault();

  const type = typeInput.value;
  const currency = currencyInput.value;
  const amount = Number(amountInput.value);
  const description = descriptionInput.value.trim();
  const creditName = creditNameInput.value.trim();
  const date = dateInput.value;

  if (!description || !date || Number.isNaN(amount) || amount <= 0 || !supportedCurrencies.includes(currency)) {
    setFormMessage(getText("invalidEntry"));
    return;
  }

  if (type === "credit" && !creditName) {
    setFormMessage(getText("creditNameRequired"));
    return;
  }

  const newEntry = {
    id: crypto.randomUUID(),
    type,
    currency,
    amount,
    description,
    creditName: type === "credit" ? creditName : "",
    date,
  };

  entries.unshift(newEntry);
  persistEntries();
  renderAll();

  amountInput.value = "";
  descriptionInput.value = "";
  creditNameInput.value = "";
  setFormMessage(getText("addSuccess"));
}

function handleTableClick(event) {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const entryId = button.dataset.id;
  entries = entries.filter((entry) => entry.id !== entryId);
  persistEntries();
  renderAll();
}

function handleClearAll() {
  if (!entries.length) return;

  const confirmed = window.confirm(getText("clearConfirm"));
  if (!confirmed) return;

  entries = [];
  persistEntries();
  renderAll();
}

function renderAll() {
  renderSummary();
  renderTable();
}

function renderSummary() {
  const totalsByCurrency = entries.reduce(
    (accumulator, entry) => {
      if (!accumulator[entry.currency]) {
        accumulator[entry.currency] = { income: 0, expense: 0, credit: 0 };
      }

      if (entry.type === "income") {
        accumulator[entry.currency].income += entry.amount;
      } else if (entry.type === "expense") {
        accumulator[entry.currency].expense += entry.amount;
      } else {
        accumulator[entry.currency].credit += entry.amount;
      }

      return accumulator;
    },
    { USD: { income: 0, expense: 0, credit: 0 }, KHR: { income: 0, expense: 0, credit: 0 } }
  );

  totalIncomeEl.textContent = formatSummaryValue(totalsByCurrency, "income");
  totalExpenseEl.textContent = formatSummaryValue(totalsByCurrency, "expense");
  balanceEl.textContent = formatBalanceValue(totalsByCurrency);
}

function renderTable() {
  if (!entries.length) {
    tableWrap.hidden = true;
    emptyState.hidden = false;
    entryTableBody.innerHTML = "";
    return;
  }

  emptyState.hidden = true;
  tableWrap.hidden = false;

  entryTableBody.innerHTML = entries
    .map((entry) => {
      const typeClass = entry.type === "income" ? "type-income" : "type-expense";
      const adjustedTypeClass = entry.type === "credit" ? "type-credit" : typeClass;
      const amountClass =
        entry.type === "income" ? "amount-income" : entry.type === "expense" ? "amount-expense" : "amount-credit";
      const signedAmount = entry.type === "expense" ? -entry.amount : entry.amount;
      const creditName = entry.type === "credit" ? entry.creditName : getText("notApplicable");

      return `
        <tr>
          <td>${escapeHtml(formatDate(entry.date))}</td>
          <td>${escapeHtml(entry.description)}</td>
          <td><span class="type-badge ${adjustedTypeClass}">${escapeHtml(getTypeLabel(entry.type))}</span></td>
          <td>${escapeHtml(creditName)}</td>
          <td class="${amountClass}">${escapeHtml(formatCurrency(signedAmount, entry.currency))}<span class="currency-chip">${escapeHtml(entry.currency)}</span></td>
          <td><button class="delete-btn" data-id="${escapeHtml(entry.id)}" type="button">${escapeHtml(getText("delete"))}</button></td>
        </tr>
      `;
    })
    .join("");
}

function getStoredEntries() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((entry) => {
      return (
        typeof entry.id === "string" &&
        (entry.type === "income" || entry.type === "expense" || entry.type === "credit") &&
        supportedCurrencies.includes(entry.currency) &&
        typeof entry.amount === "number" &&
        entry.amount > 0 &&
        typeof entry.description === "string" &&
        typeof entry.creditName === "string" &&
        typeof entry.date === "string"
      );
    });
  } catch {
    return [];
  }
}

function persistEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatCurrency(value, currency) {
  const locale = currentLanguage === "kh" ? "km-KH" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "KHR" ? 0 : 2,
    maximumFractionDigits: currency === "KHR" ? 0 : 2,
  }).format(value);
}

function formatDate(value) {
  const date = new Date(value + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setFormMessage(message) {
  formMessage.textContent = message;
}

function handleTypeChange() {
  updateCreditNameVisibility();
}

function updateCreditNameVisibility() {
  const isCredit = typeInput.value === "credit";
  creditNameField.hidden = !isCredit;
  creditNameInput.required = isCredit;

  if (!isCredit) {
    creditNameInput.value = "";
  }
}

function handleLanguageToggle() {
  currentLanguage = currentLanguage === "en" ? "kh" : "en";
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyLanguage(currentLanguage);
  renderAll();

  if (formMessage.textContent) {
    setFormMessage("");
  }
}

function getStoredLanguage() {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return supportedLanguages.includes(stored) ? stored : "en";
}

function applyLanguage(language) {
  const normalizedLanguage = supportedLanguages.includes(language) ? language : "en";
  const langTexts = translations[normalizedLanguage];

  document.documentElement.lang = normalizedLanguage;
  document.title = langTexts.pageTitle;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (langTexts[key]) {
      element.textContent = langTexts[key];
    }
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (langTexts[key]) {
      element.setAttribute("aria-label", langTexts[key]);
    }
  });

  descriptionInput.placeholder = langTexts.descriptionPlaceholder;
  creditNameInput.placeholder = langTexts.creditNamePlaceholder;
  languageToggleBtn.textContent = normalizedLanguage === "en" ? "EN | KH" : "KH | EN";
}

function getText(key) {
  return translations[currentLanguage][key] ?? translations.en[key] ?? "";
}

function getTypeLabel(type) {
  if (type === "income") return getText("income");
  if (type === "expense") return getText("expense");
  return getText("credit");
}

function formatSummaryValue(totalsByCurrency, field) {
  return supportedCurrencies
    .map((currency) => {
      const amount = totalsByCurrency[currency]?.[field] ?? 0;
      return `${formatCurrency(amount, currency)} (${currency})`;
    })
    .join(" | ");
}

function formatBalanceValue(totalsByCurrency) {
  return supportedCurrencies
    .map((currency) => {
      const totals = totalsByCurrency[currency] ?? { income: 0, expense: 0, credit: 0 };
      const balance = totals.income + totals.credit - totals.expense;
      return `${formatCurrency(balance, currency)} (${currency})`;
    })
    .join(" | ");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
