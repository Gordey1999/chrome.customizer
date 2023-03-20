
(function() {

    const body = document.querySelector('body');

    const linkGroups = ['downloaded', 'like', 'dislike'];

	class Menu {
		constructor() {
			this.makeMenu();

			this.bind();
		}

		makeMenu() {
			this.menu = createDiv('favorites__container', body);

			this.button = createDiv('favorites__button', this.menu);
			this.button.innerHTML = 'menu';

			this.body = createDiv('favorites__body');

			this.groups = {};
			linkGroups.forEach(function (item) {
				const btn = createDiv('favorites__group-btn', this.menu);
				btn.innerHTML = item;
				this.groups[item] = {
					button: btn,
					list: createDiv('favorites__group', this.body)
				}
			}, this);

			this.menu.append(this.body);


			body.append(this.menu);
		}

		bind() {
			this.button.addEventListener('click', this.onButtonClick.bind(this));

			Object.keys(this.groups).forEach(function (group) {
				this.groups[group].button.addEventListener('click', this.onGroupBtnClick.bind(this));
			}, this);
		}

		onButtonClick() {
			this.menu.classList.toggle('active');
		}

		onGroupBtnClick(e) {
			for (let key in this.groups) {
				if (!this.groups.hasOwnProperty(key)) continue;

				const group = this.groups[key];

				group.button.classList.remove('active');
				group.list.classList.remove('active');

				if (e.currentTarget === group.button) {
					group.button.classList.add('active');
					group.list.classList.add('active');
				}
			}
		}

		addLink(group, name, image, url) {
			const link = document.createElement('a');
			link.href = url;
			//link.innerHTML = name;
			const img = document.createElement('img');
			img.src = image;
			link.append(img);
			this.groups[group].list.append(link);
		}

		clearLinks() {
			for (let key in this.groups) {
				if (!this.groups.hasOwnProperty(key)) continue;
				const group = this.groups[key];
				group.list.innerHTML = '';
			}
		}

	}

	const menu = new Menu();
	let favorites = {};
	let comments = {};
	let cardButtons = [];
	const card = document.querySelector('.bigcontent.nobigcover');

	createCardButtons();

	function querySettings() {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get(['mangaFavorites', 'mangaComments']).then((result) => {
				if (typeof result.mangaFavorites === 'undefined') {
					linkGroups.forEach(group => {
						favorites[group] = {};
					});
				} else {
					favorites = result.mangaFavorites;
				}

				if (typeof result.mangaComments !== 'undefined') {
					comments = result.mangaComments;
				}
				resolve();
			}).catch(reason => {
				reject(reason);
			});
		});
	}

	querySettings().then(() => {
		fillFavorites();
		activateCardButtons();
		markLinks();
	})


	function fillFavorites() {
		menu.clearLinks();
		linkGroups.forEach(group => {
			for (let url in favorites[group]) {
				if (!favorites[group].hasOwnProperty(url)) continue;

				menu.addLink(group, favorites[group][url].name, favorites[group][url].image, url);
			}
		})
	}


	function createCardButtons() {
		if (card !== null) {
			const container = createDiv('favorites__add-buttons', card.querySelector('.thumbook'));
			const buttonNone = createDiv('favorites__add-button', container);
			buttonNone.innerHTML = 'none';
			buttonNone.addEventListener('click', onAddFavoriteClick);
			cardButtons.push(buttonNone);

			linkGroups.forEach(group => {
				const btn = createDiv('favorites__add-button', container);
				btn.innerHTML = group;
				btn.addEventListener('click', onAddFavoriteClick);
				cardButtons.push(btn);
			});
		}
	}

	function activateCardButtons() {
		const currentUrl = location.href;

		let activeGroup = 'none';

		linkGroups.forEach(group => {
			for (let url in favorites[group]) {
				if (!favorites[group].hasOwnProperty(url)) continue;

				if (url === currentUrl)
					activeGroup = group;
			}
		});

		cardButtons.forEach(btn => {
			const group = btn.innerHTML;

			if (group === activeGroup)
				btn.classList.add('active');
			else
				btn.classList.remove('active');
		});
	}

	function onAddFavoriteClick(e) {
		const currentUrl = location.href;
		const button = e.currentTarget;

		querySettings().then(() => {
			linkGroups.forEach(group => {
				delete favorites[group][currentUrl];
			});
			const group = button.innerHTML;
			if (group !== 'none')
				favorites[group][currentUrl] = {
					name: card.querySelector('.entry-title').innerHTML,
					image: card.querySelector('img').src
				}

			chrome.storage.local.set({ mangaFavorites: favorites }).then(() => {
				fillFavorites();
				activateCardButtons();
			});
		});
	}



	const linksContainers = document.querySelectorAll('.listupd');

	function markLinks() {
		linksContainers.forEach(container => {
			container.querySelectorAll('a').forEach(link => {
				const href = link.href;

				linkGroups.forEach(group => {
					if (typeof favorites[group][href] !== 'undefined')
						link.classList.add(group);
				});
			});
		});
	}





	function createDiv(htmlClass, parent = null) {
		const div = document.createElement('div');
		div.classList.add(htmlClass);
		if (parent !== null)
			parent.append(div);

		return div;
	}

})();


/* stop banners */
(function() {
	const links = document.querySelectorAll('a');

	links.forEach(function (link) {
		link.addEventListener('click', function(e) {
			e.stopImmediatePropagation();
		})
	});
})();