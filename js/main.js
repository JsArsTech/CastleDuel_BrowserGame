new Vue({
	name: 'game',
	el: '#app',
	data: state,
	template: `
		<div :class="cssClass">
			<top-bar :turn="turn" 
				:current-player-index="currentPlayerIndex"
				:players="players"/>
			<div class="world">
				<castle v-for="(player, index) in players" 
				:player="player" :index="index"/>
				<div class="land"/>
				<div class="clouds">
					<cloud v-for="index in 10" :type="(index - 1) % 5 + 1"/>
				</div>
			</div>
			<transition name="hand">			
				<hand :cards="currentHand" v-if="!activeOverlay"
				@card-play="handlePlayCard"
				@card-leave-end="handleCardLeaveEnd"/>
			</transition> 	
			<transition name="fade">
				<div class="overlay-background" v-if="activeOverlay"/>
			</transition>
			<transition name="zoom">		
				<overlay v-if="activeOverlay" :key="activeOverlay"
					@close="handleOverlayClose">
					<component :is="'overlay-content-' + activeOverlay"
					:player="currentPlayer" :opponent="currentOpponent"
					:players="players"/>						
				</overlay>
			</transition>			
		</div>
	`,
	computed: {
		testCard() {
			return cards.archers
		},
		cssClass() {
			return {
				'can-play': this.canPlay
			}
		}
	},
	methods: {
		testDrawCard() {
			// Choose a card at random with the ids
			const ids = Object.keys(cards);
			const randomId = ids[Math.floor(Math.random() 
				* ids.length)];
			// Return a new card with this definition
			return {
				uid: cardUid++,
				id: randomId, 
				def: cards[randomId]
			};
		},		
		createTestHand() {
			const cards = [];
			// Get the posible ids
			const ids = Object.keys(cards);

			//Draw 5 cards
			for (let i = 0; i < 5; i++)
			{
				cards.push(this.testDrawCard());
			}

			return cards;
		},	
		handlePlayCard(card) {
			playCard(card);
		},
		handleCardLeaveEnd() {
			applyCard();
		},
		handleOverlayClose() {
			overlayCloseHandlers[this.activeOverlay]();
		}

	}, 
	mounted() {
		beginGame();
	}
});

window.addEventListener('resize', () => {
	state.worldRatio = getWorldRatio()
});

requestAnimationFrame(animate);

function animate(time) {
	requestAnimationFrame(animate);
	TWEEN.update(time);
}

function beginGame() {
	state.players.forEach(drawInitialHand);
}

function playCard(card) {
	if (state.canPlay) {
		state.canPlay = false;
		currentPlayingCard = card;

		// Remove the card from player hand
		const index = state.currentPlayer.hand.indexOf(card);
		state.currentPlayer.hand.splice(index, 1);

		// Add the card to the discard pile
		addCardToPile(state.discardPile, card.id);
	}
}

function applyCard() {
	const card = currentPlayingCard;

	applyCardEffect(card);

	setTimeout(() => {
		// Check if the players are dead
		state.players.forEach(checkPlayerLost);

		if (isOnePlayerDead()) {
			endGame();
		}
		else {
			nextTurn();
		}
	}, 700);
}

function nextTurn() {
	state.turn++;
	state.currentPlayerIndex = state.currentOpponentId;
	state.activeOverlay = 'player-turn';
}

function endGame() {
	state.activeOverlay = 'game-over';
}

function newTurn() {

	console.log('newTurn');

	state.activeOverlay = null;
		state.canPlay = true;
	if (state.currentPlayer.skipTurn) {
		skipTurn();
	}
	else {
		startTurn();
	}
}

function skipTurn() {
	state.currentPlayer.skippedTurn = true;
	state.currentPlayer.skipTurn = false;
	nextTurn();
}

function startTurn() {
	state.currentPlayer.skippedTurn = false;
	// If both player already had a first turn
	if (state.turn > 2) {
		// Draw new card 
		setTimeout(() => {
			state.currentPlayer.hand.push(drawCard());
			state.canPlay = true;
		}, 800);
	} 
	else {
		state.canPlay = true;
	}
}

var overlayCloseHandlers = {

	'player-turn'() {
		if (state.turn > 1) {
			state.activeOverlay = 'last-play'; 
		}
		else {
			newTurn();
		}
	},

	'last-play'() {
		newTurn();
	},

	'game-over'() {
		// Reload the game 
		document.location.reload();
	}

};

