<template>
  <div class="snake3d-page">
        <div class="hud">
          <button @click="start" v-if="!running">Start</button>
          <button @click="pause" v-if="running">Pause</button>
          <button @click="reset">Reset</button>
        </div>
        <div class="survival-bar" aria-hidden="false">
          <div class="survival-fill" :style="{ width: (survivalRemaining / TOTAL_SURVIVAL * 100) + '%' }"></div>
          <div class="survival-label">{{ Math.max(0, survivalRemaining.toFixed(0)) }}s</div>
        </div>

        <div class="bonus-bar" aria-hidden="true">
            <h2 class="bonus-title">Bonnus</h2>
            <div class="bonus-items">
          <div class="bonus-item">
            <div class="bonus-icon slow" title="Slow"></div>
            <div class="bonus-label">Slow (8s)</div>
          </div>
          <div class="bonus-item">
            <div class="bonus-icon inv" title="Invincible"></div>
            <div class="bonus-label">Invinsibilité (5s)</div>
          </div>
          <div class="bonus-item">
            <div class="bonus-icon rev" title="Reverse"></div>
            <div class="bonus-label">Reverse (10s)</div>
          </div>
          </div>
        </div>

        <transition name="overlay-fade">
          <div v-if="showOverlay && !gameOver" class="start-full-overlay" role="dialog" aria-modal="true">
            <div class="start-box">
            <h1 class="start-title">Snake Reverse</h1>
              <div class="start-text">Échappe au virus pendant 1 minute ! Utilise les bonus pour t’aider et désinstalle le virus le plus rapidement possible grâce à ton antivirus <br><br>(tu ne joue pas le snake mais le carré rouge) <br><br>Utilisez les flèches pour vous déplacer</div>
              <button class="play-button" @click="start">Play</button>
            </div>
          </div>
        </transition>

        <div class="split">
          <div class="left">
            <div ref="container" class="render-wrap"></div>
          </div>
          <div class="right">
            <canvas ref="minimap" class="minimap" width="240" height="240" aria-hidden="true"></canvas>
          </div>
        </div>
    <transition name="overlay-fade">
      <div v-if="gameOver" class="start-overlay" role="dialog" aria-modal="true">
        <div class="start-box">
          <div class="start-text">
            <template v-if="gameResult === 'won'">
              Bravo vous avez attrapé le virus !
            </template>
            <template v-else>
              Partie terminée<br/>Vous avez survécu: {{ timeAlive.toFixed(1) }}s
            </template>
          </div>
          <button class="replay-button" @click="leave">Quitter</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { GameManager } from '../src/managers/GameManager';

const COLS = 20
const ROWS = 20
const TILE = 1

const leave = () => {
  GameManager.HideSnake();
}

const container = ref<HTMLDivElement | null>(null)
let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
const minimap = ref<HTMLCanvasElement | null>(null)
let minimapCtx: CanvasRenderingContext2D | null = null

const walls = ref<{ x: number; y: number }[]>([])
const snake = ref<{ x: number; y: number }[]>([])
const running = ref(false)
const gameOver = ref(false)
const timeAlive = ref(0)
const gameResult = ref<'alive'|'dead'|'won'>('alive')

const showOverlay = ref(true)

const TOTAL_SURVIVAL = 60
const survivalRemaining = ref(TOTAL_SURVIVAL)

const apple = ref<{ x: number; y: number }>({ x: Math.floor(COLS/2), y: Math.floor(ROWS/2) })
let lastTime = performance.now()
let tickAcc = 0
const TICK_RATE = 5 
const GROW_INTERVAL = 1
let growAcc = 0
let growNext = false

let lastAppleDir = new THREE.Vector3(0, 0, -1)
let lastAppleDirSmooth = new THREE.Vector3(0, 0, -1)
let appleWorldPos = new THREE.Vector3()
let targetAppleWorld = new THREE.Vector3()
const MOVE_LERP = 10
const TURN_SMOOTH = 8
const CAMERA_HEIGHT = 0.6
const LOOK_TARGET_Y = 0.2

