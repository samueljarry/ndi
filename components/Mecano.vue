<script setup lang="ts">
import { GameManager } from '@/managers/GameManager'
import { set } from 'animejs'


interface Square {
  id: number
  color: string
  placed: boolean | undefined
  zone?: 'zone1' | 'zone2' | 'zone3' | 'zone4'
  size: number
  x?: number
  y?: number
  imageUrl?: string
  mustBeAt?: 'zone1' | 'zone2' | 'zone3' | 'zone4'
  mustBeX?: number
  mustBeY?: number
}

const squares = ref<Square[]>([
  { 
    id: 1, 
    color: '#FF6B6B00', 
    placed: true,
    zone: 'zone1',
    size: 3,
    x: 0,
    y: 0,
    imageUrl: '/images/mecano/image27.png',
    mustBeAt: 'zone1',
    mustBeX: 0,
    mustBeY: 0
  },
  { 
    id: 2, 
    color: '#4ECDC400', 
    placed: true,
    zone: 'zone1',
    size: 3,
    x: 150,
    y: 0,
    imageUrl: '/images/mecano/image28.png',
    mustBeAt: 'zone1',
    mustBeX: 150,
    mustBeY: 0
  },
  { 
    id: 3, 
    color: '#45B7D100', 
    placed: true,
    zone: 'zone2',
    size: 3,
    x: 0,
    y: 0,
    imageUrl: '/images/mecano/image19.png',
    mustBeAt: 'zone4',
    mustBeX: 150,
    mustBeY: 150
  },
  { 
    id: 4, 
    color: '#FFA07A00', 
    placed: true,
    zone: 'zone2',
    size: 3,
    x: 150,
    y: 0,
    imageUrl: '/images/mecano/image20.png',
    mustBeAt: 'zone4',
    mustBeX: 0,
    mustBeY: 0
  },
  { 
    id: 5, 
    color: '#98D8C800', 
    placed: true,
    zone: 'zone2',
    size: 3,
    x: 0,
    y: 150,
    imageUrl: '/images/mecano/image21.png',
    mustBeAt: 'zone2',
    mustBeX: 150,
    mustBeY: 0
  },
  { 
    id: 6, 
    color: '#F7DC6F00', 
    placed: true,
    zone: 'zone3',
    size: 3,
    x: 0,
    y: 0,
    imageUrl: '/images/mecano/image30.png',
    mustBeAt: 'zone3',
    mustBeX: 150,
    mustBeY: 150
  },
  { 
    id: 7, 
    color: '#E056FD00', 
    placed: true,
    zone: 'zone3',
    size: 3,
    x: 150,
    y: 0,
    imageUrl: '/images/mecano/image272.png',
    mustBeAt: 'zone3',
    mustBeX: 0,
    mustBeY: 0
  },
  { 
    id: 8, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone3',
    size: 3,
    x: 0,
    y: 150,
    imageUrl: '/images/mecano/image282.png',
    mustBeAt: 'zone3',
    mustBeX: 150,
    mustBeY: 0
  },
  { 
    id: 9, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone3',
    size: 3,
    x: 150,
    y: 150,
    imageUrl: '/images/mecano/image292.png',
    mustBeAt: 'zone3',
    mustBeX: 0,
    mustBeY: 150
  },
  { 
    id: 10, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone2',
    size: 3,
    x: 150,
    y: 150,
    imageUrl: '/images/mecano/image25.png',
    mustBeAt: 'zone2',
    mustBeX: 0,
    mustBeY: 150
  },
  { 
    id: 11, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone1',
    size: 3,
    x: 0,
    y: 150,
    imageUrl: '/images/mecano/image293.png',
    mustBeAt: 'zone1',
    mustBeX: 150,
    mustBeY: 150
  },
  { 
    id: 12, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone1',
    size: 3,
    x: 150,
    y: 150,
    imageUrl: '/images/mecano/image31.png',
    mustBeAt: 'zone4',
    mustBeX: 0,
    mustBeY: 150
  },
  { 
    id: 13, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone4',
    size: 3,
    x: 0,
    y: 0,
    imageUrl: '/images/mecano/image302.png',
    mustBeAt: 'zone1',
    mustBeX: 0,
    mustBeY: 150
  },
  { 
    id: 14, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone4',
    size: 3,
    x: 150,
    y: 0,
    imageUrl: '/images/mecano/image192.png',
    mustBeAt: 'zone2',
    mustBeX: 0,
    mustBeY: 0
  },  
  { 
    id: 15, 
    color: '#FF85A200', 
    placed: true,
    zone: 'zone4',
    size: 3,
    x: 0,
    y: 150,
    imageUrl: '/images/mecano/image202.png',
    mustBeAt: 'zone2',
    mustBeX: 150,
    mustBeY: 150
  },
])

