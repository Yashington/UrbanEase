require("dotenv").config(); // loads backend/.env in this folder
const Razorpay = require("razorpay");

const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

console.log("[diag] keyId present:", !!keyId, "prefix:", keyId ? keyId.slice(0, 10) + "…" : "(none)");
console.log("[diag] keySecret present:", !!keySecret);

(async () => {
  try {
    if (!keyId || !keySecret) {
      throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET in backend/.env");
    }
    const r = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await r.orders.create({
      amount: 1000, // INR 10.00
      currency: "INR",
      receipt: "diag-test-" + Date.now(),
      notes: { test: "true" },
    });
    console.log("OK: created Razorpay order:", order.id);
  } catch (e) {
    console.error("FAIL:", e?.error || e?.message || e);
  }
})();