const productos = [
  {
    id: 1,
    nombre: "Audífonos",
    precio: 50,
    categoria: "tecnologia",
    vendedor: "comprador1",
    imagen: "https://i.pinimg.com/1200x/f6/0f/85/f60f85021025297d0880124253b187dd.jpg"
  },
  {
    id: 2,
    nombre: "Reloj",
    precio: 90,
    categoria: "accesorios",
    vendedor: "comprador1",
    imagen: "https://i.pinimg.com/736x/bb/dd/0b/bbdd0bb70c199f131ee28890fd236ef6.jpg"
  },
  {
    id: 3,
    nombre: "Camiseta",
    precio: 20,
    categoria: "ropa",
    vendedor: "comprador1",
    imagen: "https://i.pinimg.com/736x/0b/2e/35/0b2e351d77ca0b504309bca3862439c9.jpg"
  },
  {
    id: "digital-steam",
    nombre: "Saldo para Steam",
    precio: 10,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://i.pinimg.com/736x/4c/a7/8e/4ca78eacd4d92edb6b3b597f8ec1da6e.jpg"
  },
  {
    id: "digital-gemini",
    nombre: "Mensualidad de Gemini",
    precio: 20,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://i.pinimg.com/736x/28/0e/7f/280e7fe9a454648e9e51ffd92a47146a.jpg"
  },
  {
    id: "digital-netflix",
    nombre: "Mensualidad de Netflix",
    precio: 15,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://i.pinimg.com/736x/d6/d2/80/d6d280d4a3fea879610c9482e7e945c8.jpg"
  }
];

try {
  const productosPublicados = JSON.parse(
    localStorage.getItem("productosPublicados") || "[]"
  );
  const productosEliminados = new Set(
    JSON.parse(localStorage.getItem("productosEliminados") || "[]").map(String)
  );
  const vendedoresBloqueados = new Set(
    JSON.parse(localStorage.getItem("vendedoresBloqueados") || "[]")
      .map((cuenta) => String(cuenta).toLowerCase())
  );

  if (Array.isArray(productosPublicados)) {
    productos.push(...productosPublicados);
  }

  for (let indice = productos.length - 1; indice >= 0; indice -= 1) {
    if (
      productosEliminados.has(String(productos[indice].id)) ||
      vendedoresBloqueados.has(String(productos[indice].vendedor || "").toLowerCase())
    ) {
      productos.splice(indice, 1);
    }
  }
} catch (error) {
  console.error("No se pudieron cargar los datos del catálogo:", error);
}

let carrito = [];

const contenedorProductos = document.getElementById("product-grid");
const inputBusqueda = document.getElementById("search-input");
const selectCategoria = document.getElementById("category-select");
const botonCarrito = document.getElementById("cart-btn");
const modalCarrito = document.getElementById("cart-modal");
const botonCerrar = document.getElementById("close-cart");
const listaCarrito = document.getElementById("cart-items");
const contadorCarrito = document.getElementById("cart-count");
const totalCarrito = document.getElementById("cart-total-price");
const botonComprar = document.getElementById("checkout-btn");
const botonHistorial = document.getElementById("history-btn");
const panelHistorial = document.getElementById("history-panel");
const usuarioHistorial = document.getElementById("history-username");
const listaCompras = document.getElementById("purchase-history");
const listaVentas = document.getElementById("sales-history");

function mostrarHistorial(
  lista,
  transacciones,
  campoUsuario,
  campoContraparte,
  etiquetaContraparte,
  mensajeVacio
) {
  lista.replaceChildren();
  const delUsuario = transacciones.filter(
    (transaccion) =>
      String(transaccion[campoUsuario] || "").toLowerCase() ===
      usuarioActual.toLowerCase()
  );

  if (delUsuario.length === 0) {
    const elemento = document.createElement("li");
    elemento.textContent = mensajeVacio;
    lista.append(elemento);
    return;
  }

  delUsuario.slice().reverse().forEach((transaccion) => {
    const elemento = document.createElement("li");
    const fecha = new Date(transaccion.fecha);
    const fechaTexto = Number.isNaN(fecha.getTime())
      ? "Fecha no disponible"
      : fecha.toLocaleString("es");
    elemento.textContent =
      `${transaccion.producto} — $${Number(transaccion.precio).toFixed(2)} · ` +
      `${etiquetaContraparte}: ${transaccion[campoContraparte]} · ${fechaTexto}`;
    lista.append(elemento);
  });
}

const usuarioActual = localStorage.getItem("usuarioActual") || "Invitado";
usuarioHistorial.textContent = usuarioActual;

