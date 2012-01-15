function initAll() {
	board = new Board();
	board.addTiles(tiles);
	board.display();
	board.addPlayer(new Player('Nick','&lt;3'));
	board.addPlayer(new Player('Player 2','&#36;'));
	//beginPlayWrapper.delay(50);
	//board.beginPlay();//Set on a timer?

}

function beginPlayWrapper() {
	board.beginPlay();
}

function parseName(name) {
	name = name.toLowerCase();
	return name.replace(/ /g, '_') + '.png';
}

//Player Class
var Player = new Class({
	
	initialize: function(name, symbol) {
		this.name = name;
		this.symbol = symbol;
		this.money = 20000;
		this.currTile = 0;
		this.properties = new Array();

	},
	addProperty: function(property) {
		this.properties.push(property);
		this.updatePlayerInfo();
	},
	pay: function(amount, reason) {//Check to make sure is positive amount?
		board.alert(this.name + ' pays $' + amount + ' ' + reason);
		this.money -= amount;
		this.checkMoneyLevel();
		this.updatePlayerInfo();
	},
	payToOthers: function(amount, desc) {
		board.alert(this.name + ' pays all other players $' + amount + ' ' + desc);
		for(var i=0;i<board.players.length;i++) {
			if(board.players[i] != this) {
				board.players[i].gain(amount, ' from ' + this.name);
				this.money -= amount;
			}
		}
		this.checkMoneyLevel();
		this.updatePlayerInfo();
	},
	checkMoneyLevel: function() {
		if(this.money < 0) {
			board.alert('Uh oh... You have no money left...');
		}
	},
	gain: function(amount, reason) {//Relatively similar to pay... Combine? Check to make sure is positive amount?
		board.alert(this.name + ' gains $' + amount + ' ' + reason);
		this.money += amount;
		this.updatePlayerInfo();
	},
	display: function(offset) {
		var pos = board.tiles[this.currTile].getPos();
		this.offset = offset;
		this.div = document.createElement('div');
		this.div.innerHTML = this.symbol;
		this.div.style.position = 'absolute';
		this.div.style.top = pos.y + (this.offset * 25) + 'px';
		this.div.style.left = pos.x + (this.offset * 25) + 'px';
		this.div.style.fontSize = '32px';
		this.div.style.zIndex = 100;
		document.body.appendChild(this.div);
		this.dispPlayerInfo();
	},
	dispPlayerInfo: function() {
		this.infoDiv = document.createElement('div');
		this.infoDiv.style.width = '300px';
		this.infoDiv.style.height = '300px';
		this.infoDiv.style.position = 'absolute';
		this.infoDiv.style.top = (this.offset < 2) ? '100px' : '700px';//(offset > 1) * 600 + 100 + 'px';
		this.infoDiv.style.left = (this.offset % 2 == 0) ? '100px' : '700px';//(offset % 2 != 0) * 600 + 100 + 'px';
		this.infoDiv.style.background = '#DDD';

		this.title = document.createElement('h1');
		this.title.innerHTML = this.name;
		this.title.style.fontSize = '16px';
		this.title.style.margin = '5px';

		this.symbolDiv = this.div.cloneNode(true);
		this.symbolDiv.style.left = null;
		this.symbolDiv.style.right = '5px';
		this.symbolDiv.style.top = '5px';

		this.moneyDisp = this.title.cloneNode(true);
		this.moneyDisp.innerHTML = '&#36;' + this.money;

		this.propList = document.createElement('ul');

		this.infoDiv.appendChild(this.title);
		this.infoDiv.appendChild(this.symbolDiv);
		this.infoDiv.appendChild(this.moneyDisp);
		this.infoDiv.appendChild(this.propList);

		document.body.appendChild(this.infoDiv);
	},
	move: function() {
		var pos = board.tiles[this.currTile].getPos();
		this.div.style.top = pos.y + (this.offset * 25) + 'px';
		this.div.style.left = pos.x + (this.offset * 25) + 'px';
	},
	takeTurn: function() {
		board.button.innerHTML = 'Next Player\'s Turn';
		board.button.onclick = board.players[(this.offset + 1) % board.players.length].takeTurn.bind(board.players[(this.offset + 1) % board.players.length]);
		this.currTile = (this.currTile + board.rollDice()) % board.tiles.length;
		this.move();
		board.tiles[this.currTile].action(this);
	},
	updatePlayerInfo: function() {
		this.moneyDisp.innerHTML = '&#36;' + this.money;

		while(this.propList.childNodes.length > 0) {
			this.propList.removeChild(this.propList.firstChild);
		}

		var li;
		for(var i=0;i<this.properties.length;i++) {
			li = document.createElement('li');
			li.innerHTML = this.properties[i].name;
			this.propList.appendChild(li);
		}
	}
});

