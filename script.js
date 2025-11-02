

  // Obtener el ID desde la URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  // Contenedor donde se mostrará el producto
  const contenedor = document.getElementById("detalle");

  // Leer el archivo JSON con los productos
  fetch("productos.json")
    .then(response => response.json())
    .then(productos => {
      // Buscar el producto con el ID indicado
      const producto = productos.find(p => p.id === id);

      // Mostrar los detalles en el HTML
      if (producto) {
        contenedor.innerHTML = `
          <div class="detalle-prod">
            <img src="${producto.imagen}" alt="${producto.nombre}">
              <div class="prod-nombre">
              <h2>${producto.nombre}</h2>
              <p>${producto.descripcion}</p>
              </div>
              <h3 class="h3-prod">$${producto.precio.toLocaleString()}</h3>
              <button class="btn-prod">
                Agregar al Carrito
              </button>
          </div>
        `;
      } else {
        contenedor.innerHTML = `<p>Producto no encontrado.</p>`;
      }
    })
    .catch(error => {
      console.error("Error al cargar el producto:", error);
      contenedor.innerHTML = `<p>Error al cargar los detalles del producto.</p>`;
    });



