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

// This function gets as input an object to download and the name under which it should be downloaded and downloads that object under that name.
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

//******************************************************//
// region ALL SUBMISSIONS PAGE
//******************************************************//
// this function returns a promise that is resolved when all the students are visible in the current page.
function showAllStudents(page) {
	// If the students are not currently being shown we will need to update the page and wait for them to become visible.
	// We will check the ready status every "time_delay" milliseconds.
	// TODO find a better way to do this.
	let time_delay = 500;

	function waitForLoad(outer_resolve) {
		// when all the players have been loaded a single button of the class "b_table_page" will appear.
		// TODO find a better way to do this.
		if (page.getElementsByClassName("b_table_page").length !== 1) {
			return setTimeout(() => { waitForLoad(outer_resolve); }, time_delay);
		}
		else {
			return outer_resolve(0);
		}
	}


	// Look for element containing the show all button and click it. If not found we do nothing.
	function showAll(outer_resolve) {
		let container_list = page.getElementsByClassName("b_table_page_all");
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
		if (main_string.substring(0, s.length) === s){
			return true;
		}
	}
	return false;
}

// This function looks for the main table and returns it if it can be found. Otherwise, it returns 'null'.
function getMainTable(page) {
	let main_form_id = getMainFormID(page);
	if (main_form_id === null) {
		return null;
	}

	let table = page.getElementById(getTablePrefix()+main_form_id);

	if (table === undefined) {
		return null;
	}

	return table;
}

// This function looks for the main table and, if it finds it, returns the first column of the main table whose header
// is among the given ones, or at least starts with one of the given headers.
// If either the table or the header could not be found then the function returns -1.
function getHeaderColumn(page, header_name_list) {
	let table = getMainTable(page);
	if (table === null) {
		return -1;
	}

	let table_head = table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
	let all_headers = table_head.getElementsByTagName("th");

	for (let i=0; i< all_headers.length; i++){
		let link_list = all_headers[i].getElementsByTagName("a");
		let link_number = (i === 0)? 0: 1; // For the first column the header name is written in the first link. For the rest it's written on the second.

		if (link_list.length < link_number+1) {
			return -1;
		}

		let link = link_list[link_number]; // The header name should be written in here.
		if (startsWithSubstring(link.innerHTML, header_name_list)) { // If we find the header we return the index.
			return i;
		}
	}

	return -1;
}

// This function looks for the main table and, if it finds it, returns the column of the main table corresponding to the surname.
// If either the main table or surname column cannot be found the function returns -1.
function getSurnameColumn(page) {
	return getHeaderColumn(page,[getSurnameHeaderEnglish(), getSurnameHeaderGerman()]);
}

// This function looks for the main table and, if it finds it, returns the column of the main table corresponding to the name.
// If either the main table or name column cannot be found the function returns -1.
function getNameColumn(page) {
	return getHeaderColumn(page,[getNameHeaderEnglish(), getNameHeaderGerman()]);
}

// This function looks for the main table and, if it finds it, returns the column of the main table corresponding to the student ID.
// If either the main table or student ID column cannot be found the function returns -1.
function getIDColumn(page) {
	return getHeaderColumn(page,[getIDHeaderEnglish(), getIDHeaderGerman()]);
}

// This function looks for the main table and, if it finds it, returns the column of the main table corresponding to the number of submissions.
// If either the main table or number of submissions column cannot be found the function returns -1.
function getNSubmissionsColumn(page) {
	return getHeaderColumn(page,[getNSubmissionsHeaderEnglish(), getNSubmissionsHeaderGerman()]);
}

// This function looks for the main table and, if it finds it, returns the column of the main table corresponding to the grade.
// If either the main table or grade column cannot be found the function returns -1.
function getGradeColumn(page) {
	return getHeaderColumn(page,[getGradeHeaderEnglish(), getGradeHeaderGerman()]);
}

// This function checks if we are currently located in the page where we can see submission for a given exercise.
function isTablePage(page) {
	return (getSurnameColumn(page) !== -1) && (getNameColumn(page) !== -1) && (getIDColumn(page) !== -1) && (getNSubmissionsColumn(page) !== -1 && (getGradeColumn(page) !== -1));
}
//******************************************************//
// endregion
//******************************************************//

//******************************************************//
// region STUDENT SUBMISSION PAGE
//******************************************************//
// This function returns the main div in a student submission page or null if that div could not be found.
function getStudentSubmissionMainDiv() {
	let elements = document.getElementsByClassName("b_with_small_icon_left");
	if (elements.length !== 3) {
		return null;
	}

	return elements[0].parentNode;
}

