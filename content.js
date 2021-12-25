//Makes the web's script post a request then `snatches`
//the script's API-Version value from the request's header in the background script (bgp.js)
//The API-Version variable is hidden inside the web's script
function MakePostRequest()
{
    const elements = document.getElementsByClassName("btn btn-lg btn-default ml-2");
    if(elements.length == 0)
    {
        setTimeout(MakePostRequest, 100); //Attempt to find button until you find anything
        return;
    }

    var saveBtn;
    for (let index = 0; index < elements.length; index++) {
        var element = elements[index];

        if(element.ariaLabel == "Save character" || element.innerHTML == "Save");
            saveBtn = element;
    }
    saveBtn.click(); //Save button, send a save request through the web's script to get the API-version header, nasty way but they always change the script
}
MakePostRequest();

//Will be filled later by the background script
var apiVersion;
var apiBid;

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
    if(!accountId)
    {
        alert("Please login first");
        return;
    }

    if(!apiVersion)
    {
        alert("Please open the edit tab");
        return;
    }

    //Automatically includes cookies
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://pony.town/api/pony/save", true);

    console.log(`API VERSION: ${apiVersion}`)
    xhr.setRequestHeader('api-version', apiVersion); //Used to be 'EQnjieBaSd' during version 0.1 of this extension, already changed by version 0.2
    xhr.setRequestHeader('api-bid', apiBid); //New variable, currently not required but don't take risk, future versions might need it
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

//The first export post request is made to catch the API-Version
//After that all post requests are user made
var firstExport = true; 

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
            //Extension made post request, to catch the API-Version
            if (firstExport) 
            {
                firstExport = !firstExport;
                return;
            }

            //User made post request
            copyStringToClipboard(ponyInfo);
            alert(`${ponyName}'s info was copied to clipboard.\n`);
             break;

        case "APIVerion":
            apiVersion = message.value;
            apiBid = message.bid;
            break;
    
        default:
            alert("Received a message with an unimplemented handle");
            break;
    }
});