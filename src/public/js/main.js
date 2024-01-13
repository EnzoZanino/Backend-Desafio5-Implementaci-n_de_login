// document.addEventListener('DOMContentLoaded', function () {
//     const isLoginPage = window.location.pathname.includes('/login');
//     const currentUserEmail = localStorage.getItem('currentUserEmail');
//     const uldrop = document.getElementById('uldrop');
//     if (isLoginPage) {
//         return;
//     }
//     if (currentUserEmail) {
//         uldrop.innerHTML = `<li><a class="dropdown-item" href="#"><b>${currentUserEmail}</b></a></li>
//         <li><a class="adrop dropdown-item" href="#" onclick="logout()">Cerrar Sesión</a></li>`;
//     } else {
//         window.location.href = '/login';
//     }
// });

function logout() {
    window.location.replace("/logout");
}

login()
