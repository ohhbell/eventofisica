import { auth, onAuthStateChanged, db, collection, query, getDocs, doc, getDoc } from './firebase.js';
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
  const userEmailSpan = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const submissoesList = document.getElementById('submissoes-list');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "revisores", user.uid));
      if (!userDoc.exists()) {
        window.location.href = 'index.html';
        return;
      }

      userEmailSpan.textContent = user.email;
      loadSubmissoes();
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

  async function loadSubmissoes() {
    submissoesList.innerHTML = '<p class="text-center">Carregando submissões...</p>';
    try {
      const querySnapshot = await getDocs(collection(db, "submissoes"));
      
      if (querySnapshot.empty) {
        submissoesList.innerHTML = '<p class="text-center">Não há submissões para revisão no momento.</p>';
      } else {
        submissoesList.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
          const submissao = doc.data();
          const card = document.createElement('div');
          card.className = 'card mb-3';

          let statusBadgeClass = 'bg-secondary';
          if (submissao.status === 'Aprovado') {
              statusBadgeClass = 'bg-success';
          } else if (submissao.status === 'Rejeitado') {
              statusBadgeClass = 'bg-danger';
          }

          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">${submissao.titulo}</h5>
              <p class="card-text"><strong>Autor:</strong> ${submissao.autores}</p>
              <p class="card-text"><strong>Status:</strong> <span class="badge ${statusBadgeClass}">${submissao.status}</span></p>
              <p class="card-text">${submissao.resumo}</p>
              <a href="revisao.html?id=${doc.id}" class="btn btn-primary">Revisar</a>
            </div>
          `;
          submissoesList.appendChild(card);
        });
      }
    } catch (error) {
      console.error("Erro ao carregar as submissões:", error);
      submissoesList.innerHTML = `<p class="text-center text-danger">Erro ao carregar submissões. Por favor, tente novamente.</p>`;
    }
  }
});