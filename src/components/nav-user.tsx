import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function NavUser({
  user,
  onLogout,
}: {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onLogout?: () => void
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-lg shrink-0">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {user?.name?.slice(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="grid text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{user?.name || "Admin"}</span>
              <span className="truncate text-xs text-muted-foreground">Logout</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:hidden"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
