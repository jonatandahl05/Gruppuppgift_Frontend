// offlineBanner.js
export function initOfflineBanner() {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;

    function update() {
        const offline = !navigator.onLine;
        banner.hidden = !offline;
        document.body.classList.toggle("is-offline", offline);
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    update();
}
