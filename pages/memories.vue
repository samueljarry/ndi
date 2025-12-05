<template>
	<div class="memory-game-container">
        <div class="game-left">
            <img
                src="/logo/title.svg"
                alt="NDI Title"
                class="ndi-title"
                draggable="false"
            >
            <img
                src="/logo/personnage.svg"
                alt="personnage NDI"
                class="ndi-logo"
                draggable="false"
            >
        </div>
		<!-- <div class="game-header">
			<h1>Jeu Memory</h1>
			<div class="game-stats">
				<p>Coups: {{ moves }}</p>
				<p>Paires trouvées: {{ matchedPairs }} / {{ totalPairs }}</p>
				<p>Temps: {{ formattedTime }}</p>
			</div>
			<button
				class="reset-btn"
				@click="resetGame"
			>
				Nouvelle partie
			</button>
		</div> -->

		<div
			class="cards-grid"
			:class="`grid-${gridSize}`"
		>
			<MemoryCard
				v-for="card in cards"
				:key="card.id"
				:card="card"
				:is-flipped="card.isFlipped"
				:is-matched="card.isMatched"
				@click="flipCard(card)"
			/>
		</div>

		<div
			v-if="showAppModal"
			class="app-modal"
			@click="closeAppModal"
		>
			<div
				class="app-modal-content"
				@click.stop
			>
				<button
					class="close-modal-btn"
					@click="closeAppModal"
				>
					×
				</button>
				<img
					:src="currentApp.image"
					:alt="currentApp.name"
					class="app-modal-image"
                    draggable="false"
				>
				<h2>{{ currentApp.name }}</h2>
				<p class="app-description">
					{{ currentApp.description }}
				</p>
				<button
					class="details-btn"
					@click="viewDetails"
				>
					Voir plus de détails
				</button>
			</div>
		</div>

		<div
			v-if="gameWon"
			class="victory-modal"
		>
			<div class="modal-content">
				<h2>🎉 Félicitations ! 🎉</h2>
				<p>Vous avez gagné en {{ moves }} coups et {{ formattedTime }} !</p>
				<button
					class="play-again-btn"
					@click="resetGame"
				>
					Rejouer
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Card {
	id: number;
	value: string;
	isFlipped: boolean;
	isMatched: boolean;
}

interface AppInfo {
	name: string;
	description: string;
	url: string;
}

const gridSize = ref(4); // 4x4 = 16 cartes (8 paires)
const totalPairs = computed(() => (gridSize.value * gridSize.value) / 2);

const cards = ref<Card[]>([]);
const flippedCards = ref<Card[]>([]);
const moves = ref(0);
const matchedPairs = ref(0);
const gameWon = ref(false);
const canFlip = ref(true);
const showAppModal = ref(false);
const currentApp = ref({
	name: '',
	description: '',
	image: '',
	url: '',
});
const appsInfo = ref<Record<string, AppInfo>>({});

// Timer
const seconds = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);

