import { loginParticipante, registerParticipante, loginRevisor } from './auth.js';

// Função para exibir um toast do Bootstrap
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
  const loginFormParticipante = document.getElementById('participante-login-form');
  const registroFormParticipante = document.getElementById('participante-registro-form');
  const loginFormRevisor = document.getElementById('revisor-login-form');

  // Lógica de Login de Participante
  loginFormParticipante.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginFormParticipante.email_login_participante.value;
    const password = loginFormParticipante.senha_login_participante.value;

    const result = await loginParticipante(email, password);
    if (result.success) {
      showBootstrapToast('Login bem-sucedido!', true);
      window.location.href = 'dashboard.html';
    } else {
      showBootstrapToast(`Erro: ${result.error}`, false);
    }
  });

  // Lógica de Registro de Participante
  registroFormParticipante.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registroFormParticipante.email_registro_participante.value;
    const password = registroFormParticipante.senha_registro_participante.value;

    const result = await registerParticipante(email, password);
    if (result.success) {
      showBootstrapToast('Registro concluído! Por favor, verifique seu e-mail para continuar.', true);
      registroFormParticipante.reset();
    } else {
      showBootstrapToast(`Erro: ${result.error}`, false);
    }
  });

  // Lógica de Login de Revisor
  loginFormRevisor.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginFormRevisor.email_revisor.value;
    const password = loginFormRevisor.senha_revisor.value;

    const result = await loginRevisor(email, password);
    if (result.success) {
      showBootstrapToast('Login de revisor bem-sucedido!', true);
      window.location.href = 'revisor.html';
    } else {
      showBootstrapToast(`Erro: ${result.error}`, false);
    }
  });
});