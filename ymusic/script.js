(function() {
    const body = document.querySelector('body');
    const background = document.createElement('div');
    const backFront = document.createElement('div');
    const html = document.querySelector('html');

    background.classList.add('my_background');
    body.appendChild(background);
    backFront.classList.add('my_background_front');
    body.appendChild(backFront);

    let data = {
        active: false,
        image: null,
        imageIndex: 1,
        brightness: 0,
        host: location.host
    }

    chrome.runtime.sendMessage({ action: 'tabInit', host: location.host });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'tabRedraw')
        {
            applyData(request.data);
        }
        else if (request.action === 'tabGetData')
        {
            sendResponse(data);
        }
    });

    function applyData(newData) {
        this.data = Object.assign(data, newData);

        background.style.backgroundImage = 'url("' + this.data.image + '")';
        const darkness = 100 - data.brightness;
        backFront.style.opacity = (darkness / 100).toString();

        if (data.active) {
            html.classList.add('customizerActive');
        } else {
            html.classList.remove('customizerActive');
        }
    }
})();
