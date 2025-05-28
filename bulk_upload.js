// This function returns a promise that is completed when all uploaded files have been uploaded and the students marked.
async function uploadSubmissions() {
	// Temporarily disable the upload start button while we are setting up the progress bar
	let button = getUploadSelectedButton();
	button.setAttribute("class", "opal-bulk-disabled-button");
	button.removeEventListener("click", uploadSubmissions);

	let input_files = document.getElementById(getSubmissionsInputId());
	let res = preProcessFiles(input_files.files); // Separate the files between the ones in the correct format and the ones in the wrong format.
	let marked_submissions = res[0];
	let wrong_format_files = res[1];

	res = findStudentsInTable(marked_submissions);
	let matching_non_marked_submissions_list = res[0];
	let matching_marked_submissions_list = res[1];
	let duplicate_submissions_list = res[2];
	let non_matching_submissions_list = res[3];

	// The function makes a promise to upload the first submission in a list, waits until it is completed and then proceeds to the next.
	async function recursiveUpload(outer_resolve, to_upload_list, number_total_submissions) {
		if (to_upload_list.length === 0) {
			// When this point is reached all grades have been uploaded and we can resolve the promise.
			await onUploadEnd(true);
			return outer_resolve(0);
		} else {
			// Get one of the remaining submissions to upload and upload it. Then repeat the process.
			let submission = to_upload_list.pop();

			return uploadMatchingSubmission(submission[0], submission[1]).then(
				() => {
					onUploadProgress(number_total_submissions - to_upload_list.length, number_total_submissions); // Show progress of the upload process.
					return new Promise(
							(inner_resolve) => {
								return outer_resolve(recursiveUpload(inner_resolve, to_upload_list, number_total_submissions));
							}
						)
					}
				)
		}
	}

	// Ask user if the upload should proceed.
	async function upload(resolve) {
		// If some submissions where uploaded twice we stop the upload process and show a message with it.
		if (!await processDuplicateSubmissions(duplicate_submissions_list)) {
			await onUploadEnd(false);
			return resolve(1);
		}
	
		// If there are no duplicates we ask for confirmation before starting the upload process.
		let start_upload = await confirmUpload(matching_non_marked_submissions_list, matching_marked_submissions_list, non_matching_submissions_list, wrong_format_files);
		if (start_upload) {
			let submissions_to_upload = await processMarkedSubmissions(matching_non_marked_submissions_list, matching_marked_submissions_list);
			let n = submissions_to_upload.length;
			onUploadStart(n);
			return recursiveUpload(resolve, submissions_to_upload, n);
		} else {
			await onUploadEnd(false);
			return resolve(1);
		}
	}

	new Promise(upload);
}


// This function takes as input a link to a student page and a maked submision and returns a promise that is resolved when
// marked submissions has been uploaded to the corresponding page.
function uploadMatchingSubmission(student_url, marked_submission) {

	// this function loads the student page, then saves the grade and then uploads the student's submission
	function upload(upload_resolve) {
		// Once the stundent page is loaded we can save the grade, once that is done we upload the submission.
		loadPage(student_url).then((student_page) => {
			saveGrade(student_page, marked_submission.grade).then(() => {
				openUploadPage(student_page).then((upload_page) => {
					removePreviousSubmissions(student_page).then(() => {
						uploadFile(upload_page, marked_submission.file).then(() => {
							return upload_resolve(0);
						});
					});
				});
			});
		});
	}

	return new Promise(upload);
}


function openUploadPage(student_page) {
	return new Promise((resolve) => {
		let upload_button = student_page.getElementsByClassName("b_briefcase_upload")[0];
		loadPage(upload_button.href).then((res) => {
			// The response of loading the above page is an htmlElement whose head contains a single script
			// that is used on page load to populate the body. We use that script in order to create
			// the body directly without loading the page.
			let res_html = res.documentElement.innerHTML;
			let start = res_html.search("\"hfrag\":\"<div")+9;
			let end = res_html.search("div>\",\"cidvis\"")+4;

			let loaded_page = student_page.createElement("div");
			loaded_page.innerHTML = JSON.parse("\""+res_html.substring(start, end)+"\"");
			resolve(loaded_page);
		});
	});
}


