import { ref, onMounted } from 'vue'

export function useChat() {
  const messages = ref<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>>([])
  const loading = ref(false)

  const config = useRuntimeConfig()
  const base = config.public?.chatApiUrl || 'https://amel2024test.alwaysdata.net'

  // génère un id de conversation (persisté en session) — éviter l'accès à sessionStorage côté SSR
  let conversationId: string | null = null
  if (typeof window !== 'undefined' && window.sessionStorage) {
    conversationId = sessionStorage.getItem('conversationId')
    if (!conversationId) {
      conversationId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now())
      sessionStorage.setItem('conversationId', conversationId as string)
    }
  }

  async function sendMessage(text: string) {
    if (!text) return
    console.log('[useChat] sendMessage called with:', text)
    messages.value.push({ role: 'user', content: text })
    loading.value = true
    try {
      // s'assurer d'avoir une conversationId côté client
      if (!conversationId) {
        conversationId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now())
        console.log('[useChat] Generated new conversationId:', conversationId)
        if (typeof window !== 'undefined' && window.sessionStorage) sessionStorage.setItem('conversationId', conversationId as string)
      }
      // conversationId est maintenant garanti non-null après les vérifications ci-dessus
      const convId = conversationId as string
      console.log('[useChat] Sending to API:', base + '/chat')
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId: convId })
      })

      console.log('[useChat] API response status:', res.status)
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      console.log('[useChat] API response data:', data)
      // si le serveur renvoie un conversationId, on le sauvegarde
      if (data?.conversationId) {
        conversationId = data.conversationId as string
        if (typeof window !== 'undefined' && window.sessionStorage) sessionStorage.setItem('conversationId', conversationId as string)
      }
      // retourner la réponse au caller pour qu'il gère l'affichage (effet d'écriture)
      if (data?.reply) {
        console.log('[useChat] Returning reply:', data.reply)
        return data.reply
      } else {
        console.log('[useChat] No reply in response')
        return 'Erreur: pas de réponse'
      }
    } catch (err) {
      console.error('[useChat] Error in sendMessage:', err)
      return 'Erreur: impossible de contacter l\'API'
    } finally {
      console.log('[useChat] Setting loading to false')
      loading.value = false
    }
  }

  function clear() {
    messages.value = []
    if (typeof window !== 'undefined' && window.sessionStorage) sessionStorage.removeItem('conversationId')
    conversationId = null
  }

  function newChat() {
    // Vider les messages
    messages.value = []
    // Générer un nouveau conversationId
    conversationId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now())
    // Sauvegarder le nouvel ID
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('conversationId', conversationId as string)
    }
  }

  // Charger l'historique côté client si on a un conversationId
  async function loadHistory() {
    if (!conversationId) return
    try {
      const convId = conversationId as string
      const res = await fetch(`${base}/chat/${convId}`)
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      if (data?.history && Array.isArray(data.history)) {
        // remplacer les messages par l'historique (excluant les doublons)
        messages.value = data.history.map((m: any) => ({ role: m.role, content: m.content }))
      }
    } catch (err) {
      console.error('Impossible de charger l\'historique:', err)
    }
  }

  onMounted(() => {
    // au montage client, si un conversationId existe on récupère l'historique
    if (typeof window !== 'undefined' && window.sessionStorage) {
      conversationId = sessionStorage.getItem('conversationId')
    }
    loadHistory()
  })

  return { messages, loading, sendMessage, clear, newChat }
}
