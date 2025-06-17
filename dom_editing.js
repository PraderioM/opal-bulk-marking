function getMainForm() {
	let mainForm = document.getElementById(getMainFormPrefix() + getMainFormID());
	return container = mainForm.parentElement;
}

function setup() {
	if (isTablePage()) {
		setLanguage();
		getMainForm().prepend(getHeader());
		setHomeHeader();
	}
}

function clearChildren(dom_element) {
	dom_element.innerHTML = "";
	/*console.log("removing children.")
	for (let child of dom_element.children) {
		child.remove();
	}*/

	let time_delay= "200";

	function makeSureChildrenremoved(outer_resolve) {
		if (!areChildrenRemoved()) {
			return outer_resolve(new Promise((inner_resolve) => setTimeout(makeSureChildrenremoved, time_delay, inner_resolve)).then((val) => { return val;}));
		} else {
			return outer_resolve(0);
		}
	}

	function areChildrenRemoved() {
		return dom_element.children.length === 0;
	}

	return new Promise((resolve) => setTimeout(makeSureChildrenremoved, time_delay, resolve));
}

function setHomeHeader() {
	if (!MODIFYING_PAGE) {
		MODIFYING_PAGE = true;
		let header = getHeader();
		clearChildren(header).then(
			(resolve) => {
				header.appendChild(getDownloadButton());

				header.appendChild(createEmptySpan());			
				header.appendChild(getUploadButton());

				header.appendChild(createEmptySpan());			
				header.appendChild(getStatisticsButton());

				header.appendChild(createEmptySpan());
				header.appendChild(getGeneralInformationButton());

				MODIFYING_PAGE = false;
			}
		);
	}
}

function setBulkDownloadHeader() {
	showAllStudents().then((res) => {
		if (res === 0){
			setHeader();
		} else {
			throw new Error(getStudentShowingErrorMessage());
		}
	});

	function setHeader() {
		if (!MODIFYING_PAGE) {
			MODIFYING_PAGE = true;
			let header = getHeader();
			clearChildren(header).then(
				(resolve) => {
					getMainForm().prepend(header);

					header.appendChild(getStudentsDropdown(getStartDropDownId(), getFirstStudentText()));
					header.appendChild(createEmptySpan());

					header.appendChild(getStudentsDropdown(getEndDropDownId(), getLastStudentText()));
					header.appendChild(createEmptySpan());

					header.appendChild(getFileNamePrefix());
					header.appendChild(createEmptySpan());

					header.appendChild(getAddNameCheckboxContainer());
					header.appendChild(createEmptySpan());

					header.appendChild(getStartDownloadButton());
					header.appendChild(createEmptySpan());

					header.appendChild(getDownloadInformationButton());
					header.appendChild(createEmptySpan());

					header.appendChild(getBackButton());

					MODIFYING_PAGE = false;
				});
			}
		return;
	}
}

function setBulkDownloadProgress(n) {
	if (!MODIFYING_PAGE) {
		MODIFYING_PAGE = true;
		let header = getHeader();
		clearChildren(header).then(
			(resolve) => {
				getMainForm().prepend(header);

				header.appendChild(getDownloadProgressLabel());
				header.appendChild(getDownloadProgressBar(n));

				MODIFYING_PAGE = false;
			});
		}
	return;
}

function setBulkUploadHeader() {
		showAllStudents().then((res) => {
		if (res === 0){
			setHeader();
		} else {
			throw new Error(getStudentShowingErrorMessage());
		}
	});

	function setHeader() {		
		if (!MODIFYING_PAGE) {
			MODIFYING_PAGE = true;
			let header = getHeader();
			clearChildren(header).then(
				(resolve) => {
					getMainForm().prepend(header);

					header.appendChild(getSubmissionsInput())
					header.appendChild(createEmptySpan());

					header.appendChild(getUploadSelectedButton())
					header.appendChild(createEmptySpan());

					header.appendChild(getUploadInformationButton());
					header.appendChild(createEmptySpan());

					header.appendChild(getBackButton());

					MODIFYING_PAGE = false;
				});
			}
		return;
	}
}

