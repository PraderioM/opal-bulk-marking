function getDownloadButtonId() {
	return "opal-bulk-download-button";
}

function getStartDownloadButtonId() {
	return "opal-bulk-start-download-button";
}

function getUploadButtonId() {
	return "opal-bulk-upload-button";
}

function getSubmissionsInputId() {
	return "opal-bulk-upload-input";
}

function getUploadSelectedButtonId() {
	return "opal-bulk-upload-selected-button";
}

function getUploadSelectedButtonValue() {
	return "Upload marking";
}

function getUploadSelectedButtonDiabledValue() {
	return "Please select marked submissions";
}

function getBackButtonId() {
	return "opal-bulk-back-button";
}

function getHeaderId() {
	return "opal-bulk-header";
}

function getStartDropDownId() {
	return "opal-bulk-start-dropdown";
}

function getEndDropDownId() {
	return "opal-bulk-end-dropdown";
}

function getDownloadFileNameDropdownId() {
	return "opal-bulk-file-name-dropdown";
}

function getDownloadButtonValue() {
	return "Download submissions";
}


function getMainFormPrefix() {
	return "tb_ms_";
}

function getTablePrefix() {
	return "b_table";
}

function getSurnameColumn() {
	return 0;
}

function getSurnameHeaderEnglish() {
	return "Last name";
}

function getSurnameHeaderGerman() {
	return "Nachname";
}

function getNameColumn() {
	return 1;
}

function getNameHeaderEnglish() {
	return "First name";
}

function getNameHeaderGerman() {
	return "Vorname";
}

function getIDColumn() {
	return 2;
}

function getIDHeaderEnglish() {
	return "Institution identifier";
}

function getIDHeaderGerman() {
	return "Matrikelnummer";
}

function getNSubmissionsColumn() {
	return 5;
}

function getPDFDownloadColumn() {
	return 2;
}

function getNSubmissionsHeaderEnglish() {
	return "Number of files";
}

function getNSubmissionsHeaderGerman() {
	return "Anz. Dateien";
}

function getUploadingFilesSessionStorageName() {
	return "opal-bulk-marking-uploading-files";
}

function getRestartFromFileUploadingSessionStorageName() {
	return "opal-bulk-marking-restart-from-upload";
}


function getMainFormID() {
	let allForms = document.getElementsByTagName("form");
    for (let i = 0; i < allForms.length; i++) {
    	let formID = allForms[i].id;

    	if (formID !== undefined) {
    		if (formID.substring(0, getMainFormPrefix().length) == getMainFormPrefix()) {
    			return formID.substring(getMainFormPrefix().length, formID.length);
    		}
    	}

    }

	return null;
}
