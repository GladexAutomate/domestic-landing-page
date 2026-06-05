// @ts-nocheck
/*
  xenditService.js
  ────────────────
  Xendit payment gateway integration.
  API Docs: https://docs.xendit.co/apidocs

  Supports:
  • Invoice creation (GCash, Maya, Credit Card, Bank Transfer, Payment Link)
  • Invoice / payment status retrieval
  • Webhook event parsing

  ⚠️  CRITICAL SECURITY NOTE:
  The Xendit secret key grants full account access.
  Before production, move ALL Xendit calls to a Supabase Edge Function.
  The secret key must NEVER be in the browser bundle in production.

  Current setup: DEV credentials only — safe for testing.
*/

const XENDIT_BASE   = import.meta.env.VITE_XENDIT_BASE_URL    || "https://api.xendit.co";
const SECRET_KEY    = import.meta.env.VITE_XENDIT_SECRET_KEY;
const WEBHOOK_TOKEN = import.meta.env.VITE_XENDIT_WEBHOOK_SECRET;

// ── Auth header ───────────────────────────────────────────────────
// Xendit uses HTTP Basic Auth where username = secret key, password = empty
function authHeader() {
  const encoded = btoa(`${SECRET_KEY}:`);
  return { Authorization: `Basic ${encoded}` };
}

// ── Base request helper ───────────────────────────────────────────
async function xRequest(path, options = {}) {
  const url = `${XENDIT_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(options.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Xendit [${res.status}] ${json.error_code || ""}: ${json.message || JSON.stringify(json)}`);
  }

  return json;
}

// ── INVOICE (recommended for multi-payment-method checkout) ───────

/*
  createInvoice params:
  {
    externalId:   string,   // Your unique order ID (e.g. GDX booking code)
    amount:       number,   // Total amount in PHP
    description?: string,   // Item description shown on payment page
    payerEmail?:  string,   // Pre-fill customer email
    payerName?:   string,   // Pre-fill customer name
    items?:       Array<{ name, quantity, price }>,
    successRedirectUrl?: string,
    failureRedirectUrl?: string,
    currency?:    string,   // Default: "PHP"
    paymentMethods?: string[], // ["CREDIT_CARD","OTC","VIRTUAL_ACCOUNT","EWALLET"]
  }

  returns: Xendit invoice object with invoice_url for redirect
*/
export const createInvoice = async (params) => {
  const body = {
    external_id:          params.externalId,
    amount:               params.amount,
    description:          params.description || "Gladex Travel & Tours",
    payer_email:          params.payerEmail || undefined,
    customer:             params.payerName
      ? { given_names: params.payerName, ...(params.payerEmail ? { email: params.payerEmail } : {}) }
      : undefined,
    items:                params.items || [],
    currency:             params.currency || "PHP",
    success_redirect_url: params.successRedirectUrl || `${window.location.origin}/payment/success`,
    failure_redirect_url: params.failureRedirectUrl || `${window.location.origin}/payment/failed`,
    payment_methods:      params.paymentMethods || ["CREDIT_CARD", "OTC", "VIRTUAL_ACCOUNT", "EWALLET"],
    locale:               "en",
  };

  return xRequest("/v2/invoices", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ── Get invoice status ────────────────────────────────────────────
export const getInvoice = async (invoiceId) => {
  return xRequest(`/v2/invoices/${invoiceId}`);
};

// ── Get invoice by external ID ────────────────────────────────────
export const getInvoiceByExternalId = async (externalId) => {
  const data = await xRequest(`/v2/invoices?external_id=${encodeURIComponent(externalId)}`);
  // API returns an array; return the latest
  return Array.isArray(data) ? data[0] : data;
};

// ── PAYMENT LINK (simpler one-click payment URL) ──────────────────
export const createPaymentLink = async ({ amount, referenceId, description, currency = "PHP" }) => {
  const body = {
    reference_id:  referenceId,
    type:          "FIXED_AMOUNT",
    currency,
    amount,
    description,
    payment_methods: ["GCASH", "MAYA", "CARD", "BPI", "BDO"],
    redirect: {
      success_url: `${window.location.origin}/payment/success`,
      failure_url: `${window.location.origin}/payment/failed`,
      cancel_url:  `${window.location.origin}/payment/cancelled`,
    },
  };

  return xRequest("/payment/payment-links", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ── EWALLETS (GCash / Maya direct charge) ────────────────────────
export const createEWalletCharge = async ({ amount, referenceId, checkoutMethod = "ONE_TIME_PAYMENT", ewalletType = "GCASH", mobileNumber, currency = "PHP" }) => {
  const body = {
    reference_id:    referenceId,
    currency,
    amount,
    checkout_method: checkoutMethod,
    channel_code:    ewalletType,
    channel_properties: {
      success_redirect_url: `${window.location.origin}/payment/success`,
      failure_redirect_url: `${window.location.origin}/payment/failed`,
      mobile_number: mobileNumber || undefined,
    },
    metadata: { merchant: "Gladex Travel and Tours Corp." },
  };

  return xRequest("/ewallets/charges", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// Get eWallet charge status
export const getEWalletCharge = async (chargeId) => {
  return xRequest(`/ewallets/charges/${chargeId}`);
};

// ── WEBHOOK VERIFICATION ──────────────────────────────────────────
/*
  Call this in your webhook handler to verify the request is from Xendit.
  The webhook secret is in the x-callback-token header.
*/
export const verifyWebhook = (callbackToken) => {
  return callbackToken === WEBHOOK_TOKEN;
};

/*
  Parse a Xendit webhook event body.
  Returns a normalized payment result.
*/
export const parseWebhookEvent = (eventBody) => {
  const evt = typeof eventBody === "string" ? JSON.parse(eventBody) : eventBody;

  return {
    type:        evt.event || "invoice.paid",
    invoiceId:   evt.id,
    externalId:  evt.external_id,
    status:      evt.status,           // "PAID" | "EXPIRED" | "PENDING"
    amount:      evt.paid_amount || evt.amount,
    currency:    evt.currency || "PHP",
    paymentMethod: evt.payment_channel || evt.payment_method,
    paidAt:      evt.paid_at || null,
    metadata:    evt.metadata || {},
    raw:         evt,
  };
};

// ── Convenience: create Gladex checkout invoice ───────────────────
/*
  createGladexCheckout({
    bookingCode: "GDX-12345",
    guestName: "Maria Santos",
    guestEmail: "maria@example.com",
    items: [
      { name: "Island Hopping Tour", quantity: 2, price: 999 },
      { name: "Standard Travel Insurance", quantity: 1, price: 699 },
    ]
  })
*/
export const createGladexCheckout = async ({ bookingCode, guestName, guestEmail, items = [] }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return createInvoice({
    externalId:  `${bookingCode}-${Date.now()}`,
    amount:      total,
    payerEmail:  guestEmail,
    payerName:   guestName,
    description: `Gladex Travel — ${bookingCode}`,
    items:       items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
    successRedirectUrl: `${window.location.origin}/payment/success?code=${bookingCode}`,
    failureRedirectUrl: `${window.location.origin}/payment/failed?code=${bookingCode}`,
  });
};
