export function buildUpdateData(
  body: Record<string, any>,
  allowedFields: string[]
) {
  return allowedFields.reduce(
    (acc, field) => {
      if (body[field] !== undefined) acc[field] = body[field];
      return acc;
    },
    {} as Record<string, any>
  );
}
