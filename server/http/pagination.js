function encodeCursor(offset) {
  return Buffer.from(String(offset), 'utf8').toString('base64url');
}

function decodeCursor(cursor) {
  if (cursor === null || cursor === undefined || cursor === '') {
    return 0;
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
    const offset = Number(decoded);
    return Number.isInteger(offset) && offset >= 0 ? offset : null;
  } catch {
    return null;
  }
}

function paginate(items, cursor, limit) {
  const offset = decodeCursor(cursor);

  if (offset === null) {
    return null;
  }

  const data = items.slice(offset, offset + limit);
  const nextOffset = offset + data.length;

  return {
    data,
    nextCursor: nextOffset < items.length ? encodeCursor(nextOffset) : null,
  };
}

export { decodeCursor, encodeCursor, paginate };
