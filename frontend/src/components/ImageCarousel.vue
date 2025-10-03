<template>
  <div class="image-carousel">
    <div v-if="images && images.length > 0" class="carousel-container">
      <div class="main-image-container">
        <img :src="getImageUrl(currentImage)" alt="Item" class="main-image" />
      </div>
      
      <div v-if="images.length > 1" class="thumbnails-container">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          :class="['thumbnail', { active: currentIndex === index }]"
          @click="currentIndex = index"
        >
          <img :src="getImageUrl(image)" alt="Thumbnail" class="thumbnail-image" />
        </div>
      </div>
    </div>
    
    <div v-else class="no-image">
      <i class="fas fa-image no-image-icon"></i>
      <span>Sem imagens disponíveis</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  images?: string[];
}>();

const currentIndex = ref(0);
const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
});

const currentImage = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images[currentIndex.value];
  }
  return '';
});

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${apiBaseUrl.value}${imagePath}`;
};

// Reset currentIndex when images change
watch(() => props.images, () => {
  currentIndex.value = 0;
});
</script>

<style scoped>
.image-carousel {
  width: 100%;
  margin-bottom: 20px;
}

.carousel-container {
  display: flex;
  flex-direction: column;
}

.main-image-container {
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.thumbnails-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumbnail.active {
  border-color: #3498db;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #aaa;
}

.no-image-icon {
  font-size: 48px;
  margin-bottom: 10px;
}
</style>
