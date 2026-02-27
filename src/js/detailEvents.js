export function openDetail(type, id) {
  window.dispatchEvent(
    new CustomEvent("open-detail", {
      detail: { type, id: String(id) },
    })
  );
}