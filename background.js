(function() {

    let settings = {
        runDefault: true,
        imageNumber: 1,
        brightness: 50,
        theme: 170,
        themeBright: 50,
        glitch: true
    };

    /* save images in images/ and name them like 1.png, 2.png ... [imagesCount].png. Only png)) */
    const imagesCount = 64;
    console.log(imagesCount);

    chrome.storage.local.get(Object.keys(settings)).then((result) => {
        settings = Object.assign(settings, result);
    });

    /* current Tab */
    let currentTabId = null;
    let currentTabData = null;

    chrome.tabs.onActivated.addListener(function(activeInfo) {
        currentTabId = activeInfo.tabId;
        queryTabData();
    });



    function queryTabData() {
        chrome.tabs.sendMessage(currentTabId, { action: 'customizerTabGetState' }, function(response) {
            const error = chrome.runtime.lastError;
            if (error) {
                currentTabData = null;
                return;
            }
            currentTabData = response;
        });
    }



    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if (request.action === 'customizerInitTab')
        {
            const imageNumber = Math.floor(Math.random() * imagesCount) + 1;

            const data = {
                image: getImage(imageNumber),
                imageIndex: imageNumber,
                imagesCount: imagesCount,
                active: settings.runDefault,
                brightness: settings.brightness
            }

            if (sender?.tab?.id === currentTabId)
                currentTabData = data;

            sendResponse(data);
        }
        else if (request.action === 'customizerInitPopup')
        {
            sendResponse({
                settings: settings,
                tabData: currentTabData
            });
        }
        else if (request.action === 'customizerSaveSettings')
        {
            settings = Object.assign(settings, request.settings)
            chrome.storage.local.set(request.settings);
        }
        else if (request.action === 'customizerPopupApply')
        {
            if (currentTabId && currentTabData)
            {
                currentTabData = request.tabData;
                currentTabData.image = getImage(currentTabData.imageIndex);
                chrome.tabs.sendMessage(currentTabId, { action: 'customizerTabRedraw', data: request.tabData });
            }
        }
        else if (request.action === 'customizerInitNewTab')
        {
            sendResponse({
                settings: settings,
            });
        }
    });

    function getImage(index) {
        return chrome.runtime.getURL("images/" + index + ".png");
    }
})();



