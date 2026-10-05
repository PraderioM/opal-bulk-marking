const LANGUAGE = "LANGUAGE";
const ENGLISH = "ENG";
const GERMAN = "DE";

// This function detects the language in which the table page is set up and stores it as a global variable.
function setLanguageTable() {
	let table = getMainTable(document);
	if (table === null) {
		return;
	}

	let surname_column_index = getSurnameColumn(document);

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
	// If the header is written in english or german we set the language to english or german respectively.
	if (startsWithSubstring(link.innerHTML, [getSurnameHeaderEnglish()])) {
		sessionStorage.setItem(LANGUAGE, ENGLISH);
	} else if (startsWithSubstring(link.innerHTML, [getSurnameHeaderGerman()])) {
		sessionStorage.setItem(LANGUAGE, GERMAN);
	}

	// return;
}

// This function detects the language in which the table page is set up and stores it as a global variable.
function setLanguageStudentSubmission() {
	let student_submission_title = getStudentSubmissionTitle();
	if (student_submission_title === null) {
		return;
	}

	let title = student_submission_title.innerHTML;
	if (startsWithSubstring(title, [getStudentsSubmissionHeaderEnglish()])) {
		sessionStorage.setItem(LANGUAGE, ENGLISH);
	} else if (startsWithSubstring(title, [getStudentsSubmissionHeaderGerman()])) {
		sessionStorage.setItem(LANGUAGE, GERMAN);
	}
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
// region DOM EDITING.
//******************************************************//

// region MAIN PAGE.
function getStatisticsButtonValue() {
	return getLanguageDependentText("Statistiken", "Statistics");
}

function getInformationButtonValue() {
	return getLanguageDependentText("Hilfe", "Help");
}

function getGeneralInformationText() {
	return getLanguageDependentText("Willkommen zu 'opal-bulk-marking'. Dieses add-on hat drei Benutzungsarten:\n\t1) Über die Schaltfläche '" + getDownloadButtonValue() + "' können Sie Hausuafgaben herunterladen und sie auf Ihrem Computer in einem Benennungsformat Ihrer Wahl speichern.\n\t2) Über die Schaltfläche '" + getUploadButtonValue() + "' können Sie Korrekturen hochladen und Noten abspeichern.\n\t2) Über die Schaltfläche '" + getStatisticsButtonValue() + "' können Sie Statistiken zu den Lösungen sehen.\n\nSie können den Code und vollständige Anweisungen für 'opal-bulk-marking' im folgenden link finden:\n\thttps://github.com/PraderioM/opal-bulk-marking",
		"Welcome to 'opal-bulk-marking'. This add-on has three functions:\n\t1) Use the Button '" + getDownloadButtonValue() + "' to download submissions and save them in your computer in a chosen format.\n\t2) Use the button '" + getUploadButtonValue() + "' to upload corrections and save grades.\n\t3) Use the button '" + getStatisticsButtonValue() + "' to view statistics concerning the current assignment.\n\nThe source code for 'opal-bulk-marking' as well as more detailed instructions for its usage are freely available on:\n\thttps://github.com/PraderioM/opal-bulk-marking");
}

function getStudentShowingErrorMessage() {
	return getLanguageDependentText("Es gab einen unbekannten Fehler. Es ist unmöglich, alle Studenten anzuzeigen.",
		"Unexpected error occurred. Unable to sow all students.");
}

function getBackButtonValue() {
	return getLanguageDependentText("Zuruck", "Back");
}

function getFirstStudentText() {
	return getLanguageDependentText("Wählen Sie den ersten Studierenden aus", "select first student");
}

function getLastStudentText() {
	return getLanguageDependentText("Wählen Sie den letzten Studierenden aus", "select last student");
}

function getDownloadButtonValue() {
	return getLanguageDependentText("Nachbereitungen herunterladen", "Download submissions");
}

function getUploadSelectedButtonDisabledValue() {
	return getLanguageDependentText("Wählen Sie bitte die jeweiligen Korrekturen aus", "Please select marked submissions");
}

function getUploadButtonValue() {
	return getLanguageDependentText("Korrekturen hochladen", "Upload marking");
}

function getSubmissionNamingText() {
	return getLanguageDependentText("Benennungsformat ", "name submission as ");
}
// endregion

// region STUDENT SUBMISSION PAGE
function getPreviousButtonValue() {
	return getLanguageDependentText("Vorherige/r", "Previous");
}

function getNextButtonValue() {
	return getLanguageDependentText("Nächste/r", "Next");
}

function getPreviousSubmittedButtonValue() {
	return getLanguageDependentText("Vorherige/r mit Einreichung", "Previous submitted");
}

function getNextSubmittedButtonValue() {
	return getLanguageDependentText("Nächste/r mit Einreichung", "Next submitted");
}

function getFirstStudentNoSubmissionAlertText() {
	return getLanguageDependentText("Diesen is der/die erste Studenten/inen in diese Seite", "This is the first student in this page.")
}

function getLastStudentNoSubmissionAlertText() {
	return getLanguageDependentText("Diesen is der/die letzte Studenten/inen in diese Seite", "This is the last student in this page.")
}

function getFirstStudentWithSubmissionAlertText() {
	return getLanguageDependentText("Auf dieser Seite sind keine Studierenden mit Einreichungen vor der aktuelle Studenten/inen.", "There are no students with submissions before the current one in this page.")
}

function getLastStudentWithSubmissionAlertText() {
	return getLanguageDependentText("Auf dieser Seite sind keine Studierenden mit Einreichungen nach der aktuelle Studenten/inen.", "There are no students with submissions after the current one in this page.")
}
// endregion

//******************************************************//
// endregion
//******************************************************//

//*************************************************//
// region BULK DOWNLOAD.
//*************************************************//

function getDownloadInformationText() {
	return getLanguageDependentText("Über die ersten beiden Dropdown-Menüs können Sie Studierende auswählen, die mindestens ein Dokument eingereicht haben.\nSie können durch das Eingabefeld einen Prefix für die heruntergeladenen Dokumente anfügen. Die Zeichenfolgen der Form \"<id>[i]\" mit \"i\" im Bereich von 1 bis 7 werden durch die entsprechende Ziffer in der Matrikelnummer ersetzt und der Text wird leicht modifiziert, um mögliche Fehler zu vermeiden.\nSie können durch das Kontrollkästchen die Namen der Studierenden an den Namen der heruntergeladenen Dokumente anfügen.\nDanach klicken Sie die Schaltfläche '"+getStartDownloadButtonValue()+"' , um die Lösungen aller Studierenden, die zwischen den beiden ausgewählten Studierenden stehen, herunterzuladen.\nDiese Lösungen werden im gewählten Benennugsformat auf Ihrem Computer gespeichert.\nACHTUNG: Damit dieses Add-on ordnungsgemäß funktioniert, müssen Sie zunächst die Kontrollkästchen 'Jedes Mal nachfragen, wo eine Datei gespeichert werden soll' unter 'Dateien und Anwendungen' in Ihrem firefox Einstellungen Seite deaktivieren.",
		"Use the first two dropdowns to select two students from the list of all students that have one available submission.\nUse the text input field in order to write any prefix you want to appear in the names of downloaded files. The strings of the form \"<id>[i]\" with \"i\" ranging from 1 to 7 will be replaced by the corresponding digit in the student id and the text will be slightly modified in order to avoid potential errors.\nUse the checkbox to decide wether or the student's name should appear in the names of the downloaded files.\nAfter doing so you can press on the button '"+getStartDownloadButtonValue()+"' in order to download the submissions of all students whose name is alfabetically between the first and last selected student.\nThese submissions will be saved to your computer under the specified format.\nIMPORTANT: In order for the add-on to work properly you need to deactivate the checkbox 'always ask where to store files' under the section 'downloads and apps' in the 'setting' of your firefox browser.");
}

function getUnrecognizedNamingText() {
	return getLanguageDependentText("Unbekanntes Benennungsformat ", "Unrecognized file naming code ");
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
	return getLanguageDependentText("Name hinzufügen ", "Add student name ");
}

function getSubmissionNumberText() {
	return getLanguageDependentText("Vorlage", "submission");
}

function getConfirmDownloadMarkedText() {
	return getLanguageDependentText("Die folgenden Studierenden haben bereits eine Korrektur erhalten. Möchten Sie deren Hausaufgaben trotzdem herunterladen?",
		"The folllowing students have already been marked. Do you wish to download their submissions nonetheless?");
}

function getDownloadAllButtonValue() {
	return getLanguageDependentText("Alles herunterladen", "Download all");
}

function getDownloadNonMarkedButtonValue() {
	return getLanguageDependentText("Non korrigierte herunterladen", "Download non marked");
}

//******************************************************//
// endregion
//******************************************************//

//*************************************************//
// region BULK UPLOAD.
//*************************************************//


function getUploadInformationText() {
	return getLanguageDependentText("Zum Hochladen der Korrekturen müssen Sie diese entweder als '<Text>_<Matrikelnummer>_<Note>.pdf' oder als '<Matrikelnummer>_<Note>.pdf' benennen.\nHier muss die '<Note>' als '<Ganzzahlen>.<Dezimalzahlen>' oder als '<Ganzzahlen>' geschrieben werden.\nBeachten Sie, dass diese Benennugsformate so ähnlich wie die heruntergeladenen sind. Sie müssen nur '_<Note>' zum Namen der heruntergeladenen Dateien hinzufügen.\nVor dem Hochladen werden Sie gebeten, die Noten zu überprüfen, die dann gespeichert werden.\nWährend des Speichervorgangs wird die Seite mehrmals aktualisiert. Das ist normal. Das Add-on muss das tun, um alle Noten zu speichern.\nWenn Sie das Hochladen anhalten wollen, können Sie die Seite einfach schließen.\nWenn Sie sich dazu entschließen, werden Sie beim nächsten Öffnen von Opal gefragt, ob Sie mit dem Hochladen fortfahren möchten.",
		"In order to upload the marked submissions make sure that they are named either as '<text>_<student id>_<grade>.pdf' or as '<student_id>_<grade>.pdf'.\nHere '<grade>' should be written as '<integer>.<decimals>' or simply '<integer>'.\nNotice how these formats can be obtained by simply adding '_<grade>' at the end of the name of the files downloaded using this add-on.\nBefore starting the upload process you will be shown a prompt asking you to confirm the grades to be saved.\nDuring the upload process the page will be changing multiple times as it iterates over all the students whose submissions have been marked and uploads the results.\nYou can decide to stop the uploading process halfway through by simply closing the tab.\nIf you decide to do so you will then be asked if you wish to continue with the uploading process or halt it.");
}

function getDuplicateSubmissionText() {
	return getLanguageDependentText("Die folgende Studierenden besitzen verschiedene Korrekturen. Bitte beachten Sie, dass vor dem Hochladen jede Lösung eindeutig korrigert sein muss:",
		"The following students have multiple marked submissions. Please make sure that you upload a single marked file per student:");
}

function getSaveButtonText() {
	return getLanguageDependentText("Speichern", "Save");
}

function getUploadButtonText() {
	return getLanguageDependentText("Hochladen", "Upload");
}

// function getMarkedPDFName() {
// 	return getLanguageDependentText("korrektur.pdf", "marked_submission.pdf");
// }

function getUnrecognizedFormatText() {
	return getLanguageDependentText("Ich konnte das Benennungsformat den nächsten Dateien nicht erkennen.\\nBitte beachten Sie, dass das Benennugsformat '&lt;nächname&gt;_&lt;vorname&gt;_&lt;note&gt;' oder '&lt;matrikelnummer&gt;_&lt;note&gt;' ist.\\nHier &lt;note&gt; muss im Format '&lt;ganzzahlen&gt;.&lt;dezimalzahlen&gt;' oder einfach '&lt;ganzzahlen&gt;' sein:",
		"The following files are in an unrecognized format.\nPlease make sure your files are either in the format '&lt;student_surname&gt;_&lt;student_name&gt;_&lt;grade&gt;' or in the format '&lt;student_id&gt;_&lt;grade&gt;'.\nHere &lt;grade&gt; should be in the format '&lt;integer&gt;.&lt;decimals&gt;' or simply '&lt;integer&gt;':");
}


function getNonMatchingStudentsText() {
	return getLanguageDependentText("Ich konnte keine Studierenden finden, die zu der nächsten Datei gehören.\\nBitte achten Sie darauf, dass alle Studenten sichtbar sind und dass die Dateinamen korrekt sind.",
		"I was unable to find students corresponding to the following files.\nPlease make sure that all students are visible in the table below and that the names in the files are correct.");
}


function getNoFilesMatchedText() {
	return getLanguageDependentText("Ich konnte keinen Studierenden finden, der zu einer der ausgewählten Dateien passt.",
		"I was unable to find any files in the correct format matching any of the visible students.");
}

function getConfirmUploadText() {
	return getLanguageDependentText("Bitte bestätigen Sie, dass Sie diese Noten hochladen möchten:",
		"Please confirm that you want to upload the following grades:");
}

function getConfirmReplaceText() {
	return getLanguageDependentText("Bitte bestätigen Sie, dass Sie diese Noten ersetzen möchten (Wir werden dies nochmals fragen):",
		"Please confirm that you want to replace the following grades (we will ask this again later):");
}

function getConfirmNoIdText() {
	return getLanguageDependentText("Den folgenden Dateien ist keine Matrikelnummer zugeordnet. Bitte stellen Sie sicher, dass sie den richtigen Studierenden zugeordnet wurden:",
		"The following files have no associated student id, please make sure that they were matched to the correct student:");
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

function getAcceptUploadFailedButtonValue() {
	return getLanguageDependentText("Shade", "Shame");
}

function getStudentNameTitleText() {
	return getLanguageDependentText("Studierende", "Student");
}

function getGradeTitleText() {
	return getLanguageDependentText("Note", "Grade");
}

function getNewGradeTitleText() {
	return getLanguageDependentText("Neue Note", "New grade");
}

function getOldGradeTitleText() {
	return getLanguageDependentText("Alte Note", "Old grade");
}

function getSubmissionNameTitleText() {
	return getLanguageDependentText("Dateiname", "File name");
}

function getAskReplaceText() {
	return getLanguageDependentText("Die folgenden Studierenden wurden bereits benotet. Möchten Sie ihre Note durch die neue Note ersetzen? Alle zuvor hochgeladenen Korrekturdateien werden gelöscht und durch die neuen ersetzt:",
		"The following students have already been graded. Do you wish to replace their grade with the new provided one? All previously uploaded graded files will be removed and replaced by the new ones:");
}

function getConfirmAskReplaceText() {
	return getLanguageDependentText("Noten ersetzen", "Replace grades");
}

function getCancelAskReplaceText() {
	return getLanguageDependentText("Alte Noten behalten", "Keep old grades");
}

//******************************************************//
// endregion
//******************************************************//

//*************************************************//
// region STATISTICS.
//*************************************************//

function getNoHistogramText() {
	return getLanguageDependentText("Nicht genügend Daten zum Zeichnen eines Histogramms.", "Insufficient data to show a histogram.");
}

function getHistogramTitle() {
	return getLanguageDependentText("Noten", "Grades");
}

function getNoAverageText() {
	return getLanguageDependentText("Nicht genügend Daten zur Berechnung von Durchschnitt und Standardabweichung.", "Insufficient data to compute average and standard deviation.");
}

function getAverageGradeText() {
	return getLanguageDependentText("Durchschnittsnote: ", "Average grade: ");
}

function getPassingGradedPercentageText() {
	return getLanguageDependentText("Anzahl der bestandenen Einreichungen: ", "Number of passing submissions: ");
}

function getSubmittedPercentageText() {
	return getLanguageDependentText("Anzahl der Abgaben: ", "Number of submissions: ");
}

function getGradedPercentageText() {
	return getLanguageDependentText("Anzahl der benoteten Abgaben: ", "Number of graded submissions: ");
}

function getCloseText() {
	return getLanguageDependentText("Schließen", "Close");
}

//******************************************************//
// endregion
//******************************************************//


//*************************************************//
// region UTILS.
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

//******************************************************//
// endregion
//******************************************************//