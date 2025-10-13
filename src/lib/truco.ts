const suits = ['espadas', 'copas', 'ouros', 'paus'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '10', '11', '12'];
const deck: string[] = [];

for (const suit of suits) {
  for (const rank of ranks) {
    deck.push(`${rank}_${suit}`);
  }
}

function shuffle(array: string[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCards(deck: string[], numPlayers: number, handSize: number) {
  const hands = [];
  for (let i = 0; i < numPlayers; i++) {
    hands.push(deck.splice(0, handSize));
  }
  return hands;
}

function getCardValue(card: string) {
  const [rank, suit] = card.split('_');
  const rankValues: { [key: string]: number } = { '1': 14, '2': 13, '3': 12, '4': 11, '5': 10, '6': 9, '7': 8, '10': 7, '11': 6, '12': 5 };
  const suitValues: { [key: string]: number } = { 'espadas': 4, 'copas': 3, 'ouros': 2, 'paus': 1 };
  return rankValues[rank] * 10 + suitValues[suit];
}

function compareCards(card1: string, card2: string) {
  return getCardValue(card1) - getCardValue(card2);
}

export { deck, shuffle, dealCards, compareCards };