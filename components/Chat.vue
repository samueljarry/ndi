<template>
  <div class="chat-root">
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
        </div>
      </transition-group>
    </div>

    <form @submit.prevent="onSubmit" @submit="e => { e.preventDefault(); e.stopPropagation(); return false; }" class="composer">
      <input v-model="input" @focus="skipTyping" @click="skipTyping" :disabled="loading" placeholder="Écrire un message..." />
      <button type="submit" :disabled="loading || !input">Envoyer</button>
      <button type="button" @click="newChat" class="new-chat-btn">Nouveau chat</button>
    </form>
    <div v-if="loading" class="loading">En cours...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, onBeforeUnmount, computed } from 'vue';
import { useChat } from '~/composables/useChat';

const { messages, loading, sendMessage, newChat } = useChat();

const input = ref('');
const scrollRef = ref<HTMLElement | null>(null);
// Ne pas afficher les messages système dans l'UI
const visibleMessages = computed(() => messages.value.filter(m => m.role !== 'system'));

let typingTimer: ReturnType<typeof setInterval> | null = null;

async function onSubmit() {
	console.log('[Chat] onSubmit called');
	try {
		const t = input.value.trim();
		if (!t) return;
		console.log('[Chat] Sending message:', t);
		// Envoi au serveur (la fonction push le message user dans le composable)
		const sendPromise = sendMessage(t);
		// scroll to bottom right after the user message is added
		await scrollToBottom();
		input.value = '';
		// attendre la réponse
		console.log('[Chat] Waiting for reply...');
		const reply = await sendPromise;
		console.log('[Chat] Got reply:', reply);

		// Effet de saisie : ajouter un message assistant vide, puis remplir caractère par caractère
		if (typeof reply === 'string') {
			// annuler un éventuel timer existant
			if (typingTimer) {
				clearInterval(typingTimer);
				typingTimer = null;
			}
			const msgObj = { role: 'assistant', content: '' };
			messages.value.push(msgObj);
			const idx = messages.value.length - 1;
			const speed = 20; // ms par caractère, ajuste pour vitesse
			let i = 0;
			const len = reply.length;
			// scroll to bottom after adding the new assistant placeholder
			await scrollToBottom();
			typingTimer = setInterval(async () => {
				i++;
				// écrire directement dans messages.value[idx] pour garantir la réactivité
				if (messages.value[idx]) {
					messages.value[idx].content = reply.slice(0, i);
				}
				// keep scrolled to bottom while typing
				await nextTick();
				if (scrollRef.value) {
					scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
				}
				if (i >= len) {
					if (typingTimer) {
						clearInterval(typingTimer);
						typingTimer = null;
					}
					// ensure final scroll
					await nextTick();
					if (scrollRef.value) {
						scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
					}
				}
			}, speed);
		}
	}
	catch (err) {
		console.error('[Chat] Error in onSubmit:', err);
		messages.value.push({ role: 'assistant', content: 'Erreur: ' + String(err) });
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

// Si l'utilisateur clique sur l'input pendant la frappe, afficher immédiatement la réponse complète
function skipTyping() {
	if (typingTimer && messages.value.length) {
		// trouver le dernier assistant en cours (celui avec contenu partiel)
		const idx = messages.value.map(m => m.role).lastIndexOf('assistant');
		if (idx >= 0) {
			// récupérer le full reply en cours depuis le timer closure n'est pas trivial;
			// alternative : arrêter le timer et charger l'historique depuis le backend
			clearInterval(typingTimer);
			typingTimer = null;
			// recharger l'historique pour obtenir la réponse complète
			const convId = sessionStorage.getItem('conversationId');
			if (convId) {
				fetch(`${useRuntimeConfig().public.chatApiUrl || 'https://amel2024test.alwaysdata.net'}/chat/${convId}`)
					.then(r => r.json())
					.then((data) => {
						if (data?.history && Array.isArray(data.history)) {
							messages.value = data.history.map((m: Record<string, unknown>) => ({ role: m.role as string, content: m.content as string }));
						}
					})
					.catch(() => {
						// ignore
					});
			}
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
/* Placer le chat au-dessus d'un canvas qui pourrait le recouvrir */
.chat-root{
  border:1px solid var(--color-border,#ddd);
  border-radius:8px;
  padding:12px;
  position:relative;
  z-index:99999; /* très haut pour surplomber le canvas */
  background: rgba(255,255,255,0.95);
}
.messages{
	max-height:60vh;
	overflow-y: auto;
	overflow-x: hidden;
	padding:8px;
	display:flex;
	flex-direction:column;
	gap:8px;
}
.messages > div {
	display:flex;
	flex-direction:column;
	gap:8px;
	width: 100%;
}
.message{ padding:8px 10px; border-radius:6px; max-width:80%; }
.message.user{ align-self:flex-end; background:#dcf8c6; }
.message.assistant{ align-self:flex-start; background:#f1f0f0; }
.message.system{ align-self:center; background:#fff1c6; }
.role{ font-size:11px; opacity:0.7; margin-bottom:4px; }
.composer{ display:flex; gap:8px; margin-top:12px; position:relative; z-index:100000; }
.composer input{ flex:1; padding:8px; border-radius:6px; border:1px solid #ccc; pointer-events:auto; }
.composer button{ padding:8px 12px; border-radius:6px; pointer-events:auto; }
.new-chat-btn{ background:#f0f0f0; border:1px solid #bbb; }
.loading{ margin-top:8px; font-size:13px; color:#666 }

/* Si le canvas capture encore les clics, on peut forcer que le chat reçoive les événements */
.chat-root, .chat-root * { pointer-events: auto; }

/* Fade-in animation for new messages */
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
</style>
