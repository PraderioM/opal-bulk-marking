# OPAL-BULK-MARKING 1.0

Opal-bullk-marking is an add-on developed by [Marco Praderio Bova](https://marcopraderiobova.com/) with the goal of simplifying the downloading and uploading parts of the processes of marking submissions via Opal.

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
* **Statistics**: Makes all students visible and shows a pop up with statistics regarding the submissions. These statistics are described in Section [Statistics](#subsec_statistics).
* **Help**: Shows a pop-up with minimal instructions on how to use opal-bulk-marking as well as a link to this page.

**IMPORTANT**: In order for the buttons to appear it is necessary for the columns 'Last name', 'First name', 'Institution identifier', 'Number of files' and 'Grade' to be visible in the assessment table.

**IMPORTANT**: If the opal page is set in german then opal-bulk-marking will detect this and adapt the language to german. However there is currently no support for any language other than english and german.

**IMPORTANT**: There might be some gramatical errors in the german text displayed by opal-bulk-marking. If you can find any such error please get in contact with a [mainteiner](#sec_mainteiner) so that the error can be fixed in future versions.

<a id="subsec_download"></a>
### Bulk download
If you press on the 'Download submissions' button appearing in the [main page](#subsec_main) opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and change the showed buttons to the ones appearing in the image below

![dowload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/download.png?raw=true)

These buttons, text inputs and checkboxes have the following functions:

* **first student**: Allows you to select the first student of the range of students whose submissions you wish to download. If left blank the first available student will be selected automatically. Only students with exactly one submission are considered.
* **last student**: Allows you to select the last student of the range of students whose submissions you wish to download. If left blank the last available student will be selected automatically. Only students with exactly one submission are considered.
* **prefix**: Allows you to specify a custom input that will be added at the start of all downloaded submissions. If no prefix is specified no prefix will be added. Before being added to the name of the downloaded file this prefix will be modified in the following way in order to prevent potential crashes:
    * The all capital letters will be converted to lowercase.
    * All accented vowels will be replaced by their non accented counterparts and the letters "ß" and "ñ" will be replaced by "ss" and "n" respectively.
    * All remaining symbols other than letters, numbers and the punctuation signs ".", ","  and "-" will be removed.
* **Add student name**: If selected (default) the downloaded files will be in the format "\<prefix>\_\<surname>\_\<name>\_\<student_id>\.pdf" (or "\<surname>\_\<name>\_\<student_id>\.pdf" if no prefix is specified). If not selected the downloaded files will be in the format "\<prefix>\_\<student_id>\.pdf" (or "\<student_id>\.pdf" if no prefix is specified).
* **Start download**: Dowloads the submissions from all students in the specified range whom have submitted AT LEAST ONE file. Submissions are stored following the specified naming convention. A progressbar will appear on screen showing the download progress.
* **Help**: Shows a pop up with minimal instructions on how to use the bulk download function of opal-bulk-marking.
* **Back**: Goes back to the [main page](#subsec_main).


**NOTE**: Before starting the download opal-bulk-marking will let you know if any of the submissions you are intending to download have already beenmarked and give you the option of not downloading those.

**NOTE**: In the case of a student submitting multiple files opal-bulk-marking will download all of them and add the suffix "\_submission\_\<submission_number>".

**IMPORTANT**: Before starting the download make sure your Firefox browser is configured as described in Section [Configuration](#sec_configuration).

<a id="subsec_upload"></a>
### Bulk upload
If you press on the 'Upload marking' button appearing in the [main page](#subsec_main) opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and change the showed buttons to the ones appearing in the image below.

![upload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/upload.png?raw=true)

These buttons and selectables have the following functions:

* **selectable**: Allows you to select all marked submissions that you wish to upload to Opal. These submissions should be named as '\<arbitrary_text>\_\<student_id>\_\<grade>.pdf'. Notice how file names following this conventions can be obtained by adding the suffix '\_\<grade>' at the end of the files downloaded using the [bulk download function](#subsec_download). Here '\<grade>' represents the grade assigned to the submission and can be written using either of the following 2 conventions:
    * *\<integer>*: A positive integer representing the grade. For example the grade '7.0' would be written simply as '7' using this convention.
    * *\<integer>.\<decimals>*: A positive integer representing the integer part of a number followed by a dot followed by a positive integer representing the decimal part of a number. For example the grade '7.4' can be written as '7.4' using this convention.
* **Start upload**: Starts the uploading of all selected files. More precisely opal-bulk-marking will use the name of each of the selected files in order to obtain a grade and a student. It will then look for that student in the list of all available students and upload the marked submission (renamed to 'korrektur.pdf') to its page. While doing so it will also store in the student's page the grade associated to this submission. Before starting the upload process opal-bulk-marking will show you a pop-up listing any error it might encounter (i.e. unrecognized naming conventions or non found students) and showing you the list of all students and grades that it successfully identified. The upload process will start only after you confirm the showed grades are the ones you want to upload.
Furthermore opal-bulk-marking will detect the students whom have already been graded (if any) and ask you if you wish to replace their grade with the new one. In case of a positive answer IT WILL REMOVE all previous uploaded files and replace them with the new one.
A progressbar will appear on screen showing the upload progress.
* **Help**: Shows a pop up with minimal instructions on how to use the bulk upload function of opal-bulk-marking.
* **Back**: Goes back to the [main page](#subsec_main).


**NOTE**: In the case of attempting to upload muliple files associated to the same student opal-bulk-marking will detect the error and halt the uploadprocess.

<a id="subsec_statistics"></a>
### Bulk statistics
If you press on the 'Statistics' button appearing in the [main page](#subsec_main) opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and show a pop up like the one appearing in the image below.

![statistics](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/statistics.png?raw=true)

This popup contains the following information:

* **Histogram** showing the grade distribution. This histogram (generated using [Plotly](https://github.com/plotly/plotly.js#readme)) groups together all grades in the interval [n,n+1) for n=0,...,10.
* **Average grade** wich is accompanied with its standard deviation.
* **Submission percentage**. That is the portion (as a fraction and as percentage) of enrolled students that have submitted a solution.
* **Graded percentage**. That is the portion (as a fraction and as percentage) of submitted solutions that have been examined, graded and upload to opal.


## Requirements
* Firefox browser.
* Access to an [opal page from a university in Saxony](https://bildungsportal.sachsen.de/opal/).


<a id="sec_installation"></a>
## Installation
In order to install the latest version of opal-bulk-marking you need to:
* Open your firefox browser.
* Browse to the opal-bulk-marking [webpage](https://addons.mozilla.org/de/firefox/addon/opal-bulk-marking/).
* Press on the 'add to firefox' button.
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