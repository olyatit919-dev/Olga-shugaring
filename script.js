// Прайс-лист Ольги
const services = [
  { name: "Глубокое бикини", price: 1000 },
  { name: "Классическое бикини", price: 600 },
  { name: "Подмышечные впадины", price: 300 },
  { name: "Голени / бёдра", price: 800 },
  { name: "Ноги полностью", price: 1100 },
  { name: "Руки полностью", price: 800 },
  { name: "Руки до / выше локтя", price: 600 },
  { name: "Усики", price: 200 },
  { name: "Живот / ягодицы / поясница", price: 600 },
  { name: "Глубокое бикини + подмышки", price: 1200 },
  { name: "Голени + глубокое бикини + подмышки", price: 1800 },
  { name: "Ноги полностью + глубокое бикини + подмышки", price: 2100 }
];

const selectedServices = new Set();
const money = value => `${value.toLocaleString("ru-RU")} ₽`;
const serviceList = document.querySelector("#service-list");
const bookingModal = document.querySelector("#booking-modal");
const config = window.SITE_CONFIG || {};

function selectedItems() {
  return services.filter(service => selectedServices.has(service.name));
}
function totalPrice() {
  return selectedItems().reduce((sum, service) => sum + service.price, 0);
}
function pluralServices(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "услуга";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "услуги";
  return "услуг";
}
function scrollToServices() {
  document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
function updateSelectionUI() {
  const count = selectedServices.size;
  const header = document.querySelector("#header-selection");
  const bar = document.querySelector("#selection-bar");
  const barCount = document.querySelector("#selection-bar-count");
  const barTotal = document.querySelector("#selection-bar-total");
  const bookingLink = document.querySelector("#booking-link");

  if (header) header.textContent = count ? `· ${count} · ${money(totalPrice())}` : "";
  if (bar) bar.hidden = count === 0;
  if (barCount) barCount.textContent = `${count} ${pluralServices(count)} выбрано`;
  if (barTotal) barTotal.textContent = `Итого по прайсу: ${money(totalPrice())}`;
  if (bookingLink) bookingLink.textContent = count
    ? `Перейти к записи · ${count} ${pluralServices(count)} · ${money(totalPrice())}`
    : "Перейти к выбору услуг";
}
function renderServices() {
  if (!serviceList) return;
  serviceList.innerHTML = "";
  services.forEach(service => {
    const selected = selectedServices.has(service.name);
    const card = document.createElement("article");
    card.className = `service-card${selected ? " is-selected" : ""}`;

    const top = document.createElement("div");
    top.className = "service-card-top";
    const title = document.createElement("h3");
    title.textContent = service.name;
    const price = document.createElement("p");
    price.className = "service-price";
    price.textContent = money(service.price);
    top.append(title, price);

    const choose = document.createElement("button");
    choose.type = "button";
    choose.className = "button service-select";
    choose.setAttribute("aria-pressed", String(selected));
    choose.textContent = selected ? "✓ Выбрано · Убрать" : "＋ Выбрать услугу";
    choose.addEventListener("click", () => {
      selected ? selectedServices.delete(service.name) : selectedServices.add(service.name);
      renderServices();
      updateSelectionUI();
    });

    card.append(top, choose);
    serviceList.appendChild(card);
  });
}
function openBooking() {
  const chosen = selectedItems();
  const status = document.querySelector("#modal-status");
  if (!chosen.length) {
    status.textContent = "Сначала выбери одну или несколько процедур в прайсе.";
    bookingModal?.close();
    scrollToServices();
    return;
  }

  const modalServices = document.querySelector("#modal-services");
  modalServices.innerHTML = "";
  chosen.forEach(service => {
    const row = document.createElement("div");
    row.className = "modal-service-row";
    const name = document.createElement("span");
    name.textContent = service.name;
    const price = document.createElement("span");
    price.textContent = money(service.price);
    row.append(name, price);
    modalServices.appendChild(row);
  });
  document.querySelector("#modal-total").textContent = money(totalPrice());
  status.textContent = "";

  const phone = String(config.phone || "").trim();
  const phoneDigits = phone.replace(/[^\d+]/g, "");
  const phoneButton = document.querySelector("#modal-phone");
  phoneButton.href = phoneDigits ? `tel:${phoneDigits}` : "#";
  phoneButton.textContent = phone ? `Позвонить Ольге · ${phone}` : "Телефон добавь в config.js";
  phoneButton.onclick = event => {
    if (!phoneDigits) {
      event.preventDefault();
      status.textContent = "Открой config.js и впиши номер Ольги в поле phone.";
    }
  };

  const maxUrl = String(config.maxUrl || "").trim();
  const maxButton = document.querySelector("#modal-max");
  maxButton.href = maxUrl || "#";
  maxButton.textContent = maxUrl ? "Написать Ольге в MAX" : "Ссылка MAX — добавь в config.js";
  maxButton.onclick = event => {
    if (!maxUrl) {
      event.preventDefault();
      status.textContent = "Открой config.js и вставь ссылку на MAX в поле maxUrl.";
    }
  };

  const message = [
    "Здравствуйте, Ольга! Хочу записаться на шугаринг.",
    "",
    ...chosen.map(service => `• ${service.name} — ${money(service.price)}`),
    "",
    `Итого по прайсу: ${money(totalPrice())}`,
    "Подскажите, пожалуйста, какие есть свободные даты и время?"
  ].join("\n");
  document.querySelector("#modal-copy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(message);
      status.textContent = "Сообщение скопировано — вставь его в MAX или SMS.";
    } catch {
      window.prompt("Скопируй сообщение для Ольги:", message);
    }
  };
  if (bookingModal?.showModal) bookingModal.showModal();
}

document.querySelectorAll("[data-go-services], #header-booking").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    scrollToServices();
  });
});
document.querySelector("#selection-bar-book")?.addEventListener("click", openBooking);
document.querySelector("#booking-link")?.addEventListener("click", event => {
  event.preventDefault();
  if (selectedServices.size) openBooking();
  else scrollToServices();
});
document.querySelector("#modal-close")?.addEventListener("click", () => bookingModal.close());
bookingModal?.addEventListener("click", event => {
  if (event.target === bookingModal) bookingModal.close();
});

const address = document.querySelector("#address");
const hours = document.querySelector("#working-hours");
const map = document.querySelector("#map-link");
if (address) address.textContent = config.address || "Адрес уточняется при записи";
if (hours) hours.textContent = config.workingHours || "По предварительной записи";
if (map) {
  if (config.mapUrl) map.href = config.mapUrl;
  else map.hidden = true;
}
renderServices();
updateSelectionUI();
