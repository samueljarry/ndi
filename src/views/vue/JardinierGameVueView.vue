<template>
  <View>
    <img 
      v-if="showEnd"
      src="/images/jardinier/EndJardin.png" 
      alt="Background" 
      style="position: fixed; width: 100vw; height: auto; top: -17%; left: 0; z-index: 35;"
    />

    <div class="quiz-container">

    <div style="display: flex;">
      <div class="instr-class">
        <img 
          src="/images/jardinier/Jardinx.svg" 
          alt="Image"
        />
      </div>

      <div class="image-class">
        <img 
          src="/images/jardinier/jardinieur.png" 
          alt="Image"
        />
      </div>
    </div>


      <div class="quiz-content">
        <!-- Questions -->
        <div  class="game-layout">


          <!-- Right Panel - Question -->
          <div class="question-panel">
            <div v-if="!showResult" class="question-reduced">
            <div class="question-header">
              <span class="question-number">QUESTION {{ currentQuestion + 1 }}/{{ questions.length }}</span>
            </div>

            <h2 class="question-text">
              {{ questions[currentQuestion].text }}
            </h2>

            <div class="answers-grid">
              <button
                @click="selectAnswer(2)"
                class="answer-btn"
                :class="{ 'answer-selected': selectedAnswer?.index === 2 }"
              >
                <span class="answer-letter">A</span>
                <span class="answer-label">D'ACCORD</span>
              </button>

              <button
                @click="selectAnswer(1)"
                class="answer-btn"
                :class="{ 'answer-selected': selectedAnswer?.index === 1 }"
              >
                <span class="answer-letter">B</span>
                <span class="answer-label">NEUTRE</span>
              </button>

              <button
                @click="selectAnswer(0)"
                class="answer-btn"
                :class="{ 'answer-selected': selectedAnswer?.index === 0 }"
              >
                <span class="answer-letter">C</span>
                <span class="answer-label">PAS D'ACCORD</span>
              </button>
            </div>

            <div class="navigation-section">
              <button
                v-if="currentQuestion > 0"
                @click="previousQuestion"
                class="nav-btn nav-prev"
              >
                ← Précédent
              </button>
              <button
                v-if="selectedAnswer !== null"
                @click="nextQuestion"
                class="nav-btn nav-next"
              >
                {{ currentQuestion === questions.length - 1 ? 'Voir mon résultat' : 'Suivant →' }}
              </button>
            </div>
            </div>
            <div v-if="showResult">

            <div>
              <img 
                  :src="`/images/jardinier/${resultImage}.png`" 
                  alt="Image"
                  class="result-picture"
                />

              <h2 class="result-title">{{ result?.title }}</h2>

              <p class="result-description">{{ result?.description }}</p>

              <div class="result-details">
                <p>{{ result?.details }}</p>
              </div>

              <p class="result-score">Score total : {{ totalScore }}</p>
            </div>

            <button class="restart-btn" @click="onGameComplete()">
              Retour au village
            </button>
          </div>

          </div>
        </div>

      </div>
    </div>
  </View>
</template>

<script setup lang="ts">
import { GameManager } from '@/managers/GameManager';
import { computed, ref } from 'vue';

const showEnd = ref(false)


const onGameComplete = () => {
  showEnd.value = true
  setTimeout(() => {
    showEnd.value = false
    GameManager.Hide();
  }, 3000);
}

const questions = [
  { text: "Je fais attention à l'impact environnemental des produits que j'utilise au quotidien.", category: "perception" },
  { text: "J'apprécie lorsque des entreprises expliquent comment leurs produits sont fabriqués.", category: "perception" },
  { text: "Je me sens concerné·e par la quantité d'énergie consommée par les objets que j'achète.", category: "perception" },
  { text: "Il est important pour moi qu'un produit soit durable, même s'il coûte un peu plus cher.", category: "marques" },
  { text: "Je fais davantage confiance à une marque lorsqu'elle communique clairement sur ses choix écologiques.", category: "marques" },
  { text: "Je suis sensible à l'utilisation de matériaux recyclés ou recyclables dans un produit.", category: "marques" },
  { text: "Je préfère des objets réparables plutôt que des objets facilement remplaçables.", category: "usage" },
  { text: "Je prête attention à la consommation électrique des appareils que j'utilise.", category: "usage" },
  { text: "Je prends en compte l'impact environnemental dans mes décisions d'achat.", category: "usage" },
  { text: "Les démarches environnementales d'une entreprise influencent positivement mon opinion d'elle.", category: "green" },
  { text: "Je suis plus susceptible d'acheter un produit si sa fabrication limite l'impact écologique.", category: "green" },
  { text: "Je suis réceptif·ve aux labels ou certifications liées à l'écoresponsabilité.", category: "green" }
];



