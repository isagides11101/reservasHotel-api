function paginar(query) {
  const pagina = Math.max(parseInt(query.pagina) || 1, 1);
  const limite = Math.min(Math.max(parseInt(query.limite) || 10, 1), 100);
  return { pagina, limite, offset: (pagina - 1) * limite };
}

function respuesta(datos, total, pagina, limite) {
  return { datos, paginacion: { pagina, limite, total, paginas: Math.ceil(total / limite) } };
}

module.exports = { paginar, respuesta };