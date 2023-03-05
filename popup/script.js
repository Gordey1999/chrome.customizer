
(function() {
    const btnRun = document.querySelector('.js-button-run');
    const btnRunDefault = document.querySelector('.js-button-run-default')
    const inputBrightness = document.querySelector('.js-brightness');
    const inputImage = document.querySelector('.js-select-image');

    let tabData = {
        active: false,
        image: null,
        imageIndex: 1,
        brightness: 0
    }

    chrome.runtime.sendMessage({ action: 'customizerInitPopup' }, function(response) {

        setTheme(response.settings.theme, response.settings.themeBright);

        if (response?.settings?.runDefault)
        {
            btnRunDefault.classList.add('active');
            btnRunDefault.innerHTML = btnRun.dataset.on;
        }

        tabData = Object.assign(tabData, response.tabData ?? {});

        if (tabData.active)
        {
            btnRun.classList.add('active');
            btnRun.innerHTML = btnRun.dataset.on;
        }
        inputBrightness.value = tabData.brightness;
        inputImage.value = tabData.imageIndex;
        inputImage.dataset.max = tabData.imagesCount;

        triggerEvent(inputBrightness, 'input');
        triggerEvent(inputImage, 'input');
    });



    btnRun.addEventListener('click', function (e) {
        tabData.active = toggleButton(this);
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


    btnRunDefault.addEventListener('click', function (e) {
        let active = toggleButton(this);

        const message = {
            action: "customizerSaveSettings",
            settings: {
                runDefault: active
            }
        };
        chrome.runtime.sendMessage(message);
    });

    function toggleButton(button) {
        button.classList.toggle('active');

        const active = button.classList.contains('active');

        if (active) {
            button.innerHTML = button.dataset.on;
        } else {
            button.innerHTML = button.dataset.off;
        }

        return active;
    }

    function queryRedrawTab() {
        const message = {
            action: "customizerPopupApply",
            tabData: tabData
        };
        chrome.runtime.sendMessage(message, function(response) {});
    }
})();





