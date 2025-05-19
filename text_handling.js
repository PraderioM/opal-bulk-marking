const LANGUAGE = "LANGUAGE";
const ENGLISH = "ENG";
const GERMAN = "DE";

// This function detects the language in which the table page is set up and stores it as a global variable.
function setLanguage() {
	let table = getMainTable();
	if (table === null) {
		return;
	}

	let surname_column_index = getSurnameColumn();

	if (surname_column_index === -1) {
		return;
	}

	let table_head = table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
	let surname_column = table_head.getElementsByTagName("th")[surname_column_index];

	let link_list = surname_column.getElementsByTagName("a");
	let link_number = (surname_column_index === 0)? 0: 1; // For the first column the header name is written in the first link. For the rest it's written on the second.

	if (link_list.length < link_number+1) {
		return;
	}

	let link = link_list[link_number]; // The header name should be written in here.
	// If the header is written in english or german we set the language to english or gernman respectively.
	if (startsWithSubstring(link.innerHTML, [getSurnameHeaderEnglish()])) {
		sessionStorage.setItem(LANGUAGE, ENGLISH);
	} else if (startsWithSubstring(link.innerHTML, [getSurnameHeaderGerman()])) {
		sessionStorage.setItem(LANGUAGE, GERMAN);
	}

	return;
}

// This function returns true if the detected language is english and false otherwise.
function isLanguageEnglish() {
	return sessionStorage.getItem(LANGUAGE) === ENGLISH;
}

// This function returns true if the detected language is german and false otherwise.
function isLanguageGerman() {
	return sessionStorage.getItem(LANGUAGE) === GERMAN;
}

function getLanguageDependentText(german_text, english_text) {
	if (isLanguageGerman()) {
		return german_text;
	} else {
		return english_text;
	}
}


//******************************************************//
// DOM EDITING REGION.
//******************************************************//


function getInformationButtonValue() {
	return getLanguageDependentText("Hilfe", "Help");
}

function getGeneralInformationText() {
	return getLanguageDependentText("Willkommen zu 'opal-bulk-marking'. Dieses add-on hat zwei Benutzungsarten:\n\t1) Über die Schaltflache '" + getDownloadButtonValue() + "' können Sie Nachbereitungen herunterladen und sie auf Ihrem Computer in einem Benennungsformat Ihrer Wahl speichern.\n\t2) Über die Schaltflache '" + getUploadButtonValue() + "' können Sie Korrekturen hochladen und Noten abspeichern.\nSie konnen das Code und vollständige Anweisungen für 'opal-bulk-marking' in den folgende link finden:\n\thttps://github.com/PraderioM/opal-bulk-marking",
		"Welcome to 'opal-bulk-marking'. This add-on has two functions:\n\t1) Use the Button '" + getDownloadButtonValue() + "' to download submissions and save them in your computer in a chosen format.\n\t2) Use the button '" + getUploadButtonValue() + "' to upload corrections and save grades.\n\nThe source code for 'opal-bulk-marking' as well as more detailed instructions for its usage are freely available on:\n\thttps://github.com/PraderioM/opal-bulk-marking");
}

function getStudentShowingErrorMessage() {
	return getLanguageDependentText("Es gab einen unbekannten Fehler. Es ist unmöglich alle Studenten anzuzeigen.",
		"Unexpected error occurred. Unable to sow all students.");
}

function getBackButtonValue() {
	return getLanguageDependentText("Zuruck", "Back");
}

function getFirstStudentText() {
	return getLanguageDependentText("Wählen Sie den ersten Studenten aus", "select first student");
}

function getLastStudentText() {
	return getLanguageDependentText("Wählen Sie den letzten Studenten aus", "select last student");
}

function getDownloadButtonValue() {
	return getLanguageDependentText("Nachbereitungen herunterladen", "Download submissions");
}

function getUploadSelectedButtonDiabledValue() {
	return getLanguageDependentText("Wählen Sie bitte die jeweiligen Korrekturen aus", "Please select marked submissions");
}

function getUploadButtonValue() {
	return getLanguageDependentText("Korrekturen hochladen", "Upload marking");
}

function getSubmissionNamingText() {
	return getLanguageDependentText("Benennungsformat ", "name submission as ");
}


//*************************************************//
// BULK DOWNLOAD REGION.
//*************************************************//


