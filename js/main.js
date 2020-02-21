new Vue({
	name: 'game',
	el: '#app',
	data: state,
	template: `
		<div>
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
				<hand :cards="testHand" v-if="!activeOverlay"
				@card-play="testPlayCard"/>
			</transition> 	
			<transition name="fade">
				<div class="overlay-background" v-if="activeOverlay"/>
			</transition>
			<transition name="zoom">		
				<overlay v-if="activeOverlay" :key="activeOverlay">
					<component :is="'overlay-content-' + activeOverlay"
					:player="currentPlayer" :opponent="currentOpponent"
					:players="players"/>						
				</overlay>
			</transition>			
		</div>
	`,
	created() {
		this.testHand = this.createTestHand();
	},
	computed: {
		testCard() {
			return cards.archers
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
		testPlayCard(card) {
			const index = this.testHand.indexOf(card);
			this.testHand.splice(index, 1);
			this.currentPlayer.lastPlayedCardId = card.id;
		}		
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

