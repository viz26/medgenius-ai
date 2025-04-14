import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, Shield, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserMenu = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user info from authenticated session
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);
  
  const handleLogout = () => {
    // In a real implementation, this would call your logout API endpoint
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            {userEmail ? userEmail.split('@')[0] : 'Account'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="rounded-full bg-primary/10 p-1">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{userEmail}</p>
              <p className="text-xs leading-none text-muted-foreground">Medical Professional</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleNavigate('/settings')} className="cursor-pointer">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleNavigate('/security')} className="cursor-pointer">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
