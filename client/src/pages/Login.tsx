import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  // Parse URL params for status messages and intended role
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const verified = urlParams.get("verified") === "true";
  const error = urlParams.get("error");
  const intendedRole = urlParams.get("role"); // 'athlete' or 'coach'

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      if (!response.ok) {
        throw { ...result, status: response.status };
      }
      return result;
    },
    onSuccess: async () => {
      // Refetch queries and wait for them to complete before redirecting
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }),
        queryClient.refetchQueries({ queryKey: ["/api/auth/session"] }),
      ]);
      // Redirect to landing page - user can choose their role from there
      setLocation("/");
    },
    onError: (error: any) => {
      if (error.requiresVerification) {
        setShowVerificationPrompt(true);
        setUnverifiedEmail(form.getValues("email"));
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/resend-verification", {
        email: unverifiedEmail,
      });
      return response.json();
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setShowVerificationPrompt(false);
    loginMutation.mutate(data);
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "invalid-token":
        return "Invalid verification link. Please request a new one.";
      case "expired-token":
        return "Verification link has expired. Please request a new one.";
      case "verification-failed":
        return "Email verification failed. Please try again.";
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="container-login">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your CoachConnect account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700 dark:text-green-400">Email verified!</AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400">
                Your email has been verified. You can now sign in.
              </AlertDescription>
            </Alert>
          )}

          {error && getErrorMessage(error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{getErrorMessage(error)}</AlertDescription>
            </Alert>
          )}

          {showVerificationPrompt && (
            <Alert className="mb-4">
              <Mail className="h-4 w-4" />
              <AlertTitle>Email not verified</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Please verify your email before signing in.</p>
                <button
                  onClick={() => resendMutation.mutate()}
                  disabled={resendMutation.isPending}
                  className="text-primary underline hover:no-underline disabled:opacity-50"
                  data-testid="button-resend-verification"
                >
                  {resendMutation.isPending ? "Sending..." : "Resend verification email"}
                </button>
                {resendMutation.isSuccess && (
                  <p className="text-sm text-green-600">Verification email sent!</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm text-muted-foreground hover:text-primary"
                        data-testid="link-forgot-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginMutation.isError && !showVerificationPrompt && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {(loginMutation.error as any)?.error || "Failed to sign in. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary underline hover:no-underline" data-testid="link-signup">
              Create one
            </Link>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-replit-login"
          >
            Sign in with Replit
          </Button>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground" data-testid="link-home">
              <ArrowLeft className="mr-1 inline h-3 w-3" />
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
