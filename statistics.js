// This function displays all the available students and shows a dialog displaying 
// several students statistics. It then returns a promise that is resolved when the dialog is closed.
function showStatistics() {
	getStatisticsButton().blur(); // Unfocus selected button.

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
function getHistogram(values, size = 1, start = 0, end = 10) {
	// If no values are available a paragraph stating that no histogram can be shwed is returned.
	if (values.length == 0) {
		let paragraph = document.createElement("p");
		paragraph.innerHTML = getNoHistogramText();
		return paragraph;
	}

	let histogram = document.createElement("div");
	histogram.setAttribute("class", "opal-bulk-histogram");

	let canvas = document.createElement("canvas");
	canvas.setAttribute("class", "opal-bulk-histogram-canvas");
	let width = 550;
	let height = 300;
	canvas.width = width;
	canvas.height = height;
	histogram.appendChild(canvas)

	let h_padding = 30;
	let v_padding = 20;
	let y_step = 5;
	

	// Count the number of grades in given intervals.
	let i = start;
	let count_list = [];
	let max = y_step;
	while (i <= end) {
		let n = countBetween(values, i, i + size);
		count_list.push(n);
		i = i + size;
		if (n > max) {
			// We count every y_step in the vertical axis so we take the maximum to be a multiple of y_step.
			max = Math.ceil(n/y_step)*y_step;
		}
	}

	// Draw title.
	const ctx = canvas.getContext("2d");
	ctx.textAlign = "center";
	ctx.fillStyle = "#000000";
	let default_font = ctx.font;
	ctx.font = "20px sans-serif";
    ctx.fillText(getHistogramTitle(), Math.round(width/2), v_padding);
	ctx.font = default_font;

    // Draw x axis.
	ctx.textAlign = "left";
	let bar_size = (width-2*h_padding)/count_list.length;
	for (let i = 0; i < count_list.length; i++) {
		ctx.fillText((start+i*size).toString(), Math.round(bar_size*i)+h_padding, height - v_padding);
	}

    // Draw y axis.
	ctx.textAlign = "right";
    let y_coord_sep = (height - 4*v_padding)*y_step/max;
	for (let i = 0; i <= max/y_step; i++) {
		let y_start = Math.round(height - 2*v_padding - i*y_coord_sep);
		ctx.fillText((i*y_step).toString(), h_padding, y_start+5);
		let line_heigth = i===0?2:1;
		ctx.fillRect(h_padding, y_start, width - 2*h_padding, line_heigth);
	}


	// Draw number on top of every non empty bar in the histogram.
	ctx.textAlign = "center";
	i = 0;
	for (let n of count_list) {
		if (n !== 0) {
			let h = Math.round((n/max)*(height-4*v_padding));
			ctx.fillRect(Math.round(bar_size*i)+h_padding, height - 2*v_padding - h, Math.ceil(bar_size), h);
			ctx.fillText(n.toString(), Math.round(bar_size*(i+0.5))+h_padding, height - 2*v_padding - h);
		}
		i = i + 1;
	}


	// This block creates a gradient that makes colors go from red to yellow to green as the grade gets better.
	const my_gradient = ctx.createLinearGradient(h_padding, 0, width-h_padding, 0);
	my_gradient.addColorStop(0, "red");
	my_gradient.addColorStop(0.5, "yellow");
	my_gradient.addColorStop(1, "#00dd00");
	ctx.fillStyle = my_gradient;
	// ctx.fillStyle = "#0000dd"; TODO check if it looks better with the gradient os simply making it blue.

	// Draw histogram.
	i = 0;
	ctx.fillStyle = my_gradient;
	for (let n of count_list) {
		let h = Math.round((n/max)*(height-4*v_padding));
		ctx.fillRect(Math.round(bar_size*i)+h_padding, height - 2*v_padding - h, Math.ceil(bar_size), h);
		i = i + 1;
	}

	return histogram;
}


// This function takes as input a list of grades and returns a dom element showing average and standard deviation of those grades.
function getAverage(values) {
	let paragraph = document.createElement("p");
	let n = values.length;

	// If no values are available a paragraph stating that no histogram can be shwed is returned.
	if (n === 0) {	
		paragraph.innerHTML = getNoAverageText();
		return paragraph;
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

// This function takes as input a list of float numbers (values) and two floats (start and end)
// and returns the number of values in the list in the interval [start, end).
function countBetween(values, start, end) {
	let n = 0;
	for (let val of values) {
		if (val >= start && val < end) {
			n = n + 1;
		}
	}
	return n;
}