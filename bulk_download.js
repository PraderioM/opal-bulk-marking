// This function gets links to the submission pages of each of the students and downloads the submissions one by one.
// While downloading the download submission range button is disabled and its text replaced by a processing message.
async function downloadSubmissionsRange() {
	// We temporarily disable the download submissions button and show that the downloads are being processed.
	let button = getStartDownloadButton();
	button.setAttribute("class", "opal-bulk-disabled-button");
	button.removeEventListener("click", downloadSubmissionsRange);

	// Getting first, last student and naming convention and then obtaining all information relative to the requested list of students.
	// We will then iterate over this resulting list.
	let start_student = getSelectedStudent(getStartDropDownId(), ["", ""]);
	let end_student = getSelectedStudent(getEndDropDownId(), ["", ""]);
	let file_name_prefix = getChosenFileNamePrefix();
	let add_student_name = getAddStudentName();

	let all_students_intervals = getStudentsInterval(start_student, end_student);
	let students_interval = await preProcessStudentIntervals(all_students_intervals[0], all_students_intervals[1]);
	let n = students_interval.length;

	// We prepare the progressbar for downloading.
	onDownloadStart(n);
	
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
			let download_file_name = getDownloadFileName(student_id, student_surname, student_name, file_name_prefix, add_student_name);

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
			downloadFiles(student_page, download_resolve);
		});
	}

	function recursiveDownload(download_data_list, download_resolve) {
		if (download_data_list.length === 0) {
			download_resolve(0); // Once all files are downloaded we resolve our promise.
		} else {
			// First element of download data is the link to a file and the second the file name.
			let download_data = download_data_list.pop();
			let request = new XMLHttpRequest();
			request.responseType = 'blob';
			request.open("GET", download_data[0]);
			request.addEventListener('load', function() {
				save(request.response, download_data[1]); // this function is in the utils file and saves the pdf under the specified file name.
				// Once one file is downloaded we proceed to the next one. 
				recursiveDownload(download_data_list, download_resolve);
			});
			request.send();
		}
	}

	// Find all the files submitted and download all of them.
	function downloadFiles(stundet_page, download_resolve) {
		// The submission can be found following a link in the third column row one of the table body of the only table of class "b_briefcase_filetable".
		let table = stundet_page.getElementsByClassName("b_briefcase_filetable")[0];
		let tbody = table.tBodies[0];
		let rows = tbody.children;
		let download_links = preProcessLinks(rows);

		recursiveDownload(download_links, download_resolve);
	}

	// This function looks at all the rows in the submission table and prepares the appropriate links.
	function preProcessLinks(row_list) {
		let pdf_download_column = getPDFDownloadColumn();

		if (row_list.length === 1) {
			let cell = row_list[0].children[pdf_download_column];
			return [[getLinkFromRow(row_list[0]), file_name]];
		} else {
			let base_file_name = file_name.slice(0,-4) + "_" + getSubmissionNumberText() + "_";
			let output = [];
			let i = 1;
			for (let row of row_list) {
				output.push([getLinkFromRow(row), base_file_name + i + ".pdf"]);
				i = i + 1;
			}
			return output;
		}
	}

	// This function retrieves the link to a submission from a row in the submission table.
	function getLinkFromRow(row) {
		let cell = row.children[getPDFDownloadColumn()];
		let link = cell.firstChild;
		return link.href;
	}


	return new Promise(download);
}

function getChosenFileNamePrefix() {
	let input = document.getElementById(getFileNamePrefixId());
	return sanitizeInput(input.value, ["<id>[1]", "<id>[2]", "<id>[3]", "<id>[4]", "<id>[5]", "<id>[6]", "<id>[7]"]);
}

function getAddStudentName() {
	let checkbox = document.getElementById(getAddNameCheckboxId());
	return checkbox.checked;
}

function getSelectedStudent(dropdown_id, default_value) {
	let dropdown = document.getElementById(dropdown_id);
	if (dropdown.selectedIndex == 0) {
		return default_value;
	}
	return dropdown.options[dropdown.selectedIndex].value.split(",");
}


// This function takes as input two list one of non marked students and the other of marked students
// (see "getStudentsInterval" for a description on the format) and returns a single list with the same
// format as the non marked students list that corresponds to all the students whose submissions should be downloaded.
// The function asks the user for confirmation as to what should be downloaded if necessary.
// WARNING the function modfies the "non_marked_students" list and make it into the output.
async function preProcessStudentIntervals(non_marked_students, marked_students) {

	if (marked_students.length === 0) {
		return non_marked_students;
	}

	// If the user confirms they want to download all students intervals then we add the markedd students intervals
	// to the non marked ones and later return those.
	if (await confirmDownloadMarked(marked_students)) {
		for (let student_data of marked_students) {
			// We need to change the format of marked students data in order to match the one of non marked students data.
			non_marked_students.push(student_data.slice(0,4));
		}
		return non_marked_students;
	} else {
		return non_marked_students;
	}
}

