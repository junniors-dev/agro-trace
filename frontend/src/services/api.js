// La app es 100% client-side: no hay servidor. Este modulo re-exporta el store
// local (localStorage) que reproduce la logica que antes hacia el backend.
// Se mantiene el nombre `api` para no tocar las pantallas.
export { api } from './store.js';
export { PUBLIC_URL } from './qr.js';
