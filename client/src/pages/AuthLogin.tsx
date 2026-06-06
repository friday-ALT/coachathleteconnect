import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { OryzoAuthFrame } from "@/components/oryzo/OryzoAuthFrame";
import { apiRequest } from "@/lib/queryClient";
import { getPostAuthPath } from "@/lib/postAuthNavigation";
import type { ActiveRole } from "@/hooks/useRole";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthLogin() {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const verified = urlParams.get("verified") === "true";
  const roleParam = urlParams.get("role") as ActiveRole;
  const redirectParam = urlParams.get("redirect");
  const signupHref =
    roleParam === "athlete" || roleParam === "coach"
      ? `/auth/signup?role=${roleParam}`
      : "/auth/signup";

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      if (!response.ok) throw { ...result, status: response.status };
      return result;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["/api/auth/user"] }),
        queryClient.refetchQueries({ queryKey: ["/api/auth/session"] }),
      ]);

      const preferredRole =
        roleParam === "athlete" || roleParam === "coach" ? roleParam : null;

      let session = queryClient.getQueryData<{
        activeRole: ActiveRole;
        hasAthleteProfile: boolean;
        hasCoachProfile: boolean;
        athleteProfileComplete?: boolean;
        coachProfileComplete?: boolean;
      }>(["/api/auth/session"]);

      if (
        preferredRole &&
        session &&
        !session.activeRole &&
        ((preferredRole === "athlete" && session.hasAthleteProfile) ||
          (preferredRole === "coach" && session.hasCoachProfile))
      ) {
        await apiRequest("POST", "/api/auth/enter-role", { role: preferredRole });
        await queryClient.refetchQueries({ queryKey: ["/api/auth/session"] });
        session = queryClient.getQueryData(["/api/auth/session"]);
      }

      const postAuthPath = getPostAuthPath(session, preferredRole);
      const safeRedirect =
        redirectParam &&
        redirectParam.startsWith('/') &&
        !redirectParam.startsWith('//') &&
        !redirectParam.startsWith('/auth/login')
          ? redirectParam
          : null;
      setLocation(safeRedirect || postAuthPath);
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

  return (
    <OryzoAuthFrame
      title="Log in"
      lead="Use the same email and password on the mobile app. Your profile, sessions, and messages stay in sync."
    >
        {verified && (
          <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Email verified! You can now log in.
            </AlertDescription>
          </Alert>
        )}

        {showVerificationPrompt && (
          <Alert className="mb-6">
            <Mail className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>Please verify your email before signing in.</p>
              <button
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-primary underline hover:no-underline disabled:opacity-50"
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
          <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@example.com" 
                      className="h-12"
                      {...field} 
                    />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter your password" 
                      className="h-12"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {loginMutation.isError && !showVerificationPrompt && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(loginMutation.error as any)?.error || "Invalid email or password"}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base mt-6 rounded-full bg-[var(--helix-green)] hover:bg-[var(--helix-green-dim)] text-[var(--helix-black)]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href={signupHref} className="text-[var(--helix-green)] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
    </OryzoAuthFrame>
  );
}
