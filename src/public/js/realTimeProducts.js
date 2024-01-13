const realTimeProductsSocket = io();
const productList = document.getElementById("productsList");
// const currentUserEmail = localStorage.getItem("currentUserEmail");

// realTimeProductsSocket.emit("messageRTP", currentUserEmail);

let currentUserEmail;
async function updateUserEmailContainer() {
    try {
        const response = await fetch('/getUserEmail');
        const data = await response.json();

        currentUserEmail = data.email;

        // Emitir el evento después de obtener el correo electrónico
        realTimeProductsSocket.emit("messageRTP", currentUserEmail);
    } catch (error) {
        console.error('Error al obtener el correo electrónico del usuario:', error);
    }
}
// Llamar a la función asíncrona
updateUserEmailContainer();

realTimeProductsSocket.on("realTimeProducts", ({ products, cart }) => {
	if (productList) {
		productList.innerHTML = "";
		products.forEach((product) => {
			const { thumbnail, title, description, price, code, stock, _id } = product;
			const cartProduct = cart.products.find(
				(cartItem) => cartItem.productId._id.toString() === _id
			);
			const quantityInCart = cartProduct ? cartProduct.quantity : "";
			let contador;
			if (quantityInCart > 1) {
				contador = `<div class="mb-2">
        <button type="button" class="btn btn-danger btn-subtract" data-product-id="${_id}">-</button>
        <span class="mx-2"><b>${quantityInCart}</b></span>
        <button type="button" class="btn btn-primary btn-add" data-product-id="${_id}">+</button>
        </div> `;
			} else if (quantityInCart === 1) {
				contador = `<div class="mb-2">
        <button type="button" class="btn btn-danger btn-delete" data-product-id="${_id}">-</button>
        <span class="mx-2"><b>${quantityInCart}</b></span>
        <button type="button" class="btn btn-primary btn-add" data-product-id="${_id}">+</button>
        </div> `;
			} else {
				contador = `<div style="height: 46px;"></div>`;
			}

			productList.innerHTML += `
	<div class="col-md-6 col-lg-4" id="${_id}">
		<div class="card mt-4 bg-light" style="width: 100%;">
			<div class="img-container" style="width: 150px; height: 150px; overflow: hidden; margin: 0 auto;">
				<img src="${thumbnail}"	class="card-img-top" alt="${title}"	style="width: 100%; height: 100%; object-fit: cover;"/>
			</div>
			<div class="card-body" style="height: 250px;">
				<h2 class="card-title text-info">${title}</h2>
				<p
					class="card-text description"
					style="font-weight: bold; font-size: 1.1em;"
				>${description}</p>
				<p class="card-text">Precio: $ ${price}</p>
				<p class="card-text">Código: ${code}</p>
				<p class="card-text">Stock: ${stock}</p>
			</div>
			<div class="card-footer text-center ps-0 pe-0">
			${contador}
				<div>
					<button title="Agregar al Carrito" class="btn btn-success position-relative" onclick="btnAddToCart('${_id}')"><i class="fa-regular fa-shopping-cart"></i></button>
					<a href="/realTimeProducts/${_id}" title="Ver Mas" class="btn btn-info"><i class="fa-regular fa-circle-info"></i></a>
					<button title="Editar" onclick="botonEditar('${_id}')" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editModal" data-bs-title="${title}" data-bs-stock="${stock}" data-bs-code="${code}" data-bs-description="${description}" data-bs-price="${price}" data-bs-thumbnail="${thumbnail}"><i class="fa-regular fa-pen-to-square"></i></button>
					<button title="Eliminar" class="btn btn-danger" onclick="deleteProduct('${_id}')"><i class="fa-regular fa-trash-can"></i></button>
				</div>
			</div>
		</div>
	</div>
`;
});
	} else {
		console.log("Elemento 'product-list' no encontrado en el DOM");
	}
});
productList.addEventListener("click", (event) => {
	const target = event.target;
	const productId = target.dataset.productId
		? target.dataset.productId.toString()
		: null;

	if (target.classList.contains("btn-add")) {
		realTimeProductsSocket.emit("updateCart", { productId, action: "add" });
	}

	if (target.classList.contains("btn-subtract")) {
		realTimeProductsSocket.emit("updateCart", { productId, action: "subtract" });
	}

	if (target.classList.contains("btn-delete")) {
		realTimeProductsSocket.emit("deleteFromCart", { productId });
	}
});
document
	.getElementById("addProductForm")
	.addEventListener("submit", function (event) {
		event.preventDefault();
		const title = document.getElementById("title").value;
		const description = document.getElementById("description").value;
		const price = document.getElementById("price").value;
		const thumbnail = document.getElementById("thumbnail").value;
		const code = document.getElementById("code").value;
		const stock = document.getElementById("stock").value;

		realTimeProductsSocket.emit("addProduct", {
			title,
			description,
			price,
			thumbnail,
			code,
			stock,
		});

		this.reset();
	});