const results = [
  {
    min: 0,
    max: 6,
    title: "Jardin Mort",
    emoji: "🏜️",
    description: "Un terrain en friche",
    details: "Ton approche actuelle montre peu de conscience éco-numérique. C'est le moment idéal pour commencer à explorer des pratiques plus durables et découvrir l'impact de tes choix quotidiens."
  },
  {
    min: 7,
    max: 12,
    title: "Jardin Sec",
    emoji: "🌵",
    description: "Les premières pousses apparaissent",
    details: "Tu as la volonté d'agir, mais peu d'actions concrètes pour l'instant. Continue d'apprendre et de mettre en place des habitudes plus responsables, petit à petit."
  },
  {
    min: 13,
    max: 17,
    title: "Jardin Classique",
    emoji: "🌿",
    description: "Un jardin bien entretenu",
    details: "Tu as une bonne base et tu es conscient·e des enjeux environnementaux. Il te reste à franchir le cap vers une vraie transition écologique dans tes choix quotidiens."
  },
  {
    min: 18,
    max: 22,
    title: "Jardin Vert",
    emoji: "🌳",
    description: "Un espace verdoyant et cohérent",
    details: "Bravo ! Tu es engagé·e et cohérent·e dans ta démarche écoresponsable. Tes choix reflètent une véritable conscience environnementale et tu inspires ton entourage."
  },
  {
    min: 20,
    max: 24,
    title: "Jardin Luxuriant",
    emoji: "🌺",
    description: "Un écosystème florissant",
    details: "Exceptionnel ! Tu incarnes la résilience maximale et la culture du partage. Ton engagement va au-delà de la consommation : tu contribues activement à un monde plus durable."
  }
];

const resultImage = computed(() => {
  if (!result.value) return "4"; // fallback

  switch (result.value.title) {
    case "Jardin Mort":
      return "5"; // le pire
    case "Jardin Sec":
      return "4";
    case "Jardin Classique":
      return "3";
    case "Jardin Vert":
      return "2";
    case "Jardin Luxuriant":
      return "1";
    default:
      return "4";
  }
});


const currentQuestion = ref(0);
const selectedAnswer = ref<{ index: number; score: number } | null>(null);
const answers = ref<number[]>([]);
const showResult = ref(false);

const totalScore = computed(() => {
  return answers.value.reduce((sum, answer) => sum + answer, 0);
});

const result = computed(() => {
  const score = totalScore.value;
  return results.find(r => score >= r.min && score <= r.max);
});

function selectAnswer(index: number) {
  const scoreMap = [0, 1, 2];
  selectedAnswer.value = { index, score: scoreMap[index] };
}

function nextQuestion() {
  if (selectedAnswer.value !== null) {
    answers.value[currentQuestion.value] = selectedAnswer.value.score;
    
    if (currentQuestion.value < questions.length - 1) {
      currentQuestion.value++;
      const savedAnswer = answers.value[currentQuestion.value];
      if (savedAnswer !== undefined) {
        const scoreMap = [0, 1, 2];
        const index = scoreMap.indexOf(savedAnswer);
        selectedAnswer.value = { index, score: savedAnswer };
      } else {
        selectedAnswer.value = null;
      }
    } else {
      showResult.value = true;
    }
  }
}

function previousQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--;
    const savedAnswer = answers.value[currentQuestion.value];
    if (savedAnswer !== undefined) {
      const scoreMap = [0, 1, 2];
      const index = scoreMap.indexOf(savedAnswer);
      selectedAnswer.value = { index, score: savedAnswer };
    } else {
      selectedAnswer.value = null;
    }
  }
}

