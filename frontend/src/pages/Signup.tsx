import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
<<<<<<< HEAD
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
=======
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Signup: React.FC = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
=======
  const { login } = useAuth();
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (pwd.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('One lowercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push('One special character');
    }
    
    // Check if password is similar to email
    if (email && pwd.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
      errors.push('Cannot be similar to email');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
    if (pwd.length === 0) return { strength: '', color: '' };
    
    const validation = validatePassword(pwd);
    if (!validation.isValid) {
      if (pwd.length < 8) return { strength: 'Too Short', color: 'text-red-500' };
      if (validation.errors.length >= 3) return { strength: 'Weak', color: 'text-red-500' };
      if (validation.errors.length >= 2) return { strength: 'Fair', color: 'text-orange-500' };
      return { strength: 'Good', color: 'text-yellow-500' };
    }
    
    // Strong password criteria
    if (pwd.length >= 12 && /[0-9]/.test(pwd)) {
      return { strength: 'Very Strong', color: 'text-green-600' };
    }
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const handleSignup = async (e: React.FormEvent) => {
=======

  const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
    if (pwd.length === 0) return { strength: '', color: '' };
    if (pwd.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (pwd.length < 10) return { strength: 'Medium', color: 'text-yellow-500' };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 'Strong', color: 'text-green-500' };
    }
    return { strength: 'Medium', color: 'text-yellow-500' };
  };

  const handlePasswordSignup = async (e: React.FormEvent) => {
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    e.preventDefault();
    
    if (!ageConfirmed) {
      toast.error('Please confirm you are 18 years or older');
      return;
    }
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

<<<<<<< HEAD
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(`Password requirements: ${passwordValidation.errors.join(', ')}`);
=======
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

<<<<<<< HEAD
    setLoading(true);
    try {
      await signup({
        email,
        name: name.trim(),
        termsAccepted,
        ageConfirmed,
      });
      
      toast.success('Account created successfully! Please complete your profile.');
      navigate('/profile');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
=======
    try {
      await login(email, phone);
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ageConfirmed) {
      toast.error('Please confirm you are 18 years or older');
      return;
    }
    
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

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
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } catch (error) {
      toast.error('Failed to create account');
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
    }
  };

  const passwordStrength = getPasswordStrength(password);

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
              onClick={() => step === 'otp' ? setStep('details') : navigate('/')}
>>>>>>> 32c98afaf36a2d7b0db3ed893c2ec92b3046bd01
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <PawPrint className="w-8 h-8 text-[#FF385C]" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
<<<<<<< HEAD
            Join Pet Health Companion today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12"
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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
              {password && (
                <div className="space-y-1">
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                  {!validatePassword(password).isValid && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p className="font-medium">Requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {validatePassword(password).errors.map((error, idx) => (
                          <li key={idx} className="text-red-500">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="age"
                checked={ageConfirmed}
                onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
              />
              <label
                htmlFor="age"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I confirm I am 18 years or older
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the{' '}
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-[#FF385C] hover:underline">
                      terms and conditions
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Terms and Conditions</DialogTitle>
                      <DialogDescription>
                        Please read our terms and conditions carefully
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="space-y-4 text-sm">
                        <section>
                          <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                          <p className="text-muted-foreground">
                            By accessing and using the Pet Health Companion application, you accept and agree to be bound by the terms and provision of this agreement.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">2. Use of Service</h3>
                          <p className="text-muted-foreground mb-2">
                            Our service provides AI-powered health assessments and recommendations for pets. You agree to:
                          </p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                            <li>Provide accurate information about your pet</li>
                            <li>Use the service responsibly and lawfully</li>
                            <li>Not misuse or attempt to manipulate the AI system</li>
                            <li>Maintain the confidentiality of your account</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">3. Medical Disclaimer</h3>
                          <p className="text-muted-foreground">
                            <strong>IMPORTANT:</strong> The AI assessments provided by this application are for informational purposes only and do not constitute professional veterinary advice, diagnosis, or treatment. Always seek the advice of a qualified veterinarian with any questions you may have regarding your pet's health. Never disregard professional veterinary advice or delay in seeking it because of something you have read on this application.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">4. Age Requirement</h3>
                          <p className="text-muted-foreground">
                            You must be at least 18 years old to use this service. By using this service, you represent and warrant that you are at least 18 years of age.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">5. Privacy and Data</h3>
                          <p className="text-muted-foreground mb-2">
                            We collect and process your personal information in accordance with our Privacy Policy. By using our service, you consent to:
                          </p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                            <li>Collection of pet health information</li>
                            <li>Storage of medical history and symptom checks</li>
                            <li>Use of data to improve AI recommendations</li>
                            <li>Secure storage of your personal information</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">6. User Responsibilities</h3>
                          <p className="text-muted-foreground mb-2">
                            As a user, you are responsible for:
                          </p>
                          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                            <li>Maintaining accurate pet information</li>
                            <li>Seeking immediate veterinary care in emergencies</li>
                            <li>Following up with veterinarians as recommended</li>
                            <li>Not relying solely on AI assessments for medical decisions</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">7. Limitation of Liability</h3>
                          <p className="text-muted-foreground">
                            To the maximum extent permitted by law, Pet Health Companion shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">8. Service Modifications</h3>
                          <p className="text-muted-foreground">
                            We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice. You agree that we shall not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">9. Governing Law</h3>
                          <p className="text-muted-foreground">
                            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">10. Contact Information</h3>
                          <p className="text-muted-foreground">
                            If you have any questions about these Terms and Conditions, please contact us at support@pethealthcompanion.com
                          </p>
                        </section>

                        <section className="pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Last updated: December 10, 2025
                          </p>
                        </section>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
=======
            {step === 'details' 
              ? 'Choose your preferred signup method'
              : 'Enter the OTP sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'details' ? (
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as 'password' | 'otp')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="otp">OTP</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handlePasswordSignup} className="space-y-4">
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
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
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
                    {password && (
                      <p className={`text-xs ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.strength}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="age"
                      checked={ageConfirmed}
                      onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                    />
                    <label
                      htmlFor="age"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm I am 18 years or older
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </label>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-[#FF385C] hover:bg-[#E31C5F] text-white font-semibold">
                    Create Account
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="age-otp"
                      checked={ageConfirmed}
                      onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                    />
                    <label
                      htmlFor="age-otp"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I confirm I am 18 years or older
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms-otp"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    />
                    <label
                      htmlFor="terms-otp"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the terms and conditions
                    </label>
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
                Verify & Create Account
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
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 text-[#FF385C] hover:text-[#E31C5F]"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;