const formattedTime = computed(() => {
	const mins = Math.floor(seconds.value / 60);
	const secs = seconds.value % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

// Images pour les cartes
const cardValues = [
	'/logo/bac_a_sable_python.svg',
	'/logo/cartes_memoire.svg',
	'/logo/chatmd.svg',
	'/logo/codex.svg',
	'/logo/e-combox.svg',
	'/logo/marklab.svg',
	'/logo/mathalea.svg',
	'/logo/qcm_cam.svg',
];

// Charger les informations des applications depuis le JSON
const loadAppsInfo = async () => {
	console.log('[memory] loadAppsInfo: start');
	try {
		const response = await fetch('/apps-info.json');
		if (!response.ok) {
			console.warn('[memory] loadAppsInfo: response not ok', response.status, response.statusText);
		}
		const data = await response.json();
		console.log('[memory] loadAppsInfo: received', data);
		if (data && data.apps) {
			// Normaliser les clés : ajouter les variantes avec/sans slash de début
			const normalized: Record<string, AppInfo> = {};
			Object.keys(data.apps).forEach((k) => {
				normalized[k] = data.apps[k];
				const without = k.startsWith('/') ? k.slice(1) : '/' + k;
				// ajouter la variante si différente
				if (!normalized[without]) {
					normalized[without] = data.apps[k];
				}
			});
			appsInfo.value = normalized;
			console.log('[memory] loadAppsInfo: appsInfo keys', Object.keys(appsInfo.value));
		}
	}
	catch (error) {
		console.error('[memory] Erreur lors du chargement des infos des apps:', error);
	}

	// Fallback minimal si le JSON n'est pas disponible
	if (Object.keys(appsInfo.value).length === 0) {
		console.warn('[memory] appsInfo vide — utilisation d\'un fallback local');
		const fallback: Record<string, AppInfo> = {};
		cardValues.forEach((path) => {
			// retirer le slash de début pour une clé plus lisible si besoin
			const key = path;
			fallback[key] = {
				name: key.split('/').pop() || key,
				description: 'Description indisponible (fallback)',
				url: '#',
			};
		});
		appsInfo.value = fallback;
		console.log('[memory] fallback appsInfo keys', Object.keys(appsInfo.value));
	}
};

const initializeGame = () => {
	const numPairs = totalPairs.value;
	const selectedValues = cardValues.slice(0, numPairs);

	// Créer des paires
	const cardPairs = [...selectedValues, ...selectedValues];

	// Mélanger les cartes
	const shuffled = cardPairs.sort(() => Math.random() - 0.5);

	cards.value = shuffled.map((value, index) => ({
		id: index,
		value,
		isFlipped: false,
		isMatched: false,
	}));

	moves.value = 0;
	matchedPairs.value = 0;
	gameWon.value = false;
	flippedCards.value = [];
	seconds.value = 0;

	// Démarrer le timer
	if (timerInterval.value) {
		clearInterval(timerInterval.value);
	}
	timerInterval.value = setInterval(() => {
		if (!gameWon.value) {
			seconds.value++;
		}
	}, 1000);
};

const flipCard = (card: Card) => {
	if (!canFlip.value || card.isFlipped || card.isMatched || flippedCards.value.length >= 2) {
		return;
	}

	card.isFlipped = true;
	flippedCards.value.push(card);

	if (flippedCards.value.length === 2) {
		moves.value++;
		checkMatch();
	}
};

const checkMatch = () => {
	canFlip.value = false;
	const [card1, card2] = flippedCards.value;

	if (card1.value === card2.value) {
		// Match trouvé !
		setTimeout(() => {
			card1.isMatched = true;
			card2.isMatched = true;
			matchedPairs.value++;

			flippedCards.value = [];
			canFlip.value = true;

			// Afficher la modal de l'app
			if (appsInfo.value[card1.value]) {
				currentApp.value = {
					name: appsInfo.value[card1.value].name,
					description: appsInfo.value[card1.value].description,
					image: card1.value,
					url: appsInfo.value[card1.value].url,
				};
				showAppModal.value = true;
			}

			// Vérifier si le jeu est gagné
			if (matchedPairs.value === totalPairs.value) {
				gameWon.value = true;
				if (timerInterval.value) {
					clearInterval(timerInterval.value);
				}
			}
		}, 500);
	}
	else {
		// Pas de match, retourner les cartes
		setTimeout(() => {
			card1.isFlipped = false;
			card2.isFlipped = false;
			flippedCards.value = [];
			canFlip.value = true;
		}, 1000);
	}
};

const resetGame = () => {
	initializeGame();
};

const closeAppModal = () => {
	showAppModal.value = false;
};

const viewDetails = () => {
	// Navigation vers la page de détails ou ouverture d'un lien
	const url = currentApp.value.url;
	if (url && url !== '#') {
		// Ouvrir d'abord un onglet vide sécurisé, puis rediriger pour éviter le tabnabbing
		const newTab = window.open('about:blank', '_blank');
		if (newTab) {
			try {
				// Tentative de redirection dans le nouvel onglet
				newTab.location.href = url;
				// Déconnecter l'opener si possible (sécurité additionnelle)
				try {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					newTab.opener = null;
				}
				catch {
					// ignore
				}
			}
			catch {
				// Fallback si la redirection échoue
				window.open(url, '_blank');
			}
		}
		else {
			// Popup bloquée, essayer l'ouverture normale
			window.open(url, '_blank');
		}
	}
	closeAppModal();
};

onMounted(async () => {
	await loadAppsInfo();
	initializeGame();
});

onUnmounted(() => {
	if (timerInterval.value) {
		clearInterval(timerInterval.value);
	}
});
</script>

<style scoped>
.memory-game-container {
	min-height: 100vh;
	/* image de fond principale dans public/logo/bg_page.svg avec un overlay dégradé pour contraste */
	background: url('/logo/bg_page.svg');
	background-size: cover;
	background-position: center;
	padding-right: 2rem;
	display: flex;
	flex-direction: row;
	align-items: center;
    justify-content: space-between;
}

.game-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    margin-right: 2rem;
    height: 100vh;
    min-width: 350px;
    width: 50%;
    user-select: none;
}

.ndi-title {
    width: 50vh;
    margin-bottom: 7rem;
}

.ndi-logo {
    width: 50vh;
    margin-left: 1vh;
}

.game-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.game-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.game-stats p {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.reset-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.reset-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.cards-grid {
  display: grid;
  gap: 1rem;
  height: auto;
  width: 95vh;
}

.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.grid-6 {
  grid-template-columns: repeat(6, 1fr);
}

.victory-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  padding: 3rem;
  text-align: center;
  border: 6px solid #000000ff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.modal-content p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  color: #333;
}

.play-again-btn {
  background: #000000ff;
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 0px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-again-btn:hover {
  background: #5568d3;
  transform: scale(1.05);
}

.play-again-btn:hover {
	background: #5568d3;
	transform: scale(1.05);
}

.app-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.85);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
	animation: fadeIn 0.3s ease;
}

.app-modal-content {
	background: #FFF1E9;
	padding: 2.5rem;
	border-radius: 0px;
	max-width: 500px;
	width: 90%;
	text-align: center;
    border: 6px solid #000000ff;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
	animation: slideUp 0.5s ease;
	position: relative;
}

.close-modal-btn {
	position: absolute;
	top: 1rem;
	right: 1rem;
	background: transparent;
	border: none;
	font-size: 2rem;
	cursor: pointer;
	color: #999;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.3s ease;
}

.close-modal-btn:hover {
	background: #f0f0f0;
	color: #333;
}

.app-modal-image {
	width: 120px;
	height: 120px;
	object-fit: contain;
	margin: 0 auto 1.5rem;
	display: block;
}

.app-modal-content h2 {
	font-size: 2rem;
	margin-bottom: 1rem;
	color: #000;
}

.app-description {
	font-size: 1.1rem;
	color: #555;
	line-height: 1.6;
	margin-bottom: 2rem;
}

.details-btn {
	background: #000000ff;
	color: white;
	border: none;
	padding: 1rem 2rem;
	border-radius: 0px;
	font-size: 1.1rem;
	font-weight: bold;
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.details-btn:hover {
	background: #1e1e1eff;
	transform: translateY(-2px);
	box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .game-header h1 {
    font-size: 2rem;
  }

  .game-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .cards-grid {
    gap: 0.5rem;
  }
}
</style>