const draggedSquare = ref<Square | null>(null)
const gridSize = 150 // Grille 2x2 dans une zone de 300x300

const snapToGrid = (value: number) => {
  return Math.round(value / gridSize) * gridSize
}

const startDrag = (square: Square) => {
  draggedSquare.value = square
}

const showEnd = ref(false)


const startDragPlaced = (square: Square, event: DragEvent) => {
  draggedSquare.value = square
  event.stopPropagation()
}

const onDropInGrid = (event: DragEvent, zoneName : 'zone1' | 'zone2' | 'zone3' | 'zone4') => {
  event.preventDefault()
  if (draggedSquare.value) {
    const dropZone = event.currentTarget as HTMLElement
    const rect = dropZone.getBoundingClientRect()

    const squarePixelSize = draggedSquare.value.size * 50
    
    const rawX = event.clientX - rect.left - (squarePixelSize / 2)
    const rawY = event.clientY - rect.top - (squarePixelSize / 2)

    const snappedX = snapToGrid(rawX)
    const snappedY = snapToGrid(rawY)

    const maxX = rect.width - squarePixelSize
    const maxY = rect.height - squarePixelSize

    const finalX = Math.max(0, Math.min(snappedX, maxX))
    const finalY = Math.max(0, Math.min(snappedY, maxY))

    // 🔍 1) Vérifier si une pièce occupe déjà cette case
    const occupyingSquare = squares.value.find(s =>
      s.id !== draggedSquare.value!.id &&
      s.zone === zoneName &&
      s.x === finalX &&
      s.y === finalY
    )

    // 🔄 2) Échanger au besoin
    if (occupyingSquare) {
      occupyingSquare.x = draggedSquare.value.x
      occupyingSquare.y = draggedSquare.value.y
      occupyingSquare.zone = draggedSquare.value.zone
    }

    // 🔽 3) Mise à jour du draggedSquare
    draggedSquare.value.placed = true
    draggedSquare.value.zone = zoneName
    draggedSquare.value.x = finalX
    draggedSquare.value.y = finalY

    if (isGameComplete()) {
      setTimeout(() => {
        onGameComplete()
      }, 400);
    }

    draggedSquare.value = null
  }
}


const onDropInSource = (event: DragEvent) => {
  event.preventDefault()
  if (draggedSquare.value && draggedSquare.value.placed) {
    draggedSquare.value.placed = false
    draggedSquare.value.zone = undefined
    draggedSquare.value.x = undefined
    draggedSquare.value.y = undefined
    draggedSquare.value = null
  }
}

const allowDrop = (event: DragEvent) => {
  event.preventDefault()
}

const removeSquare = (square: Square) => {
  square.placed = false
  square.zone = undefined
  square.x = undefined
  square.y = undefined
}

const resetGame = () => {
  const defaultImages = [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop'
  ]
  
  const defaultPositions = [
    { zone: 'zone1', x: 0, y: 0, placed: true },
    { zone: 'zone1', x: 150, y: 0, placed: true },
    { zone: 'zone2', x: 0, y: 0, placed: true },
    { zone: 'zone2', x: 150, y: 0, placed: true },
    { zone: 'zone2', x: 0, y: 150, placed: true },
    { zone: 'zone3', x: 0, y: 0, placed: true },
    { zone: 'zone3', x: 150, y: 0, placed: true },
    { zone: 'zone3', x: 0, y: 150, placed: true },
    { zone: 'zone3', x: 150, y: 150, placed: true },
    { zone: 'zone2', x: 150, y: 150, placed: true },
    { zone: 'zone1', x: 0, y: 150, placed: true },
    { zone: 'zone1', x: 150, y: 150, placed: true },
    { placed: false },
    { placed: false }
  ]
  
  squares.value.forEach((square, index) => {
    const pos = defaultPositions[index]
    square.placed = pos?.placed
    square.zone = pos?.placed ? pos.zone as 'zone1' | 'zone2' | 'zone3' : undefined
    square.x = pos?.placed ? pos.x : undefined
    square.y = pos?.placed ? pos.y : undefined
    square.imageUrl = defaultImages[index] || defaultImages[7]
  })
}

