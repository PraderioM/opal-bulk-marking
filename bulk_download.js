// This function gets links to the submission pages of each of the students and downloads the submissions one by one.
// While downloading the download submission range button is disabled and its text replaced by a processing message.
function downloadSubmissionsRange() {
	// We temporarily disable the download submissions button and show that the downloads are being processed.
	onDownloadStart();

	// Getting first, last student and naming convention and then obtaining all information relative to the requested list of students.
	// We will then iterate over this resulting list.
	let start_student = getSelectedStudent(getStartDropDownId(), ["A", "Zzzz"]);
	let end_student = getSelectedStudent(getEndDropDownId(), ["Zzzz", "A"]);
	let file_naming_code = getFileNamingCode();

	let students_interval = getStudentsInterval(start_student, end_student);
	let n = students_interval.length;
	
	// The function below makes a promise to download the first file in a list, waits for the promise to complete and then proceeds to the next.
	function recursiveDownload(outer_resolve) {
		if (students_interval.length === 0) {
			// When this point is reached all files have been downloaded and we can resolve the promise.
			onDownloadEnd();
			return outer_resolve(0);
		} else {
			let student_data = students_interval.pop();

			let student_surname = student_data[0];
			let student_name = student_data[1];
			let student_id = student_data[2];
			let student_url = student_data[3];
			let download_file_name = getDownloadFileName(student_id, student_surname, student_name, file_naming_code);

			return downloadStudentSubmission(student_url, download_file_name).then(
				() => {
					return new Promise(
							(inner_resolve) => {
								onDownloadProgress(n-students_interval.length, n);
								return outer_resolve(recursiveDownload(inner_resolve));
							}
						)
					}
				)
		}
	}

	return new Promise(recursiveDownload);
}

// The function below makes a promise that is resolved when a student submission file is downloaded.
function downloadStudentSubmission(student_url, file_name) {

	function download(download_resolve) {
		// Once the stundent page is loaded we can start the download.
		loadPage(student_url).then((student_page) => {
			sendDownloadRequest(student_page, download_resolve);
		});
	}

	// find the "a" to the pdf to download and retrieve its url.
	function sendDownloadRequest(stundet_page, download_resolve) {
		// The submission can be found following a link in the third column row one of the table body of the only table of class "b_briefcase_filetable".
		let table = stundet_page.getElementsByClassName("b_briefcase_filetable")[0];
		let tbody = table.tBodies[0];
		let row = tbody.firstChild;
		let cell = row.children[getPDFDownloadColumn()];
		let link = cell.firstChild;

		let request = new XMLHttpRequest();
		request.responseType = 'blob';
		request.open("GET", link.href);
		request.addEventListener('load', function() {
			save(request.response, file_name); // this function is in the utils file and saves the pdf under the specified file name.
			download_resolve(0);
		});
		request.send();
	}


	return new Promise(download);
}

function getFileNamingCode() {
	let dropdown = document.getElementById(getDownloadFileNameDropdownId());
	return dropdown.selectedIndex;
}

function getSelectedStudent(dropdown_id, default_value) {
	let dropdown = document.getElementById(dropdown_id);
	if (dropdown.selectedIndex == 0) {
		return default_value;
	}
	return dropdown.options[dropdown.selectedIndex].value.split(",");
}

function getStudentsInterval(start=["A", "Zzzz"], end=["Zzzz", "A"]) {
	start[0] = sanitize_name(start[0]);
	start[1] = sanitize_name(start[1]);
	end[0] = sanitize_name(end[0]);
	end[1] = sanitize_name(end[1]);

	let table = document.getElementById(getTablePrefix() + getMainFormID());

	let tableBody = table.getElementsByTagName("tbody")[0];

	let students_interval = [];

	for (let row of tableBody.getElementsByTagName("tr")) {
		let allEntries = row.getElementsByTagName("td");
		let link = allEntries[getSurnameColumn()].getElementsByTagName("a")[1];
		let surname = link.innerHTML;
		let sane_surname = sanitize_name(surname);
		let url = link.href;
		let name = allEntries[getNameColumn()].getElementsByTagName("a")[0].innerHTML;
		let sane_name = sanitize_name(name);
		
		// The students are ordered first in alphabetical order by surame and then in alphabetical order by name.
		if (start[0] < sane_surname || (start[0] == sane_surname && start[1] <= sane_name)) {
			if (sane_surname < end[0] || (sane_surname == end[0] && sane_name <= end[1])) {
				let nSubmissions = allEntries[getNSubmissionsColumn()].innerHTML;
				if (nSubmissions > 0) {
					let identifier = allEntries[getIDColumn()].innerHTML;
					let name = allEntries[getNameColumn()].getElementsByTagName("a")[0].innerHTML;
					students_interval.push([surname, name, identifier, url]);
				}
			}
		}
	}
	return students_interval;
}

function getDownloadFileName(student_id, surname, name, naming_code) {
	if (naming_code === 0) {
		return surname+"_"+name+".pdf";
	} else if (naming_code === 1) {
		return student_id+".pdf";
	} else {
		throw new Error(getUnrecognizedNamingText() + naming_code);
	}
}


// This function makes all operations needed when file download starts.
function onDownloadStart() {
	let processing_text = getDownloadingText();

	let button = getStartDownloadButton();
	button.setAttribute("class", "opal-bulk-disabled-button");
	button.removeEventListener("click", downloadSubmissionsRange)
	button.setAttribute("value", processing_text);
}

// This function updates a progress bar that keeps track of the download progress.
// The value i represents the number of downloaded files while n is the total number of files to download.
function onDownloadProgress(i, n) {
	let button = getStartDownloadButton();
	button.setAttribute("value", i + "/" + n);
}

// This function makes all operations needed when file download ends.
function onDownloadEnd() {
	alert(getDownloadCompletedText());
	let button = getStartDownloadButton();
	button.setAttribute("value", getDownloadButtonValue());
	button.setAttribute("class", "opal-bulk-button");
	button.addEventListener("click", downloadSubmissionsRange);
}


function sanitize_name(str) {
	let out_str = str.toLowerCase();

	out_str = out_str.replaceAll("ß", "ss");
	out_str = out_str.replaceAll("ñ", "n");
	
	out_str = out_str.replaceAll("á", "a");
	out_str = out_str.replaceAll("à", "a");
	out_str = out_str.replaceAll("ä", "a");
	out_str = out_str.replaceAll("â", "a");

	out_str = out_str.replaceAll("é", "e");
	out_str = out_str.replaceAll("è", "e");
	out_str = out_str.replaceAll("ë", "e");
	out_str = out_str.replaceAll("ê", "e");

	out_str = out_str.replaceAll("í", "i");
	out_str = out_str.replaceAll("ì", "i");
	out_str = out_str.replaceAll("ï", "i");
	out_str = out_str.replaceAll("î", "i");
	
	out_str = out_str.replaceAll("ó", "o");
	out_str = out_str.replaceAll("ò", "o");
	out_str = out_str.replaceAll("ö", "o");
	out_str = out_str.replaceAll("ô", "o");
	
	out_str = out_str.replaceAll("ú", "u");
	out_str = out_str.replaceAll("ù", "u");
	out_str = out_str.replaceAll("ü", "u");
	out_str = out_str.replaceAll("û", "u");

	return out_str;
}