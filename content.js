function GetAPIVersionInScript(webScript)
{
    //Find the api version variable in the web's script and exclude the value
    var verIndex = webScript.indexOf(`"api-version"`); //Gives the index of the beginning of the substring
    verIndex += `"api-version"`.length
    while (webScript[verIndex] != '"') { //proceed to the variable's value
        verIndex++;
    }
    verIndex++; //skip the value's first (")

    //We're in the api version string(value)
    apiVersion = '';
    while (webScript[verIndex] != '"') {
        apiVersion += webScript[verIndex];
        verIndex++;
    }
}

function readTextFile(file) //Gets the script's body
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                GetAPIVersionInScript(allText);
            }
        }
    }
    rawFile.send(null);
}

function GetWebScript()
{
    for (let index = 0; index < document.scripts.length; index++) {
        const element = document.scripts[index];

        if(!element.src.includes("https://pony.town/assets/scripts/")) //If not the ponytown script then continue
            continue;

        return element;
    }
}

var apiVersion;
readTextFile(GetWebScript().src); //Fills the apiVersion variable

function copyStringToClipboard (str) {
    // Create new element
    var el = document.createElement('textarea');
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute('readonly', '');
    el.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand('copy');
    // Remove temporary element
    document.body.removeChild(el);
 }

function PostPony(accountId, ponyName, ponyInfo) //MAKE THIS FUNCTION ASYNC(future tasks, not a must)
{
    //Automatically includes cookies
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://pony.town/api/pony/save", true);

    console.log(`API VERSION: ${apiVersion}`)
    xhr.setRequestHeader('api-version', apiVersion); //Used to be 'EQnjieBaSd' during version 0.1 of this extension
    xhr.setRequestHeader('Content-Type', 'application/json'); //IMPORTANT, MADE ME SPENT HOUR OR TWO AAAHHHHH

    var body = {
        "accountId": accountId,
        "pony": {
            "id": "611055c4573f39be2210a450",
            "name": ponyName,
            "desc": "Pony Importer",
            "tag": 0,
            "info": ponyInfo
        }
    }
    xhr.onload = function () {
        const result = xhr.status;
        if(result == 200)//Success
        {
            alert(`${ponyName} was imported to your account`);
            location.reload(); //Refresh page
        }
        else //Failed to save pony
        {
            alert(`Failed to import pony \n ${xhr.responseText}`);
            return;
        }
      };

    xhr.send(JSON.stringify(body));
}

//Pony Webrequests manager
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse)
{
    const reason = message.reason;

    const ponyName = message.name;
    const ponyInfo = message.info;
    switch (reason) {
        case "Import":
            const accountId = window.localStorage.getItem("accountId");
            PostPony(accountId, ponyName, ponyInfo);
            break;

        case "Export":
            copyStringToClipboard(ponyInfo);
            alert(`${ponyName}'s info was copied to clipboard.\n`);
             break;
    
        default:
            alert("Received a message with an unimplemented handle");
            break;
    }
});