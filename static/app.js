const metricsRegistry = [
  { id: "revenue", label: "Выручка" },
  { id: "passengers_actual", label: "Количество пассажиров" },
  { id: "passengers_all", label: "Количество пассажиров (все строки)" },
  { id: "trips_count", label: "Количество рейсов" },
  { id: "avg_ticket_price", label: "Средняя цена билета" },
  { id: "cancelled_count", label: "Количество отмен" }
];

const groupsRegistry = [
  { id: "ticket_status", label: "Статус билета" },
  { id: "ticket_city_from", label: "Город отправления в билете" },
  { id: "ticket_city_to", label: "Город прибытия в билете" },
  { id: "currency_code", label: "Валюта" },
  { id: "tenant_name", label: "Партнёр" },
  { id: "carrier_name", label: "Перевозчик" },
  { id: "sales_channel_name", label: "Источник продажи" },
  { id: "route_city_from", label: "Город отправления в маршруте" },
  { id: "route_city_to", label: "Город прибытия в маршруте" },
  { id: "route_id", label: "ID маршрута" },
  { id: "payment_method", label: "Метод оплаты" }
];

const filtersRegistry = [
  { id: "carrier_name", label: "Перевозчик" },
  { id: "tenant_name", label: "Партнёр" },
  { id: "route_city_from", label: "Город отправления в маршруте" },
  { id: "route_city_to", label: "Город прибытия в маршруте" },
  { id: "route_id", label: "ID маршрута" },
  { id: "payment_method", label: "Метод оплаты" },
  { id: "ticket_status", label: "Статус билета" },
  { id: "ticket_city_from", label: "Город отправления в билете" },
  { id: "ticket_city_to", label: "Город прибытия в билете" },
  { id: "currency_code", label: "Валюта" }
];

let chartInstance = null;
let lastRows = [];

document.addEventListener("DOMContentLoaded", () => {
  renderCheckboxes();
  wireTabs();
  wireButtons();
  setDefaultDates();
});

function renderCheckboxes() {
  const metricsBox = document.getElementById("metricsBox");
  const groupsBox = document.getElementById("groupsBox");

  metricsRegistry.forEach((m, idx) => {
    const wrap = document.createElement("label");
    wrap.className = "checkbox-item";
    wrap.innerHTML = `
      <input type="checkbox" class="metric-checkbox" value="${m.id}" ${idx < 2 ? "checked" : ""}>
      <span>${m.label}</span>
    `;
    metricsBox.appendChild(wrap);
  });

  groupsRegistry.forEach((g) => {
    const wrap = document.createElement("label");
    wrap.className = "checkbox-item";
    wrap.innerHTML = `
      <input type="checkbox" class="group-checkbox" value="${g.id}">
      <span>${g.label}</span>
    `;
    groupsBox.appendChild(wrap);
  });
}

function wireTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      document.querySelectorAll(".view").forEach(x => x.classList.remove("active"));

      btn.classList.add("active");
      const view = btn.dataset.view;
      document.getElementById(view + "View").classList.add("active");
    });
  });
}

function wireButtons() {
  document.getElementById("addFilterBtn").addEventListener("click", addFilterRow);
  document.getElementById("runBtn").addEventListener("click", runQuery);
}

function setDefaultDates() {
  const from = document.getElementById("dateFrom");
  const to = document.getElementById("dateTo");

  from.value = "2023-12-01";
  to.value = "2023-12-20";
}

function addFilterRow() {
  const container = document.getElementById("filtersContainer");
  const row = document.createElement("div");
  row.className = "filter-row";

  const options = filtersRegistry.map(f => `<option value="${f.id}">${f.label}</option>`).join("");

  row.innerHTML = `
    <div class="filter-grid">
      <div class="field">
        <label>Поле</label>
        <select class="filter-field">
          <option value="">Выбери поле</option>
          ${options}
        </select>
      </div>

      <div class="field">
        <label>Поиск значения</label>
        <input type="text" class="filter-search" placeholder="Начни вводить..." />
      </div>

      <div class="field">
        <label>Результаты поиска</label>
        <div class="search-results"></div>
        <div class="selected-values"></div>
      </div>

      <div class="field">
        <label>&nbsp;</label>
        <button type="button" class="remove-filter-btn">Удалить</button>
      </div>
    </div>
  `;

  container.appendChild(row);

  const fieldSelect = row.querySelector(".filter-field");
  const searchInput = row.querySelector(".filter-search");
  const searchResults = row.querySelector(".search-results");
  const selectedValuesBox = row.querySelector(".selected-values");
  const removeBtn = row.querySelector(".remove-filter-btn");

  row.selectedValues = [];

  fieldSelect.addEventListener("change", () => {
    row.selectedValues = [];
    renderSelectedValues(row, selectedValuesBox);
    searchResults.innerHTML = "";
    if (fieldSelect.value) {
      loadFilterOptions(fieldSelect.value, "", searchResults, row, selectedValuesBox);
    }
  });

  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (!fieldSelect.value) return;
      loadFilterOptions(fieldSelect.value, searchInput.value.trim(), searchResults, row, selectedValuesBox);
    }, 300);
  });

  removeBtn.addEventListener("click", () => row.remove());
}