let editModal = document.getElementById("editModal");
let editForm = document.getElementById("editForm");
function botonEditar(pid) {
	function onModalShown(event) {
		let button = event.relatedTarget;

		let productId = pid;
		let title = button.getAttribute("data-bs-title");
		let description = button.getAttribute("data-bs-description");
		let price = button.getAttribute("data-bs-price");
		let thumbnail = button.getAttribute("data-bs-thumbnail");
		let code = button.getAttribute("data-bs-code");
		let stock = button.getAttribute("data-bs-stock");

		editModal.querySelector(".modal-body #productId").value = productId;
		editModal.querySelector(".modal-body #editedTitle").value = title;
		editModal.querySelector(".modal-body #editedTitle").focus();
		editModal.querySelector(".modal-body #editedDescription").value = description;
		editModal.querySelector(".modal-body #editedPrice").value = price;
		editModal.querySelector(".modal-body #editedThumbnail").value = thumbnail;
		editModal.querySelector(".modal-body #editedCode").value = code;
		editModal.querySelector(".modal-body #editedStock").value = stock;
		editModal.removeEventListener("shown.bs.modal", onModalShown);
	}
	editModal.addEventListener("shown.bs.modal", onModalShown);
}
function saveChanges() {
	const productId = document.getElementById("productId").value;
	const title = document.getElementById("editedTitle").value;
	const description = document.getElementById("editedDescription").value;
	const price = document.getElementById("editedPrice").value;
	const thumbnail = document.getElementById("editedThumbnail").value;
	const code = document.getElementById("editedCode").value;
	const stock = document.getElementById("editedStock").value;

	const editedProduct = {
		title,
		description,
		price,
		thumbnail,
		code,
		stock,
	};

	$("#editModal").modal("hide");

	realTimeProductsSocket.emit("editProduct", {
		productId,
		editedProduct,
	});
}

editModal.addEventListener("hide.bs.modal", (event) => {
	editForm.reset();
});

function deleteProduct(productId) {
	Swal.fire({
		title: "¿Estás seguro?",
		text: "No podrás revertir esto",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#d33",
		cancelButtonColor: "#3085d6",
		confirmButtonText: "Sí, eliminarlo",
	}).then((result) => {
		if (result.isConfirmed) {
			realTimeProductsSocket.emit("deleteProduct", productId);
		}
	});
}
function btnAddToCart(productId) {
	realTimeProductsSocket.emit("addToCart", { productId, currentUserEmail });
}
async function sortByPrice(order) {
	realTimeProductsSocket.emit("filtrando", currentUserEmail);
	realTimeProductsSocket.on("carroParaFiltro", async ({ cart }) => {
		try {
			const response = await fetch(`/api/products?sort=${order}`);
			const data = await response.json();
			productList.innerHTML = "";
			data.forEach((product) => {
				const { thumbnail, title, description, price, code, stock, _id } = product;
				const cartProduct = cart.products.find(
					(cartItem) => cartItem.productId._id.toString() === _id
				);
				const quantityInCart = cartProduct ? cartProduct.quantity : "";
				let contador;
				if (quantityInCart > 1) {
					contador = `<div class="mb-2">
									<button type="button" class="btn btn-danger btn-subtract" data-product-id="${_id}">
										-
									</button>
									<span class="mx-2">
										<b>${quantityInCart}</b>
									</span>
									<button type="button" class="btn btn-primary btn-add" data-product-id="${_id}">
										+
									</button>
								</div> `;
				} else if (quantityInCart === 1) {
					contador = `<div class="mb-2">
									<button type="button" class="btn btn-danger btn-delete" data-product-id="${_id}">
										-
									</button>
									<span class="mx-2">
										<b>${quantityInCart}</b>
									</span>
									<button type="button" class="btn btn-primary btn-add" data-product-id="${_id}">
										+
									</button>
								</div> `;
				} else {
					contador = `<div style="height: 46px;"></div>`;
				}

	productList.innerHTML += `
		<div class="col-md-6 col-lg-4" id="${_id}">
			<div class="card mt-4 bg-light" style="width: 100%;">
				<div class="img-container" style="width: 150px; height: 150px; overflow: hidden; margin: 0 auto;">
					<img src="${thumbnail}" class="card-img-top" alt="${title}"	style="width: 100%; height: 100%; object-fit: cover;"/>
				</div>
				<div class="card-body" style="height: 250px;">
					<h2 class="card-title text-info">${title}</h2>
					<p class="card-text description" style="font-weight: bold; font-size: 1.1em;">
						${description}
					</p>
					<p class="card-text">
						Precio: $ ${price}
					</p>
					<p class="card-text">
						Código: ${code}
					</p>
					<p class="card-text">
						Stock: ${stock}
					</p>
				</div>
				<div class="card-footer text-center ps-0 pe-0">
					${contador}
					<div>
					<button title="Agregar al Carrito" class="btn btn-success position-relative" onclick="btnAddToCart('${_id}')"><i class="fa-regular fa-shopping-cart"></i></button>
					<a href="/realTimeProducts/${_id}" title="Ver Mas" class="btn btn-info">
						<i class="fa-regular fa-circle-info"></i>
					</a>
					<button title="Editar" onclick="botonEditar('${_id}')" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editModal" data-bs-title="${title}" data-bs-stock="${stock}" data-bs-code="${code}" data-bs-description="${description}" data-bs-price="${price}" data-bs-thumbnail="${thumbnail}">
						<i class="fa-regular fa-pen-to-square"></i>
					</button>
					<button title="Eliminar" class="btn btn-danger" onclick="deleteProduct('${_id}')">
						<i class="fa-regular fa-trash-can"></i>
					</button>
					</div>
				</div>
			</div>
		</div>`;
	});
		} catch (error) {
			console.error("Error al ordenar productos:", error);
		}
	});
}
function resetPrice() {
	realTimeProductsSocket.emit("messageRTP", currentUserEmail);
}