function restartQuiz() {
  currentQuestion.value = 0;
  selectedAnswer.value = null;
  answers.value = [];
  showResult.value = false;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Homenaje&family=Jaro:opsz@6..72&display=swap');


.result-picture {
  width: 450px;
  margin: 0 auto 30px auto;
  display: block;
}

.quiz-container {
  min-height: 100vh;
  background-image: url("/images/jardinier/image81.png");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-reduced{
  width: 400px;
}

.quiz-content {
  width: 100%;
  max-width: 1400px;
}

/* Game Layout */
.game-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  align-items: start;
}

/* Instruction Panel */
.instruction-panel {
  background: #f5e6d3;
  border: 4px solid #8b4513;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.instruction-title {
  font-size: 24px;
  font-weight: bold;
  color: #2d1810;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.instruction-text {
  font-size: 16px;
  color: #3d2817;
  line-height: 1.6;
}

/* Question Panel */
.question-panel {
  background: #FFF1E9;
  padding: 40px;
  height: 100vh;
  width: 50vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  right: 0;
  top: 0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.question-header {
  text-align: center;
  margin-bottom: 25px;
}

.question-number {
  display: inline-block;

  color: rgb(0, 0, 0);
  padding: 8px 20px;
  font-size: 5rem;
  font-weight: 400;
  letter-spacing: 1px;

  font-family: "Jaro", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

.question-text {
  font-size: 26px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 40px;
  line-height: 1.1;

  font-family: "Homenaje", sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 3rem;
}

/* Answers Grid */
.answers-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}



.image-class {
  position: fixed;
  bottom: 0;
  left: 50px;
  z-index: 10;
  pointer-events: none;
}

.image-class img {
  width: 400px;
  height: auto;
  display: block;
}


.instr-class {
  position: fixed;
  top: 50px;
  left: 50px;
  z-index: 10;
  pointer-events: none;
}

.instr-class img {
  width: 400px;
  height: auto;
  display: block;
}



.answer-btn {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 7px 25px;
  border: 6px solid #2d1810;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 18px;
}

.answer-btn:hover {
  background: #e8f5e9;
  border-color: #4caf50;
  transform: translateX(5px);
}

.answer-btn.answer-selected {
  background: #4caf50;
  border-color: #2e7d32;
  color: white;
}

.answer-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #2d1810;
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 20px;
  flex-shrink: 0;
}

.answer-btn.answer-selected .answer-letter {
  background: white;
  color: #4caf50;
}

.answer-label {
  font-family: "Jaro", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  font-weight: 400;
  font-size: 3rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Navigation */
.navigation-section {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
}

.nav-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-prev {
  background: #9e9e9e;
  color: white;
}

.nav-prev:hover {
  background: #757575;
}

.nav-next {
  background: #4caf50;
  color: white;
  margin-left: auto;
}

.nav-next:hover {
  background: #388e3c;
}

/* Result Layout */
.result-layout {
  background: #fef8f0;
  border: 4px solid #4a90e2;
  border-radius: 12px;
  padding: 60px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.result-content {
  margin-bottom: 40px;
}

.result-emoji {
  font-size: 80px;
  margin-bottom: 20px;
}

.result-title {
  font-size: 42px;
  font-weight: bold;
  color: #2d1810;
  margin-bottom: 15px;
}

.result-description {
  font-size: 24px;
  color: #555;
  margin-bottom: 30px;
}

.result-details {
  background: #e8f5e9;
  border: 3px solid #4caf50;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 30px;
}

.result-details p {
  font-size: 18px;
  color: #2d1810;
  line-height: 1.6;
}

.result-score {
  font-size: 32px;
  font-weight: bold;
  color: #4caf50;
}

.restart-btn {
  padding: 16px 40px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.restart-btn:hover {
  background: #388e3c;
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-layout {
    grid-template-columns: 1fr;
  }

  .instruction-panel {
    order: -1;
  }
}

@media (max-width: 640px) {
  .question-panel {
    padding: 25px;
  }

  .question-text {
    font-size: 20px;
  }

  .answer-btn {
    padding: 15px 20px;
    font-size: 16px;
  }

  .result-layout {
    padding: 30px;
  }

  .result-title {
    font-size: 32px;
  }
}
</style>