<template>
  <div class="stratege-wrapper">
    <div class="left-panel">
      <div class="puzzle-instructions">
        <h3>Les Jalons du Stratège</h3>
        <p>Associe chaque action proposée au bon jalon de la démarche NIRD pour prouver que tu maîtrises la progression d'un établissement vers un numérique responsable.</p>
      </div>
      <div class="character-overlay">
        <img :src="characterImg" alt="Personnage">
      </div>
    </div>

    <div class="game-container">
      <div class="newspaper-bg"></div>
      
      <div class="content-top">
        <div class="character-card">
          <div class="character-image">
            <img :src="newspaperImg" alt="L'explorateur">
          </div>
        </div>
        
        <div class="info-right">
          <div class="title-section">
            <h1>L'explorateur</h1>
            <div class="phrase-card" id="phraseCard">
              <p>{{ currentPhrase?.text || 'Chargement...' }}</p>
            </div>
            <div class="barcode">|||||||||||||||||| ||||||||||||||</div>
          </div>
        </div>
      </div>

      <div class="bottom-section">
        <p class="instruction-text">À quel jalon de la démarche NIRD cette phrase est-elle liée ?</p>
        <div class="jalons">
          <button class="jalon jalon-1" data-jalon="1" @click="checkAnswer(1)">
            <span class="jalon-number">Jalon 1</span>
            <span class="jalon-name">Mobilisation</span>
          </button>
          <button class="jalon jalon-2" data-jalon="2" @click="checkAnswer(2)">
            <span class="jalon-number">Jalon 2</span>
            <span class="jalon-name">Expérimentation</span>
          </button>
          <button class="jalon jalon-3" data-jalon="3" @click="checkAnswer(3)">
            <span class="jalon-number">Jalon 3</span>
            <span class="jalon-name">Intégration</span>
          </button>
        </div>
      </div>

      <div class="score">
        <span id="scoreText">Phrases: {{ completedPhrases }}/{{ totalPhrases }}</span>
      </div>
    </div>

    <div id="modal" class="modal" :class="{ show: showModal }">
      <div class="modal-content">
        <h2>{{ modalTitle }}</h2>
        <p v-html="modalMessage"></p>
        <button @click="closeModal">Continuer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const characterImg = new URL('../public/persostratege.png', import.meta.url).href
const newspaperImg = new URL('../public/persojalon.png', import.meta.url).href

interface Phrase {
  text: string
  jalon: number
}

const phrases: Phrase[] = [
  // Jalon 1 - Mobilisation
  { text: "Aujourd'hui j'ai présenté un petit diaporama à mes collègues pour leur expliquer ce qu'était le numérique responsable.", jalon: 1 },
  { text: "Je me suis inscrit sur Tchap pour rejoindre les autres enseignants qui font déjà du NIRD.", jalon: 1 },
  { text: "J'ai parlé de l'initiative à la direction pour voir si on pouvait lancer un premier temps d'information.", jalon: 1 },

  // Jalon 2 - Expérimentation
  { text: "On a installé nos premiers postes Linux, et les élèves du club ont déjà réussi à remettre en état un PC !", jalon: 2 },
  { text: "J'ai fait une petite formation aux profs sur comment se connecter et enregistrer leurs documents sur les nouveaux postes.", jalon: 2 },
  { text: "On fait le point chaque semaine sur les postes Linux pour repérer les bugs et ce qu'on doit améliorer.", jalon: 2 },

  // Jalon 3 - Intégration
  { text: "La démarche NIRD a été inscrite dans le projet d'établissement, on l'a présenté en conseil d'administration.", jalon: 3 },
  { text: "On travaille maintenant avec la collectivité pour intégrer les postes Linux directement dans leur réseau officiel.", jalon: 3 },
  { text: "On partage maintenant nos résultats pour que d'autres établissements puissent s'en inspirer.", jalon: 3 }
]

const currentPhrase = ref<Phrase | null>(null)
const usedPhrases = ref<Phrase[]>([])
const completedPhrases = ref(0)
const totalPhrases = 3
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')