// This function returns a promise that is resolved when the grade of the corresponding student has been uploaded.
function saveGrade(student_page, grade) {
	function mark(resolve) {
		// The save button is linked to the form where the grade should be saved.
		// Therefore we first obtain the save button and then modify the associated form.
		let button_list = student_page.getElementsByClassName("b_button");
		let save_button;
		for (let button of button_list) {
			if (button.value === getSaveButtonText()) {
				save_button = button;
			}
		}

		// The grade is stored on the third input value from the form.
		let form = save_button.form;
		let grade_input = form.getElementsByTagName("input")[3];
		grade_input.value = grade;


		// THe HTTP request saving the grade.
		let request = new XMLHttpRequest();
		request.open("POST", form.action);
		// The headers below are copied from the headers of the post request performed when pressing the button.
		request.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		request.setRequestHeader("Priority", "u=4");
		request.setRequestHeader("Upgrade-Insecure-Requests", "1");

		request.addEventListener('load', function() {
			if (request.status === 200) {
				resolve(0);
			} else {
				resolve(1);
			}
		});

		let form_data = new FormData(form);
		form_data.set("dispatchuri", save_button.name);
		form_data.set("dispatchevent", "2");
		let url_encoded_form_data = new URLSearchParams(form_data);

		request.send([url_encoded_form_data]);
	}

	return new Promise(mark);
}


// This function returns a promise that is resolved when all already uploaded graded submissions have been deleted.
function removePreviousSubmissions(student_page) {
	function extractLink(request_response) {
		// The response of requesting deletion is an htmlDocument whose head contains a single script
		// that is used on page load to populate the body. We use that script in order to create
		// the body directly without loading the page.
		
		// The length of the link is variable but always lower that 60 characters and ends with "link_0" 
		// (wich appears only once on the whole string) and starts with "/opal/" wich appears only once in 
		// the 60 characters before "/link_0".
		let end = request_response.search("link_0/")+7;
		let request_link = request_response.substring(end - 60, end);

		let start = request_link.search("/opal/");

		return "https://bildungsportal.sachsen.de" + request_link.substring(start);
	}

	function confirmDeletion(resolve, request_link) {

		let request = new XMLHttpRequest();
		request.open("GET", request_link);
		// The headers below are copied from the headers of the post request performed when pressing the button.
		request.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		request.setRequestHeader("Priority", "u=4");
		request.setRequestHeader("Upgrade-Insecure-Requests", "1");


		request.addEventListener('load', function() {
			// Once the request is completed we will be asked to confirm the deletion. We submit another request to do so.
			if (request.status === 200) {
				resolve(0);
			} else {
				resolve(1);
			}
		});

		request.send();
	}

	function deleteFiles(resolve) {
		let submitted_files_table = student_page.getElementsByClassName("b_briefcase_filetable")[1].tBodies[0];
		let rows = submitted_files_table.children;

		if (rows.length === 0) { // If there are no submitted files we do nothing.
			resolve(1);
		} else {
			// Select all checkboxes to delete and recover paths to files.
			url_encoded_data = "" // here we will store the information we will be sending in the form.
			for (let row of rows) {
				file_path = row.children[2].firstChild.firstChild.data;
				if (url_encoded_data !== "") {
					url_encoded_data = url_encoded_data + "&";
				}
				url_encoded_data = url_encoded_data + "paths="+file_path;
				checkbox = row.firstChild.firstChild;
				checkbox.checked = true;
			}

			// Send a request to delete them and wait for the answer.
			let delete_button = student_page.getElementsByClassName("b_briefcase_commandbuttons")[1].firstChild;
			let form = delete_button.form;

			// Run an HTTP request to request deletion of the elements in the form (i.e. the previously submitted files).
			let request = new XMLHttpRequest();
			request.open("POST", form.action);
			// The headers below are copied from the headers of the post request performed when pressing the button.
			request.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
			request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			request.setRequestHeader("Priority", "u=4");
			request.setRequestHeader("Upgrade-Insecure-Requests", "1");

			// request.responseType = 'document';


			request.addEventListener('load', function() {
				// Once the request is completed we will be asked to confirm the deletion. We submit another request to do so.
				if (request.status === 200) {
					confirmDeletion(resolve, extractLink(request.response));
				} else {
					resolve(1);
				}
			});

			url_encoded_data = url_encoded_data + "&.actiondel=Delete";
			request.send(url_encoded_data);
		}
	}

	return new Promise(deleteFiles);
}


