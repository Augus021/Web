// =========================================== //
// ========== CONEXION CON AIRTABLE ========== //
// =========================================== //
const API_TOKEN = 'patcGM15PGqT7CbqR.c9867fc358c0a25fd84167ac584d913a638bd8eb55f035a1468200da78ee4f62';
const BASE_ID = 'appul61rDwdhr6xkN';
const TABLE_NAME = 'Productos';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

// Obtener el ID del producto desde la URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));
const contenedor = document.getElementById("detalle");

// Función para cargar el producto desde Airtable
async function cargarProductoDetalle() {
  try {
    contenedor.innerHTML = '<p style="text-align: center; padding: 50px;">Cargando producto...</p>';

    // Hacer la petición a Airtable
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar productos de Airtable');
    }

    const data = await response.json();
    
    // Buscar el producto por ID
    const productoRecord = data.records.find(record => record.fields.id === id);

    if (!productoRecord) {
      contenedor.innerHTML = "<p>Producto no encontrado</p>";
      return;
    }

    // Extraer los datos del producto
    const producto = {
      id: productoRecord.fields.id,
      nombre: productoRecord.fields.nombre,
      precio: productoRecord.fields.precio,
      imagen: productoRecord.fields.imagen || '',
      descripcion: productoRecord.fields.descripcion || ''
    };

    // Mostrar el producto
    contenedor.innerHTML = `
      <div class="detalle-prod">
        <div class="detalle-img">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <div class="detalle-info">
          <h2>${producto.nombre}</h2>
          <p>${producto.descripcion}</p>
          <h3 class="h3-prod">$${producto.precio.toLocaleString("es-AR")}</h3>
          <button id="btnComprar">COMPRAR</button>
        </div>
      </div>
    `;

    // Agregar evento al botón comprar
    const btnComprar = document.getElementById("btnComprar");
    btnComprar.addEventListener("click", () => {
      alert(`✅ ¡Gracias por tu compra de ${producto.nombre}! 💳`);
    });

  } catch (error) {
    console.error("Error al cargar producto:", error);
    contenedor.innerHTML = "<p>Error al cargar los datos del producto.</p>";
  }
}

// Cargar el producto al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProductoDetalle();
});

