import { usePage } from '@inertiajs/react';

type PageProps = {
    auth?: {
        user: { id: number } | null;
        permissions?: string[];
        is_super_admin?: boolean;
    };
};

/**
 * Read the shared `auth` prop and expose a `can(ability)` helper.
 *
 * `auth.permissions` / `auth.is_super_admin` are populated server-side in
 * `HandleInertiaRequests`. This is a frontend guard for showing or hiding
 * UI (buttons, menu items, routes) — it does not replace the backend
 * `Gate::authorize()` calls that protect every route.
 *
 * Super-admins bypass every gate server-side, so for them `can()` returns
 * true for any ability.
 *
 * Usage:
 * ```tsx
 * const { can, permissions, isSuperAdmin } = usePermissions();
 *
 * {can('roles.create') && <Button>New role</Button>}
 * ```
 */
export function usePermissions(): {
    can: (ability: string) => boolean;
    permissions: string[];
    isSuperAdmin: boolean;
} {
    const { auth } = usePage<PageProps>().props;

    const permissions = auth?.permissions ?? [];
    const isSuperAdmin = Boolean(auth?.is_super_admin);

    const can = (ability: string): boolean =>
        isSuperAdmin || permissions.includes(ability);

    return { can, permissions, isSuperAdmin };
}
