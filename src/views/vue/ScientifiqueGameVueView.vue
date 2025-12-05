<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { GameManager } from '@/managers/GameManager'

const showStartScreen = ref(true)
const showGame = ref(false)
const cursedMode = ref(true)
let timerActive = false
let timeLeft = 0
let fleeEnabled = true
let idleTimer = 0
let hasInteracted = false
let popupCount = 0
let typingCount = 0

const targetWords = ['WinDOS_Xpire', 'WinD0S_Spire', 'Win10_Expire', 'WinDOS_Inspire']

const letterMap: { [key: string]: string } = {
  'w': 'm', 'W': 'M',
  'i': 'l', 'I': 'L',
  'n': 'u', 'N': 'U',
  'd': 'p', 'D': 'P',
  'o': '0', 'O': '0',
  's': 'z', 'S': 'Z',
  'x': 'k', 'X': 'K',
  'p': 'd', 'P': 'D',
  'r': 'v', 'R': 'V',
  'e': '3', 'E': '3'
}

const fakeTips = [
  {
    title: 'Mise à jour importante',
    message: 'Achetez WinDOS Pro pour désinstaller votre propre système !'
  },
  {
    title: 'Assistant WinDOS',
    message: 'Astuce : revenez demain, le système sera peut-être d\'humeur.'
  },
  {
    title: 'Erreur système',
    message: 'Avez-vous essayé de redémarrer ? Encore ?'
  },
  {
    title: 'Support technique',
    message: 'Pour continuer, contactez notre support au 1-800-BIG-TECH.'
  },
  {
    title: 'Notification',
    message: 'Ce problème sera résolu dans une prochaine mise à jour (2027).'
  },
  {
    title: 'Attention',
    message: 'Votre licence WinDOS expire dans 3... 2... 1... Maintenant.'
  },
  {
    title: 'Publicité',
    message: 'Gagnez un iPhone gratuit ! Cliquez ici ! (Ne cliquez pas)'
  }
]

function deleteEveryOtherLetter(input: HTMLInputElement) {
  const value = input.value
  if (value.length > 5 && Math.random() > 0.92) {
    const chars = value.split('')
    const filtered = chars.filter((_, i) => i % 2 === 0)
    input.value = filtered.join('')
    showError('Erreur 0xDEBIL : saisie incorrecte.', document.getElementById('error') as HTMLDivElement)
  }
}

function setupFleeBehavior(container: HTMLDivElement, input: HTMLInputElement) {
  container.addEventListener('mouseenter', () => {
    if (!fleeEnabled || !cursedMode.value || Math.random() > 0.3) return
    
    const maxX = window.innerWidth - container.offsetWidth - 40
    const maxY = window.innerHeight - container.offsetHeight - 40
    
    const newX = Math.random() * maxX
    const newY = Math.random() * maxY
    
    container.style.position = 'fixed'
    container.style.left = `${newX}px`
    container.style.top = `${newY}px`
    container.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    
    setTimeout(() => {
      container.style.position = 'relative'
      container.style.left = ''
      container.style.top = ''
    }, 2000)
  })
}

function toggleInputDisabled(input: HTMLInputElement) {
  setInterval(() => {
    if (!cursedMode.value) return
    
    if (Math.random() > 0.85) {
      input.disabled = true
      input.placeholder = 'Champ occupé par un processus propriétaire…'
      input.style.opacity = '0.5'
      
      setTimeout(() => {
        input.disabled = false
        input.placeholder = 'Tapez le nom du système...'
        input.style.opacity = '1'
      }, 1000)
    }
  }, 6000)
}

function startRidiculousTimer(input: HTMLInputElement, timerDiv: HTMLDivElement, timeSpan: HTMLSpanElement, errorDiv: HTMLDivElement) {
  if (timerActive || !cursedMode.value) return
  
  timerActive = true
  timeLeft = 3.5
  timerDiv.style.display = 'block'
  
  const interval = setInterval(() => {
    timeLeft -= 0.1
    timeSpan.textContent = timeLeft.toFixed(1)
    
    if (timeLeft <= 0) {
      clearInterval(interval)
      showError('Temps dépassé. Essayons encore 😁', errorDiv)
      input.value = ''
      setTimeout(() => {
        timerActive = false
        timerDiv.style.display = 'none'
      }, 2000)
    }
  }, 100)
}

