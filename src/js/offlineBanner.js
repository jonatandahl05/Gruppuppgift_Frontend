export function initOfflineBanner() {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;

    const update = () => {
        const offline = !navigator.onLine;
        banner.hidden = !offline;
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    update();
}
