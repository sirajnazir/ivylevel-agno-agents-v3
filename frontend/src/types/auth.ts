export type UserRole = 'student' | 'parent' | 'coach' | 'admin';

export const USER_ROLES = {
    STUDENT: 'student',
    PARENT: 'parent',
    COACH: 'coach',
    ADMIN: 'admin',
} as const;
