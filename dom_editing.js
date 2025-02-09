function getMainForm() {
	let mainForm = document.getElementById(getMainFormPrefix() + getMainFormID());
	return container = mainForm.parentElement;
}

function setup() {
	if (isTablePage()) {
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
	let header = getHeader();
	clearChildren(header).then(
		(resolve) => {
			header.appendChild(getDownloadButton());
			header.appendChild(createEmptySpan());
			header.appendChild(getUploadButton());
		}
	);
}

function setBulkDownloadHeader() {
	showAllStudents().then((res) => {
		if (res === 0){
			setHeader();
		} else {
			throw new Error("Uexpected error occurred. Unable to sow all students.");
		}
	});

	function setHeader() {
		let header = getHeader();
		clearChildren(header).then(
			(resolve) => {
				getMainForm().prepend(header);

				header.appendChild(getStudentsDropdown(getStartDropDownId(), "select first student"));
				header.appendChild(createEmptySpan());

				header.appendChild(getStudentsDropdown(getEndDropDownId(), "select last student"));
				header.appendChild(createEmptySpan());

				header.appendChild(getDownloadFileNameDropdown());
				header.appendChild(createEmptySpan());

				header.appendChild(getStartDownloadButton());
				header.appendChild(createEmptySpan());

				header.appendChild(getBackButton());
			});
		return;
	}
}

function setBulkUploadHeader() {
		showAllStudents().then((res) => {
		if (res === 0){
			setHeader();
		} else {
			throw new Error("Uexpected error occurred. Unable to sow all students.");
		}
	});

	function setHeader() {
		let header = getHeader();
		clearChildren(header).then(
			(resolve) => {
				getMainForm().prepend(header);

				header.appendChild(getSubmissionsInput())
				header.appendChild(createEmptySpan());

				header.appendChild(getUploadSelectedButton())
				header.appendChild(createEmptySpan());

				header.appendChild(getBackButton());
			});
		return;
	}
}

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

function getDownloadButton() {
	return getElement(getDownloadButtonId(), createDownloadButton);
}

function createDownloadButton() {
	let button = document.createElement("input");
	button.setAttribute("type", "button");
	button.setAttribute("id", getDownloadButtonId());
	button.setAttribute("class", 'opal-bulk-button');
	button.addEventListener("click", setBulkDownloadHeader);
	button.setAttribute("value", "Download submissions");
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
	button.setAttribute("value", getDownloadButtonValue());
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
	button.setAttribute("value", "Upload marking");
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
	button.setAttribute("value", "Back");
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

	for (let student of getStudentsInterval()) {
		let option = new Option(student[0] + " " + student[1], [student[0], student[1]]);
		dropdown.options.add(option);
	}
	return dropdown;
}

function getDownloadFileNameDropdown() {
	return getElement(getDownloadFileNameDropdownId(), createDownloadFileNameDropdown);
}

function createDownloadFileNameDropdown() {
	let container = document.createElement("span");
	container.setAttribute("class", "opal-bulk-dropdown-container");

	let message = document.createElement("span");
	message.innerHTML = "name submission as "
	
	let dropdown = document.createElement("select");
	dropdown.setAttribute("id", getDownloadFileNameDropdownId());
	dropdown.setAttribute("class", "opal-bulk-dropdown");

	dropdown.options.add( new Option("<student id>.pdf","select", true, true));
	dropdown.options.add( new Option("<surname>_<name>.pdf","surname_name"));

	container.appendChild(message);
	container.appendChild(dropdown);

	return container;
}