//Board Class
var Board = new Class({
	initialize: function() {
		this.tiles = new Array();
		this.players = new Array();
		this.tax = 0;
	},
	addTiles: function(tiles) {
		for(var i=0;i<tiles.length;i++) {//Can you just add an array?
			this.tiles.push(tiles[i]);
		}
	},
	addPlayer: function(player) {
		this.players.push(player);
		player.display(this.players.length - 1);
	},
	alert: function(msg) {
		this.alertP.innerHTML = msg;
	},
	allAreOwned: function(player, id) {
		for(var i=0;i<this.tiles.length;i++) {
			if(this.tiles[i].id() == id && this.tiles[i].owner != player) {
				return false;
			}
		}
		return true;
	},
	display: function() {
		var x = 0;
		var y = 1100;
		for(var i=0;i<11;i++) {
			y -= 100;
			tiles[i].display(x, y);
		}
		for(;i<21;i++) {
			x += 100;
			tiles[i].display(x, y);
		}
		for(;i<31;i++) {
			y += 100;
			tiles[i].display(x, y);
		}
		for(;i<40;i++) {
			x -= 100;
			tiles[i].display(x, y);
		}

		this.actionDiv = document.createElement('div');
		this.actionDiv.style.width = '300px';
		this.actionDiv.style.height = '300px';
		this.actionDiv.style.background = '#DDD';
		this.actionDiv.style.position = 'absolute';
		this.actionDiv.style.left = '400px';
		this.actionDiv.style.top = '400px';

		this.alertP = document.createElement('p');

		this.button = document.createElement('button');
		this.button.innerHTML = 'Begin Game';
		this.button.onclick = this.beginPlay.bind(this);

		this.actionDiv.appendChild(this.alertP);
		this.actionDiv.appendChild(this.button);

		document.body.appendChild(this.actionDiv);
	},
	rollDice: function() {
		this.lastRoll = Math.ceil(Math.random() * 6) + Math.ceil(Math.random() * 6);
		return this.lastRoll;
	},
	lastDiceRoll: function() {
		return this.lastRoll;
	},
	collectTax: function(amount) {
		this.tax += amount;
	},
	dispenseFreeParking: function() {
		return temp + (temp = 0);
	},
	railroadsOwnedBy: function(player) {
		var count = 0;
		for(var i=0;i<this.tiles.length;i++) {
			if(this.price && this.tiles[i].owner == player) {
				count++;
			}
		}
		return count;
	},
	beginPlay: function() {
		/*var count = 0;
		while(true) {
			for(var i=0;i<this.players.length;i++) {
			//	this.players[i].takeTurn();
			}
			//break;

			count++;

			//if(count > 40) {
				break;
			//}
		}*/
		this.button.innerHTML = 'Start Turn';
		this.button.onclick = this.players[0].takeTurn.bind(this.players[0]);

	}
});

//Tile Class
var Tile = new Class({
	initialize: function(name) {
		this.name = name;
		this.desc = 'I am a basic tile piece.';
	},
	display: function(x, y) {
		this.div = document.createElement('div');
		this.div.style.width = '98px';
		this.div.style.height = '98px';
		this.div.style.position = 'absolute';
		this.div.style.top = y + 'px';
		this.div.style.left = x + 'px';
		this.div.style.border = 'solid #000 1px';

		this.header = document.createElement('h1');
		this.header.innerHTML = this.name;
		this.header.style.margin = '0px';
		this.header.style.padding = '0px';
		this.header.style.fontSize = '12px';
		this.header.style.width = '98px';
		this.header.style.height = '20px';
		this.header.style.lineHeight = '20px';
		this.header.style.verticalAlign = 'middle';
		this.header.style.textAlign = 'center';
		this.header.style.position = 'absolute';
		this.header.style.top = '0px';
		this.header.style.left = '0px';

		this.div.appendChild(this.header);
		document.body.appendChild(this.div);
	},
	getPos: function() {
		return {
			x: parseInt(this.div.style.left),
			y: parseInt(this.div.style.top)
		}
	},
	id: function() {
		return 'generic_tile';
	}
});