const wallMeshes: THREE.Mesh[] = []
const snakeMeshes: THREE.Mesh[] = []
let extraLight: THREE.PointLight | null = null
const bonuses = ref<Array<{ x:number;y:number; type: 'slow'|'inv'|'rev' }>>([])
const bonusMeshes: THREE.Mesh[] = []

let spawnAcc = 0
let nextSpawn = 6 + Math.random() * 6

let slowExpire = 0
let invExpire = 0
let revExpire = 0
const DEFAULT_SNAKE_SPEED = TICK_RATE
let baseSnakeSpeed = DEFAULT_SNAKE_SPEED
let snakeSpeed = baseSnakeSpeed

function gridToWorld(p: { x: number; y: number }) {
  const wx = (p.x - COLS/2 + 0.5) * TILE
  const wz = (p.y - ROWS/2 + 0.5) * TILE
  return new THREE.Vector3(wx, 0, wz)
}

function placeWalls() {
  walls.value = []
  const total = COLS * ROWS
  const count = Math.max(1, Math.floor(total * 0.08))
  const taken = new Set<string>()
  taken.add(`${apple.value.x},${apple.value.y}`)
  while (walls.value.length < count) {
    const x = Math.floor(Math.random() * COLS)
    const y = Math.floor(Math.random() * ROWS)
    const key = `${x},${y}`
    if (taken.has(key)) continue
    taken.add(key)
    walls.value.push({ x, y })
  }
}

function resetScene() {
  for (const m of wallMeshes) { scene.remove(m) }
  wallMeshes.length = 0
  for (const m of snakeMeshes) { scene.remove(m) }
  snakeMeshes.length = 0

  apple.value = { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) }
  placeWalls()
  snake.value = [{ x: 0, y: 0 }]
  timeAlive.value = 0
  gameOver.value = false
  growAcc = 0
  growNext = false

  const mat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d })
  const geo = new THREE.BoxGeometry(TILE, TILE, TILE)
  for (const w of walls.value) {
    const m = new THREE.Mesh(geo, mat)
    const pos = gridToWorld(w)
    m.position.set(pos.x, TILE/2, pos.z)
    scene.add(m)
    wallMeshes.push(m)
  }

  for (const m of bonusMeshes) scene.remove(m)
  bonusMeshes.length = 0
  for (const b of bonuses.value) {
    const color = b.type === 'slow' ? 0x4da6ff : b.type === 'inv' ? 0xffd24d : 0xb48cff
    const bgeo = new THREE.SphereGeometry(TILE*0.28, 8, 8)
    const bmat = new THREE.MeshStandardMaterial({ color })
    const bm = new THREE.Mesh(bgeo, bmat)
    const pw = gridToWorld(b)
    bm.position.set(pw.x, TILE*0.25, pw.z)
    scene.add(bm)
    bonusMeshes.push(bm)
  }

  const sgeo = new THREE.BoxGeometry(TILE*0.9, TILE*0.9, TILE*0.9)
  const smat = new THREE.MeshStandardMaterial({ color: 0x4ee1a0 })
  for (let i = 0; i < snake.value.length; i++) {
    const m = new THREE.Mesh(sgeo, smat)
    const pos = gridToWorld(snake.value[i])
    m.position.set(pos.x, TILE/2, pos.z)
    scene.add(m)
    snakeMeshes.push(m)
  }
  const wp = gridToWorld(apple.value)
  appleWorldPos.set(wp.x, wp.y, wp.z)
  targetAppleWorld.set(wp.x, wp.y, wp.z)
  lastAppleDirSmooth.copy(lastAppleDir)
  bonuses.value = []
  for (const m of bonusMeshes) scene.remove(m)
  bonusMeshes.length = 0
  spawnAcc = 0
  nextSpawn = 6 + Math.random() * 6
  slowExpire = 0
  invExpire = 0
  revExpire = 0
  snakeSpeed = baseSnakeSpeed
  survivalRemaining.value = TOTAL_SURVIVAL
  gameResult.value = 'alive'
}

function findPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const queue: Array<{ x: number; y: number }>=[]
  const visited = new Set<string>()
  const parent = new Map<string,string>()
  const key = (p: {x:number;y:number})=>`${p.x},${p.y}`
  queue.push(from)
  visited.add(key(from))
  const deltas = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}]
  while (queue.length) {
    const cur = queue.shift()!
    if (cur.x === to.x && cur.y === to.y) {
      const path: {x:number;y:number}[] = []
      let k = key(cur)
      while (k !== key(from)) {
        const parts = k.split(',').map(Number)
        path.push({x:parts[0], y:parts[1]})
        k = parent.get(k) as string
      }
      path.reverse()
      return path
    }
    for (const d of deltas) {
      const nx = cur.x + d.x
      const ny = cur.y + d.y
      const nk = `${nx},${ny}`
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue
      if (visited.has(nk)) continue
      if (walls.value.some(w => w.x === nx && w.y === ny)) continue
      if (snake.value.some(s => s.x === nx && s.y === ny)) continue
      visited.add(nk)
      parent.set(nk, key(cur))
      queue.push({x:nx,y:ny})
    }
  }
  return null
}

function stepSnake(grow = false) {
  const head = snake.value[0]
  if (revExpire > 0) {
    const deltas = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}]
    let best = head
    let bestDist = -Infinity
    for (const d of deltas) {
      const nx = head.x + d.x
      const ny = head.y + d.y
      if (nx<0||nx>=COLS||ny<0||ny>=ROWS) continue
      if (walls.value.some(w=>w.x===nx&&w.y===ny)) continue
      if (snake.value.some(s=>s.x===nx&&s.y===ny)) continue
      const dist = Math.abs(nx-apple.value.x)+Math.abs(ny-apple.value.y)
      if (dist > bestDist) { bestDist = dist; best = {x:nx,y:ny} }
    }
    snake.value.unshift(best)
  } else {
    const path = findPath(head, apple.value)
    if (!path || path.length === 0) {
      const deltas = [{x:0,y:1},{x:0,y:-1},{x:1,y:0},{x:-1,y:0}]
      let best = head
      let bestDist = Infinity
      for (const d of deltas) {
        const nx = head.x + d.x
        const ny = head.y + d.y
        if (nx<0||nx>=COLS||ny<0||ny>=ROWS) continue
        if (walls.value.some(w=>w.x===nx&&w.y===ny)) continue
        if (snake.value.some(s=>s.x===nx&&s.y===ny)) continue
        const dist = Math.abs(nx-apple.value.x)+Math.abs(ny-apple.value.y)
        if (dist < bestDist) { bestDist = dist; best = {x:nx,y:ny} }
      }
      snake.value.unshift(best)
    } else {
      snake.value.unshift(path[0])
    }
  }
  if (!grow) snake.value.pop()
}

function updateMeshes() {
  while (snakeMeshes.length < snake.value.length) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(TILE*0.9,TILE*0.9,TILE*0.9), new THREE.MeshStandardMaterial({color:0x72d6a3}))
    scene.add(m)
    snakeMeshes.push(m)
  }
  for (let i=0;i<snakeMeshes.length;i++) {
    const p = snake.value[i]
    if (!p) { snakeMeshes[i].visible = false; continue }
    snakeMeshes[i].visible = true
    const pos = gridToWorld(p)
    snakeMeshes[i].position.set(pos.x, TILE/2, pos.z)
    snakeMeshes[i].material = new THREE.MeshStandardMaterial({color: i===0?0x4ee1a0:0x72d6a3})
  }
}