function getDownloadInformationText() {
	return getLanguageDependentText("Über die ersten beiden Dropdown-Menüs können Sie Studenten auswählen, die mindestens ein Dokument eingereicht haben.\nSie konnen durch das Eingabefeldein prefix ein Prefix für die heruntergeladenen dokumente schreiben. Nur Buchstabe sind für diesen Prefix darft.\nSie konnen durch das Kontrollkästchen die Namen der Studenten in dem Name der heruntergeladenen Dokumente hinzufüngen.\nDanach können Sie die Schaltfläche '"+getStartDownloadButtonValue()+"' klicken, um die Herunterladen aller Einreichungen von den Studenten, die zwischen die beiden ausgewählt Studenten sind, starten.\nDiese Einreichungen werden im gewählten Benennugsformat auf Ihrem Computer gespeichert.\nACHTUNG: Damit dieses Add-on ordnungsgemäß funktionert, müssen Sie zunächst die Kontrollkästchen 'Jedes Mal nachfragen, wo eine Datei gespeichert werden soll' unter 'Dateien und Anwendungen' in Ihrem firefox Einstellungen Seite deaktivieren.",
		"Use the first two dropdowns to select two students from the list of all students that have one available submission.\nUse the text input field in order to write any prefix you want to appear in the names of downloaded files.\nUse the checkbox to decide wether or the student's name should appear in the names of the downloaded files.\nAfter doing so you can press on the button '"+getStartDownloadButtonValue()+"' in order to download the submissions of all students whose name is alfabetically between the first and last selected student.\nThese submissions will be saved to your computer under the specified format.\nIMPORTANT: In order for the add-on to work properly you need to deactivate the checkbox 'always ask where to store files' under the section 'downloads and apps' in the 'setting' of your firefox browser.");
}

function getUnrecognizedNamingText() {
	return getLanguageDependentText("Unbekannt Benennungsformat ", "Unrecognized file naming code ");
}

function getDownloadingText() {
	return getLanguageDependentText("Lädt herunter ", "Downloading ");
}

function getDownloadCompletedText() {
	return getLanguageDependentText("Herunterladen abgeschlossen", "Download completed");
}

function getStartDownloadButtonValue() {
	return getLanguageDependentText("Herunterladen anfangen", "Start download");
}

function getPrefixPlaceholderText() {
	return getLanguageDependentText("Präfix ", "prefix ");
}

function getAddNameLabelText() {
	return getLanguageDependentText("Studenten Name hinzufügen ", "Add student name ");
}

function getSubmissionNumberText() {
	return getLanguageDependentText("vorlage", "submission");
}

function getConfirmDownloadMarkedText() {
	return getLanguageDependentText("Die folgende Studierende haben bereits ein Korrektur ernhalten. Möchten Sie deren Nachbereitungen trotzdem herunterladen?",
		"The folllowing students have already been marked. Do you wish to download their submissions nonetheless?");
}

function getDownloadAllButtonValue() {
	return getLanguageDependentText("Alles herunterladen", "Download all");
}

function getDownloadNonMarkedButtonValue() {
	return getLanguageDependentText("Non korrigiert herunterladen", "Download non marked");
}


//*************************************************//
// BULK UPLOAD REGION.
//*************************************************//


function getUploadInformationText() {
	return getLanguageDependentText("Zum Hochladen der Korrekturen müssen Sie diese entweder als '<Text>_<Matrikelnummer>_<Note>.pdf' oder als '<Matrikelnummer>_<Note>.pdf' benennen.\nHier muss die '<Note>' als '<Ganzzahlen>.<Dezimalzahlen>' oder als '<Ganzzahlen>' geschrieben werden.\nBeachten Sie, dass diese Benennugsformate so ähnlich wie die heruntergeladenen sind. Mann muss nur '_<Note>' zum Namen der heruntergeladenen Dateien hinzufügen.\nVor dem Hochladen werden Sie gebeten, die Noten zu überprüfen, die dann gespeichert werden.\nWährend des Speichervorgangs, wird die Seite viele Male aktualisiert. Das ist normal. Das Add-on muss das tun, um alle Noten zu speichern.\nWenn Sie das Hochladen anhalten wollen, können Sie die Seite einfach schließen.\nWenn Sie sich dazu entschließen, werden Sie beim nächsten Öffnen von Opal gefragt, ob Sie mit dem Hochladen fortfahren möchten.\nBeachten Sie, dass die Korrekturen unter dem Namen '"+getMarkedPDFName()+"' gespeichert werden.",
		"In order to upload the marked submissions make sure that they are named either as '<text>_<student id>_<grade>.pdf' or as '<student_id>_<grade>.pdf'.\nHere '<grade>' should be written as '<integer>.<decimals>' or simply '<integer>'.\nNotice how these formats can be obtained by simply adding '_<grade>' at the end of the name of the files downloaded using this add-on.\nBefore starting the upload process you will be showed a prompt asking you to confirm the grades to be saved.\nDuring the upload process the page will be changing multiple times as it iterates over all the students whose submissions have been marked and uploads the results.\nYou can decide to stop the uploading process halfway through by simply closing the tab.\nIf you decide to do so you will then be asked if you wish to continue with the uploading process or halt it.\nNote that the marked files will all be uploaded under the name '"+getMarkedPDFName()+"'.");
}

