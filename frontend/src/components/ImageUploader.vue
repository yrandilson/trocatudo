<template>
  <div class="image-uploader">
    <h3 class="text-xl font-semibold mb-3">Imagens do Item</h3>
    
    <div v-if="images.length > 0" class="image-preview mb-4">
      <div v-for="(image, index) in images" :key="index" class="image-item">
        <img :src="getImageUrl(image)" alt="Preview" class="preview-img" />
        <button @click="removeImage(index)" class="remove-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <div v-if="images.length < 5" class="upload-area">
      <input 
        type="file" 
        ref="fileInput" 
        @change="handleFileChange" 
        accept="image/jpeg,image/png,image/gif" 
        multiple
        class="hidden"
      />
      <button @click="triggerFileInput" class="upload-btn">
        <i class="fas fa-upload mr-2"></i> Adicionar Imagens
      </button>
      <p class="upload-info">Máximo 5 imagens (JPEG, PNG, GIF)</p>
    </div>
    
    <div v-if="uploading" class="upload-progress">
      <div class="spinner mr-2"></div>
      Enviando imagens...
    </div>
    
    <div v-if="error" class="upload-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from 'vue';
import { useItemsStore } from '../stores/items';

const props = defineProps<{
  itemId: number;
  existingImages?: string[];
}>();

const emit = defineEmits(['update:images']);

const itemsStore = useItemsStore();
const fileInput = ref<HTMLInputElement | null>(null);
const images = ref<string[]>(props.existingImages || []);
const uploading = ref(false);
const error = ref<string | null>(null);

const apiBaseUrl = computed(() => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
});

const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${apiBaseUrl.value}${imagePath}`;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  
  const files = Array.from(target.files);
  
  // Verificar limite de imagens
  if (images.value.length + files.length > 5) {
    error.value = 'Máximo de 5 imagens permitidas';
    return;
  }
  
  // Preparar FormData
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });
  
  try {
    uploading.value = true;
    error.value = null;
    
    const response = await itemsStore.uploadImages(props.itemId, formData);
    images.value = response.imagens;
    emit('update:images', images.value);
    
    // Limpar input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao enviar imagens';
  } finally {
    uploading.value = false;
  }
};

const removeImage = async (index: number) => {
  try {
    uploading.value = true;
    error.value = null;
    
    const response = await itemsStore.removeImage(props.itemId, index);
    images.value = response.imagens;
    emit('update:images', images.value);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao remover imagem';
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.image-uploader {
  margin-bottom: 20px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.upload-area {
  border: 2px dashed #ddd;
  padding: 20px;
  text-align: center;
  border-radius: 4px;
}

.upload-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.upload-info {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.upload-progress {
  margin-top: 10px;
  color: #3498db;
  display: flex;
  align-items: center;
}

.spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.upload-error {
  margin-top: 10px;
  color: #e74c3c;
}

.hidden {
  display: none;
}
</style>
