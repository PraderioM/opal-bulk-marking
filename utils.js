// this function takes as input an url and returns a promise that resolves when the page in that url is loaded and returns the loaded page.
function loadPage(url) {
	function load(resolve) {
		let request = new XMLHttpRequest();
		request.responseType = 'document';
		request.open("GET", url);
		request.addEventListener('load', function() {
			return resolve(request.response);
		});
		request.send();
	}

	return new Promise(load);
}

// This function gets as in put a object to download and the name under which it should be downloaded and downloads that object under that name.
// EXAMPLE:
// 		save(pdf_blob, file_name)
function save(object, name) {
	let a = document.createElement('a');
	let url = URL.createObjectURL(object);
	a.setAttribute("href", url);
	a.setAttribute("download", name);
	a.setAttribute("target", "_blank");
	a.click();
}

// this function returns a promise that is resolved when all the students are visible in the current page.
function showAllStudents() {
	// If the students are not currently being shown we will need to update the page and wait for them to become visible.
	// We will check the ready status every "time_delay" milliseconds.
	// TODO find a better way to do this.
	time_delay = "500";

	function waitForLoad(outer_resolve) {
		// when all the players have been loaded a single button of the class "b_table_page" will appear.
		// TODO find a better way to do this.
		if (document.getElementsByClassName("b_table_page").length !== 1) {
			return setTimeout(() => { waitForLoad(outer_resolve); }, time_delay);
		}
		else {
			return outer_resolve(0);
		}
	}


	// Look for element containing the show all button and click it. If not found do nothing.
	function showAll(outer_resolve) {
		let container_list = document.getElementsByClassName("b_table_page_all");
		if (container_list.length === 1) { // There should be a single element with the specified class name.
			let container = container_list[0];
			let buttons_list = container.getElementsByTagName("a");
			if (buttons_list.length === 1) { // This element should contain a single <a> type children that we should click.
				let button = buttons_list[0];
				button.click();
				setTimeout(() => { waitForLoad(outer_resolve); }, time_delay);

			}  else{ outer_resolve(1); }
		} else{ outer_resolve(0); }
	}

	return new Promise((resolve) => showAll(resolve))
}

// This function checks if the first string starts with one of the strings in a list.
function startsWithSubstring(main_string, string_list) {
	for (let s of string_list) {
		if (main_string.substring(0, s.length) == s){
			return true;
		}
	}
	return false;
}


// this function checks if we are currently located in the page where we can see submission for a given exercise.
function isTablePage() {
	if (getMainFormID() === null) {
		return false;
	}

	let table = document.getElementById(getTablePrefix()+getMainFormID());

	if (table === undefined) {
		return false;
	}

	tableHead = table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
	allHeaders = tableHead.getElementsByTagName("th");

	if (allHeaders.length < Math.max(getSurnameColumn(), getNameColumn(), getIDColumn(), getNSubmissionsColumn()) + 1) {
		return false;
	}

	surnameHeader = allHeaders[getSurnameColumn()].getElementsByTagName("a");
	if (surnameHeader.length === 0 || (!startsWithSubstring(surnameHeader[0].innerHTML, [getSurnameHeaderEnglish(), getSurnameHeaderGerman()]))) {
		return false;
	}

	nameHeader = allHeaders[getNameColumn()].getElementsByTagName("a");
	if (nameHeader.length < 2 || !startsWithSubstring(nameHeader[1].innerHTML, [getNameHeaderEnglish(), getNameHeaderGerman()])) {
		return false;
	}

	IDHeader = allHeaders[getIDColumn()].getElementsByTagName("a");
	if (IDHeader.length < 2 || !startsWithSubstring(IDHeader[1].innerHTML, [getIDHeaderEnglish(), getIDHeaderGerman()])) {
		return false;
	}

	nSubmissionsHeader = allHeaders[getNSubmissionsColumn()].getElementsByTagName("a");
	if (nSubmissionsHeader.length < 2 || !startsWithSubstring(nSubmissionsHeader[1].innerHTML, [getNSubmissionsHeaderEnglish(), getNSubmissionsHeaderGerman()])) {
		return false;
	}

	return true;

}
