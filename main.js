main();

function main() {
	setup();
	window.setInterval(resetPage, 2000);
}

function resetPage() {
	if (document.getElementById(getHeaderId()) === null) {
		setup();
	}
}