function createPopup() {
  if (!cursedMode.value || popupCount > 3) return
  
  const tip = fakeTips[Math.floor(Math.random() * fakeTips.length)]
  
  const popup = document.createElement('div')
  popup.className = 'xp-popup'
  popup.style.left = `${Math.random() * (window.innerWidth - 400)}px`
  popup.style.top = `${Math.random() * (window.innerHeight - 300) + 50}px`
  
  popup.innerHTML = `
    <div class="xp-popup-titlebar">
      <div class="xp-popup-title">
        <div class="xp-popup-icon"></div>
        <span>${tip.title}</span>
      </div>
      <button class="xp-popup-close">✕</button>
    </div>
    <div class="xp-popup-content">
      <div class="xp-popup-icon-large">⚠️</div>
      <div class="xp-popup-text">
        <p>${tip.message}</p>
      </div>
    </div>
    <div class="xp-popup-buttons">
      <button class="xp-btn">OK</button>
      <button class="xp-btn">Annuler</button>
    </div>
  `
  
  document.body.appendChild(popup)
  popupCount++
  
  setTimeout(() => {
    popup.style.opacity = '1'
    popup.style.transform = 'scale(1)'
  }, 10)
  
  const closeBtn = popup.querySelector('.xp-popup-close') as HTMLButtonElement
  const okBtn = popup.querySelectorAll('.xp-btn')[0] as HTMLButtonElement
  const cancelBtn = popup.querySelectorAll('.xp-btn')[1] as HTMLButtonElement
  
  const closePopup = () => {
    popup.style.opacity = '0'
    popup.style.transform = 'scale(0.8)'
    setTimeout(() => {
      popup.remove()
      popupCount--
    }, 200)
  }
  
  closeBtn.addEventListener('click', closePopup)
  okBtn.addEventListener('click', closePopup)
  cancelBtn.addEventListener('click', closePopup)
  
  let isDragging = false
  let currentX = 0
  let currentY = 0
  let initialX = 0
  let initialY = 0
  
  const titlebar = popup.querySelector('.xp-popup-titlebar') as HTMLDivElement
  
  titlebar.addEventListener('mousedown', (e) => {
    isDragging = true
    initialX = e.clientX - currentX
    initialY = e.clientY - currentY
    popup.style.zIndex = '2000'
  })
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      currentX = e.clientX - initialX
      currentY = e.clientY - initialY
      popup.style.left = `${currentX}px`
      popup.style.top = `${currentY}px`
    }
  })
  
  document.addEventListener('mouseup', () => {
    isDragging = false
  })
  
  setTimeout(() => {
    if (document.body.contains(popup)) {
      closePopup()
    }
  }, 8000)
}

const showEnd = ref(false)


function unlockSuccess(message: string, explosionDiv: HTMLDivElement, successDiv: HTMLDivElement) {
  cursedMode.value = false
  const input = document.getElementById('cursed-input') as HTMLInputElement
  input.disabled = true
  
  explosionDiv.innerHTML = '💥'
  explosionDiv.style.display = 'block'
  
  setTimeout(() => {
    explosionDiv.style.display = 'none'
    successDiv.innerHTML = `
      <div class="xp-success-titlebar">
        <div class="xp-success-title">
          <div class="xp-success-icon"></div>
          <span>Installation de Linux terminée</span>
        </div>
      </div>
      <div class="xp-success-body">
        <div class="success-icon-container">
          <div class="tux-container">
            <div class="tux-body"></div>
            <div class="tux-belly"></div>
            <div class="tux-wing tux-wing-left"></div>
            <div class="tux-wing tux-wing-right"></div>
            <div class="tux-face">
              <div class="tux-eye tux-eye-left"></div>
              <div class="tux-eye tux-eye-right"></div>
              <div class="tux-beak"></div>
            </div>
            <div class="tux-feet">
              <div class="tux-foot tux-foot-left"></div>
              <div class="tux-foot tux-foot-right"></div>
            </div>
          </div>
        </div>
        <div class="success-content">
          <h2 style="color: #000000;">${message}</h2>
          <p>Le système Linux a été installé avec succès.</p>
          <p class="success-details">WinDOS XPiré a été complètement supprimé de votre ordinateur.</p>
          <div class="success-progress-complete">
            <div class="progress-bar-complete">
              <div class="progress-fill-complete"></div>
            </div>
            <span class="progress-label">Installation terminée !</span>
          </div>
        </div>
      </div>
      <div class="xp-success-footer">
        <button class="xp-btn xp-btn-primary" id="redemarrer-btn">Redémarrer</button>
        <button class="xp-btn" id="terminer-btn">Terminer</button>
      </div>
    `
    successDiv.style.display = 'block'
    
    setTimeout(() => {
      const progressFill = document.querySelector('.progress-fill-complete') as HTMLDivElement
      if (progressFill) {
        progressFill.style.width = '100%'
      }
    }, 500)
    
    // Ajouter l'event listener au bouton Terminer
    const terminerBtn = document.getElementById('terminer-btn') as HTMLButtonElement
    if (terminerBtn) {
      terminerBtn.addEventListener('click', handleTerminer)
    }
    
    // Ajouter l'event listener au bouton Redémarrer
    const redemarrerBtn = document.getElementById('redemarrer-btn') as HTMLButtonElement
    if (redemarrerBtn) {
      redemarrerBtn.addEventListener('click', handleTerminer)
    }

    showEnd.value = true
    setTimeout(() => {
      showEnd.value = false
      GameManager.Hide();
    }, 4000);
    
    createConfetti()
  }, 1000)
}