function actualizarHistorial() {
  try {
    const transacciones = HistorialCompras.obtener();
    mostrarHistorial(
      listaCompras,
      transacciones,
      "comprador",
      "vendedor",
      "Vendedor",
      "Todavía no tienes compras."
    );
    mostrarHistorial(
      listaVentas,
      transacciones,
      "vendedor",
      "comprador",
      "Comprador",
      "Todavía no tienes ventas."
    );
  } catch (error) {
    console.error("No se pudo cargar el historial:", error);
    listaCompras.textContent = "No se pudo cargar el historial.";
    listaVentas.textContent = "No se pudo cargar el historial.";
  }
}

botonHistorial.addEventListener("click", () => {
  const mostrar = panelHistorial.hidden;
  panelHistorial.hidden = !mostrar;
  botonHistorial.setAttribute("aria-expanded", String(mostrar));
  if (mostrar) {
    actualizarHistorial();
  }
});

function mostrarProductos() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  const categoria = selectCategoria.value;
  const filtrados = productos.filter((producto) => {
    const coincideTexto = producto.nombre.toLowerCase().includes(texto);
    const coincideCategoria =
      categoria === "todos" || producto.categoria === categoria;
    return coincideTexto && coincideCategoria;
  });

  contenedorProductos.replaceChildren();

  if (filtrados.length === 0) {
    contenedorProductos.textContent = "No se encontraron productos.";
    return;
  }

  filtrados.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "product-card";

    const imagen = document.createElement("img");
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.className = "product-img";

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "product-price";
    precio.textContent = `$${producto.precio}`;

    const vendedor = document.createElement("p");
    vendedor.className = "product-seller";
    vendedor.textContent = `Publicado por: ${producto.vendedor || "Vendedor"}`;

    const botonAccion = document.createElement("button");
    botonAccion.type = "button";
    botonAccion.className = "add-btn";
    if (producto.digital) {
      botonAccion.textContent = "Comprar ahora";
      botonAccion.addEventListener("click", () => {
        window.location.href = `ComprarDigital.html?producto=${encodeURIComponent(producto.id)}`;
      });
    } else {
      botonAccion.textContent = "Añadir";
      botonAccion.addEventListener("click", () => agregarAlCarrito(producto.id));
    }

    tarjeta.append(imagen, nombre, precio, vendedor, botonAccion);
    contenedorProductos.append(tarjeta);
  });
}

function agregarAlCarrito(idProducto) {
  const producto = productos.find((elemento) => elemento.id === idProducto);
  if (!producto) {
    return;
  }

  carrito.push(producto);
  actualizarCarrito();
}

function eliminarDelCarrito(indice) {
  carrito.splice(indice, 1);
  actualizarCarrito();
}

function actualizarCarrito() {
  contadorCarrito.textContent = carrito.length;
  listaCarrito.replaceChildren();

  if (carrito.length === 0) {
    listaCarrito.textContent = "Tu carrito está vacío.";
  }

  carrito.forEach((producto, indice) => {
    const item = document.createElement("div");
    item.className = "cart-item";

    const nombre = document.createElement("span");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("span");
    precio.textContent = `$${producto.precio}`;

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "remove-btn";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.setAttribute(
      "aria-label",
      `Eliminar ${producto.nombre} del carrito`
    );
    botonEliminar.addEventListener("click", () => eliminarDelCarrito(indice));

    item.append(nombre, precio, botonEliminar);
    listaCarrito.append(item);
  });

  const total = carrito.reduce((suma, producto) => suma + producto.precio, 0);
  totalCarrito.textContent = `$${total}`;
}

function cerrarCarrito() {
  modalCarrito.classList.remove("active");
}

inputBusqueda.addEventListener("input", mostrarProductos);
selectCategoria.addEventListener("change", mostrarProductos);

botonCarrito.addEventListener("click", () => {
  modalCarrito.classList.add("active");
});

botonCerrar.addEventListener("click", cerrarCarrito);

modalCarrito.addEventListener("click", (evento) => {
  if (evento.target === modalCarrito) {
    cerrarCarrito();
  }
});

botonComprar.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  try {
    const pedido = carrito.map(({ id, nombre, precio, vendedor }) => ({
      id,
      nombre,
      precio,
      vendedor
    }));
    sessionStorage.setItem("pedidoPendiente", JSON.stringify(pedido));
    window.location.href = "Formpaga.html";
  } catch (error) {
    console.error("No se pudo preparar el pedido:", error);
    alert("No se pudo iniciar la compra. Intenta de nuevo.");
  }
});

mostrarProductos();
actualizarCarrito();
