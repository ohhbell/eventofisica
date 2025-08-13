// PASSO 1: COLE AQUI A SUA CONFIGURAÇÃO DO FIREBASE
// É fundamental que você substitua os valores abaixo pela sua própria configuração.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Pega referências para os formulários
const inscricaoForm = document.getElementById('inscricaoForm');
const submissaoForm = document.getElementById('submissaoForm');

// Pega referências para os botões do painel administrativo
const fetchInscricoesBtn = document.getElementById('fetchInscricoesBtn');
const fetchArtigosBtn = document.getElementById('fetchArtigosBtn');
const logoutBtn = document.getElementById('logoutBtn');
const exportInscricoesBtn = document.getElementById('exportInscricoesBtn');
const exportArtigosBtn = document.getElementById('exportArtigosBtn');


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
const userStatusNavLink = document.getElementById('userStatusNavLink');

// Pega referências para as tabelas do painel administrativo
const inscricoesTableBody = document.getElementById('inscricoesTableBody');
const artigosTableBody = document.getElementById('artigosTableBody');

// Variáveis para armazenar os dados para exportação
let inscricoesData = [];
let artigosData = [];


// Listener de autenticação para exibir/ocultar elementos
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário logado
        adminNavLink.classList.remove('d-none');
        logoutNavLink.classList.remove('d-none');
        document.getElementById('showLoginModalBtn').classList.add('d-none');
        adminPanel.classList.remove('d-none');
        fetchInscricoesAdmin();
        fetchArtigosAdmin();
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
        timestamp: new Date(),
        status: 'Aguardando'
    };

    try {
        await addDoc(collection(db, "inscricoes"), inscricaoData);
        showMessageModal('success', 'Inscrição realizada com sucesso!');
        inscricaoForm.reset();
    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        showMessageModal('danger', 'Ocorreu um erro ao processar a inscrição. Verifique o console para mais detalhes.');
    }
});

// Adiciona um ouvinte de evento para o formulário de submissão
submissaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submissaoData = {
        titulo: document.getElementById('tituloArtigo').value,
        autor: document.getElementById('autorArtigo').value,
        email: document.getElementById('emailArtigo').value,
        resumo: document.getElementById('resumoArtigo').value,
        timestamp: new Date(),
        status: 'Aguardando'
    };

    try {
        await addDoc(collection(db, "artigos"), submissaoData);
        showMessageModal('success', 'Submissão de artigo realizada com sucesso!');
        submissaoForm.reset();
    } catch (error) {
        console.error("Erro ao adicionar documento: ", error);
        showMessageModal('danger', 'Ocorreu um erro ao processar a submissão. Verifique o console para mais detalhes.');
    }
});


// Função para buscar e exibir as inscrições (Painel Admin)
async function fetchInscricoesAdmin() {
    inscricoesTableBody.innerHTML = '<tr><td colspan="7">Carregando inscrições...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, 'inscricoes'));
        if (querySnapshot.empty) {
            inscricoesTableBody.innerHTML = '<tr><td colspan="7">Nenhuma inscrição encontrada.</td></tr>';
            return;
        }

        inscricoesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        let html = '';
        inscricoesData.forEach(data => {
            html += `
                <tr>
                    <td>${data.nome}</td>
                    <td>${data.email}</td>
                    <td>${data.instituicao}</td>
                    <td>${data.curso}</td>
                    <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString('pt-BR') : 'N/A'}</td>
                    <td><span class="badge status-badge status-${data.status}">${data.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="updateInscricaoStatus('${data.id}', 'Aprovado')">Aprovar</button>
                        <button class="btn btn-sm btn-danger" onclick="updateInscricaoStatus('${data.id}', 'Rejeitado')">Rejeitar</button>
                    </td>
                </tr>
            `;
        });
        inscricoesTableBody.innerHTML = html;
    } catch (error) {
        inscricoesTableBody.innerHTML = '<tr><td colspan="7">Você não tem permissão para visualizar estes dados. Verifique as regras de segurança.</td></tr>';
        console.error("Erro ao carregar inscrições: ", error);
    }
}

