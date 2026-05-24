import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Role = "athlete" | "coach";

const athleteStep1Schema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().int().min(5, "Must be at least 5").max(100),
});

const athleteStep2Schema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State/County is required"),
  goals: z.string().optional(),
});

const coachStep1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const coachStep2Schema = z.object({
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State/County is required"),
  experience: z.string().min(10, "Please describe your experience (min 10 chars)").max(300),
  pricePerHour: z.coerce.number().int().min(0, "Price must be 0 or more"),
});

const STORAGE_KEY = "onboarding_data";

function loadSaved(role: Role) {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${role}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function save(role: Role, data: any) {
  try {
    sessionStorage.setItem(`${STORAGE_KEY}_${role}`, JSON.stringify(data));
  } catch {}
}

export default function OnboardingSteps() {
  const [, params] = useRoute("/auth/onboarding/:role/:step");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const role = params?.role as Role;
  const currentStep = parseInt(params?.step?.replace("step", "") || "1");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) setLocation("/auth/login");
  }, [isLoading, isAuthenticated, setLocation]);

  const saved = loadSaved(role);

  const athleteStep1Form = useForm({
    resolver: zodResolver(athleteStep1Schema),
    defaultValues: { phone: saved.phone || user?.phone || "", age: saved.age || (undefined as any) },
  });

  const athleteStep2Form = useForm({
    resolver: zodResolver(athleteStep2Schema),
    defaultValues: {
      skillLevel: (saved.skillLevel as any) || "Beginner",
      locationCity: saved.locationCity || "",
      locationState: saved.locationState || "",
      goals: saved.goals || "",
    },
  });

  const coachStep1Form = useForm({
    resolver: zodResolver(coachStep1Schema),
    defaultValues: {
      name: saved.name || (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : ""),
      phone: saved.phone || user?.phone || "",
    },
  });

  const coachStep2Form = useForm({
    resolver: zodResolver(coachStep2Schema),
    defaultValues: {
      locationCity: saved.locationCity || "",
      locationState: saved.locationState || "",
      experience: saved.experience || "",
      pricePerHour: saved.pricePerHour ?? (undefined as any),
    },
  });

  const submitAthleteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/profiles/athlete", data);
      return res.json();
    },
    onSuccess: async () => {
      sessionStorage.removeItem(`${STORAGE_KEY}_athlete`);
      // Auto-enter athlete role
      try {
        await apiRequest("POST", "/api/auth/enter-role", { role: "athlete" });
      } catch {}
      await qc.invalidateQueries({ queryKey: ["/api/auth/session"] });
      await qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "🎉 Profile created!", description: "Welcome to CoachConnect." });
      setLocation("/athlete/dashboard");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submitCoachMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/profiles/coach", {
        ...data,
        pricePerHour: Math.round((data.pricePerHour || 0) * 100),
      });
      return res.json();
    },
    onSuccess: async () => {
      sessionStorage.removeItem(`${STORAGE_KEY}_coach`);
      try {
        await apiRequest("POST", "/api/auth/enter-role", { role: "coach" });
      } catch {}
      await qc.invalidateQueries({ queryKey: ["/api/auth/session"] });
      await qc.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "🎉 Profile created!", description: "Your coach profile is live." });
      setLocation("/coach/dashboard");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function ProgressHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
    return (
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground font-medium">Step {step} of {total}</span>
          <div className="w-10" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    );
  }

  // ATHLETE ONBOARDING
  if (role === "athlete") {
    if (currentStep === 1) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <ProgressHeader step={1} total={2} onBack={() => setLocation("/auth/role-selection")} />
          <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Athlete Setup</p>
              <h2 className="text-2xl font-bold mb-1">Basic Information</h2>
              <p className="text-muted-foreground text-sm">Tell us a bit about yourself</p>
            </div>
            <Form {...athleteStep1Form}>
              <form onSubmit={athleteStep1Form.handleSubmit((data) => {
                save("athlete", { ...loadSaved("athlete"), ...data });
                setLocation("/auth/onboarding/athlete/step2");
              })} className="space-y-4">
                <FormField control={athleteStep1Form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+44 7700 900000" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={athleteStep1Form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl><Input type="number" placeholder="18" className="h-12" min={5} max={100} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-12 text-base mt-4">Continue →</Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <ProgressHeader step={2} total={2} onBack={() => setLocation("/auth/onboarding/athlete/step1")} />
          <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Athlete Setup</p>
              <h2 className="text-2xl font-bold mb-1">Your Skills & Location</h2>
              <p className="text-muted-foreground text-sm">Help coaches understand your level</p>
            </div>
            <Form {...athleteStep2Form}>
              <form onSubmit={athleteStep2Form.handleSubmit((data) => {
                const finalData = { ...loadSaved("athlete"), ...data };
                submitAthleteMutation.mutate(finalData);
              })} className="space-y-4">
                <FormField control={athleteStep2Form.control} name="skillLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12"><SelectValue placeholder="Select your level" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={athleteStep2Form.control} name="locationCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="London" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={athleteStep2Form.control} name="locationState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>County / State</FormLabel>
                      <FormControl><Input placeholder="Greater London" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={athleteStep2Form.control} name="goals" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Goals <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Improve my pace, work on finishing, make the school team..." className="resize-none" rows={3} {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                {submitAthleteMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{(submitAthleteMutation.error as Error).message}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={submitAthleteMutation.isPending}>
                  {submitAthleteMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating profile...</> : "Complete Setup 🎉"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }
  }

  // COACH ONBOARDING
  if (role === "coach") {
    if (currentStep === 1) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <ProgressHeader step={1} total={2} onBack={() => setLocation("/auth/role-selection")} />
          <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Coach Setup</p>
              <h2 className="text-2xl font-bold mb-1">Your Identity</h2>
              <p className="text-muted-foreground text-sm">How athletes will see you on the platform</p>
            </div>
            <Form {...coachStep1Form}>
              <form onSubmit={coachStep1Form.handleSubmit((data) => {
                save("coach", { ...loadSaved("coach"), ...data });
                setLocation("/auth/onboarding/coach/step2");
              })} className="space-y-4">
                <FormField control={coachStep1Form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Smith" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={coachStep1Form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+44 7700 900000" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full h-12 text-base mt-4">Continue →</Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          <ProgressHeader step={2} total={2} onBack={() => setLocation("/auth/onboarding/coach/step1")} />
          <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
            <div className="mb-6">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Coach Setup</p>
              <h2 className="text-2xl font-bold mb-1">Your Expertise</h2>
              <p className="text-muted-foreground text-sm">Share your experience and pricing</p>
            </div>
            <Form {...coachStep2Form}>
              <form onSubmit={coachStep2Form.handleSubmit((data) => {
                const finalData = { ...loadSaved("coach"), ...data };
                submitCoachMutation.mutate(finalData);
              })} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={coachStep2Form.control} name="locationCity" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="London" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={coachStep2Form.control} name="locationState" render={({ field }) => (
                    <FormItem>
                      <FormLabel>County / State</FormLabel>
                      <FormControl><Input placeholder="Greater London" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={coachStep2Form.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>About You / Experience</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Former semi-pro player. 8 years coaching youth academies. UEFA B licensed..." className="resize-none min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={coachStep2Form.control} name="pricePerHour" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate (£) — enter 0 for free sessions</FormLabel>
                    <FormControl><Input type="number" placeholder="45" className="h-12" min={0} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {submitCoachMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{(submitCoachMutation.error as Error).message}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full h-12 text-base mt-2" disabled={submitCoachMutation.isPending}>
                  {submitCoachMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating profile...</> : "Complete Setup 🎉"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
