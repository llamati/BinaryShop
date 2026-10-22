const productosDigitales = {
  "digital-steam": { nombre: "Saldo para Steam", precio: 10 },
  "digital-gemini": { nombre: "Mensualidad de Gemini", precio: 20 },
  "digital-netflix": { nombre: "Mensualidad de Netflix", precio: 15 }
};

const productoId = new URLSearchParams(window.location.search).get("producto");
const producto = productosDigitales[productoId];
const resumenProducto = document.getElementById("digital-product");
const formularioCompra = document.getElementById("digital-purchase-form");
const botonContinuar = document.getElementById("digital-submit");
const mensajeCompra = document.getElementById("digital-message");

if (!producto) {
  resumenProducto.textContent = "No se encontró el producto digital seleccionado.";
  formularioCompra.hidden = true;
} else {
  const nombreProducto = document.createElement("span");
  nombreProducto.textContent = producto.nombre;

  const precioProducto = document.createElement("span");
  precioProducto.className = "digital-product-price";
  precioProducto.textContent = `$${producto.precio}`;

  resumenProducto.append(nombreProducto, precioProducto);
}

formularioCompra.addEventListener("submit", (evento) => {
  evento.preventDefault();
  if (!producto) {
    return;
  }

  try {
    HistorialCompras.registrar(
      [{ id: productoId, nombre: producto.nombre, precio: producto.precio, vendedor: "BinaryShop" }],
      localStorage.getItem("usuarioActual") || "Invitado"
    );
  } catch (error) {
    console.error("No se pudo guardar la compra digital en el historial:", error);
    mensajeCompra.textContent =
      "No se pudo guardar el historial de la compra. Intenta de nuevo.";
    return;
  }

  mensajeCompra.textContent = "SU COMPRA HA SIDO REALIZADA!!!!.";
  botonContinuar.disabled = true;
  window.alert("¡Gracias por tu compra! Tu transacción ha sido procesada con éxito.");
});
