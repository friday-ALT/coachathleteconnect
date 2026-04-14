import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { Link } from "wouter";
import type { AthleteProfile, CoachProfile } from "@shared/schema";

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

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: athleteProfile } = useQuery<AthleteProfile>({
    queryKey: ["/api/profiles/athlete"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: coachProfile } = useQuery<CoachProfile>({
    queryKey: ["/api/profiles/coach"],
    enabled: isAuthenticated,
    retry: false,
  });

  const athleteForm = useForm({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      phone: user?.phone || "",
      age: athleteProfile?.age || 0,
      skillLevel: (athleteProfile?.skillLevel as any) || "Beginner",
      locationCity: athleteProfile?.locationCity || "",
      locationState: athleteProfile?.locationState || "",
    },
  });

  const coachForm = useForm({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      phone: user?.phone || "",
      name: coachProfile?.name || "",
      locationCity: coachProfile?.locationCity || "",
      locationState: coachProfile?.locationState || "",
      experience: coachProfile?.experience || "",
      pricePerHour: coachProfile?.pricePerHour ? coachProfile.pricePerHour / 100 : 0,
    },
  });

  useEffect(() => {
    if (athleteProfile) {
      athleteForm.reset({
        phone: user?.phone || "",
        age: athleteProfile.age,
        skillLevel: athleteProfile.skillLevel as any,
        locationCity: athleteProfile.locationCity,
        locationState: athleteProfile.locationState,
      });
    }
  }, [athleteProfile, user]);

  useEffect(() => {
    if (coachProfile) {
      coachForm.reset({
        phone: user?.phone || "",
        name: coachProfile.name,
        locationCity: coachProfile.locationCity,
        locationState: coachProfile.locationState,
        experience: coachProfile.experience,
        pricePerHour: coachProfile.pricePerHour / 100,
      });
      setPreviewUrl(coachProfile.avatarUrl || "");
    }
  }, [coachProfile, user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/coach"] });
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const athleteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof athleteSchema>) => {
      return await apiRequest("PUT", "/api/profiles/athlete", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/athlete"] });
      toast({
        title: "Profile Updated",
        description: "Your athlete profile has been updated successfully!",
      });
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
      return await apiRequest("PUT", "/api/profiles/coach", {
        ...data,
        pricePerHour: priceInCents,
      });
    },
    onSuccess: async () => {
      if (avatarFile) {
        await uploadAvatarMutation.mutateAsync(avatarFile);
        setAvatarFile(null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/coach"] });
      toast({
        title: "Profile Updated",
        description: "Your coach profile has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasNoProfile = !athleteProfile && !coachProfile;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover-elevate mb-6" data-testid="link-back-dashboard">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      {/* No Profile State */}
      {hasNoProfile && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>
              You haven't created a profile yet. Complete onboarding to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/onboarding"} data-testid="button-go-onboarding">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Athlete Profile */}
      {athleteProfile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Athlete Profile</CardTitle>
            <CardDescription>Update your athlete information</CardDescription>
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
                        <Input {...field} data-testid="input-athlete-phone" />
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
                        <Input type="number" {...field} data-testid="input-athlete-age" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-athlete-skill">
                            <SelectValue />
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
                          <Input {...field} data-testid="input-athlete-city" />
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
                          <Input {...field} data-testid="input-athlete-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={athleteMutation.isPending} data-testid="button-update-athlete">
                  {athleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Coach Profile */}
      {coachProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Coach Profile</CardTitle>
            <CardDescription>Update your coach information</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar Upload */}
            <div className="mb-6 flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewUrl || coachProfile.avatarUrl || undefined} alt={coachProfile.name} />
                <AvatarFallback className="text-2xl">{coachProfile.name[0]}</AvatarFallback>
              </Avatar>
              <label htmlFor="avatar-upload">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  data-testid="input-avatar"
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("avatar-upload")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Avatar
                </Button>
              </label>
            </div>

            <Form {...coachForm}>
              <form onSubmit={coachForm.handleSubmit((data) => coachMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={coachForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-coach-phone" />
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
                        <Input {...field} data-testid="input-coach-name" />
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
                          <Input {...field} data-testid="input-coach-city" />
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
                          <Input {...field} data-testid="input-coach-state" />
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
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" {...field} data-testid="input-coach-experience" />
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
                        <Input type="number" {...field} data-testid="input-coach-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={coachMutation.isPending} data-testid="button-update-coach">
                  {coachMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
