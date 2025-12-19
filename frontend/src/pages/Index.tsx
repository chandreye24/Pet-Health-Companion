import { Settings, User, LogOut, Home, UserCircle, PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  // Array of creative loading messages
  const loadingMessages = [
    "Gears are spinning and code elves are still typing away.",
    "Your app's in the workshop—hammering and welding features.",
    "Seeds planted, watering daily—your app's growing.",
    "The orchestra's rehearsing—your app's score is being written.",
    "We're sprinting through code and hurdling over bugs as we build.",
    "Your app's training hard in the gym, getting stronger each day.",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out
      setIsVisible(false);

      // After fade out completes, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setIsVisible(true);
      }, 500); // 500ms for fade out
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Header with Profile */}
      {isAuthenticated && user && (
        <header className="absolute top-0 right-0 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-gray-800"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#FF385C] text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/')}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/pet-profile')}
                className="cursor-pointer"
              >
                <PawPrint className="mr-2 h-4 w-4" />
                <span>Pet Profiles</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Spinning Gear Icon */}
        <div className="mb-8">
          <Settings
            className="w-16 h-16 text-gray-400 animate-spin"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Main Text with Fade Animation */}
        <h1
          className={`text-xl font-medium text-gray-300 text-center max-w-md transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {loadingMessages[currentMessageIndex]}
        </h1>

        {/* Auth Buttons for non-authenticated users */}
        {!isAuthenticated && (
          <div className="mt-8 flex gap-4">
            <Button
              onClick={() => navigate("/login")}
              variant="outline"
              className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              className="bg-[#FF385C] hover:bg-[#E31C5F] text-white"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
