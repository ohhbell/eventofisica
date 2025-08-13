// PASSO 1: COLE AQUI A SUA CONFIGURAÇÃO DO FIREBASE
// É fundamental que você substitua os valores abaixo pela sua própria configuração.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCH8XQfCunSqGXKTMEdM4ZTrq2aRZ0--2o",
    authDomain: "site-evento.firebaseapp.com",
    projectId: "site-evento",
    storageBucket: "site-evento.firebasestorage.app",
    messagingSenderId: "674144936271",
    appId: "1:674144936271:web:bae7fb91cac12d4b15253a",
    measurementId: "G-96P7F28HEE"
  };
  
// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Pega referências para os formulários
const inscricaoForm = document.getElementById('inscricaoForm');
const submissaoForm = document.getElementById('submissaoForm');

// Pega referências para os botões do painel administrativo
const fetchInscricoesBtn = document.getElementById('fetchInscricoesBtn');
const fetchArtigosBtn = document.getElementById('fetchArtigosBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Pega referências para o modal de mensagem
const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
const messageModalBody = document.getElementById('messageModalBody');

// Pega referências para o modal de login do admin
const adminLoginModal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPanel = document.getElementById('admin');

// Pega referências para os links de navegação
const adminNavLink = document.getElementById('adminNavLink');
const logoutNavLink = document.getElementById('logoutNavLink');

// Listener de autenticação para exibir/ocultar elementos
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário logado
        adminNavLink.classList.remove('d-none');
        logoutNavLink.classList.remove('d-none');
        document.getElementById('showLoginModalBtn').classList.add('d-none');
        adminPanel.classList.remove('d-none');
        fetchInscricoes();
        fetchArtigos();
        console.log("Usuário logado:", user.uid);
        console.log("IMPORTANTE: Copie este UID e adicione-o na coleção 'organizadores' do Firestore para que as regras de segurança permitam o acesso.");

    } else {
        // Usuário deslogado
        adminNavLink.classList.add('d-none');
        logoutNavLink.classList.add('d-none');
        document.getElementById('showLoginModalBtn').classList.remove('d-none');
        adminPanel.classList.add('d-none');
    }
});

// Adiciona um ouvinte de evento para o formulário de inscrição
inscricaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inscricaoData = {
        nome: document.getElementById('nomeInscricao').value,
        email: document.getElementById('emailInscricao').value,
        instituicao: document.getElementById('instituicaoInscricao').value,
        curso: document.getElementById('cursoInscricao').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await db.collection('inscricoes').add(inscricaoData);
        showMessageModal('success', 'Inscrição realizada com sucesso! Aguarde o contato da nossa equipe.');
        inscricaoForm.reset();
    } catch (error) {
        showMessageModal('danger', 'Ocorreu um erro ao processar a inscrição. Tente novamente.');
        console.error("Erro ao adicionar documento de inscrição: ", error);
    }
});

// Adiciona um ouvinte de evento para o formulário de submissão de artigo
submissaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const artigoData = {
        titulo: document.getElementById('tituloArtigo').value,
        autor: document.getElementById('autorArtigo').value,
        email: document.getElementById('emailArtigo').value,
        resumo: document.getElementById('resumoArtigo').value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await db.collection('artigos').add(artigoData);
        showMessageModal('success', 'Artigo submetido com sucesso! Em breve entraremos em contato para informar o status.');
        submissaoForm.reset();
    } catch (error) {
        showMessageModal('danger', 'Ocorreu um erro ao submeter o artigo. Tente novamente.');
        console.error("Erro ao adicionar documento de artigo: ", error);
    }
});

// Lógica de login e logout
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        adminLoginModal.hide();
        showMessageModal('success', 'Login realizado com sucesso!');
        adminLoginForm.reset();
        // A função onAuthStateChanged cuidará da exibição do painel
    } catch (error) {
        showMessageModal('danger', 'E-mail ou senha incorretos.');
        console.error("Erro de login: ", error);
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        showMessageModal('success', 'Você foi desconectado.');
        // A função onAuthStateChanged cuidará de esconder o painel
    } catch (error) {
        showMessageModal('danger', 'Erro ao fazer logout.');
        console.error("Erro de logout: ", error);
    }
});

// Botões de atualização
fetchInscricoesBtn.addEventListener('click', fetchInscricoes);
fetchArtigosBtn.addEventListener('click', fetchArtigos);

// Função para buscar e exibir as inscrições
async function fetchInscricoes() {
    const inscricoesTableBody = document.getElementById('inscricoesTableBody');
    inscricoesTableBody.innerHTML = '<tr><td colspan="5">Carregando inscrições...</td></tr>';
    try {
        const snapshot = await db.collection('inscricoes').get();
        if (snapshot.empty) {
            inscricoesTableBody.innerHTML = '<tr><td colspan="5">Nenhuma inscrição encontrada.</td></tr>';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <tr>
                    <td>${data.nome}</td>
                    <td>${data.email}</td>
                    <td>${data.instituicao}</td>
                    <td>${data.curso}</td>
                    <td>${data.timestamp ? data.timestamp.toDate().toLocaleString('pt-BR') : 'N/A'}</td>
                </tr>
            `;
        });
        inscricoesTableBody.innerHTML = html;
    } catch (error) {
        inscricoesTableBody.innerHTML = '<tr><td colspan="5">Você não tem permissão para visualizar estes dados. Verifique as regras de segurança.</td></tr>';
        console.error("Erro ao carregar inscrições: ", error);
    }
}

// Função para buscar e exibir os artigos
async function fetchArtigos() {
    const artigosTableBody = document.getElementById('artigosTableBody');
    artigosTableBody.innerHTML = '<tr><td colspan="5">Carregando submissões...</td></tr>';
    try {
        const snapshot = await db.collection('artigos').get();
        if (snapshot.empty) {
            artigosTableBody.innerHTML = '<tr><td colspan="5">Nenhum artigo submetido.</td></tr>';
            return;
        }
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            html += `
                <tr>
                    <td>${data.titulo}</td>
                    <td>${data.autor}</td>
                    <td>${data.email}</td>
                    <td>${data.resumo.substring(0, 50)}...</td>
                    <td>${data.timestamp ? data.timestamp.toDate().toLocaleString('pt-BR') : 'N/A'}</td>
                </tr>
            `;
        });
        artigosTableBody.innerHTML = html;
    } catch (error) {
        artigosTableBody.innerHTML = '<tr><td colspan="5">Você não tem permissão para visualizar estes dados. Verifique as regras de segurança.</td></tr>';
        console.error("Erro ao carregar artigos: ", error);
    }
}

// Função para exibir o modal de mensagem
function showMessageModal(type, message) {
    messageModalBody.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    messageModal.show();
}