function setBulkUploadProgress(n) {
	if (!MODIFYING_PAGE) {
		MODIFYING_PAGE = true;
		let header = getHeader();
		clearChildren(header).then(
			(resolve) => {
				getMainForm().prepend(header);

				header.appendChild(getUploadProgressLabel(n));
				header.appendChild(getUploadProgressBar(n));

				MODIFYING_PAGE = false;
			});
		}
	return;
}


function showGeneralInformation() { alert(getGeneralInformationText()); }

function showUploadInformation() { alert(getUploadInformationText()); }

function showDownloadInformation() { alert(getDownloadInformationText()); }


function getElement(element_id, elementCreator) {
	let element = document.getElementById(element_id);
	if (element === null) {
		element = elementCreator();
	}
	return element;
}

function getHeader() {
	return getElement(getHeaderId(), createHeader);
}

function createHeader() {
	let header = document.createElement("div");
	header.setAttribute("id", getHeaderId());
	header.setAttribute("class", "opal-bulk-header");
	return header;
}


function getStatisticsButton() {
	return getElement(getStatisticsButtonId(), createStatisticsButton);
}

function createStatisticsButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getStatisticsButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", showStatistics);
	button.setAttribute("value", getStatisticsButtonValue());
	return button;
}


function getGeneralInformationButton() {
	return getElement(getGeneralInformationButtonId(), createGeneralInformationButton);
}

function createGeneralInformationButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getGeneralInformationButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", showGeneralInformation);
	button.setAttribute("value", getInformationButtonValue());
	return button;
}

function getDownloadInformationButton() {
	return getElement(getDownloadInformationButtonId(), createDownloadInformationButton);
}

function createDownloadInformationButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getDownloadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", showDownloadInformation);
	button.setAttribute("value", getInformationButtonValue());
	return button;
}

function getUploadInformationButton() {
	return getElement(getUploadInformationButtonId(), createUploadInformationButton);
}

function createUploadInformationButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getUploadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", showUploadInformation);
	button.setAttribute("value", getInformationButtonValue());
	return button;
}

function getDownloadButton() {
	return getElement(getDownloadButtonId(), createDownloadButton);
}

function createDownloadButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getDownloadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", setBulkDownloadHeader);
	button.setAttribute("value", getDownloadButtonValue());
	return button;
}

function getStartDownloadButton() {
	return getElement(getStartDownloadButtonId(), createStartDownloadButton);
}

function createStartDownloadButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getStartDownloadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", downloadSubmissionsRange);
	button.setAttribute("value", getStartDownloadButtonValue());
	return button;
}

function getUploadButton() {
	return getElement(getUploadButtonId(), createUploadButton);
}

function createUploadButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getUploadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", setBulkUploadHeader);
	button.setAttribute("value", getUploadButtonValue());
	return button;
}

function getSubmissionsInput() {
	return getElement(getSubmissionsInputId(), createSubmissionsInput);
}

function createSubmissionsInput() {
	let file_input = document.createElement("input");
	file_input.setAttribute("name", "submission upload");
	file_input.setAttribute("id", getSubmissionsInputId());
	file_input.setAttribute("type", "file");
	file_input.setAttribute("multiple", true);
	return file_input;
}

function getUploadSelectedButton() {
	return getElement(getUploadSelectedButtonId(), createUploadSelectedButton);
}

function createUploadSelectedButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getUploadSelectedButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.setAttribute("value", getUploadSelectedButtonValue());
	button.addEventListener("click", uploadSubmissions);
	return button;
}

function getBackButton() {
	return getElement(getBackButtonId(), createBackButton);
}

function createBackButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getBackButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", setHomeHeader);
	button.setAttribute("value", getBackButtonValue());
	return button;
}