async function loadFilterOptions(field, search, targetBox, row, selectedValuesBox) {
  if (!field) {
    targetBox.innerHTML = "";
    return;
  }

  const url = new URL("/filter-options", window.location.origin);
  url.searchParams.set("field", field);
  url.searchParams.set("limit", "50");
  if (search) {
    url.searchParams.set("search", search);
  }

  const res = await fetch(url);
  const data = await res.json();

  targetBox.innerHTML = "";

  data
    .filter(x => x.value !== null && x.value !== "")
    .forEach(item => {
      const value = String(item.value);

      if (row.selectedValues.includes(value)) {
        return;
      }

      const el = document.createElement("div");
      el.className = "search-result-item";
      el.textContent = value;

      el.addEventListener("click", () => {
        if (!row.selectedValues.includes(value)) {
          row.selectedValues.push(value);
          renderSelectedValues(row, selectedValuesBox);
          el.remove();
        }
      });

      targetBox.appendChild(el);
    });
}

function renderSelectedValues(row, container) {
  container.innerHTML = "";

  row.selectedValues.forEach(value => {
    const chip = document.createElement("div");
    chip.className = "value-chip";

    const text = document.createElement("span");
    text.textContent = value;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";

    removeBtn.addEventListener("click", () => {
      row.selectedValues = row.selectedValues.filter(v => v !== value);
      renderSelectedValues(row, container);
    });

    chip.appendChild(text);
    chip.appendChild(removeBtn);
    container.appendChild(chip);
  });
}

function buildPayload() {
  const metrics = Array.from(document.querySelectorAll(".metric-checkbox:checked")).map(x => x.value);
  const groups = Array.from(document.querySelectorAll(".group-checkbox:checked")).map(x => x.value);

  const filters = Array.from(document.querySelectorAll(".filter-row")).map(row => {
    const field = row.querySelector(".filter-field").value;
    const values = Array.isArray(row.selectedValues) ? row.selectedValues : [];

    return { field, values };
  }).filter(f => f.field && f.values.length > 0);

  return {
    metrics,
    groups,
    filters,
    date_range: {
      from: document.getElementById("dateFrom").value,
      to: document.getElementById("dateTo").value
    },
    date_field: document.getElementById("dateField").value,
    grain: document.getElementById("grain").value
  };
}

function buildSqlPreview(payload) {
  const groupSqlMap = {
    ticket_status: "`t.ticket_status_code`",
    ticket_city_from: "`t.city_from_name`",
    ticket_city_to: "`t.city_to_name`",
    currency_code: "`t.currency_code`",
    tenant_name: "`te.tenant_name`",
    carrier_name: "`c.carrier_name`",
    sales_channel_name: "`sales_channel_name`",
    route_city_from: "`route_city_from`",
    route_city_to: "`route_city_to`",
    route_id: "`tr.ims_route_id`",
    payment_method: "`t.payment_method_code`"
  };

  const metricSqlMap = {
    revenue: "SUM(CASE WHEN `t.ticket_status_code` = 'cancelled' THEN `t.refund_amount` ELSE `t.paid_amount` END)",
    passengers_actual: "COUNTIf(`t.ticket_status_code` != 'cancelled')",
    passengers_all: "COUNT()",
    trips_count: "COUNT(DISTINCT `t.ims_trip_id`)",
    avg_ticket_price: "AVGIf(`t.ticket_price`, `t.ticket_status_code` != 'cancelled')",
    cancelled_count: "COUNTIf(`t.ticket_status_code` = 'cancelled')"
  };

  const dateFieldExpr = payload.date_field === "purchase_date"
    ? "`t.purchase_date_msk`"
    : "`tr.departure_msk`";

  let dateExpr = `toDate(${dateFieldExpr})`;
  if (payload.grain === "week") {
    dateExpr = `toDate(toStartOfWeek(${dateFieldExpr}))`;
  }
  if (payload.grain === "month") {
    dateExpr = `toDate(toStartOfMonth(${dateFieldExpr}))`;
  }

  const selectParts = [`${dateExpr} AS date`];
  const groupParts = [dateExpr];
  const whereParts = [
    `${dateFieldExpr} >= toDateTime('${payload.date_range.from} 00:00:00')`,
    `${dateFieldExpr} <= toDateTime('${payload.date_range.to} 23:59:59')`
  ];

  payload.groups.forEach(g => {
    selectParts.push(`${groupSqlMap[g]} AS ${g}`);
    groupParts.push(groupSqlMap[g]);
  });

  payload.metrics.forEach(m => {
    selectParts.push(`${metricSqlMap[m]} AS ${m}`);
  });

  payload.filters.forEach(f => {
    const values = f.values.map(v => `'${String(v).replaceAll("'", "''")}'`).join(", ");
    whereParts.push(`${groupSqlMap[f.field] || filterExpr(f.field)} IN (${values})`);
  });

  return `SELECT
  ${selectParts.join(",\n  ")}
FROM routes_raw
WHERE
  ${whereParts.join("\n  AND ")}
GROUP BY
  ${groupParts.join(",\n  ")}
ORDER BY
  ${groupParts.join(",\n  ")}`;
}

