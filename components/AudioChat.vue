<template>
	<div class="audio-chat-root">
		<div ref="scrollRef" class="messages">
			<transition-group
				name="fade"
				tag="div"
			>
				<div
					v-for="(m, i) in visibleMessages"
					:key="m.role + '-' + i"
					:class="['message', m.role]"
				>
					<div class="role">{{ m.role === 'user' ? 'Vous' : 'Amel' }}</div>
					<div class="content">{{ m.content }}</div>
					<!-- <button
						v-if="m.role === 'assistant'"
						@click="playAudio(m.content)"
						class="play-btn"
						:disabled="playingId === (m.role + '-' + i)"
					>
						{{ playingId === (m.role + '-' + i) ? '🔊 Lecture...' : '🔉 Écouter' }}
					</button> -->
				</div>
			</transition-group>
		</div>

		<form @submit.prevent="onSubmit" class="composer">
			<input
				ref="inputElement"
				v-model="input"
				@focus="skipTyping"
				@click="skipTyping"
				:disabled="loading"
				placeholder="Écrire un message..."
			/>
		</form>
		<div v-if="loading" class="loading">En cours...</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useChat } from '~/composables/useChat'

const { messages, loading, sendMessage, newChat } = useChat()

const input = ref('')
const inputElement = ref<HTMLInputElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const playingId = ref<string | null>(null)
const visibleMessages = computed(() => messages.value.filter(m => m.role !== 'system'))

let typingTimer: ReturnType<typeof setInterval> | null = null

async function onSubmit() {
	const t = input.value.trim()
	if (!t) return
	const sendPromise = sendMessage(t);
	await scrollToBottom();
	input.value = '';
	// Re-focus input après envoi
	if (inputElement.value) {
		inputElement.value.focus();
	}
	const reply = await sendPromise;

	if (typeof reply === 'string') {
		if (typingTimer) {
			clearInterval(typingTimer)
			typingTimer = null
		}
		const msgObj = { role: 'assistant', content: '' }
		messages.value.push(msgObj)
		const idx = messages.value.length - 1
		const speed = 20
		let i = 0
		const len = reply.length
		let lastSentenceEnd = 0
		await scrollToBottom()
		
		// Lancer la lecture du texte complet dès le départ
		await playAudio(reply)
		
		typingTimer = setInterval(() => {
			i++
			if (messages.value[idx]) {
				messages.value[idx].content = reply.slice(0, i)
			}
			if (scrollRef.value) {
				scrollRef.value.scrollTop = scrollRef.value.scrollHeight
			}
			if (i >= len) {
				if (typingTimer) {
					clearInterval(typingTimer)
					typingTimer = null
				}
				nextTick().then(() => {
					if (scrollRef.value) {
						scrollRef.value.scrollTop = scrollRef.value.scrollHeight
					}
				})
			}
		}, speed)
	}
}

async function playAudio(text: string) {
	if (!text) return
	try {
		playingId.value = text.slice(0, 20) // id temporaire
		const config = useRuntimeConfig()
		const base = config.public?.chatApiUrl || 'https://amel2024test.alwaysdata.net'
		
		const response = await fetch(`${base}/tts`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text, lang: 'fr' })
		})

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}))
			throw new Error(errData.error || `HTTP ${response.status}`)
		}
		
		const audioBlob = await response.blob()
		if (audioBlob.size === 0) {
			throw new Error('Audio blob vide')
		}

		const audioUrl = URL.createObjectURL(audioBlob)
		const audio = new Audio(audioUrl)
		
		// Créer un contexte audio pour analyser le son
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
		const analyser = audioContext.createAnalyser()
		analyser.fftSize = 256
		const bufferLength = analyser.frequencyBinCount
		const dataArray = new Uint8Array(bufferLength)
		
		// Connecter l'audio à l'analyseur
		const source = audioContext.createMediaElementSource(audio)
		source.connect(analyser)
		analyser.connect(audioContext.destination)
		
		// Fonction pour extraire le niveau audio et le diffuser
		let animationFrameId: number
		const updateAudioLevel = () => {
			analyser.getByteFrequencyData(dataArray)
			const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
			const level = average / 255 // Normaliser entre 0 et 1
			
			// Diffuser l'événement pour le cube Three.js
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('audioLevel', { detail: { level } }))
			}
			
			if (audio.paused || audio.ended) {
				cancelAnimationFrame(animationFrameId)
				// Remettre le niveau à 0 quand l'audio s'arrête
				window.dispatchEvent(new CustomEvent('audioLevel', { detail: { level: 0 } }))
			} else {
				animationFrameId = requestAnimationFrame(updateAudioLevel)
			}
		}
		
		audio.onended = () => {
			playingId.value = null
			URL.revokeObjectURL(audioUrl)
			cancelAnimationFrame(animationFrameId)
			window.dispatchEvent(new CustomEvent('audioLevel', { detail: { level: 0 } }))
		}
		audio.onerror = (e) => {
			playingId.value = null
			console.error('Erreur lecture audio:', e)
			URL.revokeObjectURL(audioUrl)
			cancelAnimationFrame(animationFrameId)
		}
		
		// Ajouter un petit délai avant de lire (s'assurer que le DOM est à jour)
		setTimeout(() => {
			audio.play().then(() => {
				updateAudioLevel() // Démarrer l'analyse audio
			}).catch((err) => {
				console.error('Erreur play():', err)
				playingId.value = null
			})
		}, 100)
	} catch (err) {
		console.error('Erreur TTS:', err)
		playingId.value = null
	}
}

