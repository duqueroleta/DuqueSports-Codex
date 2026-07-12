function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isRequiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUtcIsoDate(value) {
  return isRequiredText(value)
    && value.endsWith('Z')
    && Number.isFinite(Date.parse(value));
}

function addError(errors, path, code, message) {
  errors.push({ path, code, message });
}

function validateRequiredText(errors, value, path) {
  if (!isRequiredText(value)) {
    addError(errors, path, 'required-text', `${path} must be a non-empty string`);
  }
}

export {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
};
