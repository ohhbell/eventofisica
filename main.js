import { auth, onAuthStateChanged, db, collection, getDocs } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
  const programacaoList = document.getElementById('programacao-list');
  const palestrantesList = document.getElementById('palestrantes-list');

  // Exemplo de como a programação seria carregada (dados de exemplo)
  const programacao = [
    { titulo: 'Abertura do Evento', horario: '09:00', descricao: 'Boas-vindas e introdução ao evento.' },
    { titulo: 'Palestra: Firebase na Prática', horario: '10:00', descricao: 'Como usar o Firebase em seus projetos web.' },
    { titulo: 'Palestra: Material Design', horario: '11:30', descricao: 'Dicas de design para uma interface moderna.' }
  ];

  // Limpa o placeholder
  programacaoList.innerHTML = '';
  
  programacao.forEach(item => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div>
        <h5 class="text-primary">${item.titulo}</h5>
        <p><strong>Horário:</strong> ${item.horario}</p>
        <p>${item.descricao}</p>
      </div>
    `;
    programacaoList.appendChild(li);
  });

  // Exemplo de como os palestrantes seriam carregados (dados de exemplo)
  const palestrantes = [
    { nome: 'Ana Carolina', bio: 'Especialista em Firebase e Cloud Functions.' },
    { nome: 'João da Silva', bio: 'UI/UX Designer com foco em Material Design.' }
  ];

  // Limpa o placeholder
  palestrantesList.innerHTML = '';

  palestrantes.forEach(palestrante => {
    const card = document.createElement('div');
    card.className = 'card shadow mb-3';
    card.innerHTML = `
      <div class="card-body">
        <h6 class="card-title">${palestrante.nome}</h6>
        <p class="card-text">${palestrante.bio}</p>
      </div>
    `;
    palestrantesList.appendChild(card);
  });
});