function filterExpr(field) {
  const map = {
    carrier_name: "`c.carrier_name`",
    tenant_name: "`te.tenant_name`",
    route_city_from: "`route_city_from`",
    route_city_to: "`route_city_to`",
    route_id: "`tr.ims_route_id`",
    payment_method: "`t.payment_method_code`",
    ticket_status: "`t.ticket_status_code`",
    ticket_city_from: "`t.city_from_name`",
    ticket_city_to: "`t.city_to_name`",
    currency_code: "`t.currency_code`"
  };
  return map[field];
}

async function runQuery() {
  const payload = buildPayload();
  const statusBox = document.getElementById("statusBox");
  const runBtn = document.getElementById("runBtn");

  if (!payload.date_range.from || !payload.date_range.to) {
    statusBox.className = "status-box error";
    statusBox.textContent = "Выбери период.";
    return;
  }

  if (payload.metrics.length === 0) {
    statusBox.className = "status-box error";
    statusBox.textContent = "Выбери хотя бы одну метрику.";
    return;
  }

  statusBox.className = "status-box";
  statusBox.textContent = "Считаю...";
  runBtn.disabled = true;

  document.getElementById("sqlPreview").value = buildSqlPreview(payload);

  try {
    const res = await fetch("/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      statusBox.className = "status-box error";
      statusBox.textContent = "Ошибка запроса: " + text;
      document.getElementById("debug").textContent = text;
      return;
    }

    const rows = await res.json();
    lastRows = rows;

    document.getElementById("debug").textContent = JSON.stringify(rows.slice(0, 20), null, 2);

    if (!rows.length) {
      statusBox.className = "status-box error";
      statusBox.textContent = "Нет данных по выбранным условиям.";
      renderTable([]);
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      return;
    }

    renderChart(rows);
    renderTable(rows);

    statusBox.className = "status-box success";
    statusBox.textContent = `Готово. Строк: ${rows.length}`;

    document.querySelector(".panel:last-of-type")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  } catch (err) {
    statusBox.className = "status-box error";
    statusBox.textContent = "Сетевая ошибка: " + err.message;
    document.getElementById("debug").textContent = err.message;
  } finally {
    runBtn.disabled = false;
  }
}

function renderChart(rows) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (!rows || rows.length === 0) {
    return;
  }

  const allKeys = Object.keys(rows[0]);
  const metricKeys = allKeys.filter(k => typeof rows[0][k] === "number");
  const dimKeys = allKeys.filter(k => !metricKeys.includes(k));

  const xKey = "date";
  const otherDims = dimKeys.filter(k => k !== xKey);

  const labels = [...new Set(rows.map(r => r[xKey]))];

  const datasets = [];

  if (otherDims.length === 0) {
    metricKeys.forEach(metric => {
      datasets.push({
        label: metric,
        data: labels.map(label => {
          const row = rows.find(r => r[xKey] === label);
          return row ? row[metric] : null;
        })
      });
    });
  } else {
    const seriesMap = new Map();

    rows.forEach(row => {
      const dimLabel = otherDims.map(k => row[k]).join(" | ");

      metricKeys.forEach(metric => {
        const seriesName = `${dimLabel} — ${metric}`;
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, new Map());
        }
        seriesMap.get(seriesName).set(row[xKey], row[metric]);
      });
    });

    for (const [seriesName, valueMap] of seriesMap.entries()) {
      datasets.push({
        label: seriesName,
        data: labels.map(label => valueMap.has(label) ? valueMap.get(label) : null)
      });
    }
  }

  chartInstance = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderTable(rows) {
  const table = document.getElementById("resultTable");
  table.innerHTML = "";

  if (!rows || rows.length === 0) {
    table.innerHTML = "<tr><td>Нет данных</td></tr>";
    return;
  }

  const columns = Object.keys(rows[0]);

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  const tbody = document.createElement("tbody");
  rows.forEach(row => {
    const tr = document.createElement("tr");
    columns.forEach(col => {
      const td = document.createElement("td");
      td.textContent = row[col] == null ? "" : row[col];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
}