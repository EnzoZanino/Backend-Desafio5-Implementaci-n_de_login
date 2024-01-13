document.addEventListener('DOMContentLoaded', () => {
    const storedEmail = localStorage.getItem('currentUserEmail');
    if (storedEmail) {
        window.location.href = '/realTimeProducts';
    }
});

const loginForm = document.getElementById('loginForm');
const userEmailInput = document.getElementById('emailInput');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userEmail = userEmailInput.value.trim();
    if (userEmail) {
        localStorage.setItem('currentUserEmail', userEmail);
        window.location.href = '/realTimeProducts';
    } else {
        console.log('El correo electrónico no puede estar vacío');
    }
});

