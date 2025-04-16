# OPAL BULK MARKING (beta)

'opal bullk marking' is an add-on developed by Marco Praderio with the goal of simplifying the download and upload parts of the marking processes of submissions made via opal.

## Disclaimer
The add-on is stil on the early stages of development and due to lack of access to parts of the opal source code the developer can ensure its functionality only in the context of the TU Dresden opal page. It might however work also in other contexts and the developer would welcome feedback from anyone who attempts to use it like that.

The add-on is designed to work on a firefox browser and the developer cannot guarantee it's functioning on any other browser.

## Instructions
For information on how to install 'opal bulk marking' see Section *[Installation](#sec_installation)*. See also Section *[Configuration](#sec_configuration)* for instructions on how to set up your firefox browser in order for the bulk download to work properly.
Once installed opal-bulk-marking will make no modifications on your browser until you enter the opal page where submissions for a given assessment are listed. In what follows we will refer to this page simply as the *assessment page* and we will refer to the table appearing in the assessment page simply as *assessment table*.

<a id="subsec_main"></a>
### Assessment page
Once you enter the assessment page opal-bulk-marking will modify it so that three new buttons with the texts 'Download submissions', 'Upload marking' and 'help' appear right above the assessment table.

![main](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/main.png?raw=true)

The 'help' button will show a pop-up with instructions on how to use opal-bulk-marking. See below for information on the functions provided by the Subsections [Bulk download](#subsec_download) and [Bulk upload](#subsec_upload)

**IMPORTANT**: In order for the buttons to appear it is necessary for the columns 'Last name', 'First name', 'Institution identifier' and 'Number of files' to be visible in the assessment table.

**IMPORTANT**: If the opal page is set in german then opal-bulk-marking will detect this and adapt the language to german. However there is currently no support for any other language.

<a id="subsec_download"></a>
### Bulk download
If you press on the 'Download submissions' button opal-bulk-marking will proceed to modifying the assessment table so that all students are visible and change the showed buttons will change and appear in the image

![dowload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/download.png?raw=true)

Below is a description of each of the opal-bulk-marking buttons and dropdowns appearing in the above image.
* **Back**: Goes back to the configration of buttons described in Section [Assessment page](#subsec_main).
* **help**: Shows a pop up with instructions on how to use the bulk download function of opal-bulk-marking.
* **Start download**: Dowloads all available submissions from all students with EXACTLY one submission in the selected range and names them after the specified name format.
* **name submission as**: Allows you to specify how you want the download submission to be named. There are two possible naming formats:
    * *\<student_id>.pdf*: The downloaded submissions will be named after the student id.
    * *\<surname_name>.pdf*: The downloaded submissions will be named after the name and surname of the student.
* **first student**: Allows you to select the first student of the range of students whose submissions you wish to download. If left blank the first available student will be selected automatically. Notice how only students with exactly one submission appear in the dropdown.
* **last student**: Allows you to select the last student of the range of students whose submissions you wish to download. If left blank the last available student will be selected automatically. Notice how only students with exactly one submission appear in the dropdown.


**IMPORTANT**: Before starting the download of submissions make sure your firefox browser is configured as described in Section [Configuration](#sec_configuration).

**IMPORTANT**: It is convenient to use this method for downloading submissions in order to be able to later use the bulk upload feature of opal-bulk-marking.

<a id="subsec_upload"></a>
### Bulk upload
**More information to appear shortly.**
![upload](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/upload.png?raw=true)

## Requirements
* a Firefox browser.
* access to an [opal](https://bildungsportal.sachsen.de/opal/home?7) page.


<a id="sec_installation"></a>
## Installation
In order to install the latest version of 'opal-bulk-marking' you need to:
* Download the [opal-bulk-marking.xpi](https://github.com/PraderioM/opal-bulk-marking/raw/refs/heads/main/opal-bulk-marking.xpi) file that can be found in this same page.
* Right click on the downloaded file and press on the option 'open with Firefox'.
* Your Firefox browser will open with a pop-up asking if you wish to add the 'opal-bulk-marking' extension to Firefox.
* Press on 'add'.
* A pop-up will show up confirming correct installing of the add-on.

<a id="sec_configuration"></a>
## Configuration
The default settings of your Firefox browser might lead to a new page opening up on firefox for every downloaded submission.
This might be quite annoying and might interfere with the corect functioning of 'opal-bulk-marking' add on.
In order order to fix this go to the *[preferences](about:preferences)* page of your Firefox browser. Under the *General* tab scroll down untill you arrive to the *Files and Applications* section and deselect the *Always ask you where to save files* checkbox.
Make also sure that the *action* associated to PDF files is set to 'Save File'.

For guidance the image below shows an example of a correct configuration.

![main](https://github.com/PraderioM/opal-bulk-marking/blob/main/images/settings.png?raw=true)

## Maintainers
* [Marco Praderio Bova](https://marcopraderiobova.com/)