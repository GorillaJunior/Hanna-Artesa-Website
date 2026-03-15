(() => {
  const DEFAULT_PRODUCTS = [
    { id: "bakatorba", name: "Bakatorba", priceValue: 5600, image: "Slike/Proizvodi/bakatorba.jpeg", status: "active" },
    { id: "bakatorba1", name: "Bakatorba 1", priceValue: 3400, image: "Slike/Proizvodi/bakatorba1.jpeg", status: "active" },
    { id: "belatorba1", name: "Belatorba 1", priceValue: 3400, image: "Slike/Proizvodi/belatorba1.jpeg", status: "active" },
    { id: "belatorba2", name: "Belatorba 2", priceValue: 5000, image: "Slike/Proizvodi/belatorba2.jpeg", status: "active" },
    { id: "belatorba3", name: "Belatorba 3", priceValue: 3500, image: "Slike/Proizvodi/belatorba3.jpeg", status: "active" },
    { id: "belatorbica", name: "Belatorbica", priceValue: 3900, image: "Slike/Proizvodi/belatorbica.jpeg", status: "active" },
    { id: "belatorbica1", name: "Belatorbica 1", priceValue: 5800, image: "Slike/Proizvodi/belatorbica1.jpeg", status: "active" },
    { id: "cegertorba", name: "Cegertorba", priceValue: 5000, image: "Slike/Proizvodi/cegertorba.jpeg", status: "active" },
    { id: "cegertorba1", name: "Cegertorba 1", priceValue: 3600, image: "Slike/Proizvodi/cegertorba1.jpeg", status: "active" },
    { id: "dedamraz", name: "Dedamraz", priceValue: 6000, image: "Slike/Proizvodi/dedamraz.jpeg", status: "active" },
    { id: "dedamraz10", name: "Dedamraz 10", priceValue: 3800, image: "Slike/Proizvodi/dedamraz10.jpeg", status: "active" },
    { id: "dedamraz2", name: "Dedamraz 2", priceValue: 3900, image: "Slike/Proizvodi/dedamraz2.jpeg", status: "active" },
    { id: "dedamraz3", name: "Dedamraz 3", priceValue: 4900, image: "Slike/Proizvodi/dedamraz3.jpeg", status: "active" },
    { id: "dedamraz4", name: "Dedamraz 4", priceValue: 4200, image: "Slike/Proizvodi/dedamraz4.jpeg", status: "active" },
    { id: "dedamraz5", name: "Dedamraz 5", priceValue: 4400, image: "Slike/Proizvodi/dedamraz5.jpeg", status: "active" },
    { id: "dedamraz6", name: "Dedamraz 6", priceValue: 3900, image: "Slike/Proizvodi/dedamraz6.jpeg", status: "active" },
    { id: "dedamraz7", name: "Dedamraz 7", priceValue: 5000, image: "Slike/Proizvodi/dedamraz7.jpeg", status: "active" },
    { id: "dedamraz8", name: "Dedamraz 8", priceValue: 3000, image: "Slike/Proizvodi/dedamraz8.jpeg", status: "active" },
    { id: "dedamraz9", name: "Dedamraz 9", priceValue: 6200, image: "Slike/Proizvodi/dedamraz9.jpeg", status: "active" },
    { id: "djedomraz1", name: "Djedomraz 1", priceValue: 5200, image: "Slike/Proizvodi/djedomraz1.jpeg", status: "active" },
    { id: "djedomraz2", name: "Djedomraz 2", priceValue: 4500, image: "Slike/Proizvodi/djedomraz2.jpeg", status: "active" },
    { id: "djedomraz3", name: "Djedomraz 3", priceValue: 3500, image: "Slike/Proizvodi/djedomraz3.jpeg", status: "active" },
    { id: "dugecarape", name: "Dugecarape", priceValue: 3200, image: "Slike/Proizvodi/dugecarape.jpeg", status: "active" },
    { id: "dugecarape2", name: "Dugecarape 2", priceValue: 5700, image: "Slike/Proizvodi/dugecarape2.jpeg", status: "active" },
    { id: "dzemper1", name: "Dzemper 1", priceValue: 6200, image: "Slike/Proizvodi/Dzemper1.jpeg", status: "active" },
    { id: "dzemper2", name: "Dzemper 2", priceValue: 5100, image: "Slike/Proizvodi/Dzemper2.jpeg", status: "active" },
    { id: "dzemper3", name: "Dzemper 3", priceValue: 3000, image: "Slike/Proizvodi/Dzemper3.jpeg", status: "active" },
    { id: "kapa1", name: "Kapa 1", priceValue: 5800, image: "Slike/Proizvodi/kapa1.jpeg", status: "active" },
    { id: "kapa2", name: "Kapa 2", priceValue: 3500, image: "Slike/Proizvodi/kapa2.jpeg", status: "active" },
    { id: "kapa3", name: "Kapa 3", priceValue: 6600, image: "Slike/Proizvodi/kapa3.jpeg", status: "active" },
    { id: "karakondzula1", name: "Karakondzula 1", priceValue: 5700, image: "Slike/Proizvodi/karakondzula1.jpeg", status: "active" },
    { id: "karakondzula2", name: "Karakondzula 2", priceValue: 5000, image: "Slike/Proizvodi/karakondzula2.jpeg", status: "active" },
    { id: "karakondzula3", name: "Karakondzula 3", priceValue: 3600, image: "Slike/Proizvodi/karakondzula3.jpeg", status: "active" },
    { id: "kratkecarape", name: "Kratkecarape", priceValue: 3000, image: "Slike/Proizvodi/kratkecarape.jpeg", status: "active" },
    { id: "kremtorba1", name: "Kremtorba 1", priceValue: 4100, image: "Slike/Proizvodi/kremtorba1.jpeg", status: "active" },
    { id: "kremtorba2", name: "Kremtorba 2", priceValue: 5200, image: "Slike/Proizvodi/kremtorba2.jpeg", status: "active" },
    { id: "kremtorba3", name: "Kremtorba 3", priceValue: 6200, image: "Slike/Proizvodi/kremtorba3.jpeg", status: "active" },
    { id: "kupaci", name: "Kupaci", priceValue: 2900, image: "Slike/Proizvodi/kupaci.jpeg", status: "active" },
    { id: "kupaci2", name: "Kupaci 2", priceValue: 5000, image: "Slike/Proizvodi/kupaci2.jpeg", status: "active" },
    { id: "kupaci3", name: "Kupaci 3", priceValue: 6200, image: "Slike/Proizvodi/kupaci3.jpeg", status: "active" },
    { id: "kuso", name: "Kuso", priceValue: 5900, image: "Slike/Proizvodi/kuso.jpeg", status: "active" },
    { id: "medo1", name: "Medo 1", priceValue: 4400, image: "Slike/Proizvodi/medo1.jpeg", status: "active" },
    { id: "medo2", name: "Medo 2", priceValue: 3500, image: "Slike/Proizvodi/medo2.jpeg", status: "active" },
    { id: "medobran", name: "Medobran", priceValue: 3000, image: "Slike/Proizvodi/medobran.jpeg", status: "active" },
    { id: "medobrundo", name: "Medobrundo", priceValue: 3100, image: "Slike/Proizvodi/medobrundo.jpeg", status: "active" },
    { id: "medobrundo1", name: "Medobrundo 1", priceValue: 6100, image: "Slike/Proizvodi/medobrundo1.jpeg", status: "active" },
    { id: "medobrundo2", name: "Medobrundo 2", priceValue: 5400, image: "Slike/Proizvodi/medobrundo2.jpeg", status: "active" },
    { id: "narandzasta-torba", name: "Narandzasta torba", priceValue: 3300, image: "Slike/Proizvodi/narandzasta torba.jpeg", status: "active" },
    { id: "nausice", name: "Nausice", priceValue: 3900, image: "Slike/Proizvodi/Nausice.jpeg", status: "active" },
    { id: "okruglatorba", name: "Okruglatorba", priceValue: 6000, image: "Slike/Proizvodi/okruglatorba.jpeg", status: "active" },
    { id: "plazatorba1", name: "Plazatorba 1", priceValue: 4000, image: "Slike/Proizvodi/plazatorba1.jpeg", status: "active" },
    { id: "plazatorba2", name: "Plazatorba 2", priceValue: 5500, image: "Slike/Proizvodi/plazatorba2.jpeg", status: "active" },
    { id: "plazatorba3", name: "Plazatorba 3", priceValue: 3400, image: "Slike/Proizvodi/plazatorba3.jpeg", status: "active" },
    { id: "plazatorba4", name: "Plazatorba 4", priceValue: 3000, image: "Slike/Proizvodi/plazatorba4.jpeg", status: "active" },
    { id: "ranac", name: "Ranac", priceValue: 5300, image: "Slike/Proizvodi/ranac.jpeg", status: "active" },
    { id: "rozetorba1", name: "Rozetorba 1", priceValue: 5000, image: "Slike/Proizvodi/rozetorba1.jpeg", status: "active" },
    { id: "rozetorba2", name: "Rozetorba 2", priceValue: 3100, image: "Slike/Proizvodi/rozetorba2.jpeg", status: "active" },
    { id: "rozetorba3", name: "Rozetorba 3", priceValue: 4600, image: "Slike/Proizvodi/rozetorba3.jpeg", status: "active" },
    { id: "sarenatorba1", name: "Sarenatorba 1", priceValue: 5700, image: "Slike/Proizvodi/sarenatorba1.jpeg", status: "active" },
    { id: "sarenatorba2", name: "Sarenatorba 2", priceValue: 5400, image: "Slike/Proizvodi/sarenatorba2.jpeg", status: "active" },
    { id: "sarenatorba3", name: "Sarenatorba 3", priceValue: 3700, image: "Slike/Proizvodi/sarenatorba3.jpeg", status: "active" },
    { id: "skoljkatorba", name: "Skoljkatorba", priceValue: 2900, image: "Slike/Proizvodi/skoljkatorba.jpeg", status: "active" },
    { id: "skoljkatorba2", name: "Skoljkatorba 2", priceValue: 4300, image: "Slike/Proizvodi/skoljkatorba2.jpeg", status: "active" },
    { id: "skoljkatorba3", name: "Skoljkatorba 3", priceValue: 3900, image: "Slike/Proizvodi/skoljkatorba3.jpeg", status: "active" },
    { id: "snesko", name: "Snesko", priceValue: 3100, image: "Slike/Proizvodi/snesko.jpeg", status: "active" },
    { id: "snesko1", name: "Snesko 1", priceValue: 5800, image: "Slike/Proizvodi/snesko1.jpeg", status: "active" },
    { id: "snesko2", name: "Snesko 2", priceValue: 3100, image: "Slike/Proizvodi/snesko2.jpeg", status: "active" },
    { id: "snesko3", name: "Snesko 3", priceValue: 4800, image: "Slike/Proizvodi/snesko3.jpeg", status: "active" },
    { id: "snoopy", name: "Snoopy", priceValue: 2900, image: "Slike/Proizvodi/snoopy.jpeg", status: "active" },
    { id: "supiizuco", name: "Supiizuco", priceValue: 6100, image: "Slike/Proizvodi/supiizuco.jpeg", status: "active" },
    { id: "supiizuco2", name: "Supiizuco 2", priceValue: 4700, image: "Slike/Proizvodi/supiizuco2.jpeg", status: "active" },
    { id: "tamnokrem1", name: "Tamnokrem 1", priceValue: 5000, image: "Slike/Proizvodi/tamnokrem1.jpeg", status: "active" },
    { id: "tamnokrem2", name: "Tamnokrem 2", priceValue: 4900, image: "Slike/Proizvodi/tamnokrem2.jpeg", status: "active" },
    { id: "tirkiztorba1", name: "Tirkiztorba 1", priceValue: 2900, image: "Slike/Proizvodi/tirkiztorba1.jpeg", status: "active" },
    { id: "tirkiztorba2", name: "Tirkiztorba 2", priceValue: 6200, image: "Slike/Proizvodi/tirkiztorba2.jpeg", status: "active" },
    { id: "trougaotorba", name: "Trougaotorba", priceValue: 2900, image: "Slike/Proizvodi/trougaotorba.jpeg", status: "active" },
    { id: "trougaotorba2", name: "Trougaotorba 2", priceValue: 2900, image: "Slike/Proizvodi/trougaotorba2.jpeg", status: "active" },
    { id: "trougaotorba3", name: "Trougaotorba 3", priceValue: 3100, image: "Slike/Proizvodi/trougaotorba3.jpeg", status: "active" },
    { id: "trougaotorba4", name: "Trougaotorba 4", priceValue: 5500, image: "Slike/Proizvodi/trougaotorba4.jpeg", status: "active" },
    { id: "zuco1", name: "Zuco 1", priceValue: 3000, image: "Slike/Proizvodi/zuco1.jpeg", status: "active" },
    { id: "zuco2", name: "Zuco 2", priceValue: 6600, image: "Slike/Proizvodi/zuco2.jpeg", status: "active" },
  ];

  const STORAGE_KEYS = {
    products: "hanna-artesa-products-v1",
    newsletter: "hanna-artesa-newsletter-v1",
    analytics: "hanna-artesa-analytics-v1",
    session: "hanna-artesa-session-v1",
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function slugify(value) {
    return (value || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function normalizeProduct(product, index) {
    const now = new Date().toISOString();
    const priceValue = Number(product.priceValue);

    return {
      id: product.id || `product-${index + 1}`,
      name: product.name || `Proizvod ${index + 1}`,
      priceValue: Number.isFinite(priceValue) ? priceValue : 0,
      image: product.image || "",
      status: product.status === "archived" ? "archived" : "active",
      createdAt: product.createdAt || now,
      updatedAt: product.updatedAt || now,
    };
  }

  function getProducts() {
    const savedProducts = loadJSON(STORAGE_KEYS.products, null);
    if (!Array.isArray(savedProducts) || savedProducts.length === 0) {
      const defaults = DEFAULT_PRODUCTS.map(normalizeProduct);
      saveJSON(STORAGE_KEYS.products, defaults);
      return defaults;
    }

    return savedProducts.map(normalizeProduct);
  }

  function saveProducts(products) {
    const normalized = products.map(normalizeProduct);
    saveJSON(STORAGE_KEYS.products, normalized);
    return normalized;
  }

  function getVisibleProducts() {
    return getProducts().filter((product) => product.status !== "archived");
  }

  function upsertProduct(product) {
    const products = getProducts();
    const productId = product.id || slugify(product.name) || `product-${Date.now()}`;
    const existingIndex = products.findIndex((item) => item.id === productId);
    const now = new Date().toISOString();
    const normalizedProduct = normalizeProduct({
      ...product,
      id: productId,
      createdAt: existingIndex >= 0 ? products[existingIndex].createdAt : now,
      updatedAt: now,
    }, existingIndex >= 0 ? existingIndex : products.length);

    if (existingIndex >= 0) {
      products[existingIndex] = normalizedProduct;
    } else {
      products.push(normalizedProduct);
    }

    saveProducts(products);
    return normalizedProduct;
  }

  function setProductStatus(productId, status) {
    const products = getProducts().map((product) => {
      if (product.id !== productId) {
        return product;
      }

      return {
        ...product,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    return saveProducts(products);
  }

  function deleteProduct(productId) {
    const products = getProducts().filter((product) => product.id !== productId);
    return saveProducts(products);
  }

  function resetProducts() {
    const defaults = DEFAULT_PRODUCTS.map(normalizeProduct);
    saveJSON(STORAGE_KEYS.products, defaults);
    return defaults;
  }

  function getSessionId() {
    let sessionId = localStorage.getItem(STORAGE_KEYS.session);
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(STORAGE_KEYS.session, sessionId);
    }
    return sessionId;
  }

  function getNewsletterSignups() {
    const signups = loadJSON(STORAGE_KEYS.newsletter, []);
    return Array.isArray(signups) ? signups : [];
  }

  function addNewsletterSignup(email) {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      return;
    }

    const signups = getNewsletterSignups();
    const exists = signups.some((signup) => signup.email === cleanEmail);
    if (exists) {
      return;
    }

    const nextSignups = [
      {
        email: cleanEmail,
        sessionId: getSessionId(),
        createdAt: new Date().toISOString(),
      },
      ...signups,
    ];

    saveJSON(STORAGE_KEYS.newsletter, nextSignups);
  }

  function getAnalytics() {
    const analytics = loadJSON(STORAGE_KEYS.analytics, {
      events: [],
      sessions: {},
    });

    if (!analytics || typeof analytics !== "object") {
      return { events: [], sessions: {} };
    }

    return {
      events: Array.isArray(analytics.events) ? analytics.events : [],
      sessions: analytics.sessions && typeof analytics.sessions === "object" ? analytics.sessions : {},
    };
  }

  function recordEvent(type, payload = {}) {
    const analytics = getAnalytics();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type,
      sessionId,
      timestamp,
      path: location.pathname,
      payload,
    };

    analytics.events.unshift(event);
    analytics.events = analytics.events.slice(0, 1500);

    const currentSession = analytics.sessions[sessionId] || {
      sessionId,
      firstSeen: timestamp,
      lastSeen: timestamp,
      eventCount: 0,
    };

    analytics.sessions[sessionId] = {
      ...currentSession,
      lastSeen: timestamp,
      eventCount: currentSession.eventCount + 1,
    };

    saveJSON(STORAGE_KEYS.analytics, analytics);
    return event;
  }

  function clearAnalytics() {
    saveJSON(STORAGE_KEYS.analytics, { events: [], sessions: {} });
  }

  function getAnalyticsSummary() {
    const analytics = getAnalytics();
    const products = getProducts();
    const visibleProducts = products.filter((product) => product.status !== "archived");
    const archivedProducts = products.filter((product) => product.status === "archived");

    const counts = analytics.events.reduce((summary, event) => {
      summary[event.type] = (summary[event.type] || 0) + 1;
      return summary;
    }, {});

    return {
      totalProducts: products.length,
      activeProducts: visibleProducts.length,
      archivedProducts: archivedProducts.length,
      totalEvents: analytics.events.length,
      totalSessions: Object.keys(analytics.sessions).length,
      pageViews: counts.page_view || 0,
      productClicks: counts.product_click || 0,
      imageOpens: counts.image_open || 0,
      cartAdds: counts.cart_add || 0,
      cartRemovals: counts.cart_remove || 0,
      newsletterSignups: getNewsletterSignups().length,
      recentEvents: analytics.events.slice(0, 40),
      recentSessions: Object.values(analytics.sessions)
        .sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen))
        .slice(0, 20),
    };
  }

  function exportSnapshot() {
    return clone({
      products: getProducts(),
      newsletter: getNewsletterSignups(),
      analytics: getAnalytics(),
    });
  }

  window.HannaStore = {
    slugify,
    getProducts,
    getVisibleProducts,
    saveProducts,
    upsertProduct,
    setProductStatus,
    deleteProduct,
    resetProducts,
    getNewsletterSignups,
    addNewsletterSignup,
    getSessionId,
    recordEvent,
    getAnalytics,
    getAnalyticsSummary,
    clearAnalytics,
    exportSnapshot,
  };
})();
