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


////////// HOME ///////////////////////
// Formatar timestamp
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

// Carregar posts
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

      // Ordenar por timestamp decrescente
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
            <button class="like-btn" id="like-${id}" onclick="curtirPost('${id}', this)">❤️ Curtir</button>
            <button class="comment-btn" onclick="comentarPost('${id}')">💬 Comentar</button>
            <button class="msg-btn" onclick="enviarMensagem('${post.userId}')">📩 Mensagem</button>
            <button class="ignore-btn" onclick="removerPost(this)">🚫 Não tenho interesse</button>
          </div>
          <div class="comments-container" id="comments-${id}" style="margin-top:10px;"></div>
        `;
        container.appendChild(card);

        // Atualiza o texto do botão Curtir com o número atual
        const likeBtn = card.querySelector(`#like-${id}`);
        contarCurtidas(id, likeBtn);

        // Carrega comentários visíveis
        carregarComentarios(id);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar posts:', error);
      container.innerHTML = '<p style="padding: 20px; color: red;">Erro ao carregar posts.</p>';
    });
}

// Curtir/descurtir post
function curtirPost(postId, btn) {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Você precisa estar logado para curtir.");

  const likeRef = db.ref(`likes/${postId}/${user.uid}`);
  likeRef.once('value').then(snapshot => {
    if (snapshot.exists()) {
      // Remover like
      likeRef.remove().then(() => {
        getLikeCount(postId).then(count => {
          btn.textContent = `❤️ Curtir (${count})`;
          btn.classList.remove('btn-curtido');
          btn.classList.add('btn-nao-curtido');
        });
      });
    } else {
      // Adicionar like
      likeRef.set(true).then(() => {
        getLikeCount(postId).then(count => {
          btn.textContent = `💔 Descurtir (${count})`;
          btn.classList.remove('btn-nao-curtido');
          btn.classList.add('btn-curtido');
        });
      });
    }
  });
}


// Função para pegar contagem de likes (Promise)
function getLikeCount(postId) {
  return db.ref(`likes/${postId}`).once('value').then(snapshot => snapshot.numChildren());
}


// Contar curtidas e atualizar botão
function contarCurtidas(postId, btn) {
  db.ref(`likes/${postId}`).on('value', snapshot => {
    const total = snapshot.numChildren();
    btn.textContent = `❤️ Curtir (${total})`;
  });
}


// Comentar post (prompt simples)
function comentarPost(postId) {
  const user = firebase.auth().currentUser;
  if (!user) return alert("Você precisa estar logado para comentar.");

  const comentario = prompt("Digite seu comentário:");
  if (!comentario) return;

  const commentData = {
    userId: user.uid,
    text: comentario,
    timestamp: Date.now()
  };

  db.ref(`comments/${postId}`).push(commentData)
    .then(() => {
      alert("Comentário enviado com sucesso!");
      carregarComentarios(postId); // Atualiza lista de comentários
    })
    .catch(err => {
      console.error("Erro ao comentar:", err);
      alert("Erro ao comentar.");
    });
}

// Carregar comentários de um post
function carregarComentarios(postId) {
  const container = document.getElementById(`comments-${postId}`);
  if (!container) return;

  db.ref(`comments/${postId}`).orderByChild('timestamp').once('value')
    .then(snapshot => {
      const comments = snapshot.val();
      container.innerHTML = '';

      if (!comments) {
        container.innerHTML = '<small style="color:#666;">Sem comentários ainda.</small>';
        return;
      }

      const sortedComments = Object.entries(comments).sort((a, b) => a[1].timestamp - b[1].timestamp);

      sortedComments.forEach(([cid, comment]) => {
        const div = document.createElement('div');
        div.style.borderTop = "1px solid #eee";
        div.style.padding = "6px 0";
        div.style.fontSize = "13px";
        div.style.color = "#444";
        div.textContent = comment.text;
        container.appendChild(div);
      });
    });
}

// Enviar mensagem privada (redireciona)
function enviarMensagem(userId) {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = "/login.html";
      return;
    }
    const remetenteId = user.uid;
    window.location.href = `/pages/chat.html?from=${remetenteId}&to=${userId}`;
  });
}



// Remover post da interface (não do Firebase)
function removerPost(botao) {
  const post = botao.closest('.post-card');
  post.remove();
}

// Inicializa
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    loadPosts();
  } else {
    // Se quiser redirecionar pra login automaticamente:
    // window.location.href = "/login.html";
    loadPosts(); // ou carregar posts sem interação de usuário
  }
});