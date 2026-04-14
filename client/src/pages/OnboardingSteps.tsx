import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Role = "athlete" | "coach";

// Athlete schemas
const athleteStep1Schema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().int().min(5).max(100),
});

const athleteStep2Schema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State is required"),
});

// Coach schemas
const coachStep1Schema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name is required"),
});

const coachStep2Schema = z.object({
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State is required"),
  experience: z.string().min(10).max(160, "Experience must be between 10-160 characters"),
  pricePerHour: z.coerce.number().int().min(1, "Price must be at least $1"),
});

export default function OnboardingSteps() {
  const [, params] = useRoute("/auth/onboarding/:role/:step");
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  
  const role = params?.role as Role;
  const currentStep = parseInt(params?.step?.replace("step", "") || "1");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/auth/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Form data storage
  const [athleteData, setAthleteData] = useState<any>({});
  const [coachData, setCoachData] = useState<any>({});

  // Athlete Step 1 Form
  const athleteStep1Form = useForm({
    resolver: zodResolver(athleteStep1Schema),
    defaultValues: {
      phone: user?.phone || "",
      age: 0,
    },
  });

  // Athlete Step 2 Form
  const athleteStep2Form = useForm({
    resolver: zodResolver(athleteStep2Schema),
    defaultValues: {
      skillLevel: "Beginner" as const,
      locationCity: "",
      locationState: "",
    },
  });

  // Coach Step 1 Form
  const coachStep1Form = useForm({
    resolver: zodResolver(coachStep1Schema),
    defaultValues: {
      phone: user?.phone || "",
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
    },
  });

  // Coach Step 2 Form
  const coachStep2Form = useForm({
    resolver: zodResolver(coachStep2Schema),
    defaultValues: {
      locationCity: "",
      locationState: "",
      experience: "",
      pricePerHour: 0,
    },
  });

  // Submit athlete profile
  const submitAthleteMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/profiles/athlete", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Your athlete profile is ready",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit coach profile
  const submitCoachMutation = useMutation({
    mutationFn: async (data: any) => {
      const priceInCents = Math.round(data.pricePerHour * 100);
      return await apiRequest("POST", "/api/profiles/coach", {
        ...data,
        pricePerHour: priceInCents,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Created!",
        description: "Your coach profile is ready",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ATHLETE ONBOARDING
  if (role === "athlete") {
    if (currentStep === 1) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          {/* Header with progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/auth/role-selection")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">Step 1 of 2</span>
              <div className="w-10" />
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-muted rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold">Basic Information</h2>
            <p className="mb-6 text-muted-foreground">Tell us a bit about yourself</p>

            <Form {...athleteStep1Form}>
              <form onSubmit={athleteStep1Form.handleSubmit((data) => {
                setAthleteData({ ...athleteData, ...data });
                setLocation("/auth/onboarding/athlete/step2");
              })} className="space-y-4">
                <FormField
                  control={athleteStep1Form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={athleteStep1Form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base mt-6">
                  Continue
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          {/* Header with progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/auth/onboarding/athlete/step1")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">Step 2 of 2</span>
              <div className="w-10" />
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-primary rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold">Your Location & Skills</h2>
            <p className="mb-6 text-muted-foreground">Help us find coaches near you</p>

            <Form {...athleteStep2Form}>
              <form onSubmit={athleteStep2Form.handleSubmit((data) => {
                const finalData = { ...athleteData, ...data };
                submitAthleteMutation.mutate(finalData);
              })} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={athleteStep2Form.control}
                    name="locationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={athleteStep2Form.control}
                    name="locationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={athleteStep2Form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select your skill level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitAthleteMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(submitAthleteMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base mt-6"
                  disabled={submitAthleteMutation.isPending}
                >
                  {submitAthleteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating profile...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
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
          {/* Header with progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/auth/role-selection")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">Step 1 of 2</span>
              <div className="w-10" />
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-muted rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold">Contact Information</h2>
            <p className="mb-6 text-muted-foreground">How can athletes reach you?</p>

            <Form {...coachStep1Form}>
              <form onSubmit={coachStep1Form.handleSubmit((data) => {
                setCoachData({ ...coachData, ...data });
                setLocation("/auth/onboarding/coach/step2");
              })} className="space-y-4">
                <FormField
                  control={coachStep1Form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={coachStep1Form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base mt-6">
                  Continue
                </Button>
              </form>
            </Form>
          </div>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="flex min-h-screen flex-col bg-background">
          {/* Header with progress */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/auth/onboarding/coach/step1")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">Step 2 of 2</span>
              <div className="w-10" />
            </div>
            <div className="flex gap-1">
              <div className="h-1 flex-1 bg-primary rounded-full" />
              <div className="h-1 flex-1 bg-primary rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8">
            <h2 className="mb-2 text-2xl font-bold">Your Expertise</h2>
            <p className="mb-6 text-muted-foreground">Share your coaching experience</p>

            <Form {...coachStep2Form}>
              <form onSubmit={coachStep2Form.handleSubmit((data) => {
                const finalData = { ...coachData, ...data };
                submitCoachMutation.mutate(finalData);
              })} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={coachStep2Form.control}
                    name="locationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={coachStep2Form.control}
                    name="locationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={coachStep2Form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (max 160 chars)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Former college player with 10 years coaching experience..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={coachStep2Form.control}
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="45" className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitCoachMutation.isError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(submitCoachMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base mt-6"
                  disabled={submitCoachMutation.isPending}
                >
                  {submitCoachMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating profile...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
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