function createEmptySpan() { 
	let empty_span = document.createElement("span");
	empty_span.setAttribute("class", "opal-bulk-empty-span");
	return empty_span;
}

function getStudentsDropdown(dropdown_id, instruction) {
	return getElement(dropdown_id, function () { return createStudentsDropdown(dropdown_id, instruction);});
}

function createStudentsDropdown(dropdown_id, instruction) {
	let dropdown = document.createElement("select");
	dropdown.setAttribute("id", dropdown_id);
	dropdown.setAttribute("class", "opal-bulk-dropdown");

	dropdown.options.add( new Option(instruction,"select", true, true) );

    // We need to join both lists of students before showing anything. WARNING, the format of both lists is slightly different.
	let all_students_intervals = getStudentsInterval();
	let all_students = all_students_intervals[2];

	for (let student of all_students) {
		let option = new Option(student[0] + " " + student[1], [student[0], student[1]]);
		dropdown.options.add(option);
	}
	return dropdown;
}

function getFileNamePrefix() {
	return getElement(getFileNamePrefixId(), createFileNamePrefix);
}

function createFileNamePrefix() {
	let input = document.createElement("input");
	input.setAttribute("type", "text");
	input.setAttribute("id", getFileNamePrefixId());
	input.setAttribute("placeholder", getPrefixPlaceholderText());
	input.setAttribute("class", "opal-bulk-text-input");

	return input;
}

function getAddNameCheckboxContainer() {
	return getElement(getAddNameCheckboxContainerId(), createAddNameCheckboxContainer);
}

function createAddNameCheckboxContainer() {
	let container = document.createElement("span");
	container.setAttribute("class", "opal-bulk-labeled-text-container");

	let label = document.createElement("label");
	label.setAttribute("for", getAddNameCheckboxId());
	label.innerHTML = getAddNameLabelText();
	
	let checkbox = document.createElement("input");
	checkbox.setAttribute("type", "checkbox");
	checkbox.setAttribute("id", getAddNameCheckboxId());
	checkbox.checked = true;

	container.appendChild(label);
	container.appendChild(checkbox);

	return container;
}

function getDownloadProgressLabel(n) {
	return getElement(getDownloadProgressLabelId(), function () {return createDownloadProgressLabel(n)});
}

function createDownloadProgressLabel(n) {

	let label = document.createElement("label");
	label.setAttribute("id", getDownloadProgressLabelId());
	label.setAttribute("class", "opal-bulk-label");
	label.setAttribute("for", getDownloadProgressBarId());
	label.innerHTML = getDownloadingText() + 0 + "/" + n;

	return label;
}

function getUploadProgressLabel(n) {
	return getElement(getUploadProgressLabelId(), function () {return createUploadProgressLabel(n)});
}

function createUploadProgressLabel(n) {

	let label = document.createElement("label");
	label.setAttribute("id", getUploadProgressLabelId());
	label.setAttribute("class", "opal-bulk-label");
	label.setAttribute("for", getUploadProgressBarId());
	label.innerHTML = getUploadingText() + 0 + "/" + n;

	return label;
}

function getDownloadProgressBar(n) {
	return getElement(getDownloadProgressBarId(), function () {return createDownloadProgressBar(n)});
}


function createDownloadProgressBar(n) {

	let progress = document.createElement("progress");
	progress.setAttribute("id", getDownloadProgressBarId());
	progress.setAttribute("class", "opal-bulk-progress");
	progress.setAttribute("max", n);
	progress.setAttribute("value", 0);

	return progress;
}

function getUploadProgressBar(n) {
	return getElement(getUploadProgressBarId(), function () {return createUploadProgressBar(n)});
}


function createUploadProgressBar(n) {

	let progress = document.createElement("progress");
	progress.setAttribute("id", getUploadProgressBarId());
	progress.setAttribute("class", "opal-bulk-progress");
	progress.setAttribute("max", n);
	progress.setAttribute("value", 0);

	return progress;
}
