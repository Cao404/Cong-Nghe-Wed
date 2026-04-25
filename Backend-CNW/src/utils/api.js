export function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isPrismaNotFound(error) {
  return error?.code === 'P2025';
}

export function isPrismaUniqueConstraint(error) {
  return error?.code === 'P2002';
}

export function sendValidationError(res, message) {
  return res.status(400).json({ error: message });
}

export function sendNotFound(res, message) {
  return res.status(404).json({ error: message });
}