// This function returns a promise that is resolved when the marked submission of the corresponding student is uploaded.
function uploadFile(upload_page, file) {

	function upload(resolve) {
		// The upload button is linked to the form where the files should be loaded.
		// Therefore we first obtain the upload button and then modify the associated form.
		let button_list = upload_page.getElementsByTagName("button");
		let upload_button;
		for (let button of button_list) {
			if (button.value === getUploadButtonText()) {
				upload_button = button;
			}
		}

		let form = upload_button.form;

		// Upload the file by creating a data transfer element.
		let file_input = form.getElementsByClassName("b_fileinput_realchooser")[0];
		let blob = file.slice(0, file.size, 'application/pdf');
		let file_to_upload =  new File([blob], getMarkedPDFName(),{ type: file.type});
		const data_transfer = new DataTransfer();
		data_transfer.items.add(file_to_upload);
		file_input.files = data_transfer.files;

		// Run an HTTP request posting the form.
		let request = new XMLHttpRequest();
		request.open("POST", form.action);
		// The headers below are copied from the headers of the post request performed when pressing the button.
		request.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
		request.setRequestHeader("Priority", "u=0, i");
		request.setRequestHeader("Upgrade-Insecure-Requests", "1");


		request.addEventListener('load', function() {
			if (request.status === 200) {
				resolve(0);
			} else {
				resolve(1);
			}
		});

		let form_data = new FormData(form);
		form_data.set("dispatchuri", form.name);
		form_data.set("dispatchevent", "2");
		request.send(form_data);

		return;
	}

	return new Promise(upload);
}

// This function takes as input a list of files and returns 2 lists:
//   The first is a list of MarkedSubmission objects obtained via the
//     files in the correct naming format.
//   The second is a list of files containing all the files in an unrecognized format.s
function preProcessFiles(file_list) {
	marked_submissions_lists = [];
	unrecognized_files_lists = [];

	for (let file of file_list) {
		let marked_submission = new MarkedSubmission(file);
		if (marked_submission.is_format_recognized) {
			marked_submissions_lists.push(marked_submission);
		} else {
			unrecognized_files_lists.push(file);
		}
	}

	return [marked_submissions_lists, unrecognized_files_lists];
}