// Função para buscar e exibir os artigos (Painel Admin)
async function fetchArtigosAdmin() {
    artigosTableBody.innerHTML = '<tr><td colspan="5">Carregando submissões...</td></tr>';
    try {
        const querySnapshot = await getDocs(collection(db, 'artigos'));
        if (querySnapshot.empty) {
            artigosTableBody.innerHTML = '<tr><td colspan="5">Nenhum artigo submetido.</td></tr>';
            return;
        }

        artigosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        let html = '';
        artigosData.forEach(data => {
            html += `
                <tr>
                    <td>${data.titulo}</td>
                    <td>${data.autor}</td>
                    <td>${data.email}</td>
                    <td>${data.resumo.substring(0, 50)}...</td>
                    <td>${data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString('pt-BR') : 'N/A'}</td>
                    <td><span class="badge status-badge status-${data.status}">${data.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="updateArtigoStatus('${data.id}', 'Aprovado')">Aprovar</button>
                        <button class="btn btn-sm btn-danger" onclick="updateArtigoStatus('${data.id}', 'Rejeitado')">Rejeitar</button>
                    </td>
                </tr>
            `;
        });
        artigosTableBody.innerHTML = html;
    } catch (error) {
        artigosTableBody.innerHTML = '<tr><td colspan="5">Você não tem permissão para visualizar estes dados. Verifique as regras de segurança.</td></tr>';
        console.error("Erro ao carregar artigos: ", error);
    }
}

// Funções para atualizar o status (Painel Admin)
async function updateInscricaoStatus(id, newStatus) {
    try {
        await updateDoc(doc(db, "inscricoes", id), { status: newStatus });
        showMessageModal('success', `Status da inscrição atualizado para "${newStatus}".`);
        fetchInscricoesAdmin(); // Atualiza a tabela
    } catch (error) {
        console.error("Erro ao atualizar status da inscrição: ", error);
        showMessageModal('danger', 'Erro ao atualizar o status. Verifique as regras de segurança.');
    }
}

async function updateArtigoStatus(id, newStatus) {
    try {
        await updateDoc(doc(db, "artigos", id), { status: newStatus });
        showMessageModal('success', `Status do artigo atualizado para "${newStatus}".`);
        fetchArtigosAdmin(); // Atualiza a tabela
    } catch (error) {
        console.error("Erro ao atualizar status do artigo: ", error);
        showMessageModal('danger', 'Erro ao atualizar o status. Verifique as regras de segurança.');
    }
}


// Login do administrador
adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        adminLoginModal.hide();
        adminLoginForm.reset();
        showMessageModal('success', 'Login realizado com sucesso!');
    } catch (error) {
        showMessageModal('danger', 'E-mail ou senha incorretos.');
        console.error("Erro de login: ", error);
    }
});


// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        showMessageModal('success', 'Você foi desconectado.');
    } catch (error) {
        showMessageModal('danger', 'Erro ao fazer logout.');
        console.error("Erro de logout: ", error);
    }
});


// Função para exibir o modal de mensagem
function showMessageModal(type, message) {
    const messageModalBody = document.getElementById('messageModalBody');
    messageModalBody.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
    messageModal.show();
}

// Funções de exportação para CSV
function exportToCsv(filename, data) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}


// Event listeners para os botões de exportação
exportInscricoesBtn.addEventListener('click', () => {
    if (inscricoesData.length > 0) {
        exportToCsv('inscricoes.csv', inscricoesData);
    } else {
        showMessageModal('warning', 'Nenhuma inscrição para exportar.');
    }
});

exportArtigosBtn.addEventListener('click', () => {
    if (artigosData.length > 0) {
        exportToCsv('submissoes_artigos.csv', artigosData);
    } else {
        showMessageModal('warning', 'Nenhum artigo para exportar.');
    }
});
