
const posts = [
{
    id: 1,
    texto: "Alguém pode me ajudar a entender Álgebra Linear? Estou perdido nos vetores.",
    horario: "há 2 horas"
},
{
    id: 2,
    texto: "Onde encontro resumos de Cálculo I? As provas estão chegando 😥",
    horario: "há 1 hora"
},
{
    id: 3,
    texto: "Preciso de ajuda com a matéria de Lógica de Programação. Alguém topa uma call?",
    horario: "ontem"
},
{
    id: 4,
    texto: "Tem alguém que já fez Geometria Analítica que possa explicar o trabalho da semana?",
    horario: "há 30 minutos"
},
{
    id: 5,
    texto: "Não estou entendendo a matéria de Banco de Dados. Tem grupo de estudo?",
    horario: "há 4 horas"
}
];

const container = document.getElementById('posts-container');

posts.forEach(post => {
const card = document.createElement('div');
card.className = 'post-card';
card.innerHTML = `
    <div class="post-header">
    <img src="../img/user.png" alt="Usuário anônimo" class="post-avatar">
    <div>
        <h3>Anônimo</h3>
        <p>Postado ${post.horario}</p>
    </div>
    </div>
    <div class="post-content">
    <p>${post.texto}</p>
    </div>
    <div class="post-actions">
    <button class="like-btn">❤️ Curtir</button>
    <button class="comment-btn">💬 Comentar</button>
    <button class="msg-btn">📩 Mensagem</button>
    <button class="ignore-btn" onclick="removerPost(this)">🚫 Não tenho interesse</button>
    </div>
`;
container.appendChild(card);
});

function removerPost(botao) {
const post = botao.closest('.post-card');
post.remove();
}

