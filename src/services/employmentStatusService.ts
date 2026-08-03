import { EmploymentStatus } from '@prisma/client';

export const normalizeStatusReason = (
  status: EmploymentStatus,
  statusReason?: string | null
): string | null => {
  if (status !== EmploymentStatus.inactive) {
    return null;
  }

  const normalizedReason = statusReason?.trim();

  return normalizedReason || null;
};

export const canAccessSystem = (status: EmploymentStatus): boolean =>
  status === EmploymentStatus.active;
