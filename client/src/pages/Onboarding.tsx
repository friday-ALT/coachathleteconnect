import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, User, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Role = "athlete" | "coach";

const athleteSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.coerce.number().int().min(5).max(100),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State is required"),
});

const coachSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  name: z.string().min(2, "Name is required"),
  locationCity: z.string().min(2, "City is required"),
  locationState: z.string().min(2, "State is required"),
  experience: z.string().min(10).max(160, "Experience must be between 10 and 160 characters"),
  pricePerHour: z.coerce.number().int().min(1, "Price must be at least $1"),
});

export default function Onboarding() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  // Support both 'role' and 'addRole' query params for compatibility
  const roleParam = urlParams.get("role") as Role | null;
  const addRoleParam = urlParams.get("addRole") as Role | null;
  const initialRole = roleParam || addRoleParam || "athlete";
  
  const [role, setRole] = useState<Role>(initialRole);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const targetRole = roleParam || addRoleParam || "athlete";
      setLocation(`/login?role=${targetRole}`);
    }
  }, [authLoading, isAuthenticated, roleParam, addRoleParam, setLocation]);

  // Update role when URL params change
  useEffect(() => {
    const targetRole = roleParam || addRoleParam;
    if (targetRole === "coach" || targetRole === "athlete") {
      setRole(targetRole);
    }
  }, [roleParam, addRoleParam]);

  // Get user's full name for pre-filling coach form
  const userFullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const userPhone = user?.phone || "";

  const athleteForm = useForm({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      phone: userPhone,
      age: 0,
      skillLevel: "Beginner" as const,
      locationCity: "",
      locationState: "",
    },
  });

  const coachForm = useForm({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      phone: userPhone,
      name: userFullName,
      locationCity: "",
      locationState: "",
      experience: "",
      pricePerHour: 0,
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (fullName) {
        coachForm.setValue("name", fullName);
      }
      if (user.phone) {
        athleteForm.setValue("phone", user.phone);
        coachForm.setValue("phone", user.phone);
      }
    }
  }, [user, coachForm, athleteForm]);

  const athleteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof athleteSchema>) => {
      return await apiRequest("POST", "/api/profiles/athlete", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your athlete profile has been created successfully!",
      });
      // Go to landing page to enter athlete role properly
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

  const coachMutation = useMutation({
    mutationFn: async (data: z.infer<typeof coachSchema>) => {
      const priceInCents = Math.round(data.pricePerHour * 100);
      return await apiRequest("POST", "/api/profiles/coach", {
        ...data,
        pricePerHour: priceInCents,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your coach profile has been created successfully!",
      });
      // Go to landing page to enter coach role properly
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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">Fill in your details to get started</p>
      </div>

      {/* Role Tabs */}
      <div className="mb-8 flex gap-4">
        <Button
          variant={role === "athlete" ? "default" : "outline"}
          className="flex-1 h-12"
          onClick={() => setRole("athlete")}
          data-testid="button-role-athlete"
        >
          <User className="mr-2 h-5 w-5" />
          Athlete
        </Button>
        <Button
          variant={role === "coach" ? "default" : "outline"}
          className="flex-1 h-12"
          onClick={() => setRole("coach")}
          data-testid="button-role-coach"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Coach
        </Button>
      </div>

      {/* Athlete Form */}
      {role === "athlete" && (
        <Card>
          <CardHeader>
            <CardTitle>Athlete Profile</CardTitle>
            <CardDescription>Tell us about yourself to find the perfect coach</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...athleteForm}>
              <form onSubmit={athleteForm.handleSubmit((data) => athleteMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={athleteForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={athleteForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15" {...field} data-testid="input-age" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={athleteForm.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-skill-level">
                            <SelectValue placeholder="Select skill level" />
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

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={athleteForm.control}
                    name="locationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={athleteForm.control}
                    name="locationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} data-testid="input-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full h-11" disabled={athleteMutation.isPending} data-testid="button-submit-athlete">
                  {athleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Athlete Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Coach Form */}
      {role === "coach" && (
        <Card>
          <CardHeader>
            <CardTitle>Coach Profile</CardTitle>
            <CardDescription>Share your experience to connect with athletes</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...coachForm}>
              <form onSubmit={coachForm.handleSubmit((data) => coachMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={coachForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone-coach" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={coachForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={coachForm.control}
                    name="locationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} data-testid="input-city-coach" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={coachForm.control}
                    name="locationState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} data-testid="input-state-coach" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={coachForm.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (max 160 characters)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Former college player with 10 years coaching experience..."
                          className="resize-none"
                          {...field}
                          data-testid="input-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={coachForm.control}
                  name="pricePerHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="45" {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-11" disabled={coachMutation.isPending} data-testid="button-submit-coach">
                  {coachMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Coach Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
