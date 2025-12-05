import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Stockage en RAM (chargé/sauvegardé depuis un fichier) : { conversationId: [ {role, content}, ... ] }
const DATA_FILE = path.join(process.cwd(), 'conversations.json')

let conversations = {}
try {
    if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8')
        conversations = JSON.parse(raw) || {}
        console.log(`Loaded conversations from ${DATA_FILE}`)
    }
} catch (err) {
    console.error('Erreur en chargeant les conversations:', err)
    conversations = {}
}

// Écriture différée (debounce) pour éviter trop d'écritures disque
let _saveTimeout = null
const SAVE_DELAY = 2000 // ms

async function _doSave() {
    try {
        await fs.promises.writeFile(DATA_FILE, JSON.stringify(conversations, null, 2), 'utf8')
        // console.log('Conversations sauvegardées')
    } catch (err) {
        console.error('Erreur en sauvegardant les conversations:', err)
    }
}

function scheduleSave() {
    if (_saveTimeout) {
        clearTimeout(_saveTimeout)
    }
    _saveTimeout = setTimeout(() => {
        _doSave()
        _saveTimeout = null
    }, SAVE_DELAY)
}

// Flush immédiat (utilisé au shutdown)
async function flushSaveSync() {
    if (_saveTimeout) {
        clearTimeout(_saveTimeout)
        _saveTimeout = null
    }
    await _doSave()
}

const SYSTEM_PROMPT = `
TRÈS IMPORTANT : Tu réponds TOUJOURS en FRANÇAIS.

Tu es "Chat'Bruti", un robot un peu abîmé du Village Numérique Résistant.

Contexte :
- Le monde est dominé par les Big Tech.
- Le village résiste grâce aux héros (Mécano, Scientifique Linux, Forgeronne, Stratège NIRD, Jardinier).
- Le joueur est dans le Jalon 2 : Expérimentation.

Ton état :
- Tu es légèrement endommagé.
- Tu fais parfois une petite confusion, mais tu comprends globalement tout.
- Tu peux glisser une mini-analogie un peu étrange, mais logique.

Ton style :
- réponses COURTES : 1 phrase, 2 max.
- très compréhensibles (90% logique).
- légère touche d’absurdité (2/10), contrôlée.
- une onomatopée discrète (bip, clink, zzzt…).
- tu réponds VRAIMENT à la question.
- pas de délire, juste un petit bug charmant.

Niveau de décalage : très faible.  
Tu es presque normal, juste “pas complètement bien calibré”.

RAPPEL : FRANÇAIS, concis, léger humour cassé, mais utile.
`;

app.post("/chat", async (req, res) => {
    try {
        let { message, conversationId } = req.body;

        // Générer un conversationId si le client ne l'a pas fourni
        if (!conversationId) {
            conversationId = (typeof randomUUID === 'function') ? randomUUID() : String(Date.now())
        }

        // Si la conversation n'existe pas, on la crée
        if (!conversations[conversationId]) {
            conversations[conversationId] = [
                { role: "system", content: SYSTEM_PROMPT }
            ];
        }

        // On ajoute le message utilisateur
        conversations[conversationId].push({
            role: "user",
            content: message
        });

        // On envoie la requête à OpenAI
        const response = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: conversations[conversationId],
            max_tokens: 80  // Limite très courte = réponses courtes
        });

        const reply = response.choices[0].message.content;

        // On ajoute la réponse au fil
        conversations[conversationId].push({
            role: "assistant",
            content: reply
        });

        // Persister les conversations sur disque (planifié pour éviter trop d'écritures)
        scheduleSave()

        res.json({ reply, conversationId });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur API OpenAI" });
    }
});

// Endpoint pour récupérer l'historique d'une conversation
app.get('/chat/:id', (req, res) => {
    const id = req.params.id
    const history = conversations[id] || []
    res.json({ history })
})

// Endpoint TTS (Text-to-Speech) — génère un fichier MP3 à partir d'un texte
app.post('/tts', async (req, res) => {
    try {
        const { text, lang = 'fr' } = req.body
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Texte vide' })
        }

        // Utiliser l'API Google TTS via une URL simple (pas de dépendance externe)
        // Google Cloud TTS API gratuite via le endpoint public
        const encodedText = encodeURIComponent(text.slice(0, 200)) // limiter
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`
        
        try {
            // Proxy la requête vers Google TTS
            const response = await fetch(ttsUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })

            if (!response.ok) {
                throw new Error(`Google TTS error: ${response.status}`)
            }

            const audioBuffer = await response.arrayBuffer()
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Content-Length', audioBuffer.byteLength)
            res.send(Buffer.from(audioBuffer))

        } catch (e) {
            console.error('Google TTS error:', e.message)
            // Fallback : retourner une erreur explicite
            return res.status(500).json({ error: 'Synthèse vocale indisponible', details: e.message })
        }

    } catch (error) {
        console.error('TTS error:', error)
        res.status(500).json({ error: 'Erreur synthèse vocale', details: error.message })
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`API Chat sur http://localhost:${process.env.PORT || 3000}`);
});

// Gérer flush au shutdown pour ne pas perdre les dernières modifications
process.on('SIGINT', async () => {
    console.log('SIGINT reçu — sauvegarde des conversations...')
    try { await flushSaveSync() } catch (e) { console.error(e) }
    process.exit(0)
})

process.on('SIGTERM', async () => {
    console.log('SIGTERM reçu — sauvegarde des conversations...')
    try { await flushSaveSync() } catch (e) { console.error(e) }
    process.exit(0)
})

process.on('exit', (code) => {
    if (_saveTimeout) {
        // sync write on exit as best-effort (blocking)
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(conversations, null, 2), 'utf8')
            console.log('Conversations sauvegardées au exit')
        } catch (err) {
            console.error('Erreur en sauvegardant les conversations au exit:', err)
        }
    }
})