const getSquareSize = (size: number) => {
  return size * 50 + 'px'
}

const getSquaresInZone = (zoneName: 'zone1' | 'zone2' | 'zone3' | 'zone4') => {
  return squares.value.filter(s => s.placed && s.zone === zoneName)
}

const getZoneScore = (zoneName: 'zone1' | 'zone2' | 'zone3' | 'zone4') => {
  return getSquaresInZone(zoneName).length
}


const isSquareCorrect = (square: Square) => {
  if (square.zone !== square.mustBeAt) return false

  if (square.mustBeAt === 'zone4') return true

  return square.x === square.mustBeX && square.y === square.mustBeY
}


const getIncorrectSquares = () => {
  return squares.value.filter(s => !isSquareCorrect(s))
}

const isGameComplete = () => {
  return squares.value.every(s => isSquareCorrect(s))
}

const onGameComplete = () => {
  showEnd.value = true
  setTimeout(() => {
    showEnd.value = false
    GameManager.Hide();
  }, 3000);
}


</script>

<template>

  <div class="game-container">
    <div style="display: flex;">
      <div class="instr-class">
        <img 
          src="/images/mecano/Group8.svg" 
          alt="Image"
        />
      </div>

      <div class="image-class">
        <img 
          src="/images/mecano/mecano.png" 
          alt="Image"
        />
      </div>
    </div>

    <img 
      v-if="showEnd"
      src="/images/mecano/EndMecano.png" 
      alt="Background" 
      style="position: fixed; width: 100vw; height: auto; top: -17%; left: 0; z-index: 35;"
    />


    <div class="zones-container">
      <!-- Zone 1 -->
       <div class="zones-sub">
      <div class="zone-wrapper">

        <div 
          class="drop-zone zone1"
          @drop="onDropInGrid($event, 'zone1')"
          @dragover="allowDrop"
        >
          <p v-if="getZoneScore('zone1') === 0">Zone 1</p>
          <div
            v-for="square in getSquaresInZone('zone1')"
            :key="square.id"
            class="placed-square"
            :style="{
              backgroundColor: square.color,
              left: square.x + 'px',
              top: square.y + 'px',
              width: getSquareSize(square.size),
              height: getSquareSize(square.size),
              fontSize: (square.size * 16) + 'px'
            }"
            draggable="true"
            @dragstart="startDragPlaced(square, $event)"
          >
            <img 
              v-if="square.imageUrl" 
              :src="square.imageUrl" 
              class="square-image"
              alt="Image"
            />
            <span v-else class="square-number">{{ square.id }}</span>
          </div>
        </div>
      </div>

      <!-- Zone 2 -->
      <div class="zone-wrapper">
        <div 
          class="drop-zone zone2"
          @drop="onDropInGrid($event, 'zone2')"
          @dragover="allowDrop"
        >
          <p v-if="getZoneScore('zone2') === 0">Zone 2</p>
          <div
            v-for="square in getSquaresInZone('zone2')"
            :key="square.id"
            class="placed-square"
            :style="{
              backgroundColor: square.color,
              left: square.x + 'px',
              top: square.y + 'px',
              width: getSquareSize(square.size),
              height: getSquareSize(square.size),
              fontSize: (square.size * 16) + 'px'
            }"
            draggable="true"
            @dragstart="startDragPlaced(square, $event)"
          >
            <img 
              v-if="square.imageUrl" 
              :src="square.imageUrl" 
              class="square-image"
              alt="Image"
            />
            <span v-else class="square-number">{{ square.id }}</span>
          </div>
        </div>
      </div>
      </div>

      <div class="zones-sub">
      <!-- Zone 3 -->
      <div class="zone-wrapper">
        <div 
          class="drop-zone zone3"
          @drop="onDropInGrid($event, 'zone3')"
          @dragover="allowDrop"
        >
          <p v-if="getZoneScore('zone3') === 0">Zone 3</p>
          <div
            v-for="square in getSquaresInZone('zone3')"
            :key="square.id"
            class="placed-square"
            :style="{
              backgroundColor: square.color,
              left: square.x + 'px',
              top: square.y + 'px',
              width: getSquareSize(square.size),
              height: getSquareSize(square.size),
              fontSize: (square.size * 16) + 'px'
            }"
            draggable="true"
            @dragstart="startDragPlaced(square, $event)"
          >
            <img 
              v-if="square.imageUrl" 
              :src="square.imageUrl" 
              class="square-image"
              alt="Image"
            />
            <span v-else class="square-number">{{ square.id }}</span>
          </div>
        </div>
      </div>

      <!-- Zone 4 -->
      <div class="zone-wrapper">
        <div 
          class="drop-zone zone4"
          @drop="onDropInGrid($event, 'zone4')"
          @dragover="allowDrop"
        >
          <p v-if="getZoneScore('zone4') === 0">Zone 4</p>
          <div
            v-for="square in getSquaresInZone('zone4')"
            :key="square.id"
            class="placed-square"
            :style="{
              backgroundColor: square.color,
              left: square.x + 'px',
              top: square.y + 'px',
              width: getSquareSize(square.size),
              height: getSquareSize(square.size),
              fontSize: (square.size * 16) + 'px'
            }"
            draggable="true"
            @dragstart="startDragPlaced(square, $event)"
          >
            <img 
              v-if="square.imageUrl" 
              :src="square.imageUrl" 
              class="square-image"
              alt="Image"
            />
            <span v-else class="square-number">{{ square.id }}</span>
          </div>
        </div>
      </div>
      <div class="reser-class">
        <img
          src="/images/mecano/reserve.png" 
          alt="Image"
        />
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  margin: 0 ;
  display: flex;
  background-image: url("/images/mecano/image 10.png")
}

