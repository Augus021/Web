// Obtiene el parámetro "id" de la URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));
const contenedor = document.getElementById("detalle");

// Carga el archivo JSON con los productos
fetch("productos.json")
  .then(res => res.json())
  .then(productos => {
    // Busca el producto por ID
    const producto = productos.find(p => p.id === id);

    if (!producto) {
      contenedor.innerHTML = "<p>Producto no encontrado</p>";
      return;
    }

    // Muestra la información en pantalla
    contenedor.innerHTML = `
      <div class="detalle-prod">
        <div class="detalle-img">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="detalle-info">
          <h2>${producto.nombre}</h2>
          <p>${producto.descripcion}</p>
          <h3 class="h3-prod">$${producto.precio.toLocaleString("es-AR")}</h3>
          <button id="btnComprar" style="width: 80%; align-self: center;">COMPRAR</button>
    `;
     const btnComprar = document.getElementById("btnComprar");
    btnComprar.addEventListener("click", () => {
      alert(`✅ ¡Gracias por tu compra de ${producto.nombre}! 💳`);
    });

    })
    .catch(err => {
        console.error("Error al cargar producto:", err);
        contenedor.innerHTML = "<p>Error al cargar los datos del producto.</p>";
    });
 

