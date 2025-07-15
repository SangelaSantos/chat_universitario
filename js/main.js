const firebaseConfig = {
  apiKey: "AIzaSyBCqMQbzWlEs4zKMXt9wINzJxD0xhZcYIg",
  authDomain: "alocalouro.firebaseapp.com",
  projectId: "alocalouro",
  storageBucket: "alocalouro.appspot.com",
  messagingSenderId: "186368562877",
  appId: "1:186368562877:web:d0ef2bc2fd01d1188e89d4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Função para formatar timestamp
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const agora = new Date();
  const diff = agora - date;

  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return "agora mesmo";
}

// Carregar posts do Firebase
function loadPosts() {
  const container = document.getElementById('posts-container');
  db.ref('posts').orderByChild('timestamp').once('value')
    .then(snapshot => {
      const posts = snapshot.val();
      container.innerHTML = '';

      if (!posts) {
        container.innerHTML = '<p style="padding: 20px;">Nenhum post encontrado.</p>';
        return;
      }

      const sortedPosts = Object.entries(posts).sort((a, b) => b[1].timestamp - a[1].timestamp);

      sortedPosts.forEach(([id, post]) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
          <div class="post-header">
            <img src="../img/user.png" alt="Usuário anônimo" class="post-avatar">
            <div>
              <h3>Anônimo</h3>
              <p>Postado ${formatDate(post.timestamp)}</p>
            </div>
          </div>
          <div class="post-content">
            <p>${post.text}</p>
          </div>
          <div class="post-actions">
            <button class="like-btn">❤️ Curtir</button>
            <button class="comment-btn">💬 Comentar</button>
            <button class="msg-btn" onclick="enviarMensagem('${post.userId}')">📩 Mensagem</button>
            <button class="ignore-btn" onclick="removerPost(this)">🚫 Não tenho interesse</button>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar posts:', error);
      container.innerHTML = '<p style="padding: 20px; color: red;">Erro ao carregar posts.</p>';
    });
}

// Função para remover post do DOM
function removerPost(botao) {
  const post = botao.closest('.post-card');
  post.remove();
}
function enviarMensagem(userId) {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }
    const remetenteId = user.uid;

    // Redireciona para a página de contatos, passando os dois IDs
    window.location.href = `/pages/chat.html?from=${remetenteId}&to=${userId}`;
  });
}

// Carrega os posts ao iniciar
loadPosts();