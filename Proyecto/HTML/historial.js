const HistorialCompras = {
  obtener() {
    const historial = JSON.parse(localStorage.getItem("historialTransacciones") || "[]");
    if (!Array.isArray(historial)) {
      throw new Error("El historial guardado no tiene un formato válido.");
    }
    return historial;
  },

  registrar(productos, comprador) {
    const historial = this.obtener();
    const fecha = new Date().toISOString();
    const transacciones = productos.map((producto) => {
      if (
        !producto ||
        typeof producto.nombre !== "string" ||
        !Number.isFinite(Number(producto.precio))
      ) {
        throw new Error("Un producto del pedido no tiene datos válidos.");
      }

      return {
        id: producto.id,
        producto: producto.nombre,
        precio: Number(producto.precio),
        comprador,
        vendedor: producto.vendedor || "Vendedor",
        fecha
      };
    });

    localStorage.setItem(
      "historialTransacciones",
      JSON.stringify([...historial, ...transacciones])
    );
  }
};