function drawMinimap(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const w = canvas.width / (window.devicePixelRatio || 1)
  const h = canvas.height / (window.devicePixelRatio || 1)
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#07101a'
  ctx.fillRect(0, 0, w, h)

  const cellW = w / COLS
  const cellH = h / ROWS

  ctx.fillStyle = '#7f8c8d'
  for (const p of walls.value) {
    ctx.fillRect(p.x * cellW, p.y * cellH, cellW, cellH)
  }

  for (let i = 0; i < snake.value.length; i++) {
    const s = snake.value[i]
    ctx.fillStyle = i === 0 ? '#4ee1a0' : '#72d6a3'
    ctx.fillRect(s.x * cellW + 1, s.y * cellH + 1, cellW - 2, cellH - 2)
  }

  if (apple.value) {
    ctx.fillStyle = '#ff6b6b'
    ctx.fillRect(apple.value.x * cellW + 2, apple.value.y * cellH + 2, cellW - 4, cellH - 4)
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.strokeRect(0, 0, w, h)

  for (const b of bonuses.value) {
    if (b.type === 'slow') ctx.fillStyle = '#4da6ff'
    else if (b.type === 'inv') ctx.fillStyle = '#ffd24d'
    else ctx.fillStyle = '#b48cff'
    ctx.beginPath()
    ctx.arc((b.x + 0.5) * cellW, (b.y + 0.5) * cellH, Math.min(cellW, cellH) * 0.28, 0, Math.PI*2)
    ctx.fill()
  }
}

const keys = new Set<string>()
let currentDir: string | null = null
let desiredDir: string | null = null
let turnAcc = 0
const TURN_DELAY = 0.14
function normKey(e: KeyboardEvent) {
  if (e.key.startsWith('Arrow')) return e.key.replace('Arrow', '').toLowerCase() 
  if (e.key.length === 1) return e.key.toLowerCase()
  return e.key
}
function onKeyDown(e: KeyboardEvent) {
  const k = normKey(e)
  keys.add(k)
  if (k === 'up' || k === 'down' || k === 'left' || k === 'right') e.preventDefault()
}
function onKeyUp(e: KeyboardEvent) { keys.delete(normKey(e)) }

function moveAppleStep() {
  if (!currentDir) return
  let nx = apple.value.x
  let ny = apple.value.y
  if (currentDir === 'up') ny -= 1
  else if (currentDir === 'down') ny += 1
  else if (currentDir === 'left') nx -= 1
  else if (currentDir === 'right') nx += 1
  if (nx>=0 && nx< COLS && ny>=0 && ny<ROWS && !walls.value.some(w=>w.x===nx&&w.y===ny)) {
    const dx = nx - apple.value.x
    const dy = ny - apple.value.y
    if (dx !== 0 || dy !== 0) {
      lastAppleDir.set(dx, 0, dy)
      const tw = gridToWorld({ x: nx, y: ny })
      targetAppleWorld.set(tw.x, tw.y, tw.z)
    }
    apple.value = { x:nx, y:ny }
  }
}

function start(restart=false) {
  if (restart) reset()
  running.value = true
  showOverlay.value = false
}
function pause() { running.value = false }

function reset() {
  resetScene()
}

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
  renderer = new THREE.WebGLRenderer({ antialias: true })
  const cw = container.value!.clientWidth || window.innerWidth
  const ch = container.value!.clientHeight || window.innerHeight
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(dpr)
  renderer.setSize(cw, ch)
  container.value!.style.position = 'relative'
  const canvasEl = renderer.domElement
  canvasEl.style.position = 'absolute'
  canvasEl.style.left = '0'
  canvasEl.style.top = '0'
  canvasEl.style.width = '100%'
  canvasEl.style.height = '100%'
  canvasEl.style.zIndex = '0'
  canvasEl.tabIndex = 0
  canvasEl.style.outline = 'none'
  canvasEl.addEventListener('click', () => { try { (canvasEl as HTMLElement).focus() } catch (e) {} })
  container.value!.appendChild(canvasEl)

  const light = new THREE.DirectionalLight(0xffffff, 0.9)
  light.position.set(5,10,7)
  scene.add(light)
  extraLight = new THREE.PointLight(0xfff0d6, 0.7, 10)
  extraLight.position.set(0, 1.5, 0)
  scene.add(extraLight)
  scene.add(new THREE.AmbientLight(0x404040))

  const floorGeo = new THREE.PlaneGeometry(COLS*TILE, ROWS*TILE)
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0b1220 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI/2
  scene.add(floor)

  resetScene()

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  function onSpaceKey(e: KeyboardEvent) {
    if (e.code !== 'Space') return
    if (showOverlay && showOverlay.value) return
    if (gameOver.value) return
    if (running.value) pause()
    else start()
  }
  window.addEventListener('keydown', onSpaceKey)
  window.addEventListener('resize', () => {
    if (container.value) {
      const cw = container.value.clientWidth
      const ch = container.value.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(dpr)
      renderer.setSize(cw, ch)
    } else {
      const cw = window.innerWidth
      const ch = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      camera.aspect = cw / ch
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(dpr)
      renderer.setSize(cw, ch)
    }
    if (minimap.value) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cssW = minimap.value.clientWidth || 160
      const cssH = minimap.value.clientHeight || 160
      minimap.value.width = Math.floor(cssW * dpr)
      minimap.value.height = Math.floor(cssH * dpr)
      minimapCtx = minimap.value.getContext('2d')
      if (minimapCtx) minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  })

  function spawnBonus() {
    const occupied = new Set<string>()
    for (const s of snake.value) occupied.add(`${s.x},${s.y}`)
    for (const w of walls.value) occupied.add(`${w.x},${w.y}`)
    occupied.add(`${apple.value.x},${apple.value.y}`)
    for (const b of bonuses.value) occupied.add(`${b.x},${b.y}`)
    const empty: {x:number;y:number}[] = []
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) {
      const k = `${x},${y}`
      if (!occupied.has(k)) empty.push({x,y})
    }
    if (empty.length === 0) return
    const idx = Math.floor(Math.random()*empty.length)
    const pos = empty[idx]
    const r = Math.random()
    const type: 'slow'|'inv'|'rev' = r < 0.4 ? 'slow' : r < 0.8 ? 'inv' : 'rev'
    bonuses.value.push({ x: pos.x, y: pos.y, type })
    const color = type === 'slow' ? 0x4da6ff : type === 'inv' ? 0xffd24d : 0xb48cff
    const bgeo = new THREE.SphereGeometry(TILE*0.28, 8, 8)
    const bmat = new THREE.MeshStandardMaterial({ color })
    const bm = new THREE.Mesh(bgeo, bmat)
    const pw = gridToWorld(pos)
    bm.position.set(pw.x, TILE*0.25, pw.z)
    scene.add(bm)
    bonusMeshes.push(bm)
  }

  function animate(now:number) {
    requestAnimationFrame(animate)
    const dt = (now - lastTime)/1000
    lastTime = now
    if (running.value && !gameOver.value) {
      timeAlive.value += dt
      growAcc += dt
      if (growAcc >= GROW_INTERVAL) { growAcc -= GROW_INTERVAL; growNext = true }

      spawnAcc += dt
      if (spawnAcc >= nextSpawn) {
        spawnAcc = 0
        nextSpawn = 6 + Math.random() * 10
        spawnBonus()
      }

      if (slowExpire > 0) { slowExpire -= dt; if (slowExpire <= 0) { snakeSpeed = baseSnakeSpeed; slowExpire = 0 } }
      if (invExpire > 0) { invExpire -= dt; if (invExpire <= 0) { invExpire = 0 } }
      if (revExpire > 0) { revExpire -= dt; if (revExpire <= 0) { revExpire = 0 } }

      survivalRemaining.value -= dt
      if (survivalRemaining.value <= 0) {
        survivalRemaining.value = 0
        gameResult.value = 'dead'
        gameOver.value = true
        running.value = false
      }

      const appleStepSec = 1 / TICK_RATE
      const snakeStepSec = 1 / Math.max(0.5, snakeSpeed)

      window['__appleAcc'] = window['__appleAcc'] || 0
      window['__snakeAcc'] = window['__snakeAcc'] || 0
      window['__appleAcc'] += dt
      window['__snakeAcc'] += dt

      if (window['__appleAcc'] >= appleStepSec) {
        let d: string | null = null
        if (keys.has('w') || keys.has('up')) d = 'up'
        else if (keys.has('s') || keys.has('down')) d = 'down'
        else if (keys.has('a') || keys.has('left')) d = 'left'
        else if (keys.has('d') || keys.has('right')) d = 'right'
        desiredDir = d
        if (desiredDir === currentDir) { turnAcc = 0 }
        else if (!desiredDir) { turnAcc = 0; currentDir = null }
        else { turnAcc += appleStepSec; if (turnAcc >= TURN_DELAY) { currentDir = desiredDir; turnAcc = 0 } }

        moveAppleStep()
        checkPickups()
        window['__appleAcc'] -= appleStepSec
      }

      if (window['__snakeAcc'] >= snakeStepSec) {
        if (revExpire > 0) stepSnake(growNext) 
        else stepSnake(growNext)
        growNext = false
        updateMeshes()
        window['__snakeAcc'] -= snakeStepSec
        if (invExpire <= 0 && snake.value.some(s=>s.x===apple.value.x && s.y===apple.value.y)) {
          if (revExpire > 0) { gameResult.value = 'won'; gameOver.value = true; running.value = false }
          else { gameResult.value = 'dead'; gameOver.value = true; running.value = false }
        }
      }
    }

    const moveLerp = Math.min(1, dt * MOVE_LERP)
    appleWorldPos.lerp(targetAppleWorld, moveLerp)
    lastAppleDirSmooth.lerp(lastAppleDir, Math.min(1, dt * TURN_SMOOTH))

    camera.position.set(appleWorldPos.x, CAMERA_HEIGHT, appleWorldPos.z)
    let lookTarget = new THREE.Vector3(appleWorldPos.x, LOOK_TARGET_Y, appleWorldPos.z - 1)
    if (lastAppleDirSmooth.lengthSq() > 0.001) {
      const dir = lastAppleDirSmooth.clone().normalize()
      const worldOffset = new THREE.Vector3(dir.x * TILE, 0, dir.z * TILE)
      lookTarget = appleWorldPos.clone().add(worldOffset)
      lookTarget.y = LOOK_TARGET_Y
    }
    camera.lookAt(lookTarget)

    renderer.render(scene, camera)
      if (minimapCtx && minimap.value) drawMinimap(minimapCtx, minimap.value)
  }
  lastTime = performance.now()
  animate(lastTime)
  if (minimap.value) {
    minimapCtx = minimap.value.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cssW = minimap.value.clientWidth || 160
    const cssH = minimap.value.clientHeight || 160
    minimap.value.width = Math.floor(cssW * dpr)
    minimap.value.height = Math.floor(cssH * dpr)
    if (minimapCtx) minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
})

