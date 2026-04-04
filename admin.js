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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
        product.image.toLowerCase().includes(searchValue) ||
        (product.images || []).some((imagePath) => imagePath.toLowerCase().includes(searchValue))
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
    const imageCount = Array.isArray(product.images) && product.images.length ? product.images.length : (product.image ? 1 : 0);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="admin-product-cell">
          <strong>${product.name}</strong>
          <span>${product.id}</span>
        </div>
      </td>
      <td>${product.category || "-"}</td>
      <td>${formatPrice(product.priceValue)}</td>
      <td><span class="admin-status admin-status-${product.status}">${product.status}</span></td>
      <td class="admin-image-path">
        <strong>${imageCount} fotografija</strong>
        <span>${product.image}</span>
      </td>
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

function getProductImages(product = null) {
  if (Array.isArray(product?.images) && product.images.length) {
    return product.images.filter((value) => typeof value === "string" && value.trim());
  }

  if (product?.image) {
    return [product.image];
  }

  return [""];
}

function getAdminImageValues() {
  return Array.from(document.querySelectorAll("[data-admin-image-input]"))
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function createAdminImageRow(value = "") {
  const row = document.createElement("div");
  row.className = "admin-image-row";
  row.innerHTML = `
    <input
      class="admin-input"
      data-admin-image-input
      type="text"
      value="${escapeHtml(value)}"
      placeholder="Slike/Proizvodi/naziv-slike.jpeg"
    >
    <button class="admin-action-btn danger" data-admin-remove-image type="button">Ukloni</button>
  `;
  return row;
}

function renderAdminImageInputs(images = [""]) {
  const list = document.getElementById("adminProductImagesList");
  if (!list) {
    return;
  }

  const normalizedImages = images.length ? images : [""];
  list.innerHTML = "";
  normalizedImages.forEach((image) => {
    list.appendChild(createAdminImageRow(image));
  });
}

function fillForm(product = null) {
  document.getElementById("adminProductId").value = product?.id || "";
  document.getElementById("adminProductName").value = product?.name || "";
  document.getElementById("adminProductPrice").value = product?.priceValue || "";
  renderAdminImageInputs(getProductImages(product));
  document.getElementById("adminProductDescription").value = product?.description || "";
  document.getElementById("adminProductMaterial").value = product?.material || "";
  document.getElementById("adminProductDimensions").value = product?.dimensions || "";
  document.getElementById("adminProductCategory").value = product?.category || "torbe";
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
  const imageList = document.getElementById("adminProductImagesList");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("adminProductName").value.trim();
    const idField = document.getElementById("adminProductId").value.trim();
    const images = getAdminImageValues();
    const image = images[0] || "";
    const description = document.getElementById("adminProductDescription").value.trim();
    const material = document.getElementById("adminProductMaterial").value.trim();
    const dimensions = document.getElementById("adminProductDimensions").value.trim();
    const category = document.getElementById("adminProductCategory").value;
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
      images,
      description,
      material,
      dimensions,
      category,
      status,
    });

    store.recordEvent("admin_product_save", { productId: savedProduct.id });
    fillForm();
    renderAdmin();
  });

  document.getElementById("adminFormResetBtn").addEventListener("click", () => {
    fillForm();
  });

  document.getElementById("adminAddImageBtn").addEventListener("click", () => {
    imageList.appendChild(createAdminImageRow(""));
  });

  imageList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-admin-remove-image]");
    if (!removeButton) {
      return;
    }

    const rows = imageList.querySelectorAll(".admin-image-row");
    if (rows.length <= 1) {
      const input = rows[0]?.querySelector("[data-admin-image-input]");
      if (input) {
        input.value = "";
      }
      return;
    }

    removeButton.closest(".admin-image-row")?.remove();
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
  fillForm();
  renderAdmin();
}

initAdmin();