.image-class {
  position: fixed;
  bottom: 0;
  left: 40px;
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
  left: 40px;
  z-index: 10;
  pointer-events: none;
}

.instr-class img {
  width: 400px;
  height: auto;
  display: block;
}


.reser-class {
  position: fixed;
  bottom: 40px;
  right: 55px;
  z-index: 10;
  pointer-events: none;
}

.reser-class img {
  width: 44.2px;
  height: auto;
  display: block;
}

.source-area {
  margin-bottom: 30px;
  padding: 15px;
  border: 2px dashed #ddd;
  background: #fafafa;
  min-height: 150px;
}

.source-area h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.squares-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  padding: 20px;
  background: #f8f9fa;
  align-items: center;
  min-height: 100px;

}

.small-square {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.small-square:hover {
  transform: scale(1.05);
}

.small-square:active {
  cursor: grabbing;
}

.square-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.square-number {
  position: relative;
  z-index: 1;
}

.zones-container {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-bottom: 20px;

  position: fixed;
  bottom: 0;
  right: 90px;
}

.zones-sub {
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  flex-direction: column;
}

.zone-wrapper {
  display: flex;
  flex-direction: column;
}

.zone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 10px;
}

.zone-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.zone-score {
  background: #4ECDC4;
  color: white;
  padding: 4px 12px;
  font-weight: bold;
  font-size: 14px;
}

.drop-zone {
  width: 310px;
  height: 310px;
  border: 5px solid #ffffff;
  position: relative;
  background: #1E1E1E;
  background-size: 150px 150px, 150px 150px;
  background-position: 0 0, 0 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.zone1 {
  background: #1E1E1E;
}

.zone2 {
  background: #1E1E1E;
}

.zone3 {
  background: #1E1E1E;
}

.zone4 {
  background: #1E1E1E;
}

.drop-zone p {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  pointer-events: none;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.placed-square {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  position: absolute;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.15s ease-out;
  cursor: grab;
  overflow: hidden;
}

.placed-square:hover {
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.02);
}

.placed-square:active {
  cursor: grabbing;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: 2px solid white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: all 0.2s;
  z-index: 2;
}

.placed-square:hover .remove-btn {
  display: flex;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 1);
  transform: scale(1.1);
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.reset-btn {
  padding: 12px 30px;
  font-size: 16px;
  background: #4ECDC4;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #45B7D1;
}

@media (max-width: 1024px) {
  .zones-container {
    grid-template-columns: 1fr;
  }
}
</style>