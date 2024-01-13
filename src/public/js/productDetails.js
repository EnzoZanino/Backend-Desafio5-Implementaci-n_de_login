const productDetailsSocket = io()
const productList = document.getElementById('productsList');

let editModal = document.getElementById('editModal')
let editForm = document.getElementById('editForm')

function botonEditar(pid) {
  function onModalShown(event) {
    let button = event.relatedTarget

    let productId = pid
    let title = button.getAttribute('data-bs-title')
    let description = button.getAttribute('data-bs-description')
    let price = button.getAttribute('data-bs-price')
    let thumbnail = button.getAttribute('data-bs-thumbnail')
    let code = button.getAttribute('data-bs-code')
    let stock = button.getAttribute('data-bs-stock')

    editModal.querySelector('.modal-body #productId').value = productId
    editModal.querySelector('.modal-body #editedTitle').value = title
    editModal.querySelector('.modal-body #editedTitle').focus()
    editModal.querySelector('.modal-body #editedDescription').value = description
    editModal.querySelector('.modal-body #editedPrice').value = price
    editModal.querySelector('.modal-body #editedThumbnail').value = thumbnail
    editModal.querySelector('.modal-body #editedCode').value = code
    editModal.querySelector('.modal-body #editedStock').value = stock;
    editModal.removeEventListener('shown.bs.modal', onModalShown);
  }
  editModal.addEventListener('shown.bs.modal', onModalShown);
}

const titleElement = document.getElementById('editedTitle');
const descriptionElement = document.getElementById('editedDescription');
const priceElement = document.getElementById('editedPrice');
const thumbnailElement = document.getElementById('editedThumbnail');
const codeElement = document.getElementById('editedCode');
const stockElement = document.getElementById('editedStock');

function saveChanges() {
  const productId = document.getElementById('productId').value;
  const title = titleElement.value;
  const description = descriptionElement.value;
  const price = priceElement.value;
  const thumbnail = thumbnailElement.value;
  const code = codeElement.value;
  const stock = stockElement.value;

  const editedProduct = {
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  };

  $('#editModal').modal('hide')

  productDetailsSocket.emit('editProduct', {
    productId,
    editedProduct
  });
}

const container_details = document.getElementById('container_details');

productDetailsSocket.on("productDetails", ({ product }) => {
    const newProductHTML = `
            <h1 class="text-center">Detalles del Producto</h1>
        
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="img-container" style="width: 70%; height: 100%; overflow: hidden;">
                        <img src="${product.thumbnail}" class="img-fluid" alt="${product.title}">
                    </div>
                </div>
                <div class="col-md-6">
                    <h2 class="text-info">${product.title}</h2>
                    <p class="description" style="font-weight: bold; font-size: 1.1em;">${product.description}</p>
                    <p>Precio: $ ${product.price}</p>
                    <p>Código: ${product.code}</p>
                    <p>Stock: ${product.stock}</p>
        
                    <div class="mt-4">
                        <button title="Editar" onclick="botonEditar('${product._id}')" class="btn btn-warning"
                            data-bs-toggle="modal" data-bs-target="#editModal" data-bs-title="${product.title}"
                            data-bs-stock="${product.stock}" data-bs-code="${product.code}"
                            data-bs-description="${product.description}" data-bs-price="${product.price}"
                            data-bs-thumbnail="${product.thumbnail}"><i class="fa-regular fa-pen-to-square"></i> Editar</button>
                        <button class="btn btn-danger" onclick="deleteProduct('${product._id}')"><i
                                class="fa-regular fa-trash-can"></i> Eliminar</button>
                        <a href="/realTimeProducts" class="btn btn-secondary"><i class="fa-regular fa-rotate-left"></i> Volver</a>
                    </div>
                </div>
            </div>
    `;

    container_details.innerHTML = newProductHTML;
});


editModal.addEventListener('hide.bs.modal', event => {
  editForm.reset()
})

function deleteProduct(productId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esto',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminarlo'
  }).then((result) => {
    if (result.isConfirmed) {
      productDetailsSocket.emit('deleteProduct', productId);
      window.location.href = '/realTimeProducts';
    }
  });
}
