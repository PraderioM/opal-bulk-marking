# OPAL-BULK-MARKING 0.6 (beta)

Opal-bullk-marking is an add-on developed by [Marco Praderio Bova](https://marcopraderiobova.com/) with the goal of simplifying the downloading and uploading parts of the processes of marking submissions via Opal.

## Disclaimer
Opal-bulk-marking is stil on its early stages of development and was only tested in the context of the [TU Dresden opal page](https://bildungsportal.sachsen.de/opal/). Even in this case, due to lack of access to some functions from Opal, it was not possible to run extensive tests on the upload process and the user is advised to double check this process. At least during their first uses of opal-bulk-marking.

Opal-bulk-marking is designed to work on a Firefox browser and will not work on any other browser.

## Instructions
For information on how to install Opal-bulk-marking see Section [Installation](#sec_installation).

For instructions on how to set up your Firefox browser in order for the [bulk download](#subsec_download) to work properly see Section [Configuration](#sec_configuration) .

Once installed opal-bulk-marking will make no modifications on your browser until you enter the opal page where submissions for a given assessment are listed.
This is the page that can be accessed by selecting a given module, pressing on the 'Assessment tool' icon on the top (appearing as a cogwheel), selecting the 'As per group' option on the table on the left side of the page, selecting a 'Group name' from the table that appears and finally selecting the desired assessment from the 'display' dropdown appearing on the right side just above the main table.
In what follows we will refer to this page simply as the *assessment page* and to the table appearing in this page simply as *assessment table*.

<a id="subsec_main"></a>
### Main page
Once you enter the assessment page for the first time opal-bulk-marking will modify it so that the following appears right above the assessment table.

![main](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/main.png?raw=true)

The big green buttons shown in the image above have the following functions:

* **Download submissions**: Makes all students visible in the assessment table and displays the configuration of buttons described in Section [Bulk download](#subsec_download).
* **Upload marking**: Makes all students visible in the assessment table and displays the configuration of buttons described in Section [Bulk upload](#subsec_upload).
* **Help**: Shows a pop-up with minimal instructions on how to use opal-bulk-marking as well as a link to this page.

**IMPORTANT**: In order for the buttons to appear it is necessary for the columns 'Last name', 'First name', 'Institution identifier' and 'Number of files' to be visible in the assessment table.

**IMPORTANT**: If the opal page is set in german then opal-bulk-marking will detect this and adapt the language to german. However there is currently no support for any language other than english and german.

**IMPORTANT**: There might be some gramatical errors in the german text displayed by opal-bulk-marking. If you can find any such error please get in contact with a [mainteiner](#sec_mainteiner) so that the error can be fixed in future versions.

<a id="subsec_download"></a>
### Bulk download
If you press on the 'Download submissions' button appearing in the [main page](#subsec_main) opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and change the showed buttons to the ones appearing in the image below

![dowload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/download.png?raw=true)

These buttons and dropdowns have the following functions:

* **first student**: Allows you to select the first student of the range of students whose submissions you wish to download. If left blank the first available student will be selected automatically. Only students with exactly one submission are considered.
* **last student**: Allows you to select the last student of the range of students whose submissions you wish to download. If left blank the last available student will be selected automatically. Only students with exactly one submission are considered.
* **name submission as**: Allows you to specify how you want the download submission to be named. There are two possible naming conventions:
    * *\<student_id>.pdf*: The downloaded submissions will be named after the student id.
    * *\<surname>\_\<name>.pdf*: The downloaded submissions will be named after the surname and name of the student.
* **Start download**: Dowloads the submissions from all students in the specified range whom have submitted EXACTLY one file. Submissions are stored following the specified naming convention.
* **Help**: Shows a pop up with minimal instructions on how to use the bulk download function of opal-bulk-marking.
* **Back**: Goes back to the [main page](#subsec_main).


**IMPORTANT**: Before starting the download make sure your Firefox browser is configured as described in Section [Configuration](#sec_configuration).

<a id="subsec_upload"></a>
### Bulk upload
If you press on the 'Upload marking' button appearing in the [main page](#subsec_main) opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and change the showed buttons to the ones appearing in the image below.

![upload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/upload.png?raw=true)

These buttons and selectables have the following functions:

* **selectable**: Allows you to select all marked submissions that you wish to upload to Opal. These submissions should be named either as '\<student_id>\_\<grade>.pdf' or as '\<surname>\_\<name>\_\<grade>.pdf'. Notice how file names following these conventions can be obtained by adding the suffix '\_\<grade>' at the end of the files downloaded using the [bulk download function](#subsec_download). Here '\<grade>' represents the grade assigned to the submission and can be written using either of the following 2 conventions:
    * *\<integer>*: A positive integer representing the grade. For example the grade '7.0' would be written simply as '7' using this convention.
    * *\<integer>_\<decimals>*: A positive integer representing the integer part of a number followed by an underscore followed by a positive integer representing the decimal part of a number. For example the grade '7.5' can be written as '7_4' using this convention.
* **Start upload**: Starts the uploading of all selected files. More precisely opal-bulk-marking will use the name of each of the selected files in order to obtain a grade and a student. It will then look for that student in the list of all available students and upload the marked submission (renamed to 'marked_submission.pdf') to its page. While doing so it will also store in the student's page the grade associated to this submission. Before starting the upload process opal-bulk-marking will show you a pop-up listing any error it might encounter (i.e. unrecognized naming conventions or non found students) and showing you the list of all students and grades that it successfully identified. The upload process will start only after you confirm the showed grades are the ones you want to upload.
* **Help**: Shows a pop up with minimal instructions on how to use the bulk upload function of opal-bulk-marking.
* **Back**: Goes back to the [main page](#subsec_main).

**IMPORTANT**: During the upload process opal-bulk-marking will change the page several times as it iterates over all students whose marked submission are being uploaded. You should NOT interact with the page during this process as it might lead to failure uploading some marked submission. Opal-bulk-marking will however NEVER incorrectly assign a grade or a file.

**IMPORTANT**: If the uploading process is stopped halfway through (for example by closing the tab) opal-bulk-marking will notify you of a non completed upload next time you use it and allow you to resume it from where it was stopped.

**IMPORTANT**: Beware that opal-bulk-marking is still in its early stages of development and it was not possible to run extensive tests of the upload process. It is therefore possible that some of the selected files will not be uploaded and the user is asked to double check that all grades have been uploaded once the uploading process is completed.

## Requirements
* Firefox browser.
* Access to [TU Dresden opal page](https://bildungsportal.sachsen.de/opal/).


<a id="sec_installation"></a>
## Installation
In order to install the latest version of opal-bulk-marking you need to:
* Download the [opal-bulk-marking.xpi](https://github.com/PraderioM/opal-bulk-marking/raw/refs/heads/main/opal-bulk-marking.xpi) file that can be found in this same page.
* Right click on the downloaded file and press on the option 'open with Firefox'.
* Your Firefox browser will open with a notification asking if you wish to add the opal-bulk-marking extension to Firefox.
* Press on 'Add'.
* A notification will appear confirming correct installation of the add-on.

<a id="sec_configuration"></a>
## Configuration
The default settings of your Firefox browser might lead to a new page opening up on Firefox for every downloaded submission.
This might be quite annoying and might interfere with the correct functioning of opal-bulk-marking add on.
In order to fix this go to the '[preferences](about:preferences)' page of your Firefox browser. Under the 'General' tab scroll down untill you arrive to the 'Files and Applications' section and deselect the 'Always ask you where to save files' checkbox.
Make also sure that the 'action' associated to PDF files is set to 'Save File'.

For guidance the image below shows an example of a correct configuration.

![main](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/settings.png?raw=true)

<a id="sec_mainteiner"></a>
## Maintainers
* [Marco Praderio Bova](https://marcopraderiobova.com/)