// variables
const botonesAgregar = document.querySelectorAll(".agregar-carrito");
const carrito = document.getElementById("carrito");
const carritoIcono = document.getElementById("carritoIcono");
const cerrarCarrito = document.querySelector(".cerrar-carrito"); 
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const btnPagar = document.getElementById("btnPagar");
const buscador = document.getElementById("buscador");
const productos = document.querySelectorAll(".producto");

let carritoProductos = [];

// Agregar productos al carrito
botonesAgregar.forEach(boton => {
  boton.addEventListener("click", () => {
    const productoDiv = boton.parentElement;
    const nombre = productoDiv.querySelector("h3").textContent;
    const precioTexto = productoDiv.querySelector("p").textContent.replace(/\$|\,/g, '');
    const precio = parseFloat(precioTexto);

    const existente = carritoProductos.find(p => p.nombre === nombre);

    if (existente) {
      existente.cantidad++;
    } else {
      carritoProductos.push({ nombre, precio, cantidad: 1 });
    }

    actualizarCarrito();
    carrito.classList.add("activo"); 
  });
});

// Mostrar/ocultar carrito
carritoIcono.addEventListener("click", () => {
  carrito.classList.toggle("activo");
});

cerrarCarrito.addEventListener("click", () => {
  carrito.classList.remove("activo");
});

// Actualizar carrito
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;
  let cantidadTotal = 0;

  carritoProductos.forEach((prod, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${prod.nombre}</strong><br>
        $${(prod.precio * prod.cantidad).toLocaleString("es-AR")}
      </div>
      <div class="botones-cantidad">
        <button onclick="cambiarCantidad(${index}, -1)">-</button>
        ${prod.cantidad}
        <button onclick="cambiarCantidad(${index}, 1)">+</button>
      </div>
    `;
    listaCarrito.appendChild(li);

    total += prod.precio * prod.cantidad;
    cantidadTotal += prod.cantidad;
  });

  totalCarrito.textContent = total.toLocaleString("es-AR");
  contadorCarrito.textContent = cantidadTotal;
}

// Cambiar cantidad
window.cambiarCantidad = function(index, cambio) {
  carritoProductos[index].cantidad += cambio;
  if (carritoProductos[index].cantidad <= 0) {
    carritoProductos.splice(index, 1);
  }
  actualizarCarrito();
};

// Botón pagar
btnPagar.addEventListener("click", () => {
  if (carritoProductos.length === 0) {
    alert("Tu carrito está vacío 🛒");
    return;
  }
  alert("Gracias por tu compra 💳");
  carritoProductos = [];
  actualizarCarrito();
});

// Buscador
buscador.addEventListener("input", () => {
  const filtro = buscador.value.toLowerCase();
  productos.forEach(producto =>{
    const nombre = producto.querySelector("h3").textContent.toLowerCase();
    if (nombre.includes(filtro)){
      producto.style.display = "flex";
    } else {
      producto.style.display = "none";
    }
  });
  });


