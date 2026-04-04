const BREVO_API_URL = "https://api.brevo.com/v3/contacts";

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function subscribeWithWebhook(email) {
  const response = await fetch(process.env.NEWSLETTER_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      source: "hanna-artesa-website",
    }),
  });

  if (!response.ok) {
    throw new Error("Webhook newsletter integracija nije uspela.");
  }
}

async function subscribeWithBrevo(email) {
  const listIds = process.env.BREVO_NEWSLETTER_LIST_ID
    ? [Number(process.env.BREVO_NEWSLETTER_LIST_ID)]
    : undefined;

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      listIds,
      updateEnabled: true,
    }),
  });

  if (response.ok || response.status === 204) {
    return;
  }

  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData?.message || "Brevo newsletter integracija nije uspela.");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const body = req.body && typeof req.body === "object" ? req.body : await readBody(req);
    const email = String(body?.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return sendJson(res, 400, { error: "Unesite ispravnu email adresu." });
    }

    if (process.env.NEWSLETTER_WEBHOOK_URL) {
      await subscribeWithWebhook(email);
    } else if (process.env.BREVO_API_KEY) {
      await subscribeWithBrevo(email);
    } else {
      return sendJson(res, 500, {
        error: "Newsletter nije povezan sa pravim servisom. Dodajte NEWSLETTER_WEBHOOK_URL ili BREVO_API_KEY.",
      });
    }

    return sendJson(res, 200, {
      ok: true,
      message: "Hvala! Vase prijavljivanje je uspesno sacuvano.",
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error.message || "Prijava na newsletter trenutno nije uspela.",
    });
  }
};
