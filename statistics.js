// This function displays all the available students and shows a dialog displaying 
// several students statistics. It then returns a promise that is resolved when the dialog is closed.
function showStatistics() {
	async function showDialog(resolve) {
		let header = getHeader();
		let dialog = document.createElement("dialog");
		dialog.setAttribute("class", "opal-bulk-statistics-dialog");
		header.appendChild(dialog);

		// collect all students data.
		let submission_data = await getSubmissionData();
		grade_list = submission_data[0];
		n_submitted = submission_data[1];
		n_graded = submission_data[2];
		n_total = submission_data[3];

		// Create an histogram of grades and add it to the dialog.
		let histogram = getHistogram(grade_list);
		dialog.appendChild(histogram);

		// Create a dom element showing average grade and standard deviation.
		let average = getAverage(grade_list);
		dialog.appendChild(average);

		// Create a dom element showing the number of students that submitted a solution.
		let submitted_statistics = getPercentageStatistics(n_submitted, n_total, getSubmittedPercentageText());
		dialog.appendChild(submitted_statistics);

		// Create a dom element showing the number submitted solutions that have been marked.
		let graded_statistics = getPercentageStatistics(n_graded, n_submitted, getGradedPercentageText());
		dialog.appendChild(graded_statistics);

		// Add a button used to close the dialog.
		let button_container = document.createElement("span");
		button_container.setAttribute("class", "opal-bulk-spaced-container");
		dialog.appendChild(button_container);

		let close_button = document.createElement("button");
		close_button.innerHTML = getCloseText();
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


// This function takes as input a list of grades and returns a dom element showing an histogram containing all these grades.
function getHistogram(values, size_val = 1, start_val = 0, end_val = 10) {
	// If no values are available a paragraph stating that no histogram can be shwed is returned.
	if (values.length == 0) {
		let paragraph = document.createElement("p");
		p.innerHTML = getNoHistogramText();
		return p;
	}

	let data = [
		{
			x:values,
			type: 'histogram',
			xbins: {
			    start: start_val,
			    end: end_val,
			    size: size_val
			}
		}
	];
	let histogram = document.createElement("div");
	histogram.setAttribute("class", "opal-bulk-histogram");
	Plotly.newPlot(histogram, data, {title: {text: getHistogramTitle()}});

	return histogram;
}

// This function takes as input a list of grades and returns a dom element showing average and standard deviation of those grades.
function getAverage(values) {
	let paragraph = document.createElement("p");
	let n = values.length;

	// If no values are available a paragraph stating that no histogram can be shwed is returned.
	if (n === 0) {	
		p.innerHTML = getNoAverageText();
		return p;
	}

	// Iterate over all the values and compute the average and standard deviation.
	let sum = 0;
	let sum2 = 0;
	for (let val of values) {
		sum = sum + val;
		sum2 = sum2 + val*val;
	}


	let avg = sum / n;
	let std = Math.sqrt(sum2 / n - avg*avg);
	paragraph.innerHTML = getAverageGradeText() + (Math.round(avg*100)/100).toString() + " std: " + (Math.round(std*100)/100).toString();
	return paragraph
}

// This function takes as input two numbers i and n and a text and returns a dom element that shows what percentage i represents out of n.
function getPercentageStatistics(i, n, text) {
	let paragraph = document.createElement("p");
	percentage = Math.round(100 * i / n);
	paragraph.innerHTML = text + i.toString() + "/" + n.toString() + " (" + percentage + "%)";
	return paragraph;
}

// This function diplays all students and returns a list of 4 elements consisting in order of:
//     * A list of grades of all available grades.
//     * The number of submitted solutions. This includes the ones that have been marked but no file has been uploaded.
//     * The number of graded submissions.
//     * The total number of students.
function getSubmissionData() {
	function gatherData(resolve) {
		showAllStudents().then((res) => {
			let table = document.getElementById(getTablePrefix() + getMainFormID());
			let tableBody = table.getElementsByTagName("tbody")[0];


			grade_list = [];
			n_submitted = 0;
			n_graded = 0;
			n_total = 0;

			// Iterate over all students.
			for (let row of tableBody.getElementsByTagName("tr")) {
				let allEntries = row.getElementsByTagName("td");
				let grade_string = allEntries[getGradeColumn()].getElementsByTagName("span")[0].innerHTML;
				let nSubmissions = allEntries[getNSubmissionsColumn()].innerHTML;

				// Update statistics accordingly.
				n_total = n_total + 1;
				if (nSubmissions > 0 || grade_string !== "") {
					n_submitted = n_submitted + 1;
					if (grade_string !== "") {
						n_graded = n_graded + 1;
						let grade = parseFloat(grade_string);
						grade_list.push(grade); 
					}
				}
			}

			resolve([grade_list, n_submitted, n_graded, n_total]);

		});
	}
	return new Promise(gatherData);
}