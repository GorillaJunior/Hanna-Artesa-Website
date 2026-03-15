const store = window.HannaStore;

function formatPrice(value) {
  return `${new Intl.NumberFormat("sr-RS").format(Number(value) || 0)} RSD`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("sr-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderStats() {
  const summary = store.getAnalyticsSummary();

  document.getElementById("statActiveProducts").textContent = String(summary.activeProducts);
  document.getElementById("statArchivedProducts").textContent = String(summary.archivedProducts);
  document.getElementById("statPageViews").textContent = String(summary.pageViews);
  document.getElementById("statProductClicks").textContent = String(summary.productClicks);
  document.getElementById("statImageOpens").textContent = String(summary.imageOpens);
  document.getElementById("statCartAdds").textContent = String(summary.cartAdds);
  document.getElementById("statNewsletterSignups").textContent = String(summary.newsletterSignups);
  document.getElementById("statSessions").textContent = String(summary.totalSessions);
}

function renderProductsTable() {
  const searchValue = (document.getElementById("adminSearchInput").value || "").trim().toLowerCase();
  const tbody = document.getElementById("adminProductsBody");
  const products = store.getProducts()
    .filter((product) => {
      if (!searchValue) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(searchValue) ||
        product.id.toLowerCase().includes(searchValue) ||
        product.image.toLowerCase().includes(searchValue)
      );
    })
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  tbody.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="admin-product-cell">
          <strong>${product.name}</strong>
          <span>${product.id}</span>
        </div>
      </td>
      <td>${formatPrice(product.priceValue)}</td>
      <td><span class="admin-status admin-status-${product.status}">${product.status}</span></td>
      <td class="admin-image-path">${product.image}</td>
      <td>
        <div class="admin-row-actions">
          <button class="admin-action-btn" data-action="edit" data-product-id="${product.id}" type="button">Izmeni</button>
          <button class="admin-action-btn" data-action="toggle-status" data-product-id="${product.id}" type="button">${product.status === "archived" ? "Vrati" : "Arhiviraj"}</button>
          <button class="admin-action-btn danger" data-action="delete" data-product-id="${product.id}" type="button">Obrisi</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderRecentEvents() {
  const feed = document.getElementById("adminEventsFeed");
  const events = store.getAnalyticsSummary().recentEvents;

  if (!events.length) {
    feed.innerHTML = '<p class="admin-empty">Jos nema zabelezenih dogadjaja.</p>';
    return;
  }

  feed.innerHTML = "";

  events.forEach((event) => {
    const item = document.createElement("article");
    item.className = "admin-feed-item";
    item.innerHTML = `
      <div>
        <strong>${event.type}</strong>
        <p>${event.payload.productId || event.payload.pageType || event.path}</p>
      </div>
      <span>${formatDate(event.timestamp)}</span>
    `;
    feed.appendChild(item);
  });
}

function renderSessions() {
  const feed = document.getElementById("adminSessionsFeed");
  const sessions = store.getAnalyticsSummary().recentSessions;

  if (!sessions.length) {
    feed.innerHTML = '<p class="admin-empty">Sesije ce se pojaviti kada neko koristi sajt na ovom browseru.</p>';
    return;
  }

  feed.innerHTML = "";

  sessions.forEach((session) => {
    const item = document.createElement("article");
    item.className = "admin-feed-item";
    item.innerHTML = `
      <div>
        <strong>${session.sessionId}</strong>
        <p>Dogadjaji: ${session.eventCount}</p>
      </div>
      <span>${formatDate(session.lastSeen)}</span>
    `;
    feed.appendChild(item);
  });
}

function renderNewsletter() {
  const feed = document.getElementById("adminNewsletterFeed");
  const signups = store.getNewsletterSignups();

  if (!signups.length) {
    feed.innerHTML = '<p class="admin-empty">Jos nema newsletter prijava.</p>';
    return;
  }

  feed.innerHTML = "";

  signups.forEach((signup) => {
    const item = document.createElement("article");
    item.className = "admin-feed-item";
    item.innerHTML = `
      <div>
        <strong>${signup.email}</strong>
        <p>${signup.sessionId}</p>
      </div>
      <span>${formatDate(signup.createdAt)}</span>
    `;
    feed.appendChild(item);
  });
}

function renderAdmin() {
  renderStats();
  renderProductsTable();
  renderRecentEvents();
  renderSessions();
  renderNewsletter();
}

function fillForm(product = null) {
  document.getElementById("adminProductId").value = product?.id || "";
  document.getElementById("adminProductName").value = product?.name || "";
  document.getElementById("adminProductPrice").value = product?.priceValue || "";
  document.getElementById("adminProductImage").value = product?.image || "";
  document.getElementById("adminProductStatus").value = product?.status || "active";
}

function exportSnapshot() {
  const snapshot = store.exportSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hanna-artesa-admin-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function setupAdminForm() {
  const form = document.getElementById("adminProductForm");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("adminProductName").value.trim();
    const idField = document.getElementById("adminProductId").value.trim();
    const image = document.getElementById("adminProductImage").value.trim();
    const status = document.getElementById("adminProductStatus").value;
    const priceValue = Number(document.getElementById("adminProductPrice").value);

    if (!name || !image || !Number.isFinite(priceValue)) {
      return;
    }

    const savedProduct = store.upsertProduct({
      id: idField || store.slugify(name),
      name,
      priceValue,
      image,
      status,
    });

    store.recordEvent("admin_product_save", { productId: savedProduct.id });
    fillForm();
    renderAdmin();
  });

  document.getElementById("adminFormResetBtn").addEventListener("click", () => {
    fillForm();
  });
}

function setupProductActions() {
  document.getElementById("adminProductsBody").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) {
      return;
    }

    const productId = button.dataset.productId;
    const action = button.dataset.action;
    const product = store.getProducts().find((item) => item.id === productId);

    if (!product) {
      return;
    }

    if (action === "edit") {
      fillForm(product);
      return;
    }

    if (action === "toggle-status") {
      const nextStatus = product.status === "archived" ? "active" : "archived";
      store.setProductStatus(productId, nextStatus);
      store.recordEvent("admin_product_status", { productId, status: nextStatus });
      renderAdmin();
      return;
    }

    if (action === "delete") {
      const confirmed = confirm(`Obrisi proizvod "${product.name}"?`);
      if (!confirmed) {
        return;
      }

      store.deleteProduct(productId);
      store.recordEvent("admin_product_delete", { productId });
      fillForm();
      renderAdmin();
    }
  });
}

function setupToolbar() {
  document.getElementById("adminSearchInput").addEventListener("input", () => {
    renderProductsTable();
  });

  document.getElementById("adminExportBtn").addEventListener("click", () => {
    exportSnapshot();
  });

  document.getElementById("adminResetProductsBtn").addEventListener("click", () => {
    const confirmed = confirm("Vrati ceo katalog na pocetne proizvode?");
    if (!confirmed) {
      return;
    }

    store.resetProducts();
    store.recordEvent("admin_products_reset");
    fillForm();
    renderAdmin();
  });

  document.getElementById("adminClearAnalyticsBtn").addEventListener("click", () => {
    const confirmed = confirm("Obrisi lokalnu analitiku i sesije?");
    if (!confirmed) {
      return;
    }

    store.clearAnalytics();
    renderAdmin();
  });
}

function initAdmin() {
  setupAdminForm();
  setupProductActions();
  setupToolbar();
  renderAdmin();
}

initAdmin();
