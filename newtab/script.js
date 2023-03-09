
(function() {

    const body = document.querySelector('body');
    const inputTheme = body.querySelector('.js-colorscheme');
    const inputThemeBright = body.querySelector('.js-colorscheme-bright');
    const checkboxGlitch = body.querySelector('.js-checkbox-glitch');

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
    checkboxGlitch.addEventListener('input', function() {
        settings.glitch = checkboxGlitch.value;
        updateTheme();
    });

    function updateTheme() {
        setTheme(settings.theme, settings.themeBright, settings.glitch);

        chrome.runtime.sendMessage({ action: 'customizerSaveSettings', settings: settings });
    }

    chrome.runtime.sendMessage({ action: 'customizerInitNewTab' }, function(response) {
        inputTheme.value = response.settings.theme;
        inputThemeBright.value = response.settings.themeBright;
        checkboxGlitch.value = response.settings.glitch;

        triggerEvent(inputTheme, 'input');
        triggerEvent(inputThemeBright, 'input');
        triggerEvent(checkboxGlitch, 'input');
    });

})();


(function() {
	const classCell = 'snake_cell';
	const classTail = 'snake_tail';
	const classMeal = 'snake_meal';
	const delay = 100;
	class SnakeGame
	{
		constructor(element) {
			this.el = element;
			this.container = element.parentNode;

			this.init();
			this.bind();

			this.newGame();
		}

		init()
		{
			const cell = document.createElement('div');
			cell.classList.add(classCell);
			this.el.append(cell);

			const cw = cell.offsetWidth;
			const ch = cell.offsetHeight;
			cell.remove();

			const w = Math.floor(this.container.offsetWidth / cw);
			const h = Math.floor(this.container.offsetHeight / ch);

			this.el.style.width = w * cw + 'px';
			this.el.style.height = h * ch + 'px';
			//this.el.style.marginTop = (this.container.offsetWidth % cw) / 2 + 'px';
			//this.el.style.marginLeft = (this.container.offsetHeight % ch) / 2 + 'px';

			this.field = {
				width: w,
				height: h,
				px:
					{
						cellWidth: cw,
						cellHeight: ch
					}
			};
		}

		bind() {
			document.addEventListener('keydown', this.onKeydown.bind(this));
		}

		onKeydown(e) {
			const oldAuto = this.auto;

			switch (e.code) {
				case 'KeyA':
					if (this.direction === 'right') break;
					this.newDir = 'left';
					this.auto = false;
					break;
				case 'KeyW':
					if (this.direction === 'down') break;
					this.newDir = 'up';
					this.auto = false;
					break;
				case 'KeyD':
					if (this.direction === 'left') break;
					this.newDir = 'right';
					this.auto = false;
					break;
				case 'KeyS':
					if (this.direction === 'up') break;
					this.newDir = 'down';
					this.auto = false;
					break;
			}

			if (this.auto !== oldAuto && this.auto === false)
				this.el.classList.add('active');
		}

		newGame() {
			const cx = Math.floor(this.field.width / 2);
			const cy = Math.floor(this.field.height / 2);
			this.tail = [];
			this.map = [];
			for (let i = 0; i < this.field.width; i++)
				this.map.push(new Array(this.field.height).fill(null));

			for (let i = 0; i < 3; i++) {
				this.tail.push(new SnakeTail(this, cx, cy + i));
				//this.map[cx][cy + i] = true;
			}

			this.el.classList.remove('active');
			this.auto = true;

			this.meal = [];
			for (let i = 0; i < 3; i++) {
				const mealPos = this.getNewMealPosition();
				this.meal.push(new SnakeMeal(this, mealPos.x, mealPos.y));
			}

			this.direction = 'up';
			this.newDir = 'up';

			this.timer = setInterval(this.cycle.bind(this), delay);
		}

		cycle() {
			if (this.auto)
				this.autoStep();

			this.direction = this.newDir ?? this.direction;
			const head = this.tail[0];
			const tail = this.tail.pop();

			//this.map[tail.x][tail.y] = null;

			let newX = head.x, newY = head.y;
			switch(this.direction) {
				case 'up': newY -= 1; break;
				case 'down': newY += 1; break;
				case 'left': newX -= 1; break;
				case 'right': newX += 1; break;
			}

			if (!this.checkAlive(newX, newY)) {
				this.stop();
				return;
			}

			const newHead = tail;

			if (this.map[newX][newY] instanceof SnakeMeal) {
				const mealPos = this.getNewMealPosition();
				this.map[newX][newY].setPosition(mealPos.x, mealPos.y);
				this.tail.push(new SnakeTail(this, tail.x, tail.y));
			}
			newHead.setPosition(newX, newY);

			this.tail.unshift(newHead);
		}

		checkAlive(x, y) {
			if (x < 0 || x >= this.field.width || y < 0 || y >= this.field.height) {
				return false;
			}
			if (this.map[x][y] instanceof SnakeTail) {
				return false;
			}

			return true;
		}

		stop() {
			clearInterval(this.timer);
			window.triggerGlitch();
			setTimeout(this.clear.bind(this), 1000);
		}
		clear() {
			//this.tail.forEach(element => element.remove());
			this.map.forEach(row => row.forEach(el => el?.remove()));
			this.newGame();
		}

		getCellPosition(x, y) {
			return {
				x: x * this.field.px.cellWidth,
				y: y * this.field.px.cellHeight,
			}
		}

		getNewMealPosition() {
			while (true) {
				const mealX = Math.floor(Math.random() * this.field.width);
				const mealY = Math.floor(Math.random() * this.field.height);

				if (this.map[mealX][mealY] === null)
					return { x: mealX, y: mealY };
			}
		}

		autoStep() {
			const head = this.tail[0];

			let minX = 1000, minY = 1000;
			this.meal.forEach(meal => {
				const distX = meal.x - head.x;
				const distY = meal.y - head.y;
				if (Math.abs(distX) + Math.abs(distY) < Math.abs(minX) + Math.abs(minY)) {
					minX = distX;
					minY = distY;
				}
			});

			switch (this.direction) {
				case 'up':
					if (minY < 0)
						this.newDir = 'up';
					else if (minX < 0)
						this.newDir = 'left';
					else
						this.newDir = 'right';
					break;
				case 'down':
					if (minY > 0)
						this.newDir = 'down';
					else if (minX < 0)
						this.newDir = 'left';
					else
						this.newDir = 'right';
					break;
				case 'left':
					if (minX < 0)
						this.newDir = 'left';
					else if (minY < 0)
						this.newDir = 'up';
					else
						this.newDir = 'down';
					break;
				case 'right':
					if (minX > 0)
						this.newDir = 'right';
					else if (minY < 0)
						this.newDir = 'up';
					else
						this.newDir = 'down';
					break;
			}

			if (this.bodyForward(this.newDir) === 1) {
				this.newDir = 'up';
				let max = this.bodyForward('up');

				if (this.bodyForward('down') > max) {
					max = this.bodyForward('down');
					this.newDir = 'down';
				}
				if (this.bodyForward('left') > max) {
					max = this.bodyForward('left');
					this.newDir = 'left';
				}
				if (this.bodyForward('right') > max) {
					max = this.bodyForward('right');
					this.newDir = 'right';
				}
			}
		}

		bodyForward(direction) {
			const head = this.tail[0];

			switch (direction) {
				case 'up':
					for (let i = head.y - 1; i >= 0; i--)
						if (this.map[head.x][i] instanceof SnakeTail)
							return head.y - i;
					return head.y + 1;
				case 'down':
					for (let i = head.y + 1; i < this.field.height; i++)
						if (this.map[head.x][i] instanceof SnakeTail)
							return i - head.y;
					return this.field.height - head.y;
				case 'left':
					for (let i = head.x - 1; i >= 0; i--)
						if (this.map[i][head.y] instanceof SnakeTail)
							return head.x - i;
					return head.x + 1;
				case 'right':
					for (let i = head.x + 1; i < this.field.width; i++)
						if (this.map[i][head.y] instanceof SnakeTail)
							return i - head.x;
					return this.field.width - head.x;
			}
		}
	}




	class SnakeCell
	{
		constructor(game, x, y) {
			this.game = game;
			this.x = x;
			this.y = y;
			this.createCell();
		}

		createCell() {
			this.cell = document.createElement('div');
			this.cell.classList.add(classCell);
			this.setPosition(this.x, this.y);

			this.game.el.append(this.cell);
		}

		setPosition(x, y) {
			const pos = this.game.getCellPosition(x, y);
			this.cell.style.top = pos.y + 'px';
			this.cell.style.left = pos.x + 'px';

			this.game.map[this.x][this.y] = null;
			this.game.map[x][y]?.remove();
			this.game.map[x][y] = this;

			this.x = x;
			this.y = y;
		}

		remove() {
			this?.cell?.remove();
		}
	}

	class SnakeTail extends SnakeCell
	{
		constructor(game, x, y) {
			super(game, x, y);

			this.create();
		}

		create() {
			this.el = document.createElement('div');
			this.el.classList.add(classTail);

			this.cell.append(this.el);
		}
	}

	class SnakeMeal extends SnakeCell
	{
		constructor(game, x, y) {
			super(game, x, y);

			this.create();
		}

		create() {
			this.el = document.createElement('div');
			this.el.classList.add(classMeal);

			this.cell.append(this.el);
		}
	}

	new SnakeGame(document.querySelector('.snake'));

})();
