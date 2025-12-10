import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleTheme } from "@/components/ToggleTheme";
import { APP_TITLE } from "@/const";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header
      className="
        sticky top-0 z-40 w-full 
        border-b border-border/50 
        bg-background/95 backdrop-blur 
        supports-[backdrop-filter]:bg-background/60 
        select-none
      "
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5 pointer-events-none" />
          </Button>

          <h1 className="text-lg font-semibold text-foreground hidden sm:block select-none">
            {APP_TITLE}
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 select-none">

          <ToggleTheme />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 rounded-full px-2 cursor-pointer flex items-center gap-3"
                aria-label="User menu"
              >
                <div
                  className="
                    w-8 h-8 rounded-full 
                    bg-gradient-to-br from-primary to-accent
                    flex items-center justify-center 
                    text-primary-foreground text-sm font-semibold
                    pointer-events-none
                  "
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <span className="hidden sm:inline text-sm font-medium select-none">
                  {user?.name || "User"}
                </span>

                <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 select-none">

              {/* USER INFO */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1 select-none">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuSeparator />

              {/* LOGOUT */}
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="
                  gap-2 cursor-pointer 
                  text-destructive focus:text-destructive
                "
              >
                <LogOut className="w-4 h-4 pointer-events-none" />
                <span className="pointer-events-none">
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