const jalonNames = ['', 'Mobilisation', 'Expérimentation', 'Intégration']
const jalonColors = ['', '#4a7c59', '#8b1010', '#23429d']

function getRandomPhrase(): Phrase | null {
  if (completedPhrases.value >= totalPhrases) return null
  
  const availablePhrases = phrases.filter(p => !usedPhrases.value.includes(p))
  if (availablePhrases.length === 0) return null

  const randomIndex = Math.floor(Math.random() * availablePhrases.length)
  return availablePhrases[randomIndex]
}

function displayNewPhrase() {
  if (completedPhrases.value >= totalPhrases) {
    return
  }
  
  currentPhrase.value = getRandomPhrase()
}

function openModal(title: string, message: string) {
  modalTitle.value = title
  modalMessage.value = message
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  if (completedPhrases.value >= totalPhrases) {
    resetGame()
  } else {
    displayNewPhrase()
  }
}

function checkAnswer(selectedJalon: number) {
  if (!currentPhrase.value) return

  usedPhrases.value.push(currentPhrase.value)
  completedPhrases.value++

  if (selectedJalon === currentPhrase.value.jalon) {
    if (completedPhrases.value === totalPhrases) {
      openModal(
        'Bravo !',
        `Vous avez terminé ! Cette phrase correspondait bien au <strong style="color: ${jalonColors[selectedJalon]}">Jalon ${selectedJalon} - ${jalonNames[selectedJalon]}</strong>.`
      )
    } else {
      openModal(
        'Correct !',
        `Bonne réponse ! Cette phrase correspond bien au <strong style="color: ${jalonColors[selectedJalon]}">Jalon ${selectedJalon} - ${jalonNames[selectedJalon]}</strong>.`
      )
    }
  } else {
    if (completedPhrases.value === totalPhrases) {
      openModal(
        'Terminé',
        `Cette phrase correspondait au <strong style="color: ${jalonColors[currentPhrase.value.jalon]}">Jalon ${currentPhrase.value.jalon} - ${jalonNames[currentPhrase.value.jalon]}</strong>.<br><br>"${currentPhrase.value.text}"`
      )
    } else {
      openModal(
        'Solution',
        `Cette phrase correspondait au <strong style="color: ${jalonColors[currentPhrase.value.jalon]}">Jalon ${currentPhrase.value.jalon} - ${jalonNames[currentPhrase.value.jalon]}</strong>.<br><br>"${currentPhrase.value.text}"`
      )
    }
  }
}

function resetGame() {
  currentPhrase.value = null
  usedPhrases.value = []
  completedPhrases.value = 0
  displayNewPhrase()
}

onMounted(() => {
  displayNewPhrase()
})
</script>

