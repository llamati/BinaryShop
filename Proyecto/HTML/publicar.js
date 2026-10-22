const formulario = document.getElementById("publish-form");
const entradaImagen = document.getElementById("product-image");
const zonaImagen = document.getElementById("image-dropzone");
const vistaPrevia = document.getElementById("image-preview");
const indicacionImagen = document.getElementById("image-prompt");
const mensaje = document.getElementById("publish-message");
let imagenSeleccionada = null;

function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle("error", esError);
}

function seleccionarImagen(archivo) {
  if (!archivo) {
    return;
  }

  if (!archivo.type.startsWith("image/")) {
    mostrarMensaje("Selecciona un archivo de imagen válido.", true);
    return;
  }

  if (archivo.size > 1024 * 1024) {
    mostrarMensaje("La imagen debe pesar 1 MB o menos.", true);
    return;
  }

  imagenSeleccionada = archivo;
  vistaPrevia.src = URL.createObjectURL(archivo);
  vistaPrevia.hidden = false;
  indicacionImagen.textContent = archivo.name;
  mostrarMensaje("");
}

entradaImagen.addEventListener("change", () => {
  seleccionarImagen(entradaImagen.files[0]);
});

["dragenter", "dragover"].forEach((tipoEvento) => {
  zonaImagen.addEventListener(tipoEvento, (evento) => {
    evento.preventDefault();
    zonaImagen.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((tipoEvento) => {
  zonaImagen.addEventListener(tipoEvento, (evento) => {
    evento.preventDefault();
    zonaImagen.classList.remove("dragging");
  });
});

zonaImagen.addEventListener("drop", (evento) => {
  seleccionarImagen(evento.dataTransfer.files[0]);
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const usuarioActual = localStorage.getItem("usuarioActual") || "";
  let vendedoresBloqueados;
  try {
    vendedoresBloqueados = JSON.parse(
      localStorage.getItem("vendedoresBloqueados") || "[]"
    );
    if (!Array.isArray(vendedoresBloqueados)) {
      throw new Error("La lista de cuentas bloqueadas no tiene un formato válido.");
    }
  } catch (error) {
    console.error("No se pudo verificar la cuenta del vendedor:", error);
    mostrarMensaje("No se pudo verificar tu cuenta. Intenta de nuevo.", true);
    return;
  }

  if (vendedoresBloqueados.some(
    (cuenta) => String(cuenta).toLowerCase() === usuarioActual.toLowerCase()
  )) {
    mostrarMensaje("Tu cuenta ha sido baneada y no puede publicar productos.", true);
    return;
  }

  if (!imagenSeleccionada) {
    mostrarMensaje("Agrega una imagen antes de publicar.", true);
    return;
  }

  const lector = new FileReader();

  lector.addEventListener("load", () => {
    const producto = {
      id: `publicado-${Date.now()}`,
      nombre: document.getElementById("product-name").value.trim(),
      precio: Number(document.getElementById("product-price").value),
      categoria: document.getElementById("product-category").value,
      vendedor: localStorage.getItem("usuarioActual") || "Vendedor",
      imagen: lector.result
    };

    try {
      const productosGuardados = JSON.parse(
        localStorage.getItem("productosPublicados") || "[]"
      );

      if (!Array.isArray(productosGuardados)) {
        throw new Error("El listado guardado no tiene un formato válido.");
      }

      productosGuardados.push(producto);
      localStorage.setItem("productosPublicados", JSON.stringify(productosGuardados));
      window.location.href = "Catalogo.html";
    } catch (error) {
      console.error("No se pudo guardar el producto:", error);
      mostrarMensaje(
        "No se pudo guardar el producto. Prueba con una imagen más pequeña o libera espacio del navegador.",
        true
      );
    }
  });

  lector.addEventListener("error", () => {
    mostrarMensaje("No se pudo leer la imagen. Intenta seleccionarla de nuevo.", true);
  });

  lector.readAsDataURL(imagenSeleccionada);
});
