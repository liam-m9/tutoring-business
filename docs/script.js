const API_URL =
  "https://vas272pqy4.execute-api.eu-west-2.amazonaws.com/inquiry";

function turnstileCallback(token) {
  document.getElementById("turnstileToken").value = token;
}

function loadTurnstile() {
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

function formatPhoneNumber(input) {
  let value = input.value.replace(/\D/g, "");
  if (value.length >= 10) {
    value = value.slice(0, 10).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  input.value = value;
}

async function submitInquiry(form) {
  const data = new FormData(form);
  const honeypot = document.getElementById("website").value;
  const loadTime = Number(form.dataset.loadTime);
  const token = data.get("turnstileToken");

  if (honeypot || Date.now() - loadTime < 3000) return;

  if (!token) {
    alert("Please complete the security check before submitting.");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      first_name: data.get("firstName"),
      last_name: data.get("lastName"),
      email: data.get("email"),
      phone: data.get("phone").toString(),
      turnstile_token: token,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    alert(body.error || `Sorry, something went wrong. Please try again.`);
    return;
  }

  form.hidden = true;
  document.getElementById("thankYouMessage").hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  loadTurnstile();

  const form = document.getElementById("contactForm");
  if (!form) return;

  form.dataset.loadTime = Date.now();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitInquiry(form);
  });

  const phone = form.querySelector('input[name="phone"]');
  if (phone) phone.addEventListener("input", (e) => formatPhoneNumber(e.target));
});
