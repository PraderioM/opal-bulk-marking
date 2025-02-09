setup();
LAST_CHECKED_URL = window.location.href;
interval = setInterval(resetPage, 1000)

function resetPage() {
	let current_url = window.location.href;
	if (current_url !== LAST_CHECKED_URL) {
		LAST_CHECKED_URL = current_url;
		setup();
	}
}