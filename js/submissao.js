import { auth, onAuthStateChanged, db, collection, addDoc, serverTimestamp } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
  const sidenav = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenav);

  const submissaoForm = document.getElementById('submissao-form');

  // Verificação de autenticação
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Se não houver usuário logado, redireciona para a página de login
      M.toast({html: 'Por favor, faça login para submeter um trabalho.', classes: 'red darken-3'});
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    }
  });

  // Lógica de envio do formulário para o Firestore
  submissaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        M.toast({html: 'Erro: Usuário não autenticado.', classes: 'red darken-3'});
        return;
    }

    // Capturar os valores do formulário
    const titulo = submissaoForm.titulo.value;
    const autores = submissaoForm.autores.value;
    const resumo = submissaoForm.resumo.value;
    const palavrasChave = submissaoForm['palavras-chave'].value;

    try {
      // Adicionar um novo documento na coleção 'submissoes'
      await addDoc(collection(db, "submissoes"), {
        userId: user.uid,
        titulo: titulo,
        autores: autores,
        resumo: resumo,
        palavrasChave: palavrasChave,
        status: "Pendente", // Status inicial para o revisor
        dataSubmissao: serverTimestamp() 
      });

      M.toast({html: 'Submissão realizada com sucesso!', classes: 'green darken-3'});
      submissaoForm.reset(); 

    } catch (error) {
      console.error("Erro ao enviar a submissão:", error);
      M.toast({html: `Erro: ${error.message}`, classes: 'red darken-3'});
    }
  });
});