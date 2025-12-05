<template>
	<div
		class="memory-card"
		:class="{ flipped: isFlipped || isMatched, matched: isMatched }"
	>
		<div class="card-inner">
			<div class="card-front">
				<!-- face cachée : image de fond du back de carte -->
			</div>
			<div class="card-back">
				<img
					:src="card.value"
					:alt="`Card ${card.id}`"
					class="card-image"
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Card {
	id: number;
	value: string;
	isFlipped: boolean;
	isMatched: boolean;
}

interface Props {
	card: Card;
	isFlipped: boolean;
	isMatched: boolean;
}

defineProps<Props>();
</script>

<style scoped>
.memory-card {
	aspect-ratio: 1;
	perspective: 1000px;
	cursor: pointer;
	transition: transform 0.2s ease;
	border-radius: 15px;
	overflow: hidden;
}

.memory-card:hover:not(.matched) {
	transform: scale(1.05);
}

.memory-card.matched {
	cursor: default;
	opacity: 0.6;
}

.card-inner {
	position: relative;
	width: 100%;
	height: 100%;
	transition: transform 0.6s;
	transform-style: preserve-3d;
}

.memory-card.flipped .card-inner {
	transform: rotateY(180deg);
}

.card-front,
.card-back {
	position: absolute;
	width: 100%;
	height: 100%;
	backface-visibility: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 3rem;
	font-weight: bold;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}


.card-front {
	/* face cachée : image de fond */
	background-image: url('/logo/bg_card.svg');
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
	color: white;
	font-size: 4rem;
	transform: rotateY(0deg);
}

.card-back {
	background: transparent;
	transform: rotateY(180deg);
	padding: 0;
}

.card-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.memory-card.matched .card-back {
	background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
	animation: pulse 1s ease;
}

@keyframes pulse {
	0%, 100% {
		transform: rotateY(180deg) scale(1);
	}
	50% {
		transform: rotateY(180deg) scale(1.1);
	}
}

@media (max-width: 768px) {
	.card-front,
	.card-back {
		font-size: 2rem;
		border-radius: 10px;
	}

	.card-front {
		font-size: 2.5rem;
	}
}
</style>