// This function takes as in put a list of marked submission and returns 4 lists:
//   The first list contains pairs of the form (student_link, marked_submission) and corresponds to all those marked
//     submissions that we could find in the table visible in the present document and have not already been marked.
//   The second list contains pairs of the form (student_link, marked_submission, old_grade) and corresponds to all
//     those marked submissions that we could find in the table visible in the present document and have already been
//     marked.
//   The third list contains pairs of the form (student_link, marked_submission) corresponding to all those marked
//     submissions that are detected at least twice.
//   The fourth list is a list of marked submissions containing all the marked submissions that could not be found. 
// WARNING marked submissions that match get their data completed with the one found in the table.
function findStudentsInTable(marked_submissions_list) {
	let non_matching_submissions = [... marked_submissions_list];
	let matching_non_marked_students = [];
	let matching_marked_students = [];
	let duplicate_submissions = [];

	// Get table.
	let table = document.getElementById(getTablePrefix() + getMainFormID());
	let tableBody = table.getElementsByTagName("tbody")[0];

	// Iterate over all visible students first and then over the submissions.
	for (let row of tableBody.getElementsByTagName("tr")) {
		let allEntries = row.getElementsByTagName("td");
		let link = allEntries[getSurnameColumn()].getElementsByTagName("a")[1];
		let student_surname = link.innerHTML;
		let student_name = allEntries[getNameColumn()].getElementsByTagName("a")[0].innerHTML;
		let student_id = allEntries[getIDColumn()].innerHTML;
		let url = link.href;
		
		// Check if the current student has a matching submission.
		let i = 0;
		let matching_student_found = false;
		while (i < non_matching_submissions.length) {
			let marked_submission = non_matching_submissions[i];
			// If we find a matching submission we add it to the list of matched submissions and remove it from the list of non matching ones.
			if (marked_submission.student_id === student_id && student_id !== "") {

				// We update the student info with the matching student
				marked_submission.student_name = student_name;
				marked_submission.student_surname = student_surname;
				if (!matching_student_found) {
					let grade = allEntries[getGradeColumn()].getElementsByTagName("span")[0].innerHTML;
					if (grade === "") {
						matching_non_marked_students.push([url, marked_submission]);
					} else {
						matching_marked_students.push([url, marked_submission, grade]);
					}
					matching_student_found = true;
				} else {					
					duplicate_submissions.push([url, marked_submission]);
					break;
				}
				non_matching_submissions.splice(i,1);
			// If we have reduced in 1 the amount of non matching submissions we don't need to update the index. Otherwise we do.
			} else {
				i = i + 1;	
			}
		}

		// If no submissions are left to match then we don't need to continue iterating over the table.
		if (non_matching_submissions.length === 0) {
			break;
		}
	}
	return [matching_non_marked_students, matching_marked_students, duplicate_submissions, non_matching_submissions];
}

// this function takes as input a list of  pairs of the form (student_link, marked_submission) corresponding to all those marked
//     submissions that are detected at least twice. If the list is empty it returns true. Otherwise it shows an alert listing all
//     students with duplicate submissions and returns false.
async function processDuplicateSubmissions(duplicate_submissions_list) {
	if (duplicate_submissions_list.length === 0) {
		return true;
	}

	let message = "<span>" + getDuplicateSubmissionText() + "</span>";
	message = message + "<table class=\"opal-bulk-borderless-table\">\n";
	highlight_row = false;


	for (let submission_info of duplicate_submissions_list) {
		highlight_row = !highlight_row;
		let submission = submission_info[1];
		message = message + "<tr>\n<td";
		if (highlight_row) {
			message = message + " class=\"opal-bulk-highlighted-cell\"";
		}
		message = message + ">" + submission.student_surname + ", " + submission.student_name + "</td>\n<td";

		if (highlight_row) {
			message = message + " class=\"opal-bulk-highlighted-cell\"";
		}
		message = message + ">" + submission.student_id + "</td>\n</tr>\n";
	}
	message = message + "</table>\n";

	await customAlert(message);
	return false;
}


// This function asks the user to confirm the marks to be uploaded.
async function confirmUpload(matching_non_marked_submission_list, matching_marked_submission_list, non_matching_submission_list, wrong_format_files) {
	let message = "";
	let highlight_row = false;

	// Files in wrong format.
	if (wrong_format_files.length !== 0) {
		message = message  + "<span>"+getUnrecognizedFormatText()+"</span>\n";
		message = message + "<table class=\"opal-bulk-borderless-table\">\n";
		highlight_row = false;
		for (let file of wrong_format_files) {
			highlight_row= !highlight_row;
			message = message + "<tr><td";
			if (highlight_row) {
				message = message + " class=\"opal-bulk-highlighted-cell\"";
			}
			message = message + ">" + file.name + "</td></tr>\n";
		}
		message = message + "</table>\n";
	}

	// Non matching submissions.
	if (non_matching_submission_list.length !== 0) {
		message = message  + "<span>"+getNonMatchingStudentsText()+"</span>\n";
		message = message + "<table class=\"opal-bulk-borderless-table\">\n";
		highlight_row = false;
		for (let submission of non_matching_submission_list) {
			highlight_row = !highlight_row;
			message = message + "<tr><td";
			if (highlight_row) {
				message = message + " class=\"opal-bulk-highlighted-cell\"";
			}
			message = message + ">" + submission.file_name + "</td></tr>\n";
		}
		message = message + "</table>\n";
	}

	// If matching submission doesn't exist we return false.
	if (matching_non_marked_submission_list.length + matching_marked_submission_list.length === 0) {
		message = message  + "<span>"+getNoFilesMatchedText()+"</span>";
		await customAlert(message);
		return false;
	}
	//   If matching submission exists.
	message = message + getStudentsGradesMessage(matching_non_marked_submission_list, matching_marked_submission_list);

	return await customConfirm(message);
}

