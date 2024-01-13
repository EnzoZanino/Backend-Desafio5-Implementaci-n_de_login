const chatSocket = io();
const emailForm = document.getElementById('email-form');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');

// const userEmail = document.getElementById('user-email');
let currentUserEmail;

async function updateUserEmailContainer() {
    try {
        const response = await fetch('/getUserEmail');
        const data = await response.json();

        const userEmailContainer = document.getElementById('user-email');
        userEmailContainer.innerText = 'Usuario actual: ' + data.email;

        currentUserEmail = data.email;

        // Emitir el evento después de obtener el correo electrónico
        chatSocket.emit('userConnected', currentUserEmail);
    } catch (error) {
        console.error('Error al obtener el correo electrónico del usuario:', error);
    }
}

// Llamar a la función asíncrona
updateUserEmailContainer();

chatSocket.on('newUserConnected', newUserEmail => {
    Swal.fire({
        icon: 'success',
        title: 'Nuevo usuario conectado',
        text: `${newUserEmail} se ha unido al chat`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
    });
});

let chatHistory = [];
chatSocket.on("chatHistory", (history) => {
    chatHistory= history.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderChatHistory();
});

chatSocket.on("newChatMessage", (newMessage) => {
    chatHistory.unshift(newMessage);
    renderChatHistory();
});

sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== '') {
        chatSocket.emit('sendChatMessage', { email: currentUserEmail, message });
        messageInput.value = '';
    }
});
function renderChatHistory() {
    chatContainer.innerHTML = '';
    chatHistory.forEach((message) => {
        displayMessage(message);
    });
}
function displayMessage(message) {
    const formattedDate = new Date(message.date).toLocaleString();
    const isCurrentUser = message.email === currentUserEmail;
    const alignmentClass = isCurrentUser ? 'text-end' : 'text-start';
    const pForMe = `<div class="message-container ${alignmentClass}">
    <p class="date">${formattedDate} -<strong> ${message.email}</strong></p>
    <p class="message">${message.message}</p>
</div>`;
    const pForOther = `<div class="message-container ${alignmentClass}">
    <p class="date"><strong>${message.email}</strong> - ${formattedDate}</p>
    <p class="message">${message.message}</p>
</div>`;
    const pToUse = isCurrentUser ? pForMe : pForOther;
    chatContainer.innerHTML += pToUse;
}
