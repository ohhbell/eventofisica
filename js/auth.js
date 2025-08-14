import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification } from './firebase.js';

// Função para registrar um participante com verificação de e-mail
const registerParticipante = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    console.log("Usuário registrado com sucesso. E-mail de verificação enviado.");
    return { success: true };
  } catch (error) {
    console.error("Erro no registro:", error);
    return { success: false, error: error.message };
  }
};

// Função para login de participante (verifica se o e-mail está confirmado)
const loginParticipante = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user.emailVerified) {
      console.log("Login de participante bem-sucedido.");
      return { success: true };
    } else {
      await signOut(auth); // Desloga o usuário se o e-mail não foi verificado
      return { success: false, error: 'Por favor, verifique seu e-mail para continuar.' };
    }
  } catch (error) {
    console.error("Erro no login do participante:", error);
    return { success: false, error: error.message };
  }
};

// Função para login de revisor (sem verificação de e-mail)
const loginRevisor = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login de revisor bem-sucedido.");
    return { success: true };
  } catch (error) {
    console.error("Erro no login do revisor:", error);
    return { success: false, error: error.message };
  }
};

// Função de logout
const logout = async () => {
  try {
    await signOut(auth);
    console.log("Logout bem-sucedido.");
    return { success: true };
  } catch (error) {
    console.error("Erro no logout:", error);
    return { success: false, error: error.message };
  }
};

export { registerParticipante, loginParticipante, loginRevisor, logout };