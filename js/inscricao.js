import { auth, onAuthStateChanged, db, collection, addDoc, serverTimestamp } from './firebase.js';

function showBootstrapToast(message, isSuccess) {
  const toastLiveExample = document.getElementById('liveToast');
  const toastBody = toastLiveExample.querySelector('.toast-body');
  toastBody.textContent = message;

  const bsToast = new bootstrap.Toast(toastLiveExample);
  
  if (isSuccess) {
    toastBody.classList.remove('text-danger');
    toastBody.classList.add('text-success');
  } else {
    toastBody.classList.remove('text-success');
    toastBody.classList.add('text-danger');
  }
  
  bsToast.show();
}

document.addEventListener('DOMContentLoaded', function() {
  const inscricaoForm = document.getElementById('inscricao-form');

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      showBootstrapToast('Por favor, faça login para se inscrever.', false);
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  });

  inscricaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        showBootstrapToast('Erro: Usuário não autenticado.', false);
        return;
    }

    const nome = inscricaoForm.nome.value;
    const email = inscricaoForm.email.value;
    const cpf = inscricaoForm.cpf.value;
    const telefone = inscricaoForm.telefone.value;
    const observacoes = inscricaoForm.observacoes.value;

    try {
      await addDoc(collection(db, "inscricoes"), {
        userId: user.uid,
        nome: nome,
        email: email,
        cpf: cpf,
        telefone: telefone,
        observacoes: observacoes,
        dataInscricao: serverTimestamp()
      });

      console.log("Inscrição salva no Firestore com sucesso!");
      showBootstrapToast('Inscrição realizada com sucesso!', true);
      inscricaoForm.reset(); 
    } catch (error) {
      console.error("Erro ao enviar a inscrição:", error);
      showBootstrapToast(`Erro: ${error.message}`, false);
    }
  });
});