// import name from "../../routes/LoginAndRegister/sessions.router.js"

const cartSocket = io();
const cartContainer = document.getElementById('cart-container');
const checkoutBTN = document.getElementById('checkout-btn');
const totalAmountElement = document.getElementById('total-amount');
// // const userEmail = document.getElementById('user-email');
// // const currentUserEmail = localStorage.getItem('currentUserEmail');

// // cartSocket.emit('userCartAuth', currentUserEmail);
// // userEmail.innerText = `Usuario: ${currentUserEmail}`;

let currentUserEmail;
async function updateUserEmailContainer() {
    try {
        const response = await fetch('/getUserEmail');
        const data = await response.json();

        const userEmailContainer = document.getElementById('user-email');
        userEmailContainer.innerText = 'Usuario: ' + data.email;

        currentUserEmail = data.email;

        // Emitir el evento después de obtener el correo electrónico
        cartSocket.emit('userCartAuth', currentUserEmail);

    } catch (error) {
        console.error('Error al obtener el correo electrónico del usuario:', error);
    }
}
// Llamar a la función asíncrona
updateUserEmailContainer();

cartSocket.on('productsCartInfo', (productsInfo) => {
    cartContainer.innerHTML=''
    let totalAmount = 0;
    productsInfo.forEach(product => {
        const productTotal = product.quantity * product.info.price;
        totalAmount += productTotal;

        cartContainer.innerHTML +=`
        <div class="card mb-3 p-2">
            <div class="row g-0 p-auto">
                <div class="col-md-4 justify-content-center">
                    <img src="${product.info.thumbnail}" alt="${product.info.title}" class="img-fluid">
                </div>
                <div class="col-md-6 card-body justify-content-center">
                        <h3 class="card-title">${product.info.title}</h3>
                        <h5 class="card-text">${product.info.description}</h5>
                </div>
                <div class="col-md-2 justify-content-center">
                    <div class="d-flex flex-column align-items-center">
                        <div class="mb-2">
                            <button type="button" class="btn btn-outline-primary btn-sm btn-subtract" data-product-id="${product.info._id}">-</button>
                            <span class="mx-2"><b>${product.quantity}</b></span>
                            <button type="button" class="btn btn-outline-primary btn-sm btn-add" data-product-id="${product.info._id}">+</button>
                        </div>                        
                        <p class="mb-0">Código: ${product.info.code}</p>
                        <p class="mb-0">Stock: ${product.info.stock}</p>
                        <p class="mb-0">Precio: <b>$${product.info.price.toFixed(2)}</b></p>
                        <p class="mb-0">Total: <b>$${(product.quantity * product.info.price).toFixed(2)}</b></p>
                        <button type="button" class="btn btn-danger btn-sm btn-delete" data-product-id="${product.info._id}">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>`;
    })
    totalAmountElement.innerText = `${totalAmount.toFixed(2)}`
});

cartContainer.addEventListener('click', (event) => {
    const target = event.target;

    const productId = target.dataset.productId;

    if (target.classList.contains('btn-add')) {
        cartSocket.emit('updateCart', { productId, action: 'add' });
    }

    if (target.classList.contains('btn-subtract')) {
        cartSocket.emit('updateCart', { productId, action: 'subtract' });
    }

    if (target.classList.contains('btn-delete')) {
        cartSocket.emit('deleteFromCart', { productId });
    }
});

cartSocket.on('userCart', ({ userCart, productInfo }) => {
    cartContainer.innerHTML = '';
    userCart.products.forEach(async (product) => {
        cartContainer.innerHTML += `
                <div class="card mb-3">
                    <div class="row g-0">
                        <div class="col-md-2">
                            <img src="${productInfo.thumbnail}" alt="${productInfo.title}" class="img-fluid">
                        </div>
                        <div class="col-md-8 card-body">
                                <h5 class="card-title">${productInfo.title}</h5>
                                <p class="card-text">${productInfo.description}</p>
                        </div>
                        <div class="col-md-2">
                            <div class="d-flex flex-column align-items-center">
                                <div class="mb-2">
                                    <button type="button" class="btn btn-outline-primary btn-sm btn-subtract" data-product-id="${productInfo._id}">-</button>
                                    <span class="mx-2">${product.quantity}</span>
                                    <button type="button" class="btn btn-outline-primary btn-sm btn-add" data-product-id="${productInfo._id}">+</button>
                                </div>                        
                                <p class="mb-0">Código: ${productInfo.code}</p>
                                <p class="mb-0">Stock: ${productInfo.stock}</p>
                                <p class="mb-0">Precio: $${productInfo.price.toFixed(2)}</p>
                                <p class="mb-0">Total: $${(product.quantity * productInfo.price).toFixed(2)}</p>
                                <button type="button" class="btn btn-danger btn-sm btn-delete" data-product-id="${productInfo._id}">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>`;
    });
});

function vaciarCarritoBTN() {
    cartSocket.emit('clearCart');
}