//Property Class
var Property = new Class({
	Extends: Tile,
	initialize: function(name, price, color) {
		this.parent(name);
		this.price = price;//[price, base rent, 1 house, 2 houses, 3 houses, 4 houses, hotel, mortgage, building cost]
		this.color = color;
		this.isMortgaged = false;
		this.owner = null;
		this.houses = 0;
		this.hotel = 0;

		//Set this.desc to include description text regarding prices...

	},
	id: function() {
		return this.color;
	},
	display: function(x, y) {
		this.parent(x, y);
		this.header.style.background = this.color;
		this.header.style.borderBottom = 'solid 1px #000';
	},
	currRent: function(player) {
		if(!this.isMortgaged) {
			return this.price[1 + this.houses + this.hotel];
		} else {
			return 0;
		}
	},
	action: function(player) {
		if(this.owner) {
			var currRent = this.currRent(player);
			player.pay(currRent, 'for rent.');
			this.owner.gain(currRent, 'for rent.');
		} else {
			if(confirm('Do you wish to buy ' + this.name + ' for $' + this.price[0] + '?', 'Yes','No')) {
				player.pay(this.price[0],'to buy ' + this.name + '.');
				this.owner = player;
				player.addProperty(this);
			} else {
				//Auction
			}
		}
	}
});

//Utility Class
var Utility = new Class({
	Extends: Tile,
	initialize: function(name, price) {
		this.parent(name);
		this.price = price;//[price, mortgage value]
		this.isMortgaged = false;
		this.owner = null;
	},

	currRent: function(player) {
		if(!this.isMortgaged) {
			return board.lastDiceRoll() * (board.allAreOwned(this.owner, this.id())) ? 100 : 40;
		} else {
			return 0;
		}
	},

	action: function(player) {
		if(this.owner) {
			var rent = this.currRent(player);
			player.pay(rent, 'for rent.');
			this.owner.gain(rent, 'for rent.');
		} else {
			if(confirm('Do you wish to buy ' + this.name + ' for $' + this.price + '?', 'Yes','No')) {
				player.pay(this.price,'to buy ' + this.name + '.');
				this.owner = player;
				player.addProperty(this);
			} else {
				//Auction
			}
		}
	},

	id: function() {
		return 'utility';
	},
	display: function(x, y) {
		this.parent(x, y);
		this.header.style.borderBottom = 'solid 1px #000';
		this.div.style.background = 'url(' + parseName(this.name) + ') center 20px no-repeat';
	}
});

//Railroad Class
var Railroad = new Class({
	Extends: Utility,
	initialize: function(name) {
		this.parent(name, 2000);
	},

	currRent: function(player) {
		if(!this.isMortgaged) {
			return 250 * Math.pow(2, board.railroadsOwnedBy(this.owner));
		} else {
			return 0;
		}
	},
	display: function(x, y) {
		this.parent(x, y);
		this.header.style.background = '#DDD';
	}
});

//Action Tile Class
var ActionTile = new Class({
	Extends: Tile,
	initialize: function(name, action) {
		this.parent(name);
		this.action = action;
	},
	display: function(x, y) {
		this.parent(x, y);
		this.div.style.background = 'url(' + parseName(this.name) + ') center 5px no-repeat';
		this.header.style.borderBottom = 'solid 1px #000';
	}
});

//Card Tile Class
var CardTile = new Class({
	Extends: ActionTile,
	initialize: function(name) {
		this.parent(name, this.action);
	},
	action: function(player) {
		cardActions[this.name][Math.floor(Math.random() * cardActions[this.name].length)](player);
	}
});

//Tax Tile Class
var TaxTile = new Class({
	Extends: ActionTile,
	initialize: function(name, tax) {
		this.parent(name, this.action);
		this.tax = tax;
	},
	action: function(player) {
		player.pay(this.tax, 'for ' + this.name + '.');
	},
	display: function(x, y) {
		this.parent(x, y);
		this.div.style.background = 'url(tax.png) center 20px no-repeat';
	}
});

window.addEvent('domready', initAll);

var colors = {
	brown: '#663300',
	light_blue: '#CCF',
	magenta: '#993399',
	orange: '#FF9933',
	red: '#F00',
	yellow: '#FF0',
	green: '#0F0',
	blue: '#0033CC'
}

