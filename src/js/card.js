import { toggleFavorite, isFavorite } from "./favStore.js";
import { getImage, PLACEHOLDER_IMG } from "./media.js";
import { openDetail } from "./detailEvents.js";

export function createCard(item, type, options = {}) {
  const {
    showBadge = false,
    badgeLabel = "",
    viewBtnClass = "",
  } = options;

  const id = String(item.id ?? item.url?.match(/\/(\d+)\/$/)?.[1] ?? "");
  if (!id) return null;

  const name = item.name || item.title || "Unknown";

  const card = document.createElement("div");
  card.className = "featured-card";

  const badgeMarkup = showBadge
    ? `<div class="card-badge" aria-label="Type">${badgeLabel}</div>`
    : "";

  card.innerHTML = `
    ${badgeMarkup}
    <img
      src="${getImage(type, id)}"
      alt="${name}"
      onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
    />
    <h3>${name}</h3>

    <div class="card-actions">
      <button class="view-btn ${viewBtnClass}".trim() type="button">View more</button>
      <button class="fav-btn" type="button">${isFavorite(id, type) ? "★" : "☆"}</button>
    </div>
  `;

  card.querySelector(".view-btn").onclick = () => openDetail(type, id);

  const favBtn = card.querySelector(".fav-btn");
  favBtn.onclick = () => {
    toggleFavorite({ id, type, name });
    favBtn.textContent = isFavorite(id, type) ? "★" : "☆";
  };

  return card;
}