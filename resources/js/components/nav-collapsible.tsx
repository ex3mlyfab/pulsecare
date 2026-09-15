import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

type NavCollapsibleProps = {
    label: string;
    icon?: LucideIcon | null;
    items: NavItem[];
    /**
     * Open the group on first render. The group auto-expands whenever one of
     * its items (or a descendant) is the current URL.
     */
    defaultOpen?: boolean;
};

export function NavCollapsible({
    label,
    icon: Icon,
    items,
    defaultOpen = true,
}: NavCollapsibleProps) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const hasActiveChild = items.some((item) =>
        isCurrentOrParentUrl(item.href),
    );

    return (
        <Collapsible asChild defaultOpen={defaultOpen}>
            <SidebarMenu>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                            isActive={hasActiveChild}
                            tooltip={{ children: label }}
                        >
                            {Icon && <Icon />}
                            <span>{label}</span>
                            <ChevronDown className="ml-auto" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <SidebarMenuSub>
                            {items.map((item) => (
                                <SidebarMenuSubItem key={item.title}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </SidebarMenu>
        </Collapsible>
    );
}
