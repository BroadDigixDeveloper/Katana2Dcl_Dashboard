import { Menu, Bell, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header = ({ onToggleSidebar, sidebarOpen }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-card border-b border-border/20 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="hover:bg-sidebar-hover"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Katana DCL</h1>
            <p className="text-xs text-muted-foreground">Pulse Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="hover:bg-sidebar-hover"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="hover:bg-sidebar-hover">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="sm" className="hover:bg-sidebar-hover">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};