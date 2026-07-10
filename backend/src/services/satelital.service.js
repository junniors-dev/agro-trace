// Servicio de "validacion satelital" de la parcela (no deforestacion / EUDR).
//
// DEMO: devolvemos un estado fijo por parcela (el seed marca P-031 como 'alerta'
// y el resto como 'validado'). Si la parcela no trae estado, cae a 'validado'.
//
// TODO(produccion): reemplazar por una integracion real con Google Earth Engine.
// Flujo tipico:
//   1. Tomar el poligono/coordenadas de la parcela.
//   2. Consultar capas de cobertura forestal (ej. Hansen Global Forest Change) para
//      la fecha de corte de la EUDR (31/12/2020).
//   3. Si hubo perdida de bosque dentro del poligono despues de esa fecha => 'alerta'.
// Ejemplo (pseudocodigo):
//   const perdida = await ee.analizarDeforestacion(parcela.geojson, '2020-12-31');
//   return perdida > 0 ? 'alerta' : 'validado';

/**
 * Valida una parcela y devuelve su estado satelital.
 * @param {{estado_satelital?: string}} parcela
 * @returns {'validado' | 'alerta'}
 */
export function validarParcela(parcela) {
  return parcela?.estado_satelital === 'alerta' ? 'alerta' : 'validado';
}
