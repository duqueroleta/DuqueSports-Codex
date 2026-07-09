const DATA_ADAPTER_VALIDATION_MODEL = 'data-adapter-validation-v1';

function hasRequiredFields(item, fields) {
  return fields.every((field) => item[field] !== undefined && item[field] !== null && item[field] !== '');
}

function validateCollection({ items, requiredFields, entityName }) {
  const errors = [];

  if (!Array.isArray(items)) {
    return {
      model: DATA_ADAPTER_VALIDATION_MODEL,
      valid: false,
      entityName,
      errors: [`${entityName} must be an array`],
      checkedItems: 0,
    };
  }

  items.forEach((item, index) => {
    if (!hasRequiredFields(item, requiredFields)) {
      errors.push(`${entityName}[${index}] missing required fields`);
    }
  });

  return {
    model: DATA_ADAPTER_VALIDATION_MODEL,
    valid: errors.length === 0,
    entityName,
    errors,
    checkedItems: items.length,
  };
}

function validateMatchesData(matches) {
  return validateCollection({
    items: matches,
    entityName: 'matches',
    requiredFields: ['id', 'league', 'time', 'status', 'home', 'away', 'signal', 'confidence'],
  });
}

function validateMarketsData(markets) {
  return validateCollection({
    items: markets,
    entityName: 'markets',
    requiredFields: ['id', 'name', 'strength', 'risk', 'averageOdd', 'audit'],
  });
}

function validateAuditsData(audits) {
  return validateCollection({
    items: audits,
    entityName: 'audits',
    requiredFields: ['marketId', 'marketName', 'status', 'risk', 'trend'],
  });
}

function summarizeAdapterValidations(validations) {
  const errors = validations.flatMap((validation) => validation.errors);

  return {
    model: DATA_ADAPTER_VALIDATION_MODEL,
    valid: validations.every((validation) => validation.valid),
    errors,
    checkedItems: validations.reduce((total, validation) => total + validation.checkedItems, 0),
    sources: validations.map((validation) => ({
      entityName: validation.entityName,
      valid: validation.valid,
      checkedItems: validation.checkedItems,
      errors: validation.errors.length,
    })),
  };
}

export {
  DATA_ADAPTER_VALIDATION_MODEL,
  summarizeAdapterValidations,
  validateAuditsData,
  validateMarketsData,
  validateMatchesData,
};
