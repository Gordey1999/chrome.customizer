(function() {

    let settings = {
        runDefault: {}, // for each site
        imageNumber: 1,
        brightness: {}, // for each image
        theme: 170,
        themeBright: 50,
        glitch: true
    };

    const defaultSettings = {
        runDefault: false,
        brightness : 50
    }

    /* save images in images/ and name them like 1.png, 2.png ... [imagesCount].png. Only png)) */
    const imagesCount = 85;

    function querySettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(Object.keys(settings)).then((result) => {
                settings = Object.assign(settings, result);
                resolve(settings);
            }).catch(reason => reject(reason));
        });
    }



    function queryTabData() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
                const currentTabId = tabs[0].id;

                chrome.tabs.sendMessage(currentTabId, {action: 'tabGetData'}, response => {
                    if (chrome.runtime.lastError)
                        reject('error');

                    resolve(response);
                });
            });
        })
    }

    function sendTabData(data) {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
                const currentTabId = tabs[0].id;

                chrome.tabs.sendMessage(currentTabId, { action: 'tabRedraw', data: data });
                resolve();
            });
        })
    }

    function getImage(index) {
        return chrome.runtime.getURL("images/" + index + ".png");
    }



    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if (request.action === 'tabInit')
        {
            const imageNumber = Math.floor(Math.random() * imagesCount) + 1;

            querySettings().then(settings => {
                const data = {
                    image: getImage(imageNumber),
                    imageIndex: imageNumber,
                    active: settings.runDefault[request.host] ?? defaultSettings.runDefault,
                    brightness: settings.brightness[imageNumber] ?? defaultSettings.brightness,
                }

                sendTabData(data);
            })
        }
        else if (request.action === 'popupInit')
        {
            querySettings().then(settings => {
                queryTabData().then(tabData => {

                    chrome.runtime.sendMessage({
                        action: 'popupSetData',
                        settings: settings,
                        defaultSettings: defaultSettings,
                        tabData: tabData,
                        imagesCount: imagesCount
                    });
                })
            })
        }
        else if (request.action === 'saveSettings')
        {
            chrome.storage.local.set(request.settings);
        }
        else if (request.action === 'popupApply')
        {
            request.tabData.image = getImage(request.tabData.imageIndex);
            sendTabData(request.tabData);
        }
        else if (request.action === 'newTabInit')
        {
            querySettings().then(settings => {
                chrome.runtime.sendMessage({
                    action: 'newTabSetData',
                    settings: settings,
                });
            })
        }
    });

})();



