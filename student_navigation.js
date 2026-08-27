// This function changes the student submission page to the previous student if any.
async function goToPrevious() {
    let url = await getPreviousUrl(false);
    if (url === null) {
        getPreviousButton().blur();
        await customAlert(getFirstStudentNoSubmissionAlertText(), "", getStudentSubmissionHeader);
    } else {
        followLink(url);
    }
}

// This function changes the student submission page to the next student if any.
async function goToNext() {
    let url = await getNextUrl(false);
    if (url === null) {
        getNextButton().blur();
        await customAlert(getLastStudentNoSubmissionAlertText(), "", getStudentSubmissionHeader);
    } else {
        followLink(url);
    }
}

// This function changes the student submission page to the previous student with a submission if any.
async function goToPreviousSubmitted() {
    let url = await getPreviousUrl(true);
    if (url === null) {
        getPreviousSubmittedButton().blur();
        await customAlert(getFirstStudentWithSubmissionAlertText(), "", getStudentSubmissionHeader);
    } else {
        followLink(url);
    }
}

// This function changes the student submission page to the next student with a submission if any.
async function goToNextSubmitted() {
    let url = await getNextUrl(true);
    if (url === null) {
        getNextSubmittedButton().blur();
        await customAlert(getLastStudentWithSubmissionAlertText(), "", getStudentSubmissionHeader);
    } else {
        followLink(url);
    }
}

// This function looks through all the students appearing in the submissions page and returns a link to the page of the
// first student before the current one if with submission is set to false o the first student before the current ont
// having a submission if with_submission is set to true. If no such student is found it returns null.
async function getPreviousUrl(with_submission) {
    let all_students = await getAllStudents();
    let student_id = getStudentsPageStudentsId();

    let previous_student = null;
    for (let student of all_students) {
        if (student[0] === student_id) {
            return previous_student;
        }

        let n_submissions = student[2];
        if (!with_submission || n_submissions > 0) {
            previous_student = student[1];
        }
    }

    return previous_student;
}

// This function looks through all the students appearing in the submissions page and returns a link to the page of the
// first student after the current one if with submission is set to false o the first student after the current ont
// having a submission if with_submission is set to true. If no such student is found it returns null.
async function getNextUrl(with_submission) {
    let all_students = await getAllStudents();
    let student_id = getStudentsPageStudentsId();

    let current_found = false;
    for (let other_student of all_students) {
        let n_submissions = other_student[2];
        if (!with_submission || n_submissions > 0) {
            if (current_found) {
                return other_student[1];
            }
        }

        if (other_student[0] === student_id) {
            current_found = true;
        }

    }

    return null;
}

// This function looks into the table appearing in the submissions page and for each student there it returns a list
// of triples containing the following elements in order:
//     Student id,
//     url: url to the page of this student for the given submission,
//     n_submissions: Either the number of submission this student has delivered or null if there cannot be submissions for this student.
async function getAllStudents() {
    let link = getStudentSubmissionBackLink();
    let page = await loadPage(link.href);
    await showAllStudents(page);

    let table = page.getElementById(getTablePrefix() + getMainFormID(page));

    let table_body = table.getElementsByTagName("tbody")[0];

    let all_students = [];

    for (let row of table_body.getElementsByTagName("tr")) {
        let all_entries = row.getElementsByTagName("td");
        let link = all_entries[getSurnameColumn(page)].getElementsByTagName("a")[1];
        let url = link.href;
        let identifier = all_entries[getIDColumn(page)].innerHTML;

        // Sometimes the submissions column is empty. In these cases we automatically say that there are 0 submissions.
        let n_submissions_column = getNSubmissionsColumn(page);
        let n_submissions = 0;
        if (n_submissions_column !== -1) {
            n_submissions = parseInt(all_entries[getNSubmissionsColumn(page)].innerHTML);
        }
        all_students.push([identifier, url, n_submissions]);
    }

    return all_students;
}

// This function gets the ID of the student corresponding to the current student page.
function getStudentsPageStudentsId() {
    let table = document.getElementsByClassName("b_table")[0];
    let table_body = table.getElementsByTagName("tbody")[0];
    let row = table_body.getElementsByTagName("tr")[0];
    let identifier_cell = row.getElementsByTagName("td")[1];
    return identifier_cell.innerHTML.replace("TU Dresden", "").trim();
}