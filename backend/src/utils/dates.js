// API dates are calendar dates ("YYYY-MM-DD"). They are anchored at UTC midnight for MySQL DATE
// columns and read back with toISOString(), so no local time zone is ever involved.
export const toDbDate = (value) => new Date(`${value}T00:00:00.000Z`);

export const toApiDate = (date) => date.toISOString().slice(0, 10);
