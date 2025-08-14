import { auth, onAuthStateChanged, db, doc, getDoc, updateDoc } from './firebase.js';
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
  const submissaoDetalhes = document.getElementById('submissao-detalhes');
  const avaliacaoForm = document.getElementById('avaliacao-form');
  const logoutBtn = document.getElementById('logout-btn');
  let submissaoId = null;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      submissaoId = urlParams.get('id');

      if (!submissaoId) {
        submissaoDetalhes.innerHTML = `<p class="text-danger">ID da submissão não encontrado.</p>`;
        return;
      }
      
      loadSubmissaoDetalhes(submissaoId);

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

  async function loadSubmissaoDetalhes(id) {
    try {
      const docRef = doc(db, "submissoes", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const submissao = docSnap.data();
        submissaoDetalhes.innerHTML = `
          <h5><strong>Título:</strong> ${submissao.titulo}</h5>
          <p><strong>Autores:</strong> ${submissao.autores}</p>
          <p><strong>Resumo:</strong> ${submissao.resumo}</p>
          <p><strong>Palavras-chave:</strong> ${submissao.palavrasChave}</p>
        `;
      } else {
        submissaoDetalhes.innerHTML = `<p class="text-danger">Trabalho não encontrado.</p>`;
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do trabalho:", error);
      submissaoDetalhes.innerHTML = `<p class="text-danger">Erro ao carregar os detalhes. Tente novamente.</p>`;
    }
  }

  avaliacaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!submissaoId) return;

    const user = auth.currentUser;
    if (!user) {
      showBootstrapToast('Erro: Usuário não autenticado.', false);
      return;
    }

    const nota = avaliacaoForm.nota.value;
    const parecer = avaliacaoForm.parecer.value;
    const status = avaliacaoForm.status.value;

    try {
      const docRef = doc(db, "submissoes", submissaoId);
      
      await updateDoc(docRef, {
        status: status,
        revisoes: {
            revisorId: user.uid,
            nota: nota,
            parecer: parecer,
            dataAvaliacao: new Date()
        }
      });
      
      showBootstrapToast('Avaliação enviada com sucesso!', true);
      avaliacaoForm.reset();
      
      setTimeout(() => {
        window.location.href = 'revisor.html';
      }, 2000);

    } catch (error) {
      console.error("Erro ao enviar a avaliação:", error);
      showBootstrapToast(`Erro: ${error.message}`, false);
    }
  });
});