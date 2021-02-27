var cards = [];
var helmets = [];
var girders = [];
var nextCardIndex = -1;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

function normalizeText(text) {
    return text.replace(/\[b\]/g, "<b>").replace(/\[\/b\]/g, "</b>");
}

const MenAtWorkHelper = {
    data() {
        return {
            isDataLoading: true,
            leftCard: false,
            rightCard: false,
            round: 1,
            bound: 25 + randomInteger(0, 3),
            isRitaBossMode: false
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            const app = this;

            fetch("/data/girders.json")
                .then((response) => response.json())
                .then((girdersData) => {
                    girders = girdersData;
                    app.checkIfAllDataLoaded();
                })
            
            fetch("/data/helmets.json")
                .then((response) => response.json())
                .then((helmetsData) => {
                    helmets = helmetsData;
                    app.checkIfAllDataLoaded();
                })
            
            fetch("/data/cards.json")
                .then((response) => response.json())
                .then((cardsData) => {
                    shuffle(cardsData)
                    cards = cardsData;
                    app.checkIfAllDataLoaded();
                })
        },
        checkIfAllDataLoaded() {
            if (cards.length && Object.keys(helmets).length && Object.keys(girders).length) {
                this.onDataLoaded();
                return true
            }
            return false;
        },
        onDataLoaded() {
            this.rightCard = this.nextCard();
            this.leftCard = this.nextCard();
        },
        nextTurn() {
            const newCard = this.nextCard();
            if ( ! newCard) return;
            this.round += 1;
            this.rightCard = this.leftCard;
            this.leftCard = newCard;
        },
        nextCard() {
            nextCardIndex += 1;

            if (nextCardIndex > cards.length - 2) {
                return;
            }

            if (this.round >= this.bound) {
                this.isRitaBossMode = true;
            }
            futureCard = cards[nextCardIndex + 1];
            return this.makeCard(cards[nextCardIndex], futureCard.type);
        },
        makeCard(cardTemplate, nextCardType) {
            var text;
            if (nextCardType == "Girder") {
                text = normalizeText(girders[cardTemplate.texts[0]]["ru"]);
            } else {
                text = normalizeText(helmets[cardTemplate.texts[1]]["ru"]);
            }
            return {
                type: cardTemplate.type.toLowerCase(),
                text: text,
                colors: cardTemplate.colors
            }
        }
    },
    template: `
        <div class="men-at-work" v-cloak>
            <div class="sidebar">
                <div class="counter">Раунд {{ round }}</div>
                <div class="action-type" :class="'action-type--' + leftCard.type"></div>
                <div class="colors">
                    <div v-for="color in leftCard.colors" class="color" :class="'color--' + color"></div>
                </div>
            </div>
            <div class="main">
                <div class="boss-rita-mode" v-if="isRitaBossMode">
                    Получите награду <b>Рабочий месяца</b> если ставите наивысший элемент на стройку
                </div>
                <div class="text" v-html="rightCard.text"></div>
                <div class="next">
                    <button v-on:click="nextTurn()">Дальше &rarr;</button>
                </div>
            </div>
        </div>
    `
};

const app = Vue.createApp(MenAtWorkHelper);
app.mount("#app");
