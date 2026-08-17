const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateOnly = (value: unknown): value is string => {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  // Datas inexistentes são normalizadas pelo Date; a comparação garante que,
  // por exemplo, 2026-02-30 não seja aceito como uma data de março.
  const isValid =
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  return isValid;
};

export const parseDateOnly = (value: string) =>
  new Date(`${value}T00:00:00.000Z`);
