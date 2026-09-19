import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    ChevronDown,
    FileBarChart,
    Folder,
    LayoutGrid,
    Menu,
    Search,
    Shield,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as recordStatsIndex } from '@/routes/record-stats';
import { index as statsReportIndex } from '@/routes/stats-report';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Record Stats',
        href: recordStatsIndex(),
        icon: BarChart3,
    },
    {
        title: 'Stats Report',
        href: statsReportIndex(),
        icon: FileBarChart,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Roles',
        href: '/admin/roles',
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
    {
        title: 'Wards',
        href: '/admin/wards',
    },
    {
        title: 'Clinics',
        href: '/admin/clinics',
    },
    {
        title: 'Other Metrics',
        href: '/admin/other-metrics',
    },
];

const activeItemStyles =
    'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    return (
        <>
            <div className="border-sidebar-border/80 bg-card shadow-layer-1 border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px]"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="text-foreground dark:text-foreground h-6 w-6 fill-current" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'hover:bg-accent hover:text-accent-foreground flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors',
                                                        isCurrentUrl(
                                                            item.href,
                                                        ) &&
                                                            'bg-primary/10 text-primary font-semibold',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <Collapsible
                                            defaultOpen={false}
                                            className="flex flex-col"
                                        >
                                            <CollapsibleTrigger className="group focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground flex items-center space-x-2 rounded-sm px-2 py-1.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
                                                <Shield className="h-5 w-5" />
                                                <span>App Admin</span>
                                                <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="border-sidebar-border mt-2 flex flex-col space-y-1 border-l pl-7">
                                                {adminNavItems.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className={cn(
                                                            'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring rounded-sm px-2 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                                                            isCurrentUrl(
                                                                item.href,
                                                            ) &&
                                                                'bg-primary/10 text-primary font-semibold',
                                                        )}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:bg-accent hover:text-accent-foreground flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring h-9 cursor-pointer px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div
                                                className="bg-primary dark:bg-primary absolute bottom-0 left-0 h-0.5 w-full translate-y-px"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                            <NavigationMenuItem className="relative flex h-full items-center">
                                <NavigationMenuTrigger
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        isCurrentUrl(
                                            '/admin',
                                            undefined,
                                            true,
                                        ) && activeItemStyles,
                                        'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring h-9 cursor-pointer px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                                    )}
                                >
                                    <Shield className="mr-2 h-4 w-4" />
                                    App Admin
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[200px] gap-1 p-2">
                                        {adminNavItems.map((item) => (
                                            <li key={item.title}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring block rounded-sm px-3 py-2 text-sm font-medium transition-colors select-none focus-visible:ring-2 focus-visible:outline-none',
                                                            isCurrentUrl(
                                                                item.href,
                                                            ) &&
                                                                'bg-primary/10 text-primary font-semibold',
                                                        )}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="group h-9 w-9 cursor-pointer"
                            >
                                <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                            </Button>
                            <div className="ml-1 hidden gap-1 lg:flex">
                                {rightNavItems.map((item) => (
                                    <Tooltip key={item.title}>
                                        <TooltipTrigger>
                                            <a
                                                href={toUrl(item.href)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground/70 inline-flex h-9 w-9 items-center justify-center rounded-sm bg-transparent p-0 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none"
                                            >
                                                <span className="sr-only">
                                                    {item.title}
                                                </span>
                                                {item.icon && (
                                                    <item.icon className="size-5 opacity-90 transition-opacity group-hover:opacity-100" />
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="bg-muted text-foreground dark:bg-card dark:text-foreground rounded-sm">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && (
                                    <UserMenuContent user={auth.user} />
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="text-foreground mx-auto flex h-12 w-full items-center justify-start px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
