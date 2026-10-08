// Prisma's `contains` passes % and _ through to LIKE; escape them so search stays a literal match.
export const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);
