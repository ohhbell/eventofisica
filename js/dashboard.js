import { auth, onAuthStateChanged, db, collection, query, where, getDocs } from './firebase.js';

import { logout } from './auth.js';

function showBootstrapToast(message, isSuccess) {
  const toastLiveExample = document.getElementById('liveToast');
  const toastBody = toastLiveExample.querySelector('.toast-body');
  toastBody.textContent = message;

  const bsToast = new bootstrap.Toast(toastLiveExample);
  
  if (isSuccess) {
    toastBody.style.color = 'green';
  } else {
    toastBody.style.color = 'red';
  }
  
  bsToast.show();
}

document.addEventListener('DOMContentLoaded', function() {
  const userNameSpan = document.getElementById('user-name');
  const userEmailSpan = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const inscricoesList = document.getElementById('inscricoes-list');
  const submissoesList = document.getElementById('submissoes-list');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      userNameSpan.textContent = user.displayName || user.email;
      userEmailSpan.textContent = user.email;
      
      loadInscricoes(user.uid);
      loadSubmissoes(user.uid);

    } else {
      window.location.href = 'login.html';
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
      window.location.href = 'login.html';
    });
  }

  async function loadInscricoes(userId) {
    inscricoesList.innerHTML = '<li class="list-group-item text-center">Carregando inscrições...</li>';
    try {
      const q = query(collection(db, "inscricoes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        inscricoesList.innerHTML = '<li class="list-group-item text-center">Você ainda não possui inscrições.</li>';
      } else {
        inscricoesList.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
          const inscricao = doc.data();
          const li = document.createElement('li');
          li.className = 'list-group-item';
          li.innerHTML = `
            <div>
              <strong>Inscrição em:</strong> ${new Date(inscricao.dataInscricao.seconds * 1000).toLocaleString()}
              <br>
              <strong>Nome:</strong> ${inscricao.nome}
              <br>
              <strong>CPF:</strong> ${inscricao.cpf}
            </div>
          `;
          inscricoesList.appendChild(li);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar as inscrições:", error);
      inscricoesList.innerHTML = `<li class="list-group-item text-center text-danger">Erro ao carregar suas inscrições. Por favor, tente novamente.</li>`;
    }
  }

  async function loadSubmissoes(userId) {
    submissoesList.innerHTML = '<li class="list-group-item text-center">Carregando submissões...</li>';
    try {
      const q = query(collection(db, "submissoes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        submissoesList.innerHTML = '<li class="list-group-item text-center">Você ainda não submeteu nenhum trabalho.</li>';
      } else {
        submissoesList.innerHTML = '';
        querySnapshot.forEach((doc) => {
          const submissao = doc.data();
          const li = document.createElement('li');
          li.className = 'list-group-item';
          
          let parecerInfo = '';
          let statusBadgeClass = 'bg-secondary';
          if (submissao.status === 'Aprovado') {
              statusBadgeClass = 'bg-success';
          } else if (submissao.status === 'Rejeitado') {
              statusBadgeClass = 'bg-danger';
          }

          if (submissao.revisoes) {
              const dataAvaliacao = submissao.revisoes.dataAvaliacao.seconds ? new Date(submissao.revisoes.dataAvaliacao.seconds * 1000).toLocaleString() : 'Não disponível';
              parecerInfo = `
                <hr>
                <p><strong>Status da Revisão:</strong> <span class="badge ${statusBadgeClass}">${submissao.status}</span></p>
                <p><strong>Nota:</strong> ${submissao.revisoes.nota}/5</p>
                <p><strong>Parecer:</strong> ${submissao.revisoes.parecer}</p>
                <p><strong>Data da Avaliação:</strong> ${dataAvaliacao}</p>
              `;
          }

          li.innerHTML = `
            <div>
              <p><strong>Título:</strong> ${submissao.titulo}</p>
              <p><strong>Status:</strong> <span class="badge ${statusBadgeClass}">${submissao.status}</span></p>
              ${parecerInfo}
            </div>
          `;
          submissoesList.appendChild(li);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar as submissões:", error);
      submissoesList.innerHTML = `<li class="list-group-item text-center text-danger">Erro ao carregar suas submissões. Por favor, tente novamente.</li>`;
    }
  }
});