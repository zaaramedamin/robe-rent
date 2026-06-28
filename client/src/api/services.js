import api from './client';

/* ------------------------- Public: dresses ------------------------- */

export function getDresses(params = {}) {
  return api.get('/dresses', { params }).then((r) => r.data);
}

export function getDress(id) {
  return api.get(`/dresses/${id}`).then((r) => r.data);
}

export function getReservedDates(id) {
  return api.get(`/dresses/${id}/reserved-dates`).then((r) => r.data);
}

/* ---------------------- Public: reservations ----------------------- */

export function createReservation(payload) {
  return api.post('/reservations', payload).then((r) => r.data);
}

/* --------------------------- Admin --------------------------------- */

export function adminLogin(username, password) {
  return api.post('/admin/login', { username, password }).then((r) => r.data);
}

export function getAdminReservations() {
  return api.get('/admin/reservations').then((r) => r.data);
}

export function updateReservationStatus(id, status) {
  return api
    .patch(`/admin/reservations/${id}/status`, { status })
    .then((r) => r.data);
}

export function getAdminCalendar() {
  return api.get('/admin/calendar').then((r) => r.data);
}

export function getAdminStats() {
  return api.get('/admin/stats').then((r) => r.data);
}

export function getAdminStatsHistory() {
  return api.get('/admin/stats/history').then((r) => r.data);
}

export function getAdminClients() {
  return api.get('/admin/clients').then((r) => r.data);
}

/* ------------------- Admin: dress management ----------------------- */
// These accept a FormData instance (so image files can be uploaded).
// Axios sets the multipart Content-Type/boundary automatically.

export function createDress(formData) {
  return api.post('/admin/dresses', formData).then((r) => r.data);
}

export function updateDress(id, formData) {
  return api.put(`/admin/dresses/${id}`, formData).then((r) => r.data);
}

export function deleteDress(id) {
  return api.delete(`/admin/dresses/${id}`).then((r) => r.data);
}
