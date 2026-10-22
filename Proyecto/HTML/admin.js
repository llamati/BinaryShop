const productosBase = [
  {
    id: 1,
    nombre: "Audífonos",
    precio: 50,
    categoria: "tecnologia",
    vendedor: "comprador1",
    imagen: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
  },
  {
    id: 2,
    nombre: "Reloj",
    precio: 90,
    categoria: "accesorios",
    vendedor: "comprador1",
    imagen: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"
  },
  {
    id: 3,
    nombre: "Camiseta",
    precio: 20,
    categoria: "ropa",
    vendedor: "comprador1",
    imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80"
  },
  {
    id: "digital-steam",
    nombre: "Saldo para Steam",
    precio: 10,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80"
  },
  {
    id: "digital-gemini",
    nombre: "Mensualidad de Gemini",
    precio: 20,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80"
  },
  {
    id: "digital-netflix",
    nombre: "Mensualidad de Netflix",
    precio: 15,
    categoria: "digital",
    vendedor: "BinaryShop",
    digital: true,
    imagen: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80"
  }
];

const contenedorProductos = document.getElementById("product-grid");
const inputBusqueda = document.getElementById("search-input");
const selectCategoria = document.getElementById("category-select");
const mensaje = document.getElementById("admin-message");

function leerLista(clave) {
  const valor = JSON.parse(localStorage.getItem(clave) || "[]");
  if (!Array.isArray(valor)) {
    throw new Error(`Los datos guardados en "${clave}" no tienen un formato válido.`);
  }
  return valor;
}

function obtenerProductos() {
  try {
    const publicados = leerLista("productosPublicados");
    const eliminados = new Set(leerLista("productosEliminados").map(String));
    const baneados = new Set(
      leerLista("vendedoresBloqueados").map((cuenta) => String(cuenta).toLowerCase())
    );
    return [...productosBase, ...publicados]
      .filter((producto) => !eliminados.has(String(producto.id)))
      .map((producto) => ({
        ...producto,
        vendedorBaneado: baneados.has(String(producto.vendedor || "").toLowerCase())
      }));
  } catch (error) {
    mensaje.textContent = "No se pudieron cargar los productos. Revisa los datos guardados del navegador.";
    mensaje.classList.add("error");
    console.error("Error al cargar productos para administración:", error);
    return [];
  }
}

function guardarEliminacion(producto) {
  try {
    const eliminados = leerLista("productosEliminados");
    const id = String(producto.id);
    if (!eliminados.map(String).includes(id)) {
      eliminados.push(id);
      localStorage.setItem("productosEliminados", JSON.stringify(eliminados));
    }

    if (typeof producto.id === "string") {
      const publicados = leerLista("productosPublicados");
      localStorage.setItem(
        "productosPublicados",
        JSON.stringify(publicados.filter((elemento) => String(elemento.id) !== id))
      );
    }

    mensaje.textContent = `Se eliminó "${producto.nombre}" del catálogo.`;
    mensaje.classList.remove("error");
    renderizarProductos();
  } catch (error) {
    console.error("No se pudo eliminar el producto:", error);
    mensaje.textContent = "No se pudo eliminar el producto. Comprueba el almacenamiento del navegador.";
    mensaje.classList.add("error");
  }
}

function banearVendedor(nombreVendedor) {
  const cuenta = String(nombreVendedor || "").trim();
  if (!cuenta || cuenta.toLowerCase() === "binaryshop") {
    return;
  }

  try {
    const baneados = leerLista("vendedoresBloqueados");
    if (!baneados.some((nombre) => String(nombre).toLowerCase() === cuenta.toLowerCase())) {
      baneados.push(cuenta);
      localStorage.setItem("vendedoresBloqueados", JSON.stringify(baneados));
    }
    mensaje.textContent = `La cuenta "${cuenta}" fue baneada. Ya no podrá iniciar sesión y sus productos no aparecerán en el catálogo.`;
    mensaje.classList.remove("error");
    renderizarProductos();
  } catch (error) {
    console.error("No se pudo banear la cuenta:", error);
    mensaje.textContent = "No se pudo banear la cuenta. Comprueba el almacenamiento del navegador.";
    mensaje.classList.add("error");
  }
}

function renderizarProductos() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  const categoria = selectCategoria.value;
  const filtrados = obtenerProductos().filter((producto) => {
    const coincideNombre = producto.nombre.toLowerCase().includes(texto);
    const coincideCategoria =
      categoria === "todos" || producto.categoria === categoria;
    return coincideNombre && coincideCategoria;
  });

  contenedorProductos.replaceChildren();

  if (filtrados.length === 0) {
    contenedorProductos.textContent = "No hay productos para mostrar.";
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

    const acciones = document.createElement("div");
    acciones.className = "admin-actions";

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "remove-btn admin-delete-btn";
    botonEliminar.textContent = "Eliminar producto";
    botonEliminar.addEventListener("click", () => {
      if (window.confirm(`¿Eliminar "${producto.nombre}" del catálogo?`)) {
        guardarEliminacion(producto);
      }
    });

    acciones.append(botonEliminar);
    if (producto.vendedor && producto.vendedor.toLowerCase() !== "binaryshop") {
      const botonBanear = document.createElement("button");
      botonBanear.type = "button";
      botonBanear.className = "remove-btn admin-ban-btn";
      botonBanear.textContent = producto.vendedorBaneado
        ? `Cuenta ${producto.vendedor} baneada`
        : `Banear a ${producto.vendedor}`;
      botonBanear.disabled = producto.vendedorBaneado;
      botonBanear.addEventListener("click", () => {
        if (window.confirm(`¿Banear la cuenta "${producto.vendedor}"?`)) {
          banearVendedor(producto.vendedor);
        }
      });
      acciones.append(botonBanear);
    }

    tarjeta.append(imagen, nombre, precio, vendedor, acciones);
    contenedorProductos.append(tarjeta);
  });
}

inputBusqueda.addEventListener("input", renderizarProductos);
selectCategoria.addEventListener("change", renderizarProductos);
renderizarProductos();