// This function takes as input two lists, one of submissions that have not yet been marked and another for submissions
// that have already been marked (see findStudentsInTable for format) and returns a message containing the information
// regarding those submissions (i.e. student name and grade).
function getStudentsGradesMessage(non_marked_submission_list, marked_submission_list) {
	let message = "";

	if (non_marked_submission_list.length > 0) {
		message = message + "<span>" + getConfirmUploadText() + "</span>\n";
		message = message + "<table class=\"opal-bulk-borderless-table\">\n";
		message = message + "<tr>\n<th>"+getStudentNameTitleText()+"</th>\n<th>"+getGradeTitleText()+"</th>\n</tr>";

		let highlight_row = false;
		
		for (let submission_info of non_marked_submission_list) {
			highlight_row = !highlight_row;
			let submission = submission_info[1];

			message = message + "<tr>\n<td";
				if (highlight_row) {
					message = message + " class=\"opal-bulk-highlighted-cell\"";
				}
				message = message + ">" + submission.student_surname + ", " + submission.student_name + "</td>\n";
				message = message + "<td";
				if (highlight_row) {
					message = message + " class=\"opal-bulk-highlighted-cell\"";
				}
				message = message + ">" + submission.grade + "</td>\n</tr>\n";
		}
		message = message + "</table>\n";
	}

	if (marked_submission_list.length > 0) {
		message = message + "<span>" + getConfirmReplaceText() + "</span>\n";
		message = message + getStudentsMarkedGradesMessage(marked_submission_list);
	}

	return message;
}


// This function takes as input a list of submissions that have already been marked (see findStudentsInTable for format) 
// and returns a message containing the information regarding those submissions (i.e. student name and old and new grade).
function getStudentsMarkedGradesMessage(marked_submission_list) {
		message = "<table class=\"opal-bulk-borderless-table\">\n";
		message = message + "<tr>\n<th>"+getStudentNameTitleText()+"</th>\n<th>"+getNewGradeTitleText()+"</th>\n<th>"+getOldGradeTitleText()+"</th>\n</tr>";

		let highlight_row = false;
		
		for (let submission_info of marked_submission_list) {
			highlight_row = !highlight_row;
			let submission = submission_info[1];
			let old_grade = submission_info[2];

			message = message + "<tr>\n<td";
				if (highlight_row) {
					message = message + " class=\"opal-bulk-highlighted-cell\"";
				}
				message = message + ">" + submission.student_surname + ", " + submission.student_name + "</td>\n";
				message = message + "<td";
				if (highlight_row) {
					message = message + " class=\"opal-bulk-highlighted-cell\"";
				}
				message = message + ">" + submission.grade + "</td>\n";
				message = message + "<td";
				if (highlight_row) {
					message = message + " class=\"opal-bulk-highlighted-cell\"";
				}
				message = message + ">" + old_grade + "</td>\n</tr>\n";
		}
		message = message + "</table>\n";

		return message;
}


