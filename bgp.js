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

  chrome.webRequest.onBeforeRequest.addListener(
    function(object) {
        if(object.method == "POST" &&
        object.initiator == "https://pony.town")
        {
            if(object.url != "https://pony.town/api/pony/save")
                return;

            var postedString = decodeURIComponent(String.fromCharCode.apply(null,
                new Uint8Array(object.requestBody.raw[0].bytes)));
            
            const saveInfo = JSON.parse(postedString);

            if(!saveInfo.accountName)
                return; //Extension made request, only the web includes the account's name(The extension doesn't, it doesn't affect anything)

            var ponyName = saveInfo.pony.name;
            var ponyInfo = saveInfo.pony.info;

            chrome.tabs.sendMessage(object.tabId, {reason: "Export", name: ponyName, info: ponyInfo});
        }
    },
    {urls: ["https://pony.town/*"]}, ['requestBody']
  );

  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(object) {
        if(object.method == "POST" &&
        object.initiator == "https://pony.town")
        {
            if(object.url != "https://pony.town/api/pony/save")
                return;

            var apiVer;
            var apiBid;

            const headers = object.requestHeaders;
            for (let index = 0; index < headers.length; index++) {
                const header = headers[index];
                
                if(header.name == "api-version")
                    apiVer = header.value;
                
                if(header.name == "api-bid")
                    apiBid = header.value;
            }

            chrome.tabs.sendMessage(object.tabId, {reason: "APIVerion", value: apiVer, bid: apiBid});
        }
    },
    {urls: ["https://pony.town/*"]}, ['requestHeaders']
  );