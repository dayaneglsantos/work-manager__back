export const permissionCatalog = [
  {
    type: 'users',
    actions: ['create', 'read', 'update'],
  },
  {
    type: 'departments',
    actions: ['create', 'read', 'update', 'delete'],
  },
  {
    type: 'profiles',
    actions: ['create', 'read', 'update', 'delete'],
  },
  {
    type: 'permissions',
    actions: ['read', 'update'],
  },
  {
    type: 'tasks',
    actions: ['create', 'read', 'update', 'delete'],
  },
] as const;
