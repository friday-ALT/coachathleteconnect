import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Star, MapPin, DollarSign, Clock, Calendar, ArrowLeft, CreditCard, CheckCircle } from "lucide-react";

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

const bookingSchema = z.object({
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  duration: z.coerce.number().min(30, "Minimum 30 minutes"),
  groupSize: z.coerce.number().int().min(1).max(20),
  position: z.string().min(1, "Please describe what you want to work on"),
  note: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

// Generate time slots for the booking form
function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = 6; h <= 21; h++) {
    for (const m of [0, 30]) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function BookSession() {
  const { coachId } = useParams<{ coachId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const timeSlots = generateTimeSlots();

  const { data: coach, isLoading } = useQuery<any>({
    queryKey: [`/api/coaches/${coachId}`],
    enabled: !!coachId,
  });

  const { data: connection } = useQuery<{ connection: any }>({
    queryKey: [`/api/connections/check/${coachId}`],
    enabled: !!coachId,
  });

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: "",
      time: "",
      duration: 60,
      groupSize: 1,
      position: "",
      note: "",
    },
  });

  const watchDuration = form.watch("duration");
  const isPaid = coach && coach.pricePerHour > 0;
  const sessionCost = isPaid
    ? ((coach.pricePerHour / 100) * (watchDuration / 60)).toFixed(2)
    : null;

  // Free request mutation
  const freeRequestMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      return apiRequest("POST", "/api/requests", {
        coachId,
        requestedDate: data.date,
        requestedTime: data.time,
        duration: data.duration,
        groupSize: data.groupSize,
        desiredPosition: data.position,
        note: data.note || "",
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // Paid checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const res = await apiRequest("POST", "/api/payments/create-checkout", {
        coachId,
        requestedDate: data.date,
        requestedStartTime: data.time,
        durationMins: data.duration,
        message: data.note || "",
        source: "web",
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (e: Error) => {
      // Fallback to free request if Stripe not configured
      toast({
        title: "Payment unavailable",
        description: "Stripe is not configured. Sending a free session request instead.",
      });
      const vals = form.getValues();
      freeRequestMutation.mutate(vals);
    },
  });

  const onSubmit = (data: BookingForm) => {
    if (isPaid) {
      checkoutMutation.mutate(data);
    } else {
      freeRequestMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">Coach not found.</p>
        <Link href="/browse"><Button className="mt-4">Browse Coaches</Button></Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Session Request Sent!</h1>
        <p className="text-muted-foreground mb-6">
          Your request has been sent to {coach.name}. You&apos;ll be notified
          when they respond.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/athlete/sessions">
            <Button>View My Sessions</Button>
          </Link>
          <Link href="/athlete/find-coaches">
            <Button variant="outline">Browse More Coaches</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
      {/* Back link */}
      <Link href={`/coach/${coachId}`}>
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to profile
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Book a Session</CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose your preferred date, time and session details.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input type="date" min={getMinDate()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start time</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pick a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DURATION_OPTIONS.map((d) => (
                                <SelectItem key={d.value} value={String(d.value)}>
                                  {d.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="groupSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group size</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={20} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What do you want to work on?</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Improving my sprint speed and agility" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional notes <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any other information the coach should know..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Cost preview */}
                  {isPaid && sessionCost && (
                    <div className="rounded-xl bg-primary/8 border border-primary/20 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Session total</span>
                        <span className="font-bold text-primary text-lg">£{sessionCost}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {watchDuration} min · £{(coach.pricePerHour / 100).toFixed(0)}/hr · 15% platform fee included
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={freeRequestMutation.isPending || checkoutMutation.isPending}
                  >
                    {freeRequestMutation.isPending || checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isPaid ? (
                      <CreditCard className="h-4 w-4 mr-2" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    {isPaid ? `Pay £${sessionCost} & Book` : "Send Session Request"}
                  </Button>

                  {!connection?.connection && (
                    <p className="text-xs text-center text-muted-foreground">
                      You&apos;ll also send a connection request to this coach.
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Coach summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={coach.avatarUrl || undefined} alt={coach.name} />
                  <AvatarFallback>{coach.name?.[0] || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{coach.name}</p>
                  {coach.locationCity && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {coach.locationCity}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Rate
                  </span>
                  <span className="font-medium">
                    {coach.pricePerHour > 0
                      ? `£${(coach.pricePerHour / 100).toFixed(0)}/hr`
                      : "Free"}
                  </span>
                </div>
                {coach.ratingAvg > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" />
                      Rating
                    </span>
                    <span className="font-medium">
                      {coach.ratingAvg.toFixed(1)} ({coach.ratingCount} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Duration
                  </span>
                  <span className="font-medium">{watchDuration} min</span>
                </div>
              </div>

              {coach.specialties && coach.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {coach.specialties.slice(0, 4).map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
                <p>✓ Request sent directly to coach</p>
                <p>✓ Coach responds within 24 hours</p>
                {isPaid && <p>✓ Secure payment via Stripe</p>}
                <p>✓ Cancel before confirmation — no charge</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