function checkPickups() {
  const ax = apple.value.x
  const ay = apple.value.y
  for (let i = bonuses.value.length - 1; i >= 0; i--) {
    const b = bonuses.value[i]
    if (b.x === ax && b.y === ay) {
      if (b.type === 'slow') {
        slowExpire = 8
        snakeSpeed = baseSnakeSpeed * 0.5
      } else if (b.type === 'inv') {
        invExpire = 5
      } else if (b.type === 'rev') {
        revExpire = 10
      }
      const bm = bonusMeshes[i]
      if (bm) scene.remove(bm)
      bonusMeshes.splice(i,1)
      bonuses.value.splice(i,1)
    }
  }
}

(function attachPickupCheck(){
  const orig = requestAnimationFrame
})()

onUnmounted(()=>{
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  try { window.removeEventListener('keydown', onSpaceKey) } catch (e) {}
  if (minimapCtx) minimapCtx = null
  for (const m of bonusMeshes) {
    try { scene.remove(m) } catch (e) {}
  }
  if (extraLight) {
    try { scene.remove(extraLight) } catch (e) {}
    extraLight = null
  }
})
</script>

<style scoped>
.snake3d-page { position: fixed; inset: 0; background: #07101a }
.render-wrap { width: 100%; height: 100%; }
.hud { position: absolute; z-index: 40; left: 12px; top: 12px; display:flex; gap:8px; align-items:center }
.hud .info { color: #e6eef6; margin-left: 8px }
.overlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center }
.overlay .box { background: rgba(6,10,14,0.9); color:#fff; padding:18px; border-radius:8px }
.split {
  display: flex;
  height: 100%;
}
.left,
.right {
  flex: 0 0 50%;
  height: 100%;
  box-sizing: border-box;
  min-width: 0;
}
.left {
  position: relative;
}
.right {
  display: block;
  padding: 0;
}
.minimap {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 30;
  border-radius: 0;
  box-shadow: none;
  background: rgba(0,0,0,0.06);
  border-left: 1px solid rgba(255,255,255,0.03);
}

.start-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: auto;
}
.start-text {
  color: #000000;
  font-weight: 500;
  font-size: 1vw;
  text-align: center;
  white-space: pre-line;
  padding: 18px 28px;
  pointer-events: none;
  width: 450px;
  background-color: white;
  border: 4px solid black;
}
.bonus-items {
  display: flex;
  flex-direction: row;
  gap: 12px;
}
.start-title {
  color: #ffffff;
  font-weight: 800;
  font-size: 4vw;
  text-align: center;
  white-space: pre-line;
  padding: 18px 28px;
  pointer-events: none;
  text-transform: uppercase;
}

.start-full-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(2,6,12,0.65);
  background-color: rgba(255, 241, 233, 0.9);
  background-image: url('/bg-snake.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.start-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 28px 36px;
  border-radius: 12px;
  background: rgb(255, 241, 233);
  width: 100%;
  height: 100%;
  background-color: rgba(255, 241, 233, 0.9);
  background-image: url('/bg-snake.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0 }
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 240ms ease }
.overlay-fade-enter-from .start-box, .overlay-fade-leave-to .start-box { transform: scale(0.96) translateY(8px); opacity: 0 }
.overlay-fade-enter-to .start-box, .overlay-fade-leave-from .start-box { transform: scale(1) translateY(0); opacity: 1 }
.start-box { transition: transform 240ms ease, opacity 200ms ease }
.play-button {
  background: #0b1220;
  color: #fff;
  border: none;
  padding: 10px 18px;
  font-weight: 700;
  border-radius: 8px;
  width: 150px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(2,6,12,0.35);
}
.play-button:active { transform: translateY(1px) }

.replay-button {
  background: #0b1220;
  color: #fff;
  border: none;
  padding: 8px 16px;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  width: 150px;
  box-shadow: 0 6px 18px rgba(2,6,12,0.35);
}
.replay-button:active { transform: translateY(1px) }

.survival-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 18px;
  top: auto;
  width: 360px;
  max-width: calc(100% - 40px);
  height: 14px;
  background: rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
  display: block;
  z-index: 220;
}
.survival-fill {
  height: 100%;
  background: linear-gradient(90deg,#e14e4e,#a6ff4d);
  transition: width 0.2s linear;
}
.survival-label {
  position: absolute;
  left: 50%;
  bottom: 6px;
  transform: translateX(-50%);
  color: #e6eef6;
  font-size: 12px;
  font-weight: 700;
  pointer-events: none;
}

.bonus-bar {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 55;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgb(0, 0, 0);
  padding: 6px 10px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(2,6,12,0.6);
}
.bonus-title { color: #e6eef6; font-size: 14px; font-weight: 700;}
.bonus-item { display:flex; gap:8px; align-items:center; color:#e6eef6; font-size:12px }
.bonus-icon { width:14px; height:14px; border-radius:50%; box-shadow:0 0 8px rgba(0,0,0,0.35) inset }
.bonus-icon.slow { background: #4da6ff }
.bonus-icon.inv { background: #ffd24d }
.bonus-icon.rev { background: #b48cff }
.bonus-label { opacity: 0.9; font-weight:600 }
</style>
