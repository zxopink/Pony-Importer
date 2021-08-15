function SavePony(e)
{
    const form = document.getElementById("form")

    var accountId;
    var cookies;
    const ponyName = form.elements["pname"].value;
    const ponyinfo = form.elements["pinfo"].value;

    chrome.tabs.query({}, //Iterate through all tabs
        function(tabs){
            var ponyPage;

            for (let index = 0; index < tabs.length; index++) {
                const tab = tabs[index];
                if(tab.title == "Pony Town")
                    ponyPage = tab;
            }

            if(!ponyPage)
            {
                alert("Could not find Pony Town open");
                return;
            }

            chrome.tabs.sendMessage(ponyPage.id, {reason: "Import", name: ponyName, info: ponyinfo});
        });
}

//On page load
document.addEventListener('DOMContentLoaded', function(){ 
    document.getElementById('button').onclick = SavePony;
});