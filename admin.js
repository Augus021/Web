// =========================================== //
// ========== CONEXION CON AIRTABLE ========== //
// =========================================== //
const API_TOKEN = 'patcGM15PGqT7CbqR.c9867fc358c0a25fd84167ac584d913a638bd8eb55f035a1468200da78ee4f62';
const BASE_ID = 'appul61rDwdhr6xkN';
const TABLE_NAME = 'Productos';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;


// Variables globales
let productos = [];
let editandoId = null;


// ============================================= //
// ====== CARGAR PRODUCTOS DESDE AIRTABLE ====== //
// ============================================= //
async function cargarProductos() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }

    const data = await response.json();
    productos = data.records.map(record => ({
      recordId: record.id, // ID de Airtable (necesario para editar/eliminar)
      id: record.fields.id,
      nombre: record.fields.nombre,
      precio: record.fields.precio,
      imagen: record.fields.imagen || '',
      categoria: record.fields.categoria,
      descripcion: record.fields.descripcion || ''
    }));

    mostrarProductos();
  } catch (error) {
    console.error('Error:', error);
    alert('Error al cargar productos de Airtable');
  }
}

// ============================================ //
// ====== MOSTRAR PRODUCTOS EN LA LISTA ======= //
// ============================================ //
function mostrarProductos(filtro = '') {
  const listaProductos = document.getElementById('listaProductos');
  listaProductos.innerHTML = '';

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(filtro.toLowerCase())
  );

  if (productosFiltrados.length === 0) {
    listaProductos.innerHTML = '<p style="text-align: center; color: #666;">No hay productos para mostrar</p>';
    return;
  }

  productosFiltrados.forEach(producto => {
    const productoDiv = document.createElement('div');
    productoDiv.className = 'producto-item';
    productoDiv.innerHTML = `
      <strong>${producto.nombre}</strong>
      <p>Precio: $${producto.precio.toLocaleString('es-AR')}</p>
      <p>Categoría: ${producto.categoria}</p>
      <p>ID: ${producto.id}</p>
      <div class="acciones">
        <button onclick="editarProducto('${producto.recordId}')">✏️</button>
        <button onclick="eliminarProducto('${producto.recordId}')" style="background: #ff4444;">🗑️</button>
      </div>
    `;
    listaProductos.appendChild(productoDiv);
  });
}

// =========================================== //
// ============ AGREGAR PRODUCTO ============= //
// =========================================== //
async function agregarProducto(productoData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: productoData
      })
    });

    if (!response.ok) {
      throw new Error('Error al agregar producto');
    }

    alert('✅ Producto agregado exitosamente');
    await cargarProductos();
    limpiarFormulario();
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al agregar producto');
  }
}


// =========================================== //
// ============= EDITAR PRODUCTO ============= //
// =========================================== //
window.editarProducto = function(recordId) {
  const producto = productos.find(p => p.recordId === recordId);
  if (!producto) return;

  // Llenar el formulario con los datos del producto
  document.getElementById('id').value = producto.id;
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('precio').value = producto.precio;
  document.getElementById('imagen').value = producto.imagen;
  document.getElementById('categoria').value = producto.categoria;
  document.getElementById('descripcion').value = producto.descripcion;

  // Cambiar el estado a "editando"
  editandoId = recordId;
  document.getElementById('btnGuardar').textContent = 'Actualizar Producto';
  document.getElementById('btnCancelar').style.display = 'inline-block';

  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function actualizarProducto(recordId, productoData) {
  try {
    const response = await fetch(`${API_URL}/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: productoData
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }

    alert('✅ Producto actualizado exitosamente');
    await cargarProductos();
    limpiarFormulario();
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al actualizar producto');
  }
}


// ============================================ //
// ============ ELIMINAR PRODUCTO ============= //
// ============================================ //
window.eliminarProducto = async function(recordId) {
  const producto = productos.find(p => p.recordId === recordId);
  
  if (!confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al eliminar producto'); 
    }

    alert('✅ Producto eliminado exitosamente');
    await cargarProductos();
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al eliminar producto');
  }
}


// =========================================== //
// =========== LIMPIAR FORMULARIO ============ //
// =========================================== //
function limpiarFormulario() {
  document.getElementById('formProducto').reset();
  editandoId = null;
  document.getElementById('btnGuardar').textContent = 'Agregar Producto';
  document.getElementById('btnCancelar').style.display = 'none';
}


// ============================================ //
// ========== EVENTO DEL FORMULARIO =========== //
// ============================================ //
document.getElementById('formProducto').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Obtener el ID más alto actual y sumar 1 para el nuevo producto
  const maxId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) : 0;
  const nuevoId = editandoId ? parseInt(document.getElementById('id').value) : maxId + 1;

  const productoData = {
    id: nuevoId,
    nombre: document.getElementById('nombre').value,
    precio: parseFloat(document.getElementById('precio').value),
    imagen: document.getElementById('imagen').value,
    categoria: document.getElementById('categoria').value,
    descripcion: document.getElementById('descripcion').value
  };

  if (editandoId) {
    await actualizarProducto(editandoId, productoData);
  } else {
    await agregarProducto(productoData);
  }
});

// Botón cancelar
document.getElementById('btnCancelar').addEventListener('click', () => {
  limpiarFormulario();
});

// Filtro de búsqueda
document.getElementById('filtroNombre').addEventListener('input', (e) => {
  mostrarProductos(e.target.value);
});


// ====================================== //
// ============ INICIALIZAR ============= //
// ====================================== //
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});