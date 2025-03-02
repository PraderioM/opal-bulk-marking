// This function returns a promise that is completed when all uploaded files have been uploaded and the students marked.
function uploadSubmissions() {
	onUploadStart();

	let input_files = document.getElementById(getSubmissionsInputId());
	let res = preProcessFiles(input_files.files); // Separate the files between the ones in the correct format and the ones in the wrong format.
	let marked_submissions = res[0];
	let wrong_format_files = res[1];

	res = findStudentsInTable(marked_submissions);
	let matching_submissions_list = res[0];
	let non_matching_submissions_list = res[1];

	// As user if the upload should proceed.
	function upload(resolve) {
		let start_upload = confirmUpload(matching_submissions_list, non_matching_submissions_list, wrong_format_files);
		if (start_upload) {
			sessionStorage.setItem(getUploadingFilesSessionStorageName(), JSON.stringify(matching_submissions_list));
			uploadMatchingSubmissions().then((res) => {
				onUploadEnd(true);
				return resolve(0);
			});
		} else {
			onUploadEnd(false);
			return resolve(1);
		}
	}

	new Promise(upload);
}

// The opal system is setup so that every time that a file is uploaded the page is reloaded. When that happens we need to restart the downloading process.
// This function checks if some files where left without uploading and if so if it was due to this quirk. If the answer to both is yes it resumes uploading
// without further question. If the block in uploading was not due to this quirk then it asks the user if it wants to continue with the uploading process
// and acts accordingly.
function resumeUploading() {
	let remaining_submissions = JSON.parse(sessionStorage.getItem(getUploadingFilesSessionStorageName()));
	if (remaining_submissions !== null) { // We do something only when some submissions where left without uploading.
		let stopped_from_upload = sessionStorage.getItem(getRestartFromFileUploadingSessionStorageName());

		if (stopped_from_upload === "true") { // If they where left because of the page reload then we continue without promting any message.
			sessionStorage.removeItem(getRestartFromFileUploadingSessionStorageName());
			uploadMatchingSubmissions().then((res) => { onUploadEnd(true); });
		} else if (remaining_submissions.length === 0) { // Otherwise if there are no files left to upload we also do nothing.
			sessionStorage.removeItem(getUploadingFilesSessionStorageName());
		} else {  // Finally if there are some files left to upload but we where not expecting there to be any we ask the user what to do.
			message = "It looks like you stopped the grade uploading process before it finished.";
			message = message + "\nDo you wish to resume uploading of the following grades?:";
			message = message + getStudentsGradesMessage(remaining_submissions);
			if (confirm(message)){
				uploadMatchingSubmissions().then((res) => { onUploadEnd(true); });
			} else {
				uploadEnd(false);
			}
		}
	} 
}


// This function takes as input a list of tuples of the form (<student url>, <marked submission>). And returns a promise that is resolved when
// all the marked submissions have been uploaded to the corresponding pages.
function uploadMatchingSubmissions() {

	// The function below recursively makes promises and waits until they are completed before proceeding to the next.
	function recursiveUpload(outer_resolve) {
		let remaining_submissions = JSON.parse(sessionStorage.getItem(getUploadingFilesSessionStorageName()));
		if (remaining_submissions.length === 0) {
			// When this point is reached all files have been uploaded and we can return to the main page and resolve the promise.
			if (isTablePage()) {
				return outer_resolve(0);
			} else {
				// When returning to the main page the page is reloaded so we need to state that this was intentional.
				sessionStorage.setItem(getRestartFromFileUploadingSessionStorageName(), true);
				document.getElementsByClassName("b_link_back")[0].click();
				setTimeout(() => {return outer_resolve(0);}, 30000);  // TODO this will probably never run. and for not it is fixed with the if above. find a different way of doing so
				return;
			}
		} else {
			let submission_data = remaining_submissions.pop();
			sessionStorage.setItem(getUploadingFilesSessionStorageName(), JSON.stringify(remaining_submissions));
			let student_url = submission_data[0];
			let marked_submission = submission_data[1];

			return uploadStudentSubmission(student_url, marked_submission).then(() => {
				return new Promise(
					(inner_resolve) => {
						return outer_resolve(recursiveUpload(inner_resolve));
					});
			});
		}
	}
	return new Promise(recursiveUpload);
}