// This funtion takes as input a list of marked students (see "getStudentsInterval" for a description on the format) and
// asks the user if they wish to download them of not. It then returns true if they answer yes and false otherwise.
function confirmDownloadMarked(marked_students) {
	let message = "<span>" + getConfirmDownloadMarkedText() + "</span>\n";
	message = message + "<table class=\"opal-bulk-borderless-table\">\n";

	let highlight = false;

	// Add all rows with alternating colors in order to make identification easier.
	for (let student_data of marked_students) {			
		highlight = !highlight;

		// Cell for name and surname.
		let surname = student_data[0];
		let name = student_data[1];
		message = message + "<tr>\n<td";
		if (highlight) {
			message = message + " class=\"opal-bulk-highlighted-cell\"";
		}
		message = message + ">" + surname + ", " + name + "</td>\n";

		// Cell for grade.
		let grade = student_data[4];
		message = message + "<td";
		if (highlight) {
			message = message + " class=\"opal-bulk-highlighted-cell\"";
		}
		message = message + ">" + grade + "</td>\n</tr>\n";
	}
	message = message + "</table>\n"

	return customConfirm(message, getDownloadAllButtonValue(), getDownloadNonMarkedButtonValue());
}

// This function takes as input the Surname and name of two sets of students and returns thre lists.
// The first list contains quadruples of the form (surname, name, student_id, student_page_link) and corresponds to students
// whose submission has not yet been marked. The second list contains quintuples of the form 
// (surname, name, student_id, student_page_link, grade) and corresponds to students whose sumbissions have already been marked.
// The third list has the same format as the first but contains all students.
function getStudentsInterval(start=["", ""], end=["", ""]) {
	start[0] = sanitizeName(start[0]);
	start[1] = sanitizeName(start[1]);
	end[0] = sanitizeName(end[0]);
	end[1] = sanitizeName(end[1]);

	let table = document.getElementById(getTablePrefix() + getMainFormID());

	let tableBody = table.getElementsByTagName("tbody")[0];

	let non_marked_students = [];
	let marked_students = [];
	let all_students = [];

	let interval_start = false;

	for (let row of tableBody.getElementsByTagName("tr")) {
		let allEntries = row.getElementsByTagName("td");
		let link = allEntries[getSurnameColumn()].getElementsByTagName("a")[1];
		let surname = link.innerHTML;
		let sane_surname = sanitizeName(surname);
		let url = link.href;
		let name = allEntries[getNameColumn()].getElementsByTagName("a")[0].innerHTML;
		let sane_name = sanitizeName(name);

		// If the first student is matched or is the default then we set interval to start.
		if ((start[0] === "" && start[1] === "") || (start[0] === sane_surname && start[1] === sane_name)) {
			interval_start = true;
		}

		// Download all students in the interval.
		if (interval_start) {
			let nSubmissions = allEntries[getNSubmissionsColumn()].innerHTML;
			if (nSubmissions > 0) {
				let identifier = allEntries[getIDColumn()].innerHTML;
				name = allEntries[getNameColumn()].getElementsByTagName("a")[0].innerHTML;
				let grade = allEntries[getGradeColumn()].getElementsByTagName("span")[0].innerHTML;
				if (grade === "") {
					non_marked_students.push([surname, name, identifier, url]);
				} else {
					marked_students.push([surname, name, identifier, url, grade]);
				}
				all_students.push([surname, name, identifier, url]);
			}
		}

		// If the interval is finished then we break out of the loop.
		if (sane_surname === end[0] && sane_name <= end[1]) {
			break;
		}
	}

	return [non_marked_students, marked_students, all_students];
}

function getDownloadFileName(student_id, surname, name, file_name_prefix, add_student_name, default_id = getDefaultStudentId()) {
	let output = "";

	if (file_name_prefix !== "") {
		for (let i = 1; i <= 7; i++) {
			file_name_prefix = file_name_prefix.replaceAll("<id>["+i+"]", student_id[i-1]);
		}
		output = output + file_name_prefix + "_";
	}

	if (add_student_name || student_id === "") {
		output = output + surname + "_" + name + "_";
	}

	if (student_id === "") {
		student_id = default_id;
	}

	output = output + student_id + ".pdf";
	return output;
}


// This function makes all operations needed when file download starts.
function onDownloadStart(n) {
	setBulkDownloadProgress(n);
}

// This function updates a progress bar that keeps track of the download progress.
// The value i represents the number of downloaded files while n is the total number of files to download.
function onDownloadProgress(i, n) {
	let progress = getDownloadProgressBar(n);
	progress.setAttribute("value", i);	
	let label = getDownloadProgressLabel(n);
	label.innerHTML = getDownloadingText() + i + "/" + n;
}

// This function makes all operations needed when file download ends.
function onDownloadEnd() {
	customAlert(getDownloadCompletedText());
	setBulkDownloadHeader();
}


function sanitizeName(str) {
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


function sanitizeInput(str, allowed_strings) {
	let pre_processed_str = sanitizeName(str);

	// The allowed strings need to be recursively removed from the text wich then needs to be sanitized
	// before being put back together using the allowed string as separator.
	function recursiveSanitize(substr, remaining_allowed_strings) {
		if (remaining_allowed_strings.length === 0) {
			let output = "";
			// Only the letters in the english alphabet, numbers and the symbols ".", "," and "-" are allowed in the input.
			// We remove everything else.
			for (let char of substr) {
				if (char.match(/[a-z0-9.,-]/i) !== null) {
					output = output + char;
				}
			}
			return output
		} else {
			// We need to separate the string by one of the allowed strings, process the obtained strings using this
			// same function and then put them back together using the same separator.
			let separator = remaining_allowed_strings[0];
			let new_remaining_allowed_strings = remaining_allowed_strings.slice(1, remaining_allowed_strings.length);
			let substr_list = substr.split(separator);
			let out_substr_list = [];
			for (let subsubstr of substr_list) {
				out_substr_list.push(recursiveSanitize(subsubstr, new_remaining_allowed_strings));
			}
			return out_substr_list.join(separator);
		}
	}



	return recursiveSanitize(pre_processed_str, allowed_strings);
}