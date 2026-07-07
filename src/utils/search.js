function normalizeSearchValue(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function itemMatchesSearch(item, searchTerm) {
  const normalizedTerm = normalizeSearchValue(searchTerm).trim();

  if (!normalizedTerm) {
    return true;
  }

  return Object.values(item).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => normalizeSearchValue(entry).includes(normalizedTerm));
    }

    return normalizeSearchValue(value).includes(normalizedTerm);
  });
}

export { itemMatchesSearch };