// This function returns a promise that is resolved when the given student submission is fully marked.
function uploadStudentSubmission(student_url, marked_submission) {
	// TODO FIND A BETTER WAY OF FOLLOWING THE STUDENT LINK.
	function followLink(url) {
		let scr = document.createElement("script");
		scr.setAttribute("type", "text/javascript")
		document.head.appendChild(scr);
		scr.innerHTML = "setAjaxIFrameContent(decodeURI('"+url+"'))";

		return new Promise((resolve) => { setTimeout(resolve, 1500)});
	}

	function upload(resolve) {
		followLink(student_url).then(() => {
			saveGrade(marked_submission.grade).then(() => {
				uploadFile(marked_submission.file).then(resolve);
			});
		});
	}

	return new Promise(upload);
}

// This function returns a promise that is resolved when the grade of the corresponding student has been uploaded.
//function saveGrade(grade) {
function saveGrade(grade) {
	function mark(resolve) {
		// write the grade in the appropriate input element. 
		let fieldset = document.getElementsByTagName("fieldset")[1];
		let form_element = fieldset.getElementsByClassName("b_form_element")[3];
		let container = form_element.getElementsByTagName("div")[0];
		let grade_input = container.getElementsByTagName("input")[0];
		grade_input.value = grade;

		let button_list = document.getElementsByClassName("b_button");
		let save_button;
		for (let button of button_list) {
			if (button.value === "Save") {
				save_button = button;
			}
		} 
		save_button.click();

		// TODO find a way to verify that the grade was saved.
		setTimeout(resolve, 1500);
	}

	return new Promise(mark);
}