// This function takes as input two lists, one of submissions that have not yet been marked and another for submissions
// that have already been marked (see findStudentsInTable for format). If there are some already marked submissions then
// it asks the user weather or not the already marked submissions should be replaced or not on depending on the answer it
// returns a list with all submissions to upload. Otherwise it just returns the list of non_marked_submissions.
async function processMarkedSubmissions(non_marked_submissions, marked_submissions) {
	let output = [];
	for (let submission_info of non_marked_submissions) {
		output.push(submission_info);
	}

	if (marked_submissions.length > 0) {
		// We ask the user if we wants to replace the grades or not.
		message = "<span>" + getAskReplaceText() + "</span>\n";
		message = message + getStudentsMarkedGradesMessage(marked_submissions);
		let replace_grades = await customConfirm(message, getConfirmAskReplaceText(), getCancelAskReplaceText());

		// If grades should be replaced we add marked submissions to the output.
		// Otherwise the output consists on non marked submissions.
		if (replace_grades) {
			for (let submission_info of marked_submissions) {
				output.push(submission_info.slice(0,2));
			}
		}
	}

	return output;
}

// This function checks if a given string is apositive integer
function isPositiveInteger(str) {
	let res = str.match("[0-9]+");
	if (res !== null) {
		if (res.length === 1) {
			if (res[0] === str) {
				return true;
			}
		}
	}
	return false;
}

// This function takes as input a string and checks if it is on the format "<pos int 1>.<pos int 2>"
// or the format "<pos int>". In that case it returns the string "<pos int 1>.<pos int 2>" or "<pos int>"
// respectively. Otherwise it returns null.
function processGradeString(str) {
	grade_parts = str.split(".");

	if (grade_parts.length === 1) {
		if (isPositiveInteger(grade_parts[0])) {
			return grade_parts[0];
		}
	} else if (grade_parts.length === 2) {
		if (isPositiveInteger(grade_parts[0]) && isPositiveInteger(grade_parts[1])) {
			return grade_parts.join(".");
		}
	}

	return null;
}


// This class is used to store data relative to a marked submission.
function MarkedSubmission(file) {
	// We start by initializing all entries to empty strings and only fill them if the naming format is correct.
	this.file = file;
	this.file_name = file.name;
	this.student_id = "";
	this.student_name = "";
	this.student_surname = "";
	this.grade = "";
	this.is_format_recognized = false;

	// first we need to make sure the file extension is correct. That is if the file is indeed a pdf.
	// In windows the file name might not have the extension encoded in it. In this case there should
	// be no "."  in the file name. Otherwise there will be a single "." the file name and after it 
	// there should only appear the letters "pdf".
	let file_name_parts = file.name.split(".");
	let file_extension = file_name_parts[file_name_parts.length - 1];

	if (file_extension === "pdf") {
		let file_name = file_name_parts.splice(0, file_name_parts.length - 1).join(".");
		
		// We only accept 2 naming conventions for file names. 
		// The first one is "<student_id>_<grade>".
		// The second one is "<prefix>_<student_id>_<grade>".
		// We process the file only if one of these two formats is met.

		// remove any prefix.
		let prefixed_name_parts = file_name.split("_");
		let name_parts = prefixed_name_parts.splice(prefixed_name_parts.length-2, 2);

		if (name_parts.length === 2) { // At this point only the matrikel number and the grade should remain in the name.
			if (isPositiveInteger(name_parts[0])) { // Here we are checking if the name is in the format "<student_id>_<grade>"
				// Check if the grade is in the correct format. If not the function "processGradeString" will return null.
				// Otherwise it will return a string that can be parsed to a float.
				unprocessed_grade = name_parts[1];
				let grade = processGradeString(unprocessed_grade);

				if (grade !== null) {
					this.student_id = name_parts[0];
					this.grade = grade;
					this.is_format_recognized = true;
				}
			}
		}
	}
}


// This function makes all operations needed when file download starts.
function onUploadStart(n) {
	setBulkUploadProgress(n);
}


// This function updates a progress bar that keeps track of the upload progress.
// The value i represents the number of uploaded files while n is the total number of files to upload.
function onUploadProgress(i, n) {
	let progress = getUploadProgressBar(n);
	progress.setAttribute("value", i);
	let label = getUploadProgressLabel(n);
	label.innerHTML = getDownloadingText() + i + "/" + n;
}

// This function makes all operations needed when file download ends.
async function onUploadEnd(completed = true) {
	await customAlert(completed ? getUploadCompletedText() : getUploadStoppedText());

	setBulkUploadHeader();
}
