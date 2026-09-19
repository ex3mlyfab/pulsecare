import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    FileBarChart,
    FolderGit2,
    LayoutGrid,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavCollapsible } from '@/components/nav-collapsible';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as recordStatsIndex } from '@/routes/record-stats';
import { index as statsReportIndex } from '@/routes/stats-report';
import { index as rolesIndex } from '@/routes/admin/roles';
import { index as permissionsIndex } from '@/routes/admin/permissions';
import { index as usersIndex } from '@/routes/admin/users';
import { index as otherMetricsIndex } from '@/routes/admin/other-metrics';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Record Stats',
        href: recordStatsIndex().url,
        icon: BarChart3,
    },
    {
        title: 'Stats Report',
        href: statsReportIndex().url,
        icon: FileBarChart,
    },
];

const appSettingsItems: NavItem[] = [
    {
        title: 'Roles',
        href: rolesIndex().url,
    },
    {
        title: 'Permissions',
        href: permissionsIndex().url,
    },
    {
        title: 'Users',
        href: usersIndex().url,
    },
    {
        title: 'Other Metrics',
        href: otherMetricsIndex().url,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavCollapsible
                    label="App Settings"
                    icon={Settings}
                    items={appSettingsItems}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
