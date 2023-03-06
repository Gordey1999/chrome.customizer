
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

    chrome.runtime.sendMessage({ action: 'customizerInitPopup' }, function(response) {

        setTheme(response.settings.theme, response.settings.themeBright, response.settings.glitch);

        if (response?.settings?.runDefault)
        {
            checkboxRunDefault.value = 1;
            triggerEvent(checkboxRunDefault, 'input');
        }

        tabData = Object.assign(tabData, response.tabData ?? {});

        if (tabData.active)
        {
            checkboxRun.value = 1;
            triggerEvent(checkboxRun, 'input');
        }
        inputBrightness.value = tabData.brightness;
        inputImage.value = tabData.imageIndex;
        inputImage.dataset.max = tabData.imagesCount;

        triggerEvent(inputBrightness, 'input');
        triggerEvent(inputImage, 'input');
    });



    checkboxRun.addEventListener('input', function (e) {
        tabData.active = Boolean(this.value);
        queryRedrawTab();
    });

    inputBrightness.addEventListener('input', function (e) {
        tabData.brightness = parseInt(inputBrightness.value);
        queryRedrawTab();
    });

    inputImage.addEventListener('input', function (e) {
        tabData.imageIndex = parseInt(inputImage.value);
        queryRedrawTab();
    });


    checkboxRunDefault.addEventListener('input', function (e) {
        let active = Boolean(this.value);

        const message = {
            action: "customizerSaveSettings",
            settings: {
                runDefault: active
            }
        };
        chrome.runtime.sendMessage(message);
    });

    function queryRedrawTab() {
        const message = {
            action: "customizerPopupApply",
            tabData: tabData
        };
        chrome.runtime.sendMessage(message, function(response) {});
    }
})();





