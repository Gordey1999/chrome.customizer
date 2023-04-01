
(function() {
    const checkboxRun = document.querySelector('.js-check-run');
    const checkboxRunDefault = document.querySelector('.js-check-run-default')
    const inputBrightness = document.querySelector('.js-brightness');
    const inputImage = document.querySelector('.js-select-image');

    let tabData = {
        active: false,
        image: null,
        imageIndex: 1,
        brightness: 0
    }

    let settings = {
        runDefault: {},
        brightness: {}
    };
    let defaultSettings;

    chrome.runtime.sendMessage({ action: 'popupInit' });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'popupSetData')
        {
            tabData = Object.assign(tabData, request.tabData ?? {});
            settings = {
                runDefault: request.settings.runDefault,
                brightness: request.settings.brightness
            };
            defaultSettings = request.defaultSettings;


            setTheme(request.settings.theme, request.settings.themeBright, request.settings.glitch);

            const runDefault = settings.runDefault[tabData.host] ?? defaultSettings.runDefault;
            checkboxRunDefault.value = runDefault ? 1 : '';

            checkboxRun.value = tabData.active ? 1 : '';

            inputBrightness.value = settings.brightness[tabData.imageIndex] ?? defaultSettings.brightness;
            inputImage.value = tabData.imageIndex;
            inputImage.dataset.max = request.imagesCount;

            triggerEvent(checkboxRunDefault, 'input');
            triggerEvent(inputBrightness, 'input');
            triggerEvent(inputImage, 'input');
            triggerEvent(checkboxRun, 'input');

            triggerGlitch();
        }
    });



    checkboxRun.addEventListener('input', function (e) {
        tabData.active = Boolean(this.value);
        queryRedrawTab();
    });

    inputBrightness.addEventListener('input', function (e) {
        tabData.brightness = parseInt(inputBrightness.value);
        settings.brightness[tabData.imageIndex] = inputBrightness.value;

        queryRedrawTab();
        querySaveSettings();
    });

    inputImage.addEventListener('input', function (e) {
        tabData.imageIndex = parseInt(inputImage.value);
        inputBrightness.value = settings.brightness[tabData.imageIndex] ?? defaultSettings.brightness;
        triggerEvent(inputBrightness, 'input');
    });


    checkboxRunDefault.addEventListener('input', function (e) {
        let active = Boolean(this.value);
        settings.runDefault[tabData.host] = active;

        querySaveSettings();
    });

    function queryRedrawTab() {
        chrome.runtime.sendMessage({
            action: "popupApply",
            tabData: tabData
        });
    }

    function querySaveSettings() {
        chrome.runtime.sendMessage({
            action: "saveSettings",
            settings: settings
        });
    }
})();





