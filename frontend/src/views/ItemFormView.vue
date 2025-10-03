<template>
  <div class="item-form-container">
    <div class="page-header">
      <h1>{{ isEditing ? 'Editar Item' : 'Novo Item' }}</h1>
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i> Voltar
      </button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ isEditing ? 'Carregando item...' : 'Preparando formulário...' }}</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>
      <button @click="isEditing ? fetchItem() : resetForm()" class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
    </div>

    <form v-else @submit.prevent="submitForm" class="item-form">
      <div class="form-group">
        <label for="titulo">Título *</label>
        <input 
          type="text" 
          id="titulo" 
          v-model="formData.titulo" 
          required 
          placeholder="Ex: Smartphone Samsung Galaxy S10"
          maxlength="200"
        />
        <div class="form-hint">Máximo 200 caracteres</div>
      </div>

      <div class="form-group">
        <label for="categoria">Categoria *</label>
        <select id="categoria" v-model="formData.categoryId" required>
          <option :value="null" disabled>Selecione uma categoria</option>
          <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="descricao">Descrição *</label>
        <textarea 
          id="descricao" 
          v-model="formData.descricao" 
          required 
          rows="5"
          placeholder="Descreva o item em detalhes, incluindo estado de conservação, tempo de uso, etc."
        ></textarea>
      </div>

      <div v-if="isEditing" class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="formData.status">
          <option v-for="(label, value) in statusOptions" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>

      <ImageUploader 
        v-if="isEditing && itemId" 
        :itemId="itemId" 
        :existingImages="formData.imagens"
        @update:images="formData.imagens = $event"
      />

      <div class="form-actions">
        <button type="button" @click="goBack" class="cancel-button">
          Cancelar
        </button>
        <button type="submit" class="submit-button" :disabled="submitting">
          <span v-if="submitting">
            <div class="spinner-small"></div> {{ isEditing ? 'Salvando...' : 'Criando...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Salvar Alterações' : 'Criar Item' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItemsStore } from '@/stores/items';
import { useCategoryStore } from '@/stores/categories'; // Importa a nova store
import { ItemStatus } from '@/types';
import ImageUploader from '@/components/ImageUploader.vue';

const route = useRoute();
const router = useRouter();
const itemStore = useItemsStore();
const categoryStore = useCategoryStore(); // Instancia a nova store

const loading = ref(false);
const error = ref<string | null>(null);
const submitting = ref(false);

const formData = ref({
  titulo: '',
  categoryId: null as number | null, // Atualizado de 'categoria' para 'categoryId'
  descricao: '',
  status: ItemStatus.DISPONIVEL,
  imagens: [] as string[]
});

const isEditing = computed(() => {
  return route.name === 'EditItem';
});

const itemId = computed(() => {
  return isEditing.value ? Number(route.params.id) : 0;
});

const statusOptions = {
  [ItemStatus.DISPONIVEL]: 'Disponível',
  [ItemStatus.TROCADO]: 'Trocado'
};

const fetchItem = async () => {
  if (!isEditing.value) return;

  loading.value = true;
  error.value = null;

  try {
    // Usando a store para buscar o item, que já lida com o estado de loading e erro
    await itemStore.fetchItemById(itemId.value);
    
    if (!itemStore.currentItem) {
      throw new Error('Item não encontrado');
    }
    
    // Preencher o formulário com os dados do item
    formData.value = {
      titulo: itemStore.currentItem.titulo,
      categoryId: itemStore.currentItem.category.id, // Atualizado
      descricao: itemStore.currentItem.descricao,
      status: itemStore.currentItem.status,
      imagens: itemStore.currentItem.imagens || []
    };
  } catch (err: any) {
    error.value = err.message || 'Erro ao carregar o item';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    titulo: '',
    categoryId: null, // Atualizado
    descricao: '',
    status: ItemStatus.DISPONIVEL,
    imagens: []
  };
  error.value = null;
};

const submitForm = async () => {
  submitting.value = true;
  error.value = null;

  try {
    if (isEditing.value) {
      // Atualizando item
      await itemStore.updateItem(itemId.value, {
        titulo: formData.value.titulo,
        descricao: formData.value.descricao,
        status: formData.value.status,
        categoryId: formData.value.categoryId,
      });
      router.push(`/items/${itemId.value}`);
    } else {
      // Criando novo item
      const newItem = await itemStore.createItem({
        titulo: formData.value.titulo,
        descricao: formData.value.descricao,
        categoryId: formData.value.categoryId,
      });
      
      // Se a criação for bem-sucedida, redireciona para a página de edição para adicionar fotos
      if (newItem && newItem.id) {
        router.push(`/items/${newItem.id}/edit`);
      } else {
        router.push('/my-items');
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Erro ao salvar o item';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(async () => {
  // Garante que as categorias sejam carregadas antes de qualquer outra coisa
  await categoryStore.fetchCategories();
  
  if (isEditing.value) {
    await fetchItem();
  }
});
</script>

<style scoped>
.item-form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin: 0;
}

.back-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-small {
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fef2f2;
  border: 1px solid #f8d7da;
  border-radius: 4px;
}

.error-message {
  display: flex;
  align-items: center;
  color: #e74c3c;
  margin-bottom: 15px;
}

.error-message i {
  font-size: 24px;
  margin-right: 10px;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.retry-button i {
  margin-right: 8px;
}

.item-form {
  background-color: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.form-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-button {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .item-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .submit-button {
    width: 100%;
    justify-content: center;
  }
}
</style>