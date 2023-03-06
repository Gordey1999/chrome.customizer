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
            this.text = element.querySelector('.button-text');

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
                this.text.innerHTML = this.input.dataset.on;
                this.el.classList.add('active');
            } else {
                this.text.innerHTML = this.input.dataset.off;
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


    class Glitch {

        constructor(element) {
            this.el = element;
            this.container = element.parentNode;
            this.glitch = null;
            this.step = 0;
            this.delay = 0;

            this.bind();
            this.repeat();
        }

        bind() {
            this.el.addEventListener('mousedown', this.onMousedown.bind(this));

            this.el.querySelectorAll('input').forEach(() => {
                addEventListener('input', this.onInput.bind(this))
            })
        }

        onMousedown(e) {
            if (Math.random() < 0.5)
                setTimeout(this.create.bind(this), this.rand(this.delay), true);
        }

        onInput(e) {
            if (Math.random() < 0.01)
                setTimeout(this.create.bind(this), this.rand(this.delay), true);
        }

        create(short) {
            if (this.glitch) return;

            this.glitch = this.el.cloneNode(true);
            this.glitch.classList.add('glitch');
            this.step = 1;
            this.container.append(this.glitch);
            this.delay = 100;
            this.short = short;
            this.move();
        }

        repeat() {
            this.create();
            setTimeout(this.repeat.bind(this), this.rand(20000));
        }

        move() {
            const distance = this.step * 2;

            this.glitch.style.top = this.rand(distance * 2) - distance + 'px';
            this.glitch.style.left = this.rand(distance * 2) - distance + 'px';

            this.step++;

            const v = this.short ? 0.3 : 0.1;

            const again = Math.random() > (v * this.step);
            if (again)
                setTimeout(this.move.bind(this), this.rand(this.delay));
            else
                setTimeout(this.stop.bind(this), this.rand(this.delay * this.step));
        }

        rand(max) {
            return Math.floor(Math.random() * max);
        }

        stop() {
            this.glitch.remove();
            this.glitch = null;
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

    window.triggerEvent = function(element, eventName) {
        const event = new Event(eventName, { bubbles: true, cancelable: true });
        element.dispatchEvent(event);
    }

    let glitchObj = null;
    window.setTheme = function(color, brightness, glitch) {
        const hsl = 'hsl(' + color + ', 100%, ' + brightness + '%)';
        if (glitch && !glitchObj) {

            document.querySelectorAll('.js-glitch').forEach(function(el) {
                glitchObj = new Glitch(el);
            });
        }

        document.querySelector('body').style.setProperty('--color-main', hsl);
    }

})();
