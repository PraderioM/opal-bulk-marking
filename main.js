main();

function main() {
	resumeUploading(); // This will do something only if there are files left to upload.
	setup();
	window.setInterval(resetPage, 2000);
}

function resetPage() {
	if (document.getElementById(getHeaderId()) === null) {
		setup();
	}
}
