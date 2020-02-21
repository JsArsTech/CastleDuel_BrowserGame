
function getWorldRatio() {
	return 1 / 1920 * window.innerWidth;
}


function getLastPlayedCard(player) {
	return cards[player.lastPlayedCardId];
}