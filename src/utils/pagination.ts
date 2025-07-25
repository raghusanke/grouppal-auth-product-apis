export const getPagination = (page: string | undefined, limit: string | undefined) => {
  const p = parseInt(page || '1');
  const l = parseInt(limit || '10');
  const offset = (p - 1) * l;

  return { page: p, limit: l, offset };
};
