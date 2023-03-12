
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
			this.pause = false;

			this.el.style.width = w * cw + 'px';
			this.el.style.height = h * ch + 'px';
			//this.el.style.marginTop = (this.container.offsetWidth % cw) / 2 + 'px';
			//this.el.style.marginLeft = (this.container.offsetHeight % ch) / 2 + 'px';

			this.delay = 50;

			this.field = {
				width: w,
				height: h,
				px:
					{
						cellWidth: cw,
						cellHeight: ch
					}
			};

			this.inputScore = document.querySelector('.js-snake-score');
			this.inputBest = document.querySelector('.js-snake-best');
			this.inputBestAi = document.querySelector('.js-snake-best-ai');

			this.ai = new SnakeAI(this);
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
				case 'Space':
					this.pause = !this.pause;
					break;
				case 'Digit1': this.cycleDelay(100); break;
				case 'Digit2': this.cycleDelay(70); break;
				case 'Digit3': this.cycleDelay(50); break;
				case 'Digit4': this.cycleDelay(30); break;
				case 'Digit5': this.cycleDelay(10); break;
				case 'Digit6': this.cycleDelay(0); break;
				case 'Digit0': this.ai.toggleDebug();
			}

			if (this.auto !== oldAuto && this.auto === false)
				this.el.classList.add('active');
		}

		cycleDelay(delay = null) {
			this.delay = delay;

			if (this.timer)
				clearInterval(this.timer);

			this.timer = setInterval(this.cycle.bind(this), this.delay);
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

			this.path = this.ai.calculate();

			this.setScore(0);

			this.cycleDelay(this.delay);
		}

		cycle() {
			if (this.pause) {
				return;
			}
			if (this.auto) {
				if (this.path.length)
					this.newDir = this.path.pop();
				else
					this.autoStep();
			}

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
				tail.remove();
				this.stop();
				return;
			}

			const newHead = tail;

			if (this.map[newX][newY] instanceof SnakeMeal) {
				const mealPos = this.getNewMealPosition();
				this.map[newX][newY].setPosition(mealPos.x, mealPos.y);
				this.tail.push(new SnakeTail(this, tail.x, tail.y));

				newHead.setPosition(newX, newY);
				this.tail.unshift(newHead);

				this.setScore(parseInt(this.inputScore.value) + 1);

				if (this.auto) {
					this.path = this.ai.calculate();
				}
			}
			else {
				newHead.setPosition(newX, newY);
				this.tail.unshift(newHead);
			}
		}

		setScore(score) {
			this.inputScore.value = score;
			triggerEvent(this.inputScore, 'input');

			if (!this.auto && score > this.inputBest.value) {
				this.inputBest.value = score;
				triggerEvent(this.inputBest, 'input');
			}

			if (this.auto && score > this.inputBestAi.value) {
				this.inputBestAi.value = score;
				triggerEvent(this.inputBestAi, 'input');
			}
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

	class SnakeAI
	{
		constructor(game) {
			this.game = game;
			this.map = [];
			this.debug = false;
			for (let i = 0; i < game.field.width; i++) {

				this.map[i] = [];
				for (let j = 0; j < game.field.height; j++) {

					this.map[i].push({
						steps: null,
						rotates: 0,
						dir: null,
						tail: null,
						x: i,
						y: j,
					});
				}
			}
		}

		calculate() {
			let cell = this.makeMap();
			if (!cell) {
				return false;
			}
			const path = [];

			this.avoidLoop(cell);

			for (let i = cell.steps; i > 0; i--) {
				path.push(cell.dir);
				switch (cell.dir) {
					case 'left':
						cell = this.map[cell.x + 1][cell.y];
						break;
					case 'right':
						cell = this.map[cell.x - 1][cell.y];
						break;
					case 'up':
						cell = this.map[cell.x][cell.y + 1];
						break;
					case 'down':
						cell = this.map[cell.x][cell.y - 1];
						break;
				}
			}
			//path.reverse();

			return path;
		}

		makeMap() {
			this.clear();

			//this.findMeal();

			let step = 0;
			let arr = new Array(1000);
			let arr2 = new Array(1000);
			arr[0] = this.head;
			let count = 1;
			let count2 = 0;

			let found = false;
			while (!found && step < 100) {
				// arr.forEach(item => {
				// 	count2 = this.calcCell(item, arr2, count2);
				// });
				for (let i = 0; i < count; i++) {
					const cell = arr[i];
					if (this.game.map[cell.x][cell.y] instanceof SnakeMeal) {
						this.calcCell(cell, arr2, count2);
						return cell;
					}
					count2 = this.calcCell(cell, arr2, count2);
				}

				arr = [arr2, arr2 = arr][0];
				count = count2;
				count2 = 0;

				step++;
			}

			return null;
		}

		calcCell(current, arr, count) {
			const i = current.x;
			const j = current.y;
			const mx = this.map.length - 1;
			const my = this.map[0].length - 1;

			//const tail = current.tail ?? 0;

			const left = i > 0 ? this.map[i - 1][j] : null;
			const right = i < mx ? this.map[i + 1][j] : null;
			const top = j > 0 ? this.map[i][j - 1] : null;
			const bottom = j < my ? this.map[i][j + 1] : null;

			if (left && left.steps === null && left.tail <= current.steps) {
				this.set(i - 1, j, current.steps + 1);
				arr[count] = left;
				count++;
			}
			if (right && right.steps === null && right.tail <= current.steps) {
				this.set(i + 1, j, current.steps + 1);
				arr[count] = right;
				count++;
			}
			if (top && top.steps === null && top.tail <= current.steps) {
				this.set(i, j - 1, current.steps + 1);
				arr[count] = top;
				count++;
			}
			if (bottom && bottom.steps === null && bottom.tail <= current.steps) {
				this.set(i, j + 1, current.steps + 1);
				arr[count] = bottom;
				count++;
			}

			current.rotates = 500;
			if (left && left.steps - current.steps === -1 && left.rotates < current.rotates) {
				this.set(i, j, current.steps,
					left.dir === 'right' ? left.rotates : left.rotates + 1, 'right');
			}
			if (right && right.steps - current.steps === -1 && right.rotates < current.rotates) {
				this.set(i, j, current.steps,
					right.dir === 'left' ? right.rotates : right.rotates + 1, 'left');
			}
			if (top && top.steps - current.steps === -1 && top.rotates < current.rotates) {
				this.set(i, j, current.steps,
					top.dir === 'down' ? top.rotates : top.rotates + 1, 'down');
			}
			if (bottom && bottom.steps - current.steps === -1 && bottom.rotates < current.rotates) {
				this.set(i, j, current.steps,
					bottom.dir === 'up' ? bottom.rotates : bottom.rotates + 1, 'up');
			}
			if (current.rotates === 500) {
				this.set(i, j, current.steps, 0, this.game.direction);
			}

			return count;
		}

		avoidLoop(current) {
			const tail = this.getNearTail(current.x, current.y, current.dir);
			if (tail === null) {
				return;
			}

			if (tail.tailDir === this.getOppositeDirection(current.dir)) {
				return;
			}
			const x = current.x;
			const y = current.y;

			if (x > 0 && tail.x - x === 1 && current.steps - this.map[x - 1][y].steps === 1) {
				current.dir = 'right';
			} else if (x < this.map.length - 1 && tail.x - x === -1 && current.steps - this.map[x + 1][y].steps === 1) {
				current.dir = 'left';
			} else if (y > 0 &&  tail.y - y === 1 && current.steps - this.map[x][y - 1].steps === 1) {
				current.dir = 'down';
			} else if (y < this.map[0].length - 1 && tail.y - y === -1 && current.steps - this.map[x][y + 1].steps === 1) {
				current.dir = 'top';
			}
		}

		getOppositeDirection(dir) {
			switch (dir) {
				case 'up': return 'down';
				case 'down': return 'up';
				case 'left': return 'right';
				case 'right': return 'left';
			}
		}

		getNearTail(x, y, dir) {
			if (x > 0 && this.map[x - 1][y].tail > this.map[x][y].steps && dir !== 'left' && this.map[x - 1][y].tail !== 0) {
				return this.map[x - 1][y];
			}
			if (x < this.map.length - 1 && this.map[x + 1][y].tail > this.map[x][y].steps && dir !== 'right' && this.map[x + 1][y].tail !== 0) {
				return this.map[x + 1][y];
			}
			if (y > 0 && this.map[x][y - 1].tail > this.map[x][y].steps && dir !== 'up' && this.map[x][y - 1].tail !== 0) {
				return this.map[x][y - 1];
			}
			if (y < this.map[0].length - 1 && this.map[x][y + 1].tail > this.map[x][y].steps && dir !== 'down' && this.map[x][y + 1].tail !== 0) {
				return this.map[x][y + 1];
			}
			return null;
		}

		set(x, y, steps = null, rotates = null, dir = null) {
			this.map[x][y].steps = steps;
			this.map[x][y].rotates = rotates;
			this.map[x][y].dir = dir;

			if (this.debug) {
				const s = steps !== null ? steps : '';
				const t = this.map[x][y].rotates !== null ? this.map[x][y].rotates : '';
				const d = dir !== null ? dir[0] : '';
				this.map[x][y].debug.innerHTML = s + '<br>' + t + d;
				const hsl = 'rgb(' + (this.map[x][y].steps * 13) + ', ' + (255 - this.map[x][y].steps * 13) + ', 0)';
				this.map[x][y].debug.style.backgroundColor = s === '' ? 'black' : hsl;
			}
		}
		setTail(x, y, tail) {
			this.map[x][y].tail = tail;
		}

		clear() {
			for (let i = 0; i < this.map.length; i++) {
				for (let j = 0; j < this.map[i].length; j++) {
					this.set(i, j, null, 500, null, null);
					this.setTail(i, j, 0);
				}
			}
			const tail = this.game.tail;
			this.set(tail[0].x, tail[0].y, 0, 0, this.game.direction);
			this.head = this.map[tail[0].x][tail[0].y];

			for (let i = 0; i < tail.length; i++) {
				this.setTail(tail[i].x, tail[i].y, tail.length - i);

				if (i === 0) {
					this.map[tail[i].x][tail[i].y].tailDir = this.game.direction;
				} else {
					if (tail[i-1].x - tail[i].x === -1) {
						this.map[tail[i].x][tail[i].y].tailDir = 'left';
					} else if (tail[i-1].x - tail[i].x === 1) {
						this.map[tail[i].x][tail[i].y].tailDir = 'right';
					} else if (tail[i-1].y - tail[i].y === -1) {
						this.map[tail[i].x][tail[i].y].tailDir = 'up';
					} else if (tail[i-1].y - tail[i].y === 1) {
						this.map[tail[i].x][tail[i].y].tailDir = 'down';
					}
				}
			}
		}

		showDebug() {
			this.debug = true;
			const game = this.game;
			for (let i = 0; i < game.field.width; i++) {
				for (let j = 0; j < game.field.height; j++) {

					const cell = document.createElement('div');
					cell.classList.add('snake_dubug');
					const pos = game.getCellPosition(i, j);
					cell.style.top = pos.y + 'px';
					cell.style.left = pos.x + 'px';
					game.el.append(cell);

					this.map[i][j].debug = cell;
				}
			}
		}
		hideDebug() {
			this.debug = false;
			const game = this.game;
			for (let i = 0; i < game.field.width; i++) {
				for (let j = 0; j < game.field.height; j++) {
					this.map[i][j].debug.remove();
				}
			}
		}
		toggleDebug() {
			if (this.debug) this.hideDebug();
			else this.showDebug()
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

(function() {
	class Score {
		constructor(element) {
			this.el = element;
			this.input = element.querySelector('input');

			this.digits = [];

			for (let i = 0; i < 3; i++) {
				const d = document.createElement('div');
				d.classList.add('snake_score-value-inner');
				let html = '';
				if (i > 0) {
					for (let j = 0; j < Math.pow(10, i) - 1; j++)
						html += ' 9 8 7 6 5 4 3 2 1 0 ';
				}

				html += ' 9 8 7 6 5 4 3 2 1 ';
				if (i === 2) {
					html += '0';
				}
				d.innerHTML = html;
				this.el.append(d);

				this.digits.unshift(d);
			}

			this.render();
			this.bind();
		}

		bind() {
			this.input.addEventListener('input', this.onInput.bind(this));
		}

		onInput(e) {
			this.render();
		}

		render() {
			const value = this.input.value;

			for (let i = 0; i < this.digits.length; i++) {
				const a = i > 0 ? Math.floor(value / (Math.pow(10, i))) : parseInt(value);
				//const d = a % 10;

				this.digits[i].style.marginTop = -Math.pow(10, 3 - i) + 1 + a + 'em';

			}
			// if (this.input.value) {
			// 	this.text.innerHTML = this.input.dataset.on;
			// 	this.el.classList.add('active');
			// } else {
			// 	this.text.innerHTML = this.input.dataset.off;
			// 	this.el.classList.remove('active');
			// }
		}
		setValue(value) {
			const changed = Boolean(this.input.value) !== value;
			this.input.value = value ? 1 : '';
			if (changed)
				triggerEvent(this.input, 'input');
		}
	}

	document.querySelectorAll('.js-score').forEach(function(el) {
		new Score(el);
	});
})();
