import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  CheckSquare,
  LayoutGrid,
  Settings,
  Tag,
  X,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import { useLocation } from "wouter";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutGrid,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: BarChart3,
  },
  {
    label: "Tags",
    href: "/tags",
    icon: Tag,
  },
];

const secondaryItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-card 
        transition-transform duration-300 select-none lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
            <div className="flex items-center gap-3 cursor-pointer">
              <img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="w-8 h-8 rounded-lg object-cover pointer-events-none"
              />
              <span className="font-semibold text-foreground hidden sm:inline">
                {APP_TITLE}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 pointer-events-none" />
                    <span className="text-sm font-medium pointer-events-none">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="py-2">
              <div className="h-px bg-border/50" />
            </div>

            {/* Secondary items */}
            <div className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 pointer-events-none" />
                    <span className="text-sm font-medium pointer-events-none">
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