<style scoped>
@font-face {
  font-family: 'Gensco';
  src: url('/assets/gensco-webfont/GENSCO.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

:root {
  font-family: 'Gensco', 'Times New Roman', serif;
  line-height: 1.5;
  font-weight: 400;
}

.stratege-wrapper {
  display: flex;
  align-items: stretch;
  gap: 0;
  min-height: 100vh;
  width: 100%;
  justify-content: space-between;
  background-image: url('/bgstratege.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.left-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 50px;
  width: 450px;
  flex-shrink: 0;
}

.game-container {
  flex: 1;
  background: #f9f6e8;
  border-top: 8px solid #000000;
  border-left: 8px solid #000000;
  max-width: 1000px;
  border-right: 8px solid #000000;
  padding: 50px;
  position: relative;
  gap: 50px;
  text-align: left;
  display: flex;
  flex-direction: column;
  margin: 20px 20px 0 20px;
  overflow-y: auto;
}

.newspaper-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background-image:
    repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 20px),
    repeating-linear-gradient(90deg, #000, #000 1px, transparent 1px, transparent 20px);
  pointer-events: none;
}

.character-image {
  background: #f5e6d3;
  border: 4px solid #000000;
  margin-bottom: 1rem;
  display: inline-block;
  width: 250px;
  height: 330px;
  overflow: hidden;
}

.character-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.title-section h1 {
  font-size: 3.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: #2a2a2a;
  font-family: 'Gensco', serif;
  letter-spacing: 2px;
}

.barcode {
  font-size: 1.5rem;
  letter-spacing: -2px;
  margin-top: 1rem;
  color: #000000;
}

.content-top {
  display: flex;
  gap: 40px;
  text-align: left;
}

.phrase-card {
  margin: 10px 0;
  transform: rotate(-0.5deg);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.phrase-card:hover {
  transform: rotate(0deg) scale(1.02);
}

.phrase-card p {
  font-size: 2rem;
  line-height: 1.4;
  color: #2a2a2a;
  font-style: italic;
}

.jalons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2.5rem 0 1.5rem;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.jalon {
  flex: 1;
  min-width: 160px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  font-family: 'Gensco', serif;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: transparent;
  border: none;
  position: relative;
}

.jalon::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  width: 120%;
  height: 120%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

.jalon:hover::after {
  opacity: 0.8;
}

.jalon-1::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ctext x='100' y='100' font-family='Gensco' font-size='60' font-weight='bold' fill='%234a7c59' fill-opacity='0.3' text-anchor='middle' dominant-baseline='middle' transform='rotate(-15 100 100)'%3EVALIDE%3C/text%3E%3C/svg%3E");
}

.jalon-2::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ctext x='100' y='100' font-family='Gensco' font-size='60' font-weight='bold' fill='%238b1010' fill-opacity='0.3' text-anchor='middle' dominant-baseline='middle' transform='rotate(-15 100 100)'%3EVALIDE%3C/text%3E%3C/svg%3E");
}

.jalon-3::after {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ctext x='100' y='100' font-family='Gensco' font-size='60' font-weight='bold' fill='%2323429d' fill-opacity='0.3' text-anchor='middle' dominant-baseline='middle' transform='rotate(-15 100 100)'%3EVALIDE%3C/text%3E%3C/svg%3E");
}

.jalon-1 {
  color: #4a7c59;
}

.jalon-2 {
  color: #8b1010;
}

.jalon-3 {
  color: #23429d;
}

.jalon-number {
  font-size: 1.5vw;
  font-weight: bold;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.jalon-name {
  font-size: 2vw;
  font-weight: bold;
}

.score {
  display: none;
  justify-content: space-around;
  gap: 2rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 3px double #000000;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2a2a2a;
  flex-shrink: 0;
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal.show {
  display: flex;
}

.modal-content {
  background: #f9f6e8;
  border: 8px solid #000000;
  padding: 3rem;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: modalAppear 0.3s ease;
}

@keyframes modalAppear {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-content h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2a2a2a;
  font-family: 'Gensco', serif;
}

.modal-content p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #444;
  margin-bottom: 2rem;
}

.modal-content button {
  background: #0e0e0e;
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.4rem;
  cursor: pointer;
  font-family: 'Gensco', serif;
  font-weight: bold;
  transition: all 0.3s ease;
}

.modal-content button:hover {
  background: #000000;
  transform: translateY(-2px);
}

.modal-content button:active {
  transform: translateY(0);
}

.character-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  pointer-events: none;
  align-self: flex-end;
}

.instruction-text {
  font-size: 1.7rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2a2a2a;
  opacity: 0.6;
  font-family: 'Gensco', serif;
  text-align: left;
}

.character-overlay img {
  width: 350px;
  height: auto;
  display: block;
}

.puzzle-instructions {
  position: relative;
  top: 0;
  left: 0;
  background: #f5f4ed;
  padding: 20px 25px;
  border: 3px solid #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  max-width: 300px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  pointer-events: none;
  align-self: flex-start;
}

.puzzle-instructions h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.puzzle-instructions p {
  margin: 0;
  font-size: 14px;
  color: #000;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .left-panel {
    width: 100%;
    padding: 2rem;
  }

  .game-container {
    max-width: 100%;
  }

  .title-section h1 {
    font-size: 2rem;
  }

  .jalons {
    flex-direction: column;
  }
}
</style>