function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + '%'
    confetti.style.animationDelay = Math.random() * 3 + 's'
    confetti.textContent = ['🐧', '🎉', '✨', '🎊'][Math.floor(Math.random() * 4)]
    document.body.appendChild(confetti)
    
    setTimeout(() => confetti.remove(), 5000)
  }
}

function showError(message: string, errorDiv: HTMLDivElement) {
  errorDiv.textContent = '❌ ' + message
  errorDiv.style.display = 'block'
  
  setTimeout(() => {
    errorDiv.style.display = 'none'
  }, 2000)
}

function updateClock(clockSpan: HTMLSpanElement) {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  clockSpan.textContent = `${hours}:${minutes}`
}

function startGame() {
  // Ajouter la classe d'animation au écran de démarrage
  const startScreen = document.querySelector('.start-screen') as HTMLDivElement
  if (startScreen) {
    startScreen.classList.add('crt-shutdown')
    
    // Attendre la fin de l'animation avant de passer au jeu
    setTimeout(() => {
      showStartScreen.value = false
      showGame.value = true
      
      // Attendre le rendu
      setTimeout(() => {
        const gameContainer = document.querySelector('.scientifique-game-container') as HTMLDivElement
        const gameOverlay = document.querySelector('.game-overlay') as HTMLDivElement
        if (gameContainer) {
          gameContainer.classList.add('crt-startup')
          // Retirer la classe après l'animation pour voir le contenu
          setTimeout(() => {
            gameContainer.classList.remove('crt-startup')
            // Faire disparaître l'overlay noir
            if (gameOverlay) {
              gameOverlay.style.display = 'none'
            }
          }, 800)
        }
        initializeGameLogic()
      }, 100)
    }, 800)
  }
}

function initializeGameLogic() {
  const input = document.getElementById('cursed-input') as HTMLInputElement
  const container = document.getElementById('input-container') as HTMLDivElement
  const errorDiv = document.getElementById('error') as HTMLDivElement
  const targetTextSpan = document.getElementById('target-text') as HTMLSpanElement
  const timerDiv = document.getElementById('timer') as HTMLDivElement
  const timeSpan = document.getElementById('time') as HTMLSpanElement
  const dialogueP = document.getElementById('dialogue') as HTMLParagraphElement
  const explosionDiv = document.getElementById('explosion') as HTMLDivElement
  const successDiv = document.getElementById('success') as HTMLDivElement
  const clockSpan = document.getElementById('clock') as HTMLSpanElement

  // Update clock
  updateClock(clockSpan)
  setInterval(() => updateClock(clockSpan), 1000)

  // Setup behaviors
  setupFleeBehavior(container, input)
  toggleInputDisabled(input)

  // Input handlers
  input.addEventListener('input', () => {
    if (!cursedMode.value) return
    
    hasInteracted = true
    const originalValue = input.value
    
    if (Math.random() > 0.75) {
      const lastChar = originalValue[originalValue.length - 1]
      if (lastChar && letterMap[lastChar]) {
        input.value = originalValue.slice(0, -1) + letterMap[lastChar]
        showError('Saisie détectée comme non conforme au protocole Big Tech.', errorDiv)
      }
    }
    
    if (Math.random() > 0.93 && originalValue.length > 5) {
      deleteEveryOtherLetter(input)
    }
    
    idleTimer = 0
    
    if (input.value === 'WinDOS_Xpire') {
      unlockSuccess('Désinstallation réussie !', explosionDiv, successDiv)
    }
  })

  input.addEventListener('keydown', () => {
    if (!cursedMode.value) return
    typingCount++
    if (typingCount === 15 && !timerActive) {
      setTimeout(() => startRidiculousTimer(input, timerDiv, timeSpan, errorDiv), 500)
    }
  })

  // Popup interval
  setInterval(() => {
    if (cursedMode.value && Math.random() > 0.75) {
      createPopup()
    }
  }, 6000)

  // Idle timer
  setInterval(() => {
    if (!cursedMode.value || !hasInteracted) return
    
    idleTimer++
    
    if (idleTimer >= 300) {
      dialogueP.textContent = 'Vous n\'utilisez pas ma licence ? Je me retire ! 😤'
      setTimeout(() => {
        unlockSuccess('L\'ancien OS a rage-quit ! 🎮', explosionDiv, successDiv)
      }, 1500)
    }
  }, 100)

  input.focus()
}

