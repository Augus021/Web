// =========================================== //
// ========== CONEXION CON AIRTABLE ========== //
// =========================================== //
const API_TOKEN = 'patcGM15PGqT7CbqR.c9867fc358c0a25fd84167ac584d913a638bd8eb55f035a1468200da78ee4f62';
const BASE_ID = 'appul61rDwdhr6xkN';
const TABLE_NAME = 'Productos';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;



// ===================================================== //
// === CARGAR PRODUCTOS desde AIRTABLE al index.html === //
// ===================================================== //
async function cargarProductosDesdeAirtable() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar productos de Airtable');
    }

    const data = await response.json();
    
    todosLosProductos = data.records.map(record => ({
      id: record.fields.id,
      nombre: record.fields.nombre,
      precio: record.fields.precio,
      imagen: record.fields.imagen || '', 
      categoria: record.fields.categoria,
      descripcion: record.fields.descripcion || ''
    }));

    mostrarProductos(todosLosProductos);
    configurarEventos();
    inicializarBuscador(); 

  } catch (error) {
    console.error('Error:', error);
    alert('No se pudieron cargar los productos. Verifica tu conexión a Airtable.');
  }
}

// Una vez cargados desde Airtable: MOSTRAR PRODUCTOS EN LA GRILLA DE PRODUCTOS DE LA PÁGINA PRINCIPAL //
function mostrarProductos(productos) {
  const grillaProductos = document.querySelector('.grilla-de-productos');
  grillaProductos.innerHTML = '';

  const categorias = ['CELULARES', 'SMARTWACHES', 'AURICULARES', 'TABLETS'];
  
  categorias.forEach(categoria => {
    const productosPorCategoria = productos.filter(p => p.categoria === categoria);
    
    if (productosPorCategoria.length > 0) {
      // Agregar separador de categoría
      const separador = document.createElement('div');
      separador.className = 'separadores-cat';
      separador.id = categoria;
      separador.innerHTML = `<h3>${categoria}</h3>`;
      grillaProductos.appendChild(separador);

      // Agregar productos de la categoría
      productosPorCategoria.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.innerHTML = `
          <a href="detalle-productos.html?id=${producto.id}">
            <img src="${producto.imagen}" alt="${producto.nombre}">
          </a>
          <h3>${producto.nombre}</h3>
          <p>$${producto.precio.toLocaleString('es-AR')}</p>
          <button class="agregar-carrito" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
            Agregar al Carrito
          </button>
        `;
        grillaProductos.appendChild(productoDiv);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  cargarProductosDesdeAirtable();
});



// ============================================ //
// ================== CARRITO ================= //
// ============================================ //

//variables de carrito//
const botonesAgregar = document.querySelectorAll(".agregar-carrito");
const carrito = document.getElementById("carrito");
const carritoIcono = document.getElementById("carritoIcono");
const cerrarCarrito = document.querySelector(".cerrar-carrito"); 
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const productos = document.querySelectorAll(".producto");

let carritoProductos = [];

// Agregar productos al carrito al hacer click en el boton "Agregar al carrito"
function configurarEventos() {
  // Botones agregar al carrito
  const botonesAgregar = document.querySelectorAll(".agregar-carrito");
  botonesAgregar.forEach(boton => {
    boton.addEventListener("click", () => {
      const nombre = boton.getAttribute('data-nombre');
      const precio = parseFloat(boton.getAttribute('data-precio'));

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


  // Enlaces de categorías
  const enlacesCategorias = document.querySelectorAll("aside a:not(#mostrarTodo)");
  enlacesCategorias.forEach(enlace => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const categoriaId = enlace.getAttribute("href").substring(1);
      filtrarPorCategoria(categoriaId);
    });
  });
}

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
  
  guardarCarrito(); 
}

// Cambiar cantidad
window.cambiarCantidad = function(index, cambio) {
  carritoProductos[index].cantidad += cambio;
  if (carritoProductos[index].cantidad <= 0) {
    carritoProductos.splice(index, 1);
  }
  actualizarCarrito();
  guardarCarrito(); 
};

// Botón pagar
const btnPagar = document.getElementById("btnPagar");
btnPagar.addEventListener("click", () => {
  if (carritoProductos.length === 0) {
    alert("Tu carrito está vacío 🛒");
    return;
  }
  alert("Gracias por tu compra 💳");
  carritoProductos = [];
  actualizarCarrito();
  localStorage.removeItem('carritoProductos');
});



// =========================================== //
// ====== BUSCADOR CON FILTRO DINÁMICO ======= //
// =========================================== //

function inicializarBuscador() {
  const buscador = document.getElementById("buscador");

  buscador.addEventListener("input", () => {
    const filtro = buscador.value.toLowerCase().trim();

    const productos = document.querySelectorAll(".producto");
    const separadoresCat = document.querySelectorAll(".separadores-cat");

    // --- Filtrar productos ---
    productos.forEach(producto => {
      const nombre = producto.querySelector("h3").textContent.toLowerCase();
      // Mostrar si coincide con el filtro o si el filtro está vacío
      producto.style.display = nombre.includes(filtro) || filtro === "" ? "flex" : "none";
    });

    // --- Mostrar / ocultar separadores según si tienen productos visibles ---
    separadoresCat.forEach(separador => {
      let tieneProductosVisibles = false;
      let siguiente = separador.nextElementSibling;

      while (siguiente && !siguiente.classList.contains("separadores-cat")) {
        if (siguiente.classList.contains("producto") && siguiente.style.display !== "none") {
          tieneProductosVisibles = true;
          break;
        }
        siguiente = siguiente.nextElementSibling;
      }

      // Mostrar u ocultar separador
      separador.style.display = tieneProductosVisibles ? "flex" : "none";
    });
  });
}



// =========================================== //
// ======= ASIDE: FILTRO POR CATEGORIA ======= //
// =========================================== //
const enlacesCategorias = document.querySelectorAll("aside a");
const separadoresCat = document.querySelectorAll(".separadores-cat");

enlacesCategorias.forEach(enlace => {
  enlace.addEventListener("click", (e) => {
    e.preventDefault(); // Evitar el comportamiento de scroll
    
    const categoriaId = enlace.getAttribute("href").substring(1); // Quitar el #
    filtrarPorCategoria(categoriaId);
  });
});

function filtrarPorCategoria(categoria) {
  let categoriaActual = null;
  let dentroCategoria = false;
  
  // Recorrer todos los elementos de la grilla
  const elementosGrilla = document.querySelectorAll(".grilla-de-productos > *");
  
  elementosGrilla.forEach(elemento => {
    // Si es un separador de categoría
    if (elemento.classList.contains("separadores-cat")) {
      const idCategoria = elemento.getAttribute("id");
      
      if (idCategoria === categoria) {
        dentroCategoria = true;
        categoriaActual = categoria;
        elemento.style.display = "flex"; // Mostrar el separador
      } else {
        dentroCategoria = false;
        elemento.style.display = "none"; // Ocultar otros separadores
      }
    }
    // Si es un producto
    else if (elemento.classList.contains("producto")) {
      if (dentroCategoria) {
        elemento.style.display = "flex"; // Mostrar productos de la categoría
      } else {
        elemento.style.display = "none"; // Ocultar productos de otras categorías
      }
    }
  });
}



// ============================================ //
// ========== PERSISTENCIA DE DATOS =========== //
// ============================================ //

// 1. GUARDAR Y CARGAR CARRITO
function guardarCarrito() {
  localStorage.setItem('carritoProductos', JSON.stringify(carritoProductos));

   try {
    localStorage.setItem('carritoProductos', JSON.stringify(carritoProductos));
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
    // Opcional: Mostrar mensaje al usuario
  }
}

function cargarCarrito() {
  try {
    const carritoGuardado = localStorage.getItem('carritoProductos');
    if (carritoGuardado) {
      carritoProductos = JSON.parse(carritoGuardado);
      // Validar que los datos sean correctos
      if (!Array.isArray(carritoProductos)) {
        throw new Error('Formato de carrito inválido');
      }
      actualizarCarrito();
    }
  } catch (error) {
    console.error('Error al cargar el carrito:', error);
    // Opcional: Restablecer a un carrito vacío
    carritoProductos = [];
    guardarCarrito();
  }
}

// 2. GUARDAR BÚSQUEDA
function guardarBusqueda(termino) {
    try {
        // Obtener el historial actual o crear uno nuevo
        const historial = JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
        
        // Evitar duplicados
        if (!historial.includes(termino)) {
            // Agregar al inicio del array
            historial.unshift(termino);
            
            // Limitar el historial a las últimas 10 búsquedas
            const historialLimitado = historial.slice(0, 10);
            
            // Guardar en localStorage
            localStorage.setItem('historialBusquedas', JSON.stringify(historialLimitado));
        }
    } catch (error) {
        console.error('Error al guardar la búsqueda:', error);
    }
}

function obtenerHistorialBusquedas() {
    try {
        return JSON.parse(localStorage.getItem('historialBusquedas') || '[]');
    } catch (error) {
        console.error('Error al cargar el historial de búsquedas:', error);
        return [];
    }
}

// Actualizar el manejador del evento de búsqueda
buscador.addEventListener("input", (e) => {
    const termino = e.target.value.trim();
    if (termino) {
        guardarBusqueda(termino);
    }
    
    // Tu lógica de filtrado existente
    const filtro = termino.toLowerCase();
    // ... resto de tu código de filtrado
});

// Función para mostrar el historial (opcional)
function mostrarHistorialBusquedas() {
    const historial = obtenerHistorialBusquedas();
    console.log('Historial de búsquedas:', historial);
    // Aquí podrías mostrar el historial en la interfaz si lo deseas
}


// 3. INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  cargarProductosDesdeAirtable();
  inicializarBuscador();
  cargarCarrito(); // Cargar carrito guardado
  mostrarHistorialBusquedas() // Cargar búsqueda guardada
});