//Define board tiles
var tiles = [
	new ActionTile('Go', function(player) {}),
	new Property('Gdynia', [600, 20, 100, 300, 900, 1600, 2500, 300, 500], colors.brown),
	new CardTile('Community Chest'),
	new Property('Taipei', [600, 40, 200, 600, 1800, 3200, 4500, 300, 500], colors.brown),
	new TaxTile('Income Tax', 2000),
	new Railroad('Monopoly Rail'),

	new Property('Tokyo', [1000, 60, 300, 900, 2700, 4000, 5500, 500, 500], colors.light_blue),
	new CardTile('Chance'),
	new Property('Barcelona', [1000, 60, 300, 900, 2700, 4000, 5500, 500, 500], colors.light_blue),
	new Property('Athens', [1200, 80, 400, 1000, 3000, 4500, 6000, 600, 500], colors.light_blue),

	new ActionTile('Jail', function(player) {}),

	new Property('Istanbul', [1400, 100, 500, 1500, 4500, 6250, 7500, 700, 1000], colors.magenta),
	new Utility('Solar Energy', 1400),
	new Property('Kyiv', [1400, 100, 500, 1500, 4500, 6250, 7500, 700, 1000], colors.magenta),
	new Property('Toronto', [1600, 120, 600, 1800, 5000, 7000, 9000, 800, 1000], colors.magenta),

	new Railroad('Monopoly Air'),

	new Property('Rome', [1800, 140, 700, 2000, 5500, 7500, 9500, 900, 1000], colors.orange),
	new CardTile('Community Chest'),
	new Property('Shanghai', [1800, 140, 700, 2000, 5500, 7500, 9500, 900, 1000], colors.orange),
	new Property('Vancouver', [2000, 160, 800, 2200, 6000, 8000, 10000, 1000, 1000], colors.orange),

	new ActionTile('Free Parking', function(player) {}),

	new Property('Sydney', [2200, 180, 900, 2500, 7000, 8750, 10500, 1000, 1500], colors.red),
	new CardTile('Chance'),
	new Property('New York', [2200, 180, 900, 2500, 7000, 8750, 10500, 1000, 1500], colors.red),
	new Property('London', [2400, 200, 1000, 3000, 7500, 9250, 11000, 1200, 1500], colors.red),

	new Railroad('Monopoly Cruise'),

	new Property('Beijing', [2600, 220, 1100, 3300, 8000, 9750, 11500, 1300, 1500], colors.yellow),
	new Property('Hong Kong', [2600, 220, 1100, 3300, 8000, 9750, 11500, 1300, 1500], colors.yellow),
	new Utility('Wind Energy', 1500),
	new Property('Jerusalem', [2800, 240, 1200, 3600, 8500, 10250, 12000, 1400, 1500], colors.yellow),

	new ActionTile('Go to Jail', function(player) {}),

	new Property('Paris', [3000, 260, 1300, 3900, 9000, 11000, 12750, 1500, 2000], colors.green),
	new Property('Belgrade', [3000, 260, 1300, 3900, 9000, 11000, 12750, 1500, 2000], colors.green),
	new CardTile('Community Chest'),
	new Property('Cape Town', [3200, 280, 1500, 4500, 10000, 12000, 14000, 1600, 2000], colors.green),

	new Railroad('Monopoly Space'),
	new CardTile('Chance'),

	new Property('Riga', [3500, 350, 1750, 5000, 11000, 13000, 15000, 1750, 2000], colors.blue),
	new TaxTile('Super Tax', 1000),
	new Property(' Montreal', [4000, 500, 2000, 6000, 14000, 17000, 20000, 2000, 2000], colors.blue),

];

	// initialize: function(name, price, color) {
	// 	this.parent(name);
	// 	this.price = price;//[price, rent, 1 house, 2 houses, 3 houses, 4 houses, hotel, mortgage, house cost]

var cardActions = {
	'Community Chest': [
		function(player) {
			player.payToOthers(500, 'to each player to taste world cuisines.');
		},
		function(player) {
			player.gain(1000, 'when stocks soar.');
		}
	],
	'Chance': [
		function(player) {
			player.pay(500, 'for new clothes.');
		},
		function(player) {
			player.gain(500, 'from a radio contest.');
		}
	]
}