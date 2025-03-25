import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Login form schema
const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Registration form schema
const registerFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username cannot exceed 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(search);
  const returnUrl = searchParams.get("returnUrl") || "/";
  const signupParam = searchParams.get("signup");
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>(signupParam === "true" ? "register" : "login");
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation(returnUrl);
    }
  }, [user, returnUrl, setLocation]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Continue with social login (placeholder)
  const handleSocialLogin = (provider: string) => {
    alert(`${provider} login is not implemented yet`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 items-center">
        {/* Auth form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-2">
                <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="ml-2 text-2xl font-bold text-primary-800">EduHub</span>
              </div>
              <CardTitle className="text-2xl text-center">Welcome to EduHub</CardTitle>
              <CardDescription className="text-center">
                {activeTab === "login" 
                  ? "Sign in to your account to access your courses" 
                  : "Create an account to start your learning journey"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>
                
                {/* Login form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username or Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between items-center">
                              <FormLabel>Password</FormLabel>
                              <a href="#" className="text-sm text-primary hover:underline">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : "Sign in"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Registration form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                        </label>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : "Create account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button variant="outline" type="button" onClick={() => handleSocialLogin("Google")}>
                    <svg className="mr-2 h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.545 12.151L12.545 9.95H19.425C19.855 9.95 19.935 10.357 19.935 10.691C19.935 13.759 18.142 19.052 12.428 19.052C8.142 19.052 4.655 15.565 4.655 11.279C4.655 6.993 8.142 3.506 12.428 3.506C14.885 3.506 16.621 4.437 17.864 5.614C18.342 6.084 18.333 6.856 17.864 7.325L16.125 9.064C15.656 9.533 14.917 9.533 14.448 9.064C13.847 8.473 13.022 8.085 12.428 8.085C10.61 8.085 9.131 9.7 9.131 11.279C9.131 12.852 10.61 14.473 12.428 14.473C13.962 14.473 14.831 13.917 15.413 13.325C15.831 12.9 16.381 12.619 16.95 12.619L17.215 12.619C17.843 12.619 18.24 13.206 17.965 13.757C17.254 15.17 15.95 16.696 13.506 17.488C13.16 17.605 12.808 17.478 12.59 17.201C11.429 15.712 12.545 13.724 12.545 12.151Z" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" onClick={() => handleSocialLogin("Facebook")}>
                    <svg className="mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Hero section */}
        <motion.div 
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 text-black p-8 rounded-lg shadow-xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-4">
                Empower Your Future with EduHub
              </h2>
              <p className="text-lg text-black mb-6">
                Join our community of learners and gain in-demand skills with our expert-led courses.
              </p>
              <ul className="space-y-3">
                {[
                  "Access to 500+ courses across various domains",
                  "Learn at your own pace, anywhere, anytime",
                  "Connect with expert instructors and peers",
                  "Earn certificates to showcase your skills"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-indigo-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-black/20 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold">Did you know?</p>
                  <p className="text-indigo-200 text-sm">Online learners report 50% faster skill acquisition compared to traditional methods</p>
                </div>
              </div>
              
              <blockquote className="italic text-indigo-100 border-l-4 border-indigo-300 pl-4 mt-4">
                "EduHub transformed my career path. The courses were engaging and the skills I learned helped me land my dream job."
                <footer className="mt-2 font-medium text-white">
                  — Sarah K., Software Developer
                </footer>
              </blockquote>
            </div>
          </div>
        </motion.div>
      </div>
      
      <p className="mt-6 text-center text-gray-600">
        <button className="">
        <a href="/" className="text-primary hover:underline">Back to Home</a>
        </button>
      </p>
   
  

    </div>
  );
}
