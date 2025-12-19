import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PetProvider } from "@/contexts/PetContext";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
<<<<<<< HEAD
import Profile from "./pages/Profile";
import SymptomChecker from "./pages/SymptomChecker";
import PetProfile from "./pages/PetProfile";
import EditPetProfile from "./pages/EditPetProfile";
=======
import SymptomChecker from "./pages/SymptomChecker";
import PetProfile from "./pages/PetProfile";
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
import Providers from "./pages/Providers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
<<<<<<< HEAD
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
=======
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PetProvider>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
<<<<<<< HEAD
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/providers" element={<Providers />} />
              <Route
                path="/pet-profile"
=======
              <Route path="/symptom-checker" element={<SymptomChecker />} />
              <Route path="/providers" element={<Providers />} />
              <Route 
                path="/pet-profile" 
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
                element={
                  <ProtectedRoute>
                    <PetProfile />
                  </ProtectedRoute>
<<<<<<< HEAD
                }
              />
              <Route
                path="/pet-profile/edit/:petId"
                element={
                  <ProtectedRoute>
                    <EditPetProfile />
                  </ProtectedRoute>
                }
              />
=======
                } 
              />
              {/* Protected routes will be added in next response */}
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PetProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;