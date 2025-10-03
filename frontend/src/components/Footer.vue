<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section about">
          <div class="logo">
            <i class="fas fa-exchange-alt"></i>
            <span>TrocaTudo</span>
          </div>
          <p class="description">
            Plataforma de trocas gratuitas para dar nova vida aos seus itens.
            Troque o que você não usa mais por algo que precisa!
          </p>
          <div class="social-links">
            <a href="#" class="social-link">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-twitter"></i>
            </a>
          </div>
        </div>
        
        <div class="footer-section links">
          <h3>Links Rápidos</h3>
          <ul>
            <li><router-link to="/">Início</router-link></li>
            <li><router-link to="/my-items">Meus Itens</router-link></li>
            <li><router-link to="/propostas">Propostas</router-link></li>
            <li><a href="#">Como Funciona</a></li>
            <li><a href="#">Termos de Uso</a></li>
            <li><a href="#">Política de Privacidade</a></li>
          </ul>
        </div>
        
        <div class="footer-section categories">
          <h3>Categorias</h3>
          <ul>
            <li><a href="#">Eletrônicos</a></li>
            <li><a href="#">Vestuário</a></li>
            <li><a href="#">Móveis</a></li>
            <li><a href="#">Livros</a></li>
            <li><a href="#">Esportes</a></li>
            <li><a href="#">Outros</a></li>
          </ul>
        </div>
        
        <div class="footer-section contact">
          <h3>Contato</h3>
          <p>
            <i class="fas fa-envelope"></i> contato@trocatudo.com.br
          </p>
          <p>
            <i class="fas fa-phone"></i> (11) 99999-9999
          </p>
          <p>
            <i class="fas fa-map-marker-alt"></i> São Paulo, SP - Brasil
          </p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} TrocaTudo. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 50px 0 20px;
  margin-top: 50px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 50px;
  height: 2px;
  background-color: #3498db;
}

.about .logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 15px;
}

.about .logo i {
  margin-right: 10px;
}

.about .description {
  margin-bottom: 20px;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #34495e;
  color: #ecf0f1;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.social-link:hover {
  background-color: #3498db;
}

.links ul,
.categories ul {
  list-style: none;
  padding: 0;
}

.links li,
.categories li {
  margin-bottom: 10px;
}

.links a,
.categories a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.links a:hover,
.categories a:hover {
  color: #3498db;
}

.contact p {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.contact i {
  margin-right: 10px;
  color: #3498db;
  width: 20px;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #34495e;
  font-size: 14px;
  color: #bdc3c7;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .footer-section {
    margin-bottom: 30px;
  }
}
</style>