function handleTerminer() {
    showEnd.value = true
    setTimeout(() => {
      showEnd.value = false
      GameManager.Hide();
    }, 4000);
}

onMounted(async () => {
  await nextTick()
  // Tout est géré par startGame
})
</script>

<template>

  <img 
      v-if="showEnd"
      src="/images/scien/EndScien.png" 
      alt="Background" 
      style="position: fixed; width: 100vw; height: auto; top: -17%; left: 0; z-index: 35;"
    />

  <div class="scientifique-game-wrapper">
    <!-- Overlay noir -->
    <div v-if="showStartScreen || showGame" class="game-overlay"></div>
    
    <!-- Écran de démarrage -->
    <div v-if="showStartScreen" class="start-screen">
      <div class="start-bg" style="background-image: url('/bgscientifique.png')"></div>
      <img src="/persolinux.png" alt="Personnage" class="start-character" />
      <div class="start-info">
        <h1>WinDOS_XPire</h1>
        <p>Réussis à remplir le champ de désinstallation de Windows pour installer Linux — malgré son comportement totalement ingérable.</p>
      </div>
      <div class="pc-screen" @click="startGame">
        <div class="pc-monitor">
          <div class="pc-screen-bezel">
            <div class="pc-screen-content">
              <img src="/windowsgamescreen.png" alt="Aperçu du jeu" />
            </div>
          </div>
          <div class="pc-stand"></div>
        </div>
      </div>
    </div>

    <!-- Écran du jeu -->
    <div v-if="showGame" class="scientifique-game-container">
      <div class="windows-xp-desktop">
        <div class="xp-window">
          <div class="xp-titlebar">
            <div class="xp-titlebar-left">
              <div class="xp-icon"></div>
              <span class="xp-title">Désinstallation de WinDOS XPiré</span>
            </div>
            <div class="xp-titlebar-buttons">
              <button class="xp-button xp-minimize">_</button>
              <button class="xp-button xp-maximize">□</button>
              <button class="xp-button xp-close">✕</button>
            </div>
          </div>
          
          <div class="xp-content">
            <div class="xp-wizard-main">
              <div class="xp-header-section">
                <div class="xp-icon-large"></div>
                <h3 class="xp-wizard-title">Désinstaller WinDOS XPiré</h3>
              </div>
              
              <div class="xp-dialog" id="dialogue">
                <p>⚠️ Cette opération est irréversible. Pour confirmer la désinstallation, tapez le nom exact du système ci-dessous.</p>
              </div>
              
              <div class="xp-form-group">
                <label class="xp-label">
                  Nom du système à désinstaller :
                </label>
                <div class="xp-instruction" id="instruction">
                  <strong id="target-text">WinDOS_Xpire</strong>
                </div>
                
                <div class="timer" id="timer">⏰ Temps restant : <span id="time">∞</span>s</div>
                
                <div class="input-container" id="input-container">
                  <input 
                    type="text" 
                    id="cursed-input" 
                    class="xp-textbox"
                    placeholder="Tapez le nom du système..."
                    autocomplete="off"
                  />
                </div>
              </div>
              
              <div class="error-message" id="error"></div>
              <div class="fake-tips" id="tips"></div>
              
              <div class="xp-progress-section">
                <div class="progress-bar">
                  <div class="progress-fill" id="progress"></div>
                </div>
                <p class="progress-text">En attente de confirmation...</p>
              </div>
              
              <div class="xp-buttons">
                <button class="xp-btn xp-btn-primary" disabled>< Précédent</button>
                <button class="xp-btn xp-btn-primary" id="next-btn" disabled>Suivant ></button>
                <button class="xp-btn" id="cancel-btn">Annuler</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="xp-taskbar">
          <button class="xp-start-button">
            <div class="start-icon"></div>
            <span>Démarrer</span>
          </button>
          <div class="xp-taskbar-items">
            <div class="xp-taskbar-item active">
              <div class="taskbar-icon"></div>
              Désinstallation de WinDOS XPiré
            </div>
          </div>
          <div class="xp-system-tray">
            <span class="xp-clock" id="clock">12:00</span>
          </div>
        </div>
        
        <div class="explosion" id="explosion"></div>
        <div class="success-message" id="success"></div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