function getDuplicateSubmissionText() {
	return getLanguageDependentText("Die folgende Studenten besitzen verschidener Korrekturen. Bitte achten, dass jeden student eine einzige korrektur besitzt, bevor die Hochladen anfangt:",
		"The following students have multiple marked submissions. Please make sure that you upload a single marked file per student:");
}

function getSaveButtonText() {
	return getLanguageDependentText("Speichern", "Save");
}

function getUploadButtonText() {
	return getLanguageDependentText("Hochladen", "Upload");
}

function getMarkedPDFName() {
	return getLanguageDependentText("korrektur.pdf", "marked_submission.pdf");
}

function getUnrecognizedFormatText() {
	return getLanguageDependentText("Ich konnte das Heißungsformat den nächsten Dateien nicht erkannen.\nBitte achten, dass das Heißungsformat '&lt;nächname&gt;_&lt;vorname&gt;_&lt;note&gt;' oder '&lt;matrikelnummer&gt;_&lt;note&gt;' ist.\nHier &lt;note&gt; muss bei dem form '&lt;ganzzahlen&gt;.&lt;dezimalzahlen&gt;' oder einfachtlich '&lt;ganzzahlen&gt;' sein:",
		"The following files are in an unrecognized format.\nPlease make sure your files are either in the format '&lt;student_surname&gt;_&lt;student_name&gt;_&lt;grade&gt;' or in the format '&lt;student_id&gt;_&lt;grade&gt;'.\nHere &lt;grade&gt; should be in the format '&lt;integer&gt;.&lt;decimals&gt;' or simply '&lt;integer&gt;':");
}


function getNonMatchingStudentsText() {
	return getLanguageDependentText("Ich konnte keine Studenten finden, dazu einen von die nächsten Dateien gehört.\nBitte achten, dass alle Studenten sichtbar sind und das Dateiem namen richtig sind.",
		"I was unable to find students corresponding to the following files.\nPlease make sure that all students are visible in the table below and that the names in the files are correct.");
}


function getNoFilesMatchedText() {
	return getLanguageDependentText("Ich konnte keinen studenten finden, der zu einer von dem ausgewälen Dateien passt.",
		"I was unable to find any files in the correct format matching any of the visible students.");
}

function getConfirmUploadText() {
	return getLanguageDependentText("Bitte achten, dass Sie diesen Noten hochladen mochten:",
		"Please confirm that you want to upload the following grades:");
}

function getUploadingText() {
	return getLanguageDependentText("Lädt hoch ", "Uploading ");
}

function getUploadCompletedText() {
	return getLanguageDependentText("Hochladen abgeschlossen", "Upload completed");
}

function getUploadStoppedText() {
	return getLanguageDependentText("Hochladen angehalten", "Upload stopped");
}

function getUploadSelectedButtonValue() {
	return getLanguageDependentText("Hochladen anfangen", "Start upload");
}

function getDownloadAllButtonValue() {
	return getLanguageDependentText("Alles herunterladen", "Download all");
}

function getDownloadNonMarkedButtonValue() {
	return getLanguageDependentText("Non korrigiert herunterladen", "Download non marked");
}

function getAcceptUploadFailedButtonValue() {
	return getLanguageDependentText("Shade", "Shame");
}



//*************************************************//
// UTILS REGION.
//*************************************************//


function getConfirmButtonValue() {
	return getLanguageDependentText("Bestätigen", "Confirm");
}

function getCancelButtonValue() {
	return getLanguageDependentText("Ablehnen", "Cancel");
}

function getOKButtonValue() {
	return getLanguageDependentText("Akzeptieren", "Accept");
}