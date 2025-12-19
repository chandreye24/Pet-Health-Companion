import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
<<<<<<< HEAD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

=======
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotDialog, setShowForgotDialog] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    if (password.length < 6) {
      toast.error('Invalid password');
      return;
    }

<<<<<<< HEAD
    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      await login(email);
      console.log('Login successful, navigating to pet-profile');
      toast.success('Logged in successfully!');
      navigate('/pet-profile');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setLoading(false);
=======
    try {
      await login(email, phone);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to login');
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('OTP sent to your phone!');
    setStep('otp');
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await login(email, phone);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to login');
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      toast.error('Please enter your email');
      return;
    }

    // Mock password reset
    toast.success('Password reset link sent to your email!');
    setShowForgotDialog(false);
    setForgotPasswordEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
<<<<<<< HEAD
              onClick={() => navigate('/')}
=======
              onClick={() => step === 'otp' ? setStep('credentials') : navigate('/')}
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <PawPrint className="w-8 h-8 text-[#FF385C]" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
<<<<<<< HEAD
            Login to your Pet Health Companion account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs text-[#FF385C] hover:text-[#E31C5F]"
                    >
                      Forgot Password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="your@email.com"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-[#FF385C] hover:bg-[#E31C5F]">
                        Send Reset Link
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
=======
            {step === 'credentials' 
              ? 'Choose your preferred login method'
              : 'Enter the OTP sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'credentials' ? (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as 'password' | 'otp')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto text-xs text-[#FF385C] hover:text-[#E31C5F]"
                          >
                            Forgot Password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="forgot-email">Email</Label>
                              <Input
                                id="forgot-email"
                                type="email"
                                placeholder="your@email.com"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                                className="h-12"
                              />
                            </div>
                            <Button type="submit" className="w-full bg-[#FF385C] hover:bg-[#E31C5F]">
                              Send Reset Link
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold">
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-otp">Email</Label>
                    <Input
                      id="email-otp"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-otp">Phone Number</Label>
                    <Input
                      id="phone-otp"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold">
                    Send OTP
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="h-12 text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-muted-foreground">
                  OTP sent to {phone}
                </p>
              </div>

              <Button type="submit" className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold">
                Verify & Login
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12"
                onClick={() => toast.success('OTP resent!')}
              >
                Resend OTP
              </Button>
            </form>
          )}
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01

          <div className="text-center text-sm mt-6">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 text-[#FF385C] hover:text-[#E31C5F]"
              onClick={() => navigate('/signup')}
            >
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;