.scientifique-game-wrapper {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  line-height: 1.5;
  color: #000000;
}

/* Écran de démarrage */
.start-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  overflow: hidden;
}

.start-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/bgscientifique.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

/* 📺 Animation CRT old-school shutdown */
.start-screen.crt-shutdown {
  animation: crtShutdown 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes crtShutdown {
  0% {
    transform: scale(1, 1);
    filter: brightness(1) contrast(1);
    opacity: 1;
  }
  50% {
    transform: scale(1, 0.01);
    filter: brightness(2) contrast(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(0, 0.01);
    filter: brightness(0) contrast(0);
    opacity: 0;
  }
}

.start-screen.crt-shutdown::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: scanlines 0.1s linear infinite;
  pointer-events: none;
  z-index: 10001;
}

@keyframes scanlines {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(10px);
  }
}

/* 📺 Animation CRT au démarrage */
.scientifique-game-container.crt-startup {
  animation: crtStartup 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes crtStartup {
  0% {
    transform: scale(0, 0.01);
    filter: brightness(0) contrast(0);
    opacity: 0;
  }
  50% {
    transform: scale(1, 0.01);
    filter: brightness(2) contrast(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1, 1);
    filter: brightness(1) contrast(1);
    opacity: 1;
  }
}

.scientifique-game-container.crt-startup::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  animation: scanlines 0.1s linear infinite;
  pointer-events: none;
  z-index: 10001;
}

/* Overlay noir derrière le jeu */
.game-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  z-index: 999;
  pointer-events: none;
}

.start-character {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 50vh;
  max-height: 600px;
  width: auto;
  z-index: 9999;
  pointer-events: none;
  object-fit: contain;
}

.start-info {
  position: fixed;
  top: 80px;
  left: 60px;
  background: #f5f4ed;
  padding: 25px 30px;
  border: 3px solid #000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  max-width: 400px;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
}

.start-info h1 {
  margin: 0 0 15px 0;
  font-size: 22px;
  font-weight: bold;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.start-info p {
  margin: 0;
  font-size: 15px;
  color: #000;
  line-height: 1.6;
}

/* Écran de PC cliquable */
.pc-screen {
  position: fixed;
  right: 120px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
}

.pc-screen:hover {
  transform: translateY(-50%) scale(1.05);
  filter: brightness(1.1);
}

.pc-screen:active {
  transform: translateY(-50%) scale(0.98);
}

.pc-monitor {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pc-screen-bezel {
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.8),
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
}

.pc-screen-bezel::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 8px;
  background: #444;
  border-radius: 4px;
}

.pc-screen-content {
  width: 700px;
  height: 525px;
  background: #000;
  border: 2px solid #0a0a0a;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9);
}

.pc-screen-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.02) 50%,
    transparent 100%
  );
  pointer-events: none;
  animation: screenGlow 2s ease-in-out infinite;
}

@keyframes screenGlow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.pc-screen-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pc-stand {
  width: 120px;
  height: 15px;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  border-radius: 0 0 8px 8px;
  margin-top: 5px;
  position: relative;
}

.pc-stand::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 15px;
  background: linear-gradient(145deg, #333 0%, #222 100%);
  border-radius: 4px;
}

.scientifique-game-container {
  position: relative;
  z-index: 1000;
  width: 100%;
  height: 100vh;
  background-image: url('/windowsbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  position: relative;
  background-color: #1e4d8b;
}

.scientifique-game-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 150, 255, 0.05) 0%,
    rgba(0, 100, 200, 0.05) 100%);
  pointer-events: none;
}

