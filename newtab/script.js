
(function() {

    const body = document.querySelector('body');
    const inputTheme = body.querySelector('.js-colorscheme');
    const inputThemeBright = body.querySelector('.js-colorscheme-bright');

    let settings = {
        theme: 170,
        themeBright: 50
    }

    inputTheme.addEventListener('input', function() {
        settings.theme = inputTheme.value;
        updateTheme();
    });
    inputThemeBright.addEventListener('input', function() {
        settings.themeBright = inputThemeBright.value;
        updateTheme();
    });

    function updateTheme() {
        setTheme(settings.theme, settings.themeBright);

        chrome.runtime.sendMessage({ action: 'customizerSaveSettings', settings: settings });
    }

    chrome.runtime.sendMessage({ action: 'customizerInitNewTab' }, function(response) {
        inputTheme.value = response.settings.theme;
        inputThemeBright.value = response.settings.themeBright;

        triggerEvent(inputTheme, 'input');
        triggerEvent(inputThemeBright, 'input');
    });


})();