function skipTyping() {
	if (typingTimer && messages.value.length) {
		const idx = messages.value.map(m => m.role).lastIndexOf('assistant')
		if (idx >= 0) {
			clearInterval(typingTimer)
			typingTimer = null
			const convId = sessionStorage.getItem('conversationId')
			if (convId) {
				fetch(`${useRuntimeConfig().public.chatApiUrl || 'https://amel2024test.alwaysdata.net'}/chat/${convId}`)
					.then(r => r.json())
					.then(data => {
						if (data?.history && Array.isArray(data.history)) {
							messages.value = data.history.map((m: any) => ({ role: m.role, content: m.content }))
						}
					}).catch(() => {})
			}
		}
	}
}

async function scrollToBottom() {
	await nextTick();
	// Attendre que les animations de transition se terminent
	await new Promise((resolve) => {
		setTimeout(resolve, 100);
	});
	if (scrollRef.value) {
		try {
			// Utiliser requestAnimationFrame pour garantir le scroll après le rendu
			requestAnimationFrame(() => {
				if (scrollRef.value) {
					scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
				}
			});
		}
		catch {
			// ignore
		}
	}
}

onBeforeUnmount(() => {
	if (typingTimer) {
		clearInterval(typingTimer);
		typingTimer = null;
	}
});

watch(messages, () => {
	// scroll to bottom avec un délai pour s'assurer que le DOM est mis à jour
	nextTick().then(() => {
		if (scrollRef.value) {
			scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
		}
	});
	// Deuxième scroll plus agressif après les animations
	setTimeout(() => {
		requestAnimationFrame(() => {
			if (scrollRef.value) {
				scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
			}
		});
	}, 100);
}, { deep: true });

onMounted(() => {
	// Scroll initial immédiat
	if (scrollRef.value) {
		scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
	}

	// Scroll après le render
	nextTick().then(() => {
		if (scrollRef.value) {
			scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
		}
	});

	// Scroll agressif pour l'historique
	setTimeout(() => {
		if (scrollRef.value) {
			scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
		}
		requestAnimationFrame(() => {
			if (scrollRef.value) {
				scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
			}
		});
	}, 200);
});
</script>

<style scoped>
.audio-chat-root{
	border: 5px solid #000000;
	border-radius: 0px;
	padding:12px;
	position:relative;
	z-index:99999;
	max-width: 500px;
	background: #FFF1E9;
}
.messages{ max-height:60vh; overflow:auto; padding:8px 0; display:flex; flex-direction:column; gap:8px; }
.messages > div {
	display:flex;
	flex-direction:column;
	gap:8px;
	width: 100%;
}
.message{ padding:8px 10px; border-radius:6px; max-width:80%; }
.message.user{
	align-self:flex-end;
	background:transparent;
	text-align: right;
}
.message.user .role {
	text-align: right;
}
.message.assistant{
	align-self:flex-start;
	background: #000000;
	color: #FFFFFF;
}
.message.assistant .role {
	color: #FFFFFF;
}
.message.system{ align-self:center; background:#fff1c6; }
.role{ font-size:11px; opacity:0.7; margin-bottom:4px; }
.content{ margin-bottom:6px; }
.play-btn{ font-size:12px; padding:4px 8px; border-radius:4px; border:1px solid #999; background:#fff; cursor:pointer; }
.play-btn:hover{ background:#f0f0f0; }
.play-btn:disabled{ opacity:0.6; cursor:not-allowed; }
.composer{ display:flex; gap:8px; margin-top:12px; position:relative; z-index:100000; }
.composer input{ flex:1; padding:8px; border-radius:6px; border:1px solid #ccc; pointer-events:auto; }
.composer button{ padding:8px 12px; border-radius:6px; pointer-events:auto; }
.new-chat-btn{ background:#f0f0f0; border:1px solid #bbb; }
.loading{ margin-top:8px; font-size:13px; color:#666 }

.fade-enter-active {
	transition: opacity 240ms ease, transform 240ms ease;
}
.fade-enter-from {
	opacity: 0;
	transform: translateY(6px);
}
.fade-enter-to {
	opacity: 1;
	transform: translateY(0);
}

.audio-chat-root, .audio-chat-root * { pointer-events: auto; }
</style>