/* Windows XP Desktop Styles */
.windows-xp-desktop {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url('/windowsbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #1e4d8b;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* XP Window */
.xp-window {
  width: 100%;
  max-width: 700px;
  background: #ece9d8;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  z-index: 10;
}

.xp-titlebar {
  background: linear-gradient(180deg, #0997ff 0%, #0053ee 50%, #0050ee 50%, #06f 100%);
  padding: 3px 5px 3px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
}

.xp-titlebar-left {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.xp-icon {
  width: 16px;
  height: 16px;
  background: #0066cc;
  border: 1px solid #0066cc;
}

.xp-titlebar-buttons {
  display: flex;
  gap: 2px;
}

.xp-button {
  width: 21px;
  height: 21px;
  border: none;
  background: linear-gradient(180deg, #f1f1f1 0%, #c3c3c3 100%);
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 1px 1px 0 rgba(255, 255, 255, 0.7);
}

.xp-button:hover {
  background: linear-gradient(180deg, #fff 0%, #d5d5d5 100%);
}

.xp-button:active {
  background: linear-gradient(180deg, #c3c3c3 0%, #f1f1f1 100%);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.3);
}

.xp-close {
  background: linear-gradient(180deg, #ff5542 0%, #d63e2e 100%);
  color: white;
}

.xp-close:hover {
  background: linear-gradient(180deg, #ff7766 0%, #ff5542 100%);
}

.xp-content {
  background: #ece9d8;
  min-height: 400px;
}

.xp-wizard-main {
  flex: 1;
  padding: 20px 30px;
  background: #fff;
}

.xp-header-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.xp-icon-large {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b5a 0%, #e5453a 50%, #cc2818 100%);
  border-radius: 8px;
  box-shadow: 
    0 4px 10px rgba(204, 40, 24, 0.4),
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.2);
}

.xp-wizard-title {
  font-size: 16px;
  font-weight: bold;
  color: #003399;
  margin: 0;
}

.xp-dialog {
  background: #ffffcc;
  border: 1px solid #c0c0c0;
  padding: 12px;
  margin: 15px 0;
  border-radius: 3px;
}

.xp-dialog p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.xp-form-group {
  margin: 20px 0;
}

.xp-label {
  display: block;
  font-size: 12px;
  margin-bottom: 8px;
  color: #000;
}

.xp-instruction {
  background: #e0e0ff;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #8080ff;
  border-radius: 3px;
  text-align: center;
  font-size: 14px;
}

#target-text {
  color: #cc0000;
  font-weight: bold;
}

.timer {
  font-size: 12px;
  color: #ff0000;
  font-weight: bold;
  display: none;
  padding: 4px;
  background: #ffcccc;
  border-left: 3px solid #ff0000;
}

.input-container {
  position: relative;
  display: flex;
}

.xp-textbox {
  flex: 1;
  padding: 3px;
  border: 2px inset #c0c0c0;
  font-family: inherit;
  font-size: 12px;
  background: white;
  color: #000000;
}

.xp-textbox:focus {
  outline: none;
  border: 2px inset #c0c0c0;
}

.error-message {
  font-size: 12px;
  color: #ff0000;
  background: #ffcccc;
  padding: 4px;
  border-left: 3px solid #ff0000;
  display: none;
}

.fake-tips {
  font-size: 11px;
  color: #666666;
  padding: 4px;
  background: #f0f0f0;
  border-left: 2px solid #c0c0c0;
}

.xp-progress-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-bar {
  height: 16px;
  background: #c0c0c0;
  border: 2px inset #dfdfdf;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(to right, #0a246a 0%, #1084d7 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #666666;
  margin: 0;
}

.xp-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
}

.xp-btn {
  padding: 4px 12px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  cursor: pointer;
  font-size: 12px;
  min-width: 60px;
  font-family: 'Tahoma', sans-serif;
}

.xp-btn:hover:not(:disabled) {
  background: linear-gradient(to bottom, #f0ede4 0%, #dfd6ce 100%);
}

.xp-btn:active:not(:disabled) {
  border-color: #808080 #dfdfdf #dfdfdf #808080;
}

.xp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.xp-btn-primary {
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
}

/* Taskbar */
.xp-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 34px;
  background: linear-gradient(180deg, #4d9eff 0%, #2d7ee6 45%, #1d6ecc 55%, #1460b3 100%);
  border-top: 2px solid #6db0ff;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 3px;
  box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 1000;
}

.xp-start-button {
  padding: 2px 6px;
  background: linear-gradient(145deg, #5ecd5e 0%, #3aaa3a 50%, #2a8c2a 100%);
  border: none;
  border-radius: 0 10px 10px 0;
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  font-size: 11px;
  font-weight: bold;
  color: white;
  font-family: inherit;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  height: 28px;
}

.start-icon {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.xp-taskbar-items {
  display: flex;
  gap: 4px;
  flex: 1;
}

.xp-taskbar-item {
  flex: 0 1 auto;
  padding: 4px 10px;
  background: linear-gradient(145deg, #4d9eff 0%, #2d7ee6 50%, #1d6ecc 100%);
  border: 1px solid #1460b3;
  font-size: 11px;
  color: white;
  display: flex;
  align-items: center;
  gap: 2px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.xp-taskbar-item.active {
  background: linear-gradient(145deg, #1d6ecc 0%, #1460b3 50%, #0d509a 100%);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2);
}

.taskbar-icon {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #e8e8e8 100%);
  border-radius: 2px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.xp-system-tray {
  margin-left: auto;
  padding-right: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: linear-gradient(145deg, #2daeff 0%, #1d8ee6 50%, #0f72c7 100%);
  border-left: 2px solid #1460b3;
  padding-left: 4px;
  height: 100%;
  box-shadow: inset 2px 0 5px rgba(0, 0, 0, 0.2);
}

.xp-clock {
  font-size: 11px;
  color: white;
  padding: 2px 4px;
  font-weight: bold;
}

/* Popups */
.xp-popup {
  position: fixed;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  box-shadow: 1px 1px 0 #ffffff inset, 1px 1px 0 #808080;
  min-width: 300px;
  z-index: 1000;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.xp-popup-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #000080 0%, #1084d7 100%);
  padding: 2px;
  cursor: move;
}

.xp-popup-title {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.xp-popup-icon {
  width: 16px;
  height: 16px;
  background: #0066cc;
}

.xp-popup-close {
  width: 16px;
  height: 14px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xp-popup-content {
  padding: 8px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  display: flex;
  gap: 12px;
  min-height: 60px;
}

.xp-popup-icon-large {
  font-size: 32px;
  flex-shrink: 0;
}

.xp-popup-text {
  flex: 1;
}

.xp-popup-text p {
  margin: 0;
  font-size: 12px;
  color: #000000;
}

.xp-popup-buttons {
  padding: 8px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border-top: 1px solid #dfdfdf;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Popups */
.xp-popup {
  position: fixed;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  box-shadow: 1px 1px 0 #ffffff inset, 1px 1px 0 #808080;
  min-width: 300px;
  z-index: 1000;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  border-radius: 3px;
}

.xp-popup-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #000080 0%, #1084d7 100%);
  padding: 2px;
  cursor: move;
}

.xp-popup-title {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.xp-popup-icon {
  width: 16px;
  height: 16px;
  background: #0066cc;
}

.xp-popup-close {
  width: 16px;
  height: 14px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border: 1px solid;
  border-color: #dfdfdf #808080 #808080 #dfdfdf;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xp-popup-close:active {
  border-color: #808080 #dfdfdf #dfdfdf #808080;
}

.xp-popup-content {
  padding: 8px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  display: flex;
  gap: 12px;
  min-height: 60px;
}

.xp-popup-icon-large {
  font-size: 32px;
  flex-shrink: 0;
}

.xp-popup-text {
  flex: 1;
}

.xp-popup-text p {
  margin: 0;
  font-size: 12px;
  color: #000000;
}

.xp-popup-buttons {
  padding: 8px;
  background: linear-gradient(to bottom, #ece9d8 0%, #d3ccc4 100%);
  border-top: 1px solid #dfdfdf;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Success Message */
/* Message de succès - Low Poly 3D */
.success-message {
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 8px 8px 0 0;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    0 5px 20px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  min-width: 550px;
  animation: successPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform-style: preserve-3d;
  overflow: hidden;
}

@keyframes successPop {
  0% {
    transform: translate(-50%, -50%) scale(0) rotateY(-90deg);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotateY(0deg);
    opacity: 1;
  }
}

.xp-success-titlebar {
  background: linear-gradient(180deg, 
    #3d95ff 0%, 
    #1573e6 45%, 
    #0d5ecc 55%, 
    #0a4fb3 100%);
  padding: 5px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.xp-success-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.3px;
}

.xp-success-icon {
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #00dd00 0%, #00aa00 100%);
  border-radius: 3px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.xp-success-body {
  display: flex;
  gap: 25px;
  padding: 30px;
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
}

.success-icon-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 🐧 Tux Low Poly */
.tux-container {
  position: relative;
  width: 120px;
  height: 140px;
  animation: tuxFloat 3s ease-in-out infinite;
}

@keyframes tuxFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(-2deg); }
  50% { transform: translateY(0px) rotate(0deg); }
  75% { transform: translateY(-8px) rotate(2deg); }
}

.tux-body {
  position: absolute;
  width: 80px;
  height: 90px;
  background: linear-gradient(145deg, #2c2c2c 0%, #1a1a1a 100%);
  border-radius: 40% 40% 30% 30% / 50% 50% 40% 40%;
  top: 25px;
  left: 20px;
  box-shadow: 
    0 5px 15px rgba(0, 0, 0, 0.3),
    inset -5px -5px 10px rgba(0, 0, 0, 0.4),
    inset 5px 5px 10px rgba(255, 255, 255, 0.1);
  transform: perspective(200px) rotateX(5deg);
}

.tux-belly {
  position: absolute;
  width: 50px;
  height: 65px;
  background: linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%);
  border-radius: 50%;
  top: 40px;
  left: 35px;
  box-shadow: 
    inset 2px 2px 5px rgba(0, 0, 0, 0.1),
    0 2px 5px rgba(255, 255, 255, 0.5);
  z-index: 1;
}

.tux-wing {
  position: absolute;
  width: 30px;
  height: 50px;
  background: linear-gradient(145deg, #2c2c2c 0%, #1a1a1a 100%);
  border-radius: 50%;
  top: 50px;
  box-shadow: 
    0 3px 8px rgba(0, 0, 0, 0.3),
    inset -2px -2px 5px rgba(0, 0, 0, 0.4);
  transform: perspective(100px) rotateY(25deg);
}

.tux-wing-left {
  left: 10px;
  transform: perspective(100px) rotateY(-25deg);
  animation: wingFlap 2s ease-in-out infinite;
}

.tux-wing-right {
  right: 10px;
  transform: perspective(100px) rotateY(25deg);
  animation: wingFlap 2s ease-in-out infinite 1s;
}

@keyframes wingFlap {
  0%, 100% { transform: perspective(100px) rotateY(25deg) rotateZ(0deg); }
  50% { transform: perspective(100px) rotateY(25deg) rotateZ(-10deg); }
}

.tux-face {
  position: absolute;
  width: 60px;
  height: 40px;
  top: 15px;
  left: 30px;
  z-index: 2;
}

.tux-eye {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%);
  border-radius: 50%;
  top: 8px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.tux-eye::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: #000;
  border-radius: 50%;
  top: 3px;
  left: 3px;
}

.tux-eye-left {
  left: 12px;
}

.tux-eye-right {
  right: 12px;
}

.tux-beak {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 12px solid #ff9500;
  top: 20px;
  left: 22px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
  transform: perspective(50px) rotateX(10deg);
}

.tux-feet {
  position: absolute;
  bottom: 5px;
  left: 25px;
  width: 70px;
  display: flex;
  justify-content: space-between;
  z-index: 0;
}

.tux-foot {
  width: 25px;
  height: 15px;
  background: linear-gradient(145deg, #ff9500 0%, #dd7700 100%);
  border-radius: 50% 50% 40% 40%;
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.3),
    inset 1px 1px 2px rgba(255, 165, 0, 0.3);
  transform: perspective(50px) rotateX(20deg);
}

.tux-foot-left {
  animation: footTap 2s ease-in-out infinite;
}

.tux-foot-right {
  animation: footTap 2s ease-in-out infinite 1s;
}

@keyframes footTap {
  0%, 100% { transform: perspective(50px) rotateX(20deg); }
  50% { transform: perspective(50px) rotateX(30deg) translateY(2px); }
}

/* Contenu du succès */
.success-content {
  flex: 1;
}

.success-content h2 {
  color: #000000;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.success-content p {
  color: #000;
  font-size: 13px;
  margin: 10px 0;
  line-height: 1.5;
}

.success-details {
  color: #666 !important;
  font-size: 12px !important;
  font-style: italic;
}

.success-progress-complete {
  margin-top: 25px;
}

.progress-bar-complete {
  width: 100%;
  height: 24px;
  background: linear-gradient(145deg, #e0e0e0 0%, #d0d0d0 100%);
  border: 2px solid #8090a0;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 
    inset 2px 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.3);
}

.progress-fill-complete {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, 
    #00cc00 0%, 
    #00ff00 50%, 
    #00cc00 100%);
  transition: width 1.5s ease-out;
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.progress-fill-complete::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-label {
  display: block;
  font-size: 11px;
  color: #006600;
  font-weight: bold;
  margin-top: 8px;
}

.xp-success-footer {
  display: flex;
  gap: 10px;
  padding: 15px 30px;
  background: linear-gradient(145deg, #f0f0f0 0%, #e8e8e8 100%);
  justify-content: flex-end;
  border-radius: 0 0 8px 8px;
}

/* Explosion effect */
.explosion {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 100px;
  display: none;
  animation: explode 0.8s ease-out;
  z-index: 9999;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* Confetti */
.confetti {
  position: fixed;
  font-size: 24px;
  animation: fall 3s ease-out forwards;
  z-index: 9998;
}

@keyframes fall {
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>