// This function returns the title in a student submission page or null if that title could not be found.
function getStudentSubmissionTitle() {
	let main_div = getStudentSubmissionMainDiv();
	if (main_div === null) {
		return null;
	}

	let headers = main_div.getElementsByTagName("h4");
	if (headers.length !== 1) {
		return null;
	}

	return headers[0];
}

// This function returns the back button in a student submission page or null if that button could not be found.
function getStudentSubmissionBackLink() {
	let main_div = getStudentSubmissionMainDiv();
	if (main_div === null) {
		return null;
	}

	let spans = main_div.getElementsByTagName("span");
	if (spans.length === 0) {
		return null;
	}

	let links = spans[0].getElementsByTagName("a");
	if (links.length !== 1) {
		return null;
	}

	return links[0];
}

// This function checks if we are currently located in the page where we can the submission of a particular student for a given exercise.
function isStudentSubmissionPage() {
	let link = getStudentSubmissionBackLink();
	if (link === null) {
		return false;
	}

	let title = getStudentSubmissionTitle();
	if (title === null) {
		return false;
	}

	return startsWithSubstring(title.innerHTML, [getStudentsSubmissionHeaderEnglish(), getStudentsSubmissionHeaderGerman()]);
	// let page = await loadPage(link.href);
	// return isTablePage(page);
}
//******************************************************//
// endregion
//******************************************************//


// This functions takes as input HTML code and a string and shows the HTML in a dialog box that mimics the alert function.
// The button used to close the box shows the value of the string. If this value is an empty string then the default 
// getOKButtonValue() is used.
function customAlert(message, accept_text = "", headerCaller = getHeader) {
	if (accept_text === "") {
		accept_text = getOKButtonValue();
	}
	
	function showDialog(resolve) {
		let header = headerCaller();
		let dialog = document.createElement("dialog");
		dialog.setAttribute("class", "opal-bulk-dialog");
		header.appendChild(dialog);
		dialog.innerHTML = message;

		// Add a button used to close the dialog.
		let button_container = document.createElement("span");
		button_container.setAttribute("class", "opal-bulk-spaced-container");
		dialog.appendChild(button_container);

		let close_button = document.createElement("button");
		close_button.innerHTML = accept_text;
		close_button.addEventListener("click", () => {
			dialog.close();
		});
		button_container.appendChild(close_button);

		// After closing we delete the dialog and resolve the promise.
		dialog.onclose = () => {
			dialog.remove();
			resolve(true);
		};

		// Display the dialog.
		dialog.showModal();
	}

	return new Promise(showDialog);
}


// This functions takes as input HTML code and two string "confirm_text" and "cancel_text" and the HTML in a dialog box that
// mimics the custom function. The two buttons to accept or reject the displayed message take values from the corresponding
// texts. If these values are empty string then the defaults getConfirmButtonValue() and getCancelButtonValue are used.
function customConfirm(message, confirm_text = "", cancel_text = "", headerCaller = getHeader) {
	if (confirm_text === "") {
		confirm_text = getConfirmButtonValue();
	}
	if (cancel_text === "") {
		cancel_text = getCancelButtonValue();
	}

	function showDialog(resolve) {
		let header = headerCaller();
		let dialog = document.createElement("dialog");
		dialog.setAttribute("class", "opal-bulk-dialog");
		header.appendChild(dialog);
		dialog.innerHTML = message;

		// Add buttons to accept or refuse the message displayed in the code.
		let button_container = document.createElement("span");
		button_container.setAttribute("class", "opal-bulk-spaced-container");
		dialog.appendChild(button_container);

		let button_clicked = false;

		// When message is accepted we resolve the promise positively and delete the dialog.
		let confirm_button = document.createElement("button");
		confirm_button.innerHTML = confirm_text;
		confirm_button.addEventListener("click", () => {
			button_clicked = true;
			dialog.close();
			dialog.remove();
			resolve(true);
		});
		button_container.appendChild(confirm_button);

		// When message is rejected we resolve the promise negatively and delete the dialog.
		let cancel_button = document.createElement("button");
		cancel_button.innerHTML = cancel_text;
		cancel_button.addEventListener("click", () => {
			button_clicked = true;
			dialog.close();
			dialog.remove();
			resolve(false);
		});
		button_container.appendChild(cancel_button);

		// If no button is pressed but the dialog is closed in a different way we act as if it was rejected.
		dialog.onclose = () => {
			if (!button_clicked) { 
				dialog.remove();
				resolve(false);
			}
		};

		dialog.showModal();
	}

	return new Promise(showDialog);
}

// This functions follows a link to a new page.
function followLink(url) {
	let link = document.createElement("a");
	link.setAttribute("href", url);
	link.click();
}
