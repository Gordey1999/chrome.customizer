(function() {

    class Slider {
        constructor(element) {
            this.el = element;
            this.input = element.querySelector('input')
            this.backEl = element.querySelector('.slider_back');
            this.frontEl = element.querySelector('.slider_front');
            this.frontInnerEl = element.querySelector('.slider_front-inner');
            this.moveArea = element.querySelector('.slider_area');

            this.maxValue = this.input.dataset.max;
            this.step = this.input.dataset.step;

            this.frontInnerEl.style.width = this.backEl.offsetWidth + 'px';

            this.render();

            this.active = false;
            this.currentValue = 0;

            this.bind();
        }

        bind() {
            this.moveArea.addEventListener('mousedown', this.onMousedown.bind(this));
            this.moveArea.addEventListener('mousemove', this.onMousemove.bind(this));
            this.moveArea.addEventListener('mouseout', this.onMouseout.bind(this));

            this.input.addEventListener('input', this.onInput.bind(this));

            document.addEventListener('mouseup', this.onDocumentMouseup.bind(this));
        }

        onMousedown(e) {
            this.active = true;
        }

        onMousemove(e) {
            if (!this.active)
                return;

            let offset = e.offsetX < 0 ? 0 : e.offsetX;
            let valueFloat = offset / this.moveArea.offsetWidth;

            let value = Math.round(valueFloat * this.maxValue / this.step) * this.step;

            this.setValue(value);
        }
        onMouseout(e) {
            if (!this.active)
                return;

            if (e.offsetX <= 0)
                this.setValue(0);
            else if (e.offsetX >= this.moveArea.offsetWidth)
                this.setValue(this.maxValue);
        }

        onDocumentMouseup(e) {
            if (!this.active)
                return;

            this.setValue(this.currentValue);
            this.active = false;
        }
        onInput(e) {
            this.render();
        }

        render() {
            const value = this.input.value;
            this.currentValue = value;
            this.backEl.innerHTML = value;
            this.frontInnerEl.innerHTML = value;

            this.frontEl.style.width = value / this.maxValue * 100 + '%';
        }
        setValue(value) {
            const changed = parseInt(this.input.value) !== value;
            this.input.value = value;

            if (changed)
                triggerEvent(this.input, 'input');
        }
    }

    class Select {
        constructor(element) {
            this.el = element;
            this.input = element.querySelector('input')
            this.minus = element.querySelector('.select_minus');
            this.plus = element.querySelector('.select_plus');
            this.text = element.querySelector('.select_text');

            this.render();

            this.bind();
        }

        bind() {
            this.minus.addEventListener('click', this.onMinusClick.bind(this));
            this.plus.addEventListener('click', this.onPlusClick.bind(this));

            this.input.addEventListener('input', this.onInput.bind(this));
        }

        onMinusClick(e) {
            this.setValue(parseInt(this.input.value) - 1);
        }
        onPlusClick(e) {
            this.setValue(parseInt(this.input.value) + 1);
        }
        onInput(e) {
            this.render();
        }

        render() {
            this.text.innerHTML = this.input.value;
        }
        setValue(value) {
            if (value < 1)
                value = this.input.dataset.max;
            else if (value > this.input.dataset.max)
                value = 1;

            const changed = parseInt(this.input.value) !== value;
            this.input.value = value;

            if (changed)
                triggerEvent(this.input, 'input');
        }
    }

    class Checkbox {
        constructor(element) {
            this.el = element;
            this.input = element.querySelector('input')

            this.render();
            this.bind();
        }

        bind() {
            this.el.addEventListener('click', this.onClick.bind(this));
            this.input.addEventListener('input', this.onInput.bind(this));
        }

        onClick(e) {
            this.setValue(!this.input.value);
        }
        onInput(e) {
            this.render();
        }

        render() {
            if (this.input.value) {
                this.el.innerHTML = this.input.dataset.on;
                this.el.classList.add('active');
            } else {
                this.el.innerHTML = this.input.dataset.off;
                this.el.classList.remove('active');
            }
        }
        setValue(value) {
            const changed = Boolean(this.input.value) !== value;
            this.input.value = value ? 1 : '';
            if (changed)
                triggerEvent(this.input, 'input');
        }
    }

    document.querySelectorAll('.js-select').forEach(function(el) {
        new Select(el);
    });
    document.querySelectorAll('.js-slider').forEach(function(el) {
        new Slider(el);
    });
    document.querySelectorAll('.js-checkbox').forEach(function(el) {
        new Checkbox(el);
    });

})();

function triggerEvent(element, eventName) {
    const event = new Event(eventName, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
}

function setTheme(color, brightness) {
    const hsl = 'hsl(' + color + ', 100%, ' + brightness + '%)';

    document.querySelector('body').style.setProperty('--color-main', hsl);
}
