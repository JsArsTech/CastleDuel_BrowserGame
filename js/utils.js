
function getWorldRatio() {
	return 1 / 1920 * window.innerWidth;
}


function getLastPlayedCard(player) {
	return cards[player.lastPlayedCardId];
}

function drawInitialHand(player) {
	for (let i = 0; i < handSize; i++) {
		player.hand.push(drawCard());
	}
}

function drawCard() {

	if (getDrawPileCount() === 0) {
		refillPile();		
	}

	const choice = Math.round(Math.random() * (getDrawPileCount() - 1)) + 1;

	let accumulation = 0;
	for (let k in state.drawPile) {
		accumulation += state.drawPile[k];
		if (choice <= accumulation) {
			// Draw te card from the pile
			state.drawPile[k]--;
			return {
				id: k,
				uid: cardUid++,
				def: cards[k]
			}
		}
	}
}

function getDrawPileCount() {
	let result = 0;
	for (let k in state.drawPile) {
		result += state.drawPile[k];
	}
	return result;
}

function refillPile() {
	Object.assign(state.drawPile, state.discardPile);
	state.discardPile = {};
}

function addCardToPile(pile, cardId) {
	if (typeof pile[cardId] === 'number') {
		pile[cardId]++;
	}
	else {
		pile[cardId] = 1;
	}
}

// Card play 

function applyCardEffect(card) {

	state.currentPlayer.lastPlayedCardId = card.id;
	card.def.play(state.currentPlayer, state.currentOppenent);

	state.players.forEach(checkStatsBounds);
}

// Player 
function checkStatsBounds(player) {
	// Health
	if (player.health < 0) {
		player.health = 0;
	}
	else if (player.health > maxHealth) {
		player.health = maxHealth;
	}
	// Food
	if (player.food < 0) {
		player.food = 0;
	}
	else if (player.food > maxFood) {
		player.food = maxFood;
	}	
}

function checkPlayerLost(player) {
	player.dead = (player.health === 0 || player.food === 0);
}

function isOnePlayerDead() {
	return state.players.some(p => p.dead);
}
