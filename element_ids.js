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


function getMainFormPrefix() {
	return "tb_ms_";
}

function getTablePrefix() {
	return "b_table";
}

function getSurnameHeaderEnglish() {
	return "Last name";
}

function getSurnameHeaderGerman() {
	return "Nachname";
}

function getNameHeaderEnglish() {
	return "First name";
}

function getNameHeaderGerman() {
	return "Vorname";
}

function getIDHeaderEnglish() {
	return "Institution identifier";
}

function getIDHeaderGerman() {
	return "Matrikelnummer";
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

function getGeneralInformationButtonId() {
	"opal-bulk-marking-general-information-button";
}

function getDownloadInformationButtonId() {
	"opal-bulk-marking-download-information-button";
}

function getUploadInformationButtonId() {
	"opal-bulk-marking-upload-information-button";
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
