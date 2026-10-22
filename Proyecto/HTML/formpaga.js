const resumenPedido = document.getElementById("order-summary");
const formularioPedido = document.getElementById("checkout-form");
const mensajePedido = document.getElementById("checkout-message");
const botonConfirmar = document.getElementById("confirm-order");
const campoVencimiento = document.getElementById("card-expiry");
const fechaActual = new Date();
campoVencimiento.min = `${fechaActual.getFullYear()}-${String(
  fechaActual.getMonth() + 1
).padStart(2, "0")}`;
let pedido = [];

try {
  const pedidoGuardado = JSON.parse(sessionStorage.getItem("pedidoPendiente") || "[]");
  if (Array.isArray(pedidoGuardado)) {
    pedido = pedidoGuardado.filter(
      (producto) =>
        producto &&
        typeof producto.nombre === "string" &&
        Number.isFinite(Number(producto.precio)) &&
        Number(producto.precio) >= 0
    );
  }
} catch (error) {
  console.error("No se pudo leer el pedido:", error);
  mensajePedido.textContent = "No se pudo cargar el pedido. Regresa al catálogo e inténtalo de nuevo.";
  mensajePedido.classList.add("error");
  formularioPedido.hidden = true;
}

if (pedido.length === 0) {
  resumenPedido.textContent = "No hay productos en este pedido. Vuelve al catálogo para elegir productos.";
  formularioPedido.hidden = true;
} else {
  pedido.forEach((producto) => {
    const linea = document.createElement("div");
    linea.className = "order-line";

    const nombre = document.createElement("span");
    nombre.textContent = producto.nombre;

    const precio = document.createElement("span");
    precio.textContent = `$${Number(producto.precio).toFixed(2)}`;

    linea.append(nombre, precio);
    resumenPedido.append(linea);
  });

  const total = pedido.reduce((suma, producto) => suma + Number(producto.precio), 0);
  const lineaTotal = document.createElement("p");
  lineaTotal.className = "order-total";

  const etiquetaTotal = document.createElement("span");
  etiquetaTotal.textContent = "Total";

  const precioTotal = document.createElement("span");
  precioTotal.textContent = `$${total.toFixed(2)}`;

  lineaTotal.append(etiquetaTotal, precioTotal);
  resumenPedido.append(lineaTotal);
}

formularioPedido.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (pedido.length === 0) {
    return;
  }

  try {
    HistorialCompras.registrar(
      pedido.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        vendedor: producto.vendedor || "Vendedor"
      })),
      localStorage.getItem("usuarioActual") || "Invitado"
    );
  } catch (error) {
    console.error("No se pudo guardar la compra en el historial:", error);
    mensajePedido.textContent =
      "No se pudo guardar el historial de la compra. Intenta confirmar de nuevo.";
    mensajePedido.classList.add("error");
    return;
  }

  sessionStorage.removeItem("pedidoPendiente");
  formularioPedido.reset();
  mensajePedido.textContent =
    "Compra de demostración confirmada. No se realizó ningún cobro.";

  botonConfirmar.disabled = true;
  alert("¡Gracias por tu compra! La simulación terminó. Volverás al catálogo.");
  window.location.href = "Catalogo.html";
});