// This function returns a promise that is resolved when the marked submission of the corresponding student is uploaded.
function uploadFile(base_64_file) {
	function openUploadPage() {
		return new Promise((resolve) => { upload_button = document.getElementsByClassName("b_briefcase_upload")[0].click(); setTimeout(resolve, 1000) });
	}

	function upload(resolve) {
		openUploadPage().then(() => {
			let file_input = document.getElementsByClassName("b_fileinput_realchooser")[0];
			const data_transfer = new DataTransfer();
			fetch(base_64_file).then((res) => {
				return res.blob()
			}).then((blob) => {
				let file =  new File([blob], "marked_submission.pdf",{ type: "application/pdf" });
				data_transfer.items.add(file);
				file_input.files = data_transfer.files;

				let button_list = document.getElementsByTagName("button");
				let upload_button;
				for (let button of button_list) {
					if (button.value === "Upload") {
						upload_button = button;
						break;
					}
				}

				sessionStorage.setItem(getRestartFromFileUploadingSessionStorageName(), true);
				upload_button.click();

				setTimeout(resolve, 1000);
			});
		});

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

// This function takes as in put a list of marked submission and returns 2 lists:
//   The first list contains pairs of the form (student_link, marked submission) and
//     corresponds to all those marked submissions that we could find in the table visible in the present document.
//   The second list is a list of marked submissions containing all the marked submissions that could not be found. 
// WARNING marked submissions that match get their data completed with the one found in the table.
function findStudentsInTable(marked_submissions_list) {
	let non_matching_submissions = [... marked_submissions_list];
	let matching_students = [];

	// We iterate over all the students visible in the table body until we find the 
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
		for (let i = 0; i < non_matching_submissions.length; i++) {
			let marked_submission = non_matching_submissions[i];
			// If we find a matching submission we add it to the list of matched submissions and remove it from the list of non matching ones.
			if ((marked_submission.student_name === student_name && marked_submission.student_surname === student_surname) || marked_submission.student_id === student_id) {
				// We update the student info with the matching student
				marked_submission.student_name = student_name;
				marked_submission.student_surname = student_surname;
				marked_submission.student_id = student_id;
				matching_students.push([url, marked_submission]);
				non_matching_submissions.splice(i,1);
				break;
			}
		}

		// If no submissions are left to match then we don't need to continue iterating over the table.
		if (non_matching_submissions.length === 0) {
			break;
		}
	}
	return [matching_students, non_matching_submissions];
}


// This function asks the user to confirm the marks to be uploaded.
function confirmUpload(matching_submission_list, non_matching_submission_list, wrong_format_files) {
	let message = "";

	// Files in wrong format.
	if (wrong_format_files.length !== 0) {
		message = message + "The following files are in an unrecognized format.";
		message = message + "\nPlease make sure your files are either in the format '<student_surname>_<student_name>_<grade>' or in the format '<student_id>_<grade>'.";
		message = message + "\nHere <grade> should be in the format '<integer>_<decimals>' or simply '<integer>'";
		for (let file of wrong_format_files) {
			message = message + "\n\t" + file.name;
		}
	}

	// Non matching submissions.
	if (non_matching_submission_list.length !== 0) {
		if (message !== "") { message = message + "\n\n"; }
		message = message + "I was unable to find students corresponding to the following files.";
		message = message + "\nPlease make sure that all students are visible in the table below and that the names in the files are correct.";
		for (let submission of non_matching_submission_list) {
			message = message + "\n\t" + submission.file.name;
		}
	}

	// matching submissions.
	//   If matching submission doesn' exist.
	if (message !== "") { message = message + "\n\n"; }
	if (matching_submission_list.length === 0) {
		message = message + "I was unable to find any files in the correct format matching to any of the visible students."
		alert(message);
		return false;
	}
	//   If matching submission exists.
	message = message + "Please confirm that you want to upload the following grades:"
	message = message + getStudentsGradesMessage(matching_submission_list);

	return confirm(message);
}

// this function takes as input a list of submissions and returns a message containing the information regarding those submissions (i.e. student name and grade).
function getStudentsGradesMessage(submission_list) {
	let message = "";
	
	for (let submission_info of submission_list) {
		let submission = submission_info[1];
		message = message + "\n\t" + submission.student_surname + ", " + submission.student_name + "\t" + submission.grade;
	}

	return message;
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

// This function takes as input a string and checks if it is on the format "<pos int 1>_<pos int 2>"
// or the format "<pos int>". In that case it returns the string "<pos int 1>.<pos int 2>" or "<pos int>"
// respectively. Otherwise it returns null.
function processGradeString(str) {
	grade_parts = str.split("_");

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
	this.file = ""; // File needs to be converted to base64 in order to be preserved between sessions.
	toBase64(file).then((res) => this.file = res);
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
	let file_extension = "pdf";
	if (file_name_parts.length === 2) {
		file_extension = file_name_parts[1];
	} else if (file_name_parts > 2) {
		file_extension = "";
	}

	if (file_extension === "pdf") {
		let file_name = file_name_parts[0];
		
		// We only accept 2 naming conventions for file names.
		// The first one is "<student_surname>_<student_name>_<grade>".
		// The second one is "<student_id>_<grade>".
		// We process the file only if one of these two formats is met.
		let name_parts = file_name.split("_");
		if (isPositiveInteger(name_parts[0])) { // Here we are checking if the name is in the format "<student_id>_<grade>"
			// Check if the grade is in the correct format. If not the function "processGradeString" will return null.
			// Otherwise it will return a string that can be parsed to a float.
			unprocessed_grade = name_parts.slice(1).join("_");
			let grade = processGradeString(unprocessed_grade);

			if (grade !== null) {
				this.student_id = name_parts[0];
				this.grade = grade;
				this.is_format_recognized = true;
			}
		} else if (name_parts.length >= 3) { // Here we are checking if the name is in the format "<student_surname>_<student_name>_<grade>".
			unprocessed_grade = l.slice(2).join("_");
			let grade = processGradeString(unprocessed_grade);
			if (grade !== null) {
				this.student_surname = name_parts[0];
				this.student_name = name_parts[1];
				this.is_format_recognized = true;
			}

		}
	}
}


function toBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
	});
}


// This function makes all operations needed when file download starts.
function onUploadStart() {
	let button = getUploadSelectedButton();
	button.setAttribute("class", "opal-bulk-disabled-button");
	button.removeEventListener("click", uploadSubmissions);
	button.setAttribute("value", "Uploading");
}

// This function makes all operations needed when file download ends.
function onUploadEnd(completed = true) {
	sessionStorage.removeItem(getUploadingFilesSessionStorageName());
	alert(completed ? "Upload completed" : "Upload stopped");

	let button = getUploadSelectedButton();
	button.setAttribute("class", 'opal-bulk-button');
	button.setAttribute("value", getUploadSelectedButtonValue());
	button.addEventListener("click", uploadSubmissions);
}
