// This function returns a promise that is completed when all uploaded files have been uploaded and the students marked.
function uploadSubmissions() {
	onUploadStart();

	let input_files = document.getElementById(getSubmissionsInputId());
	let res = preProcessFiles(input_files.files); // Separate the files between the ones in the correct format and the ones in the wrong format.
	let marked_submissions = res[0];
	let wrong_format_files = res[1];

	
	res = findStudentsInTable(marked_submissions);
	let matching_submissions = res[0];
	let non_matching_submissions = res[1];

	// As user if the upload should proceed.
	function upload(resolve) {
		let start_upload = confirmUpload(matching_submissions, non_matching_submissions, wrong_format_files);
		if (start_upload) {
			uploadMatchingSubmissions(matching_submissions).then((res) => {
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

// This function takes as input a list of tuples of the form (<student url>, <marked submission>). And returns a promise that is resolved when
// all the marked submissions have been uploaded to the corresponding pages.
function uploadMatchingSubmissions(submissions_list) {
	let remaining_submissions = [...submissions_list];

	// The function below recursively makes promises and waits until they are completed before proceeding to the next.
	function recursiveUpload(outer_resolve) {
		if (remaining_submissions.length === 0) {
			// When this point is reached all files have been uploaded and we can return to the main page and resolve the promise.
			document.getElementsByClassName("b_link_back")[0].click();
			setTimeout(() => {return outer_resolve(0);}, 1500); // TODO FIND A BETTER WAY TO DETERMINE WHEN WE ARE BACK IN THE START PAGE.
			return;
		} else {
			let submission_data = remaining_submissions.pop();
			let student_link = submission_data[0];
			let marked_submission = submission_data[1];

			return uploadStudentSubmission(student_link, marked_submission).then(() => {
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
function uploadStudentSubmission(student_link, marked_submission) {
	// TODO FIND A BETTER WAY OF FOLLOWING THE STUDENT LINK.
	function followLink(link) {
		link.click();
		return new Promise((resolve) => { setTimeout(resolve, 1500)});
	}

	function upload(resolve) {
		followLink(student_link).then(() => {
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
function uploadFile(file) {
	function openUploadPage() {
		return new Promise((resolve) => { upload_button = document.getElementsByClassName("b_briefcase_upload")[0].click(); setTimeout(resolve, 1000) });
	}

	function upload(resolve) {
		openUploadPage().then(() => {
			let file_input = document.getElementsByClassName("b_fileinput_realchooser")[0];
			const data_transfer = new DataTransfer();
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
			upload_button.click();

			setTimeout(resolve, 1000);
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
		// let url = link.href;
		
		// Check if the current student has a matching submission.
		for (let i = 0; i < non_matching_submissions.length; i++) {
			let marked_submission = non_matching_submissions[i];
			// If we find a matching submission we add it to the list of matched submissions and remove it from the list of non matching ones.
			if ((marked_submission.student_name === student_name && marked_submission.student_surname === student_surname) || marked_submission.student_id === student_id) {
				// We update the student info with the matching student
				marked_submission.student_name = student_name;
				marked_submission.student_surname = student_surname;
				marked_submission.student_id = student_id;
				// matching_students.push([url, marked_submission]);
				matching_students.push([link, marked_submission]);
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
	if (message !== "") { message = message + "\n\n"; }
	if (matching_submission_list.length === 0) {
		message = message + "I was unable to find any files in the correct format matching to any of the visible students."
		alert(message);
		return false;
	}
	message = message + "Please confirm that you want to upload the following grades"
	
	for (let submission_info of matching_submission_list) {
		let matching_submission = submission_info[1];
		message = message + "\n\t" + matching_submission.student_surname + ", " + matching_submission.student_name + "\t" + matching_submission.grade;
	}

	return confirm(message);
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
	this.file = file;
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

// This function makes all operations needed when file download starts.
function onUploadStart() {
	let button = getUploadSelectedButton();
	button.setAttribute("class", "opal-bulk-disabled-button");
	button.removeEventListener("click", uploadSubmissions);
	button.setAttribute("value", "Uploading");
}

// This function makes all operations needed when file download ends.
function onUploadEnd(completed = true) {
	alert(completed ? "Upload completed" : "Upload stopped");

	let button = getUploadSelectedButton();
	button.setAttribute("class", 'opal-bulk-button');
	button.setAttribute("value", getUploadSelectedButtonValue());
	button.addEventListener("click", uploadSubmissions);
}
