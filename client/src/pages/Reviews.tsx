import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Star, MessageSquare, Trophy, Send, Lock } from "lucide-react";
import { Link } from "wouter";
import type { CoachProfile, Review } from "@shared/schema";

const reviewSchema = z.object({
  coachId: z.string().min(1, "Please select a coach"),
  rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
  comment: z.string().optional(),
});

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= (readonly ? value : (hovered || value));
        return (
          <Star
            key={i}
            className={`h-7 w-7 transition-colors ${readonly ? "" : "cursor-pointer"} ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
            onClick={() => !readonly && onChange?.(i)}
            onMouseEnter={() => !readonly && setHovered(i)}
            onMouseLeave={() => !readonly && setHovered(0)}
          />
        );
      })}
    </div>
  );
}

export default function Reviews() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAthlete, isCoach } = useRole();
  const { toast } = useToast();

  // Athlete: coaches they can review
  const { data: acceptedCoaches = [], isLoading: coachesLoading } = useQuery<CoachProfile[]>({
    queryKey: ["/api/reviews/accepted-coaches"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/accepted-coaches", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated && isAthlete,
  });

  // Athlete: reviews they've written
  const { data: myReviews = [] } = useQuery<any[]>({
    queryKey: ["/api/reviews/my-reviews"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/my-reviews", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated && isAthlete,
  });

  // Coach: reviews they've received
  const { data: receivedReviews = [], isLoading: receivedLoading } = useQuery<any[]>({
    queryKey: ["/api/reviews/received"],
    queryFn: async () => {
      const res = await fetch("/api/reviews/received", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: isAuthenticated && isCoach,
  });

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { coachId: "", rating: 0, comment: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => apiRequest("POST", "/api/reviews", data),
    onSuccess: () => {
      toast({ title: "Review submitted ✓", description: "Thank you for your feedback!" });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/accepted-coaches"] });
      form.reset({ coachId: "", rating: 0, comment: "" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Sign in to view reviews</h2>
        <Link href="/auth/login"><Button>Sign in</Button></Link>
      </div>
    );
  }

  // Coach view: see reviews received
  if (isCoach && !isAthlete) {
    const avgRating = receivedReviews.length
      ? (receivedReviews.reduce((s: number, r: any) => s + r.rating, 0) / receivedReviews.length).toFixed(1)
      : null;

    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">My Reviews</h1>
          <p className="text-muted-foreground text-sm">Feedback from athletes you've coached</p>
        </div>

        {avgRating && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-5 flex items-center gap-5">
              <div className="text-4xl font-bold text-primary">{avgRating}</div>
              <div>
                <StarRating value={Math.round(Number(avgRating))} readonly />
                <p className="text-sm text-muted-foreground mt-1">{receivedReviews.length} review{receivedReviews.length !== 1 ? "s" : ""}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {receivedLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : receivedReviews.length > 0 ? (
          <div className="space-y-4">
            {receivedReviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Athlete</p>
                      <StarRating value={review.rating} readonly />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="font-medium mb-1">No reviews yet</p>
            <p className="text-sm text-muted-foreground">Reviews from athletes will appear here after sessions.</p>
          </div>
        )}
      </div>
    );
  }

  // Athlete view: write reviews + see past reviews
  const alreadyReviewedIds = new Set(myReviews.map((r: any) => r.coachId));
  const unreviewedCoaches = acceptedCoaches.filter((c) => !alreadyReviewedIds.has(c.userId));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Reviews</h1>
        <p className="text-muted-foreground text-sm">Rate coaches you've worked with</p>
      </div>

      <Tabs defaultValue={unreviewedCoaches.length > 0 ? "write" : "mine"}>
        <TabsList className="mb-6">
          <TabsTrigger value="write" className="relative">
            Write a Review
            {unreviewedCoaches.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreviewedCoaches.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine">My Reviews ({myReviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="write">
          {coachesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : acceptedCoaches.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-medium mb-1">No coaches to review yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                You can review coaches after having an accepted session with them.
              </p>
              <Link href="/athlete/find-coaches">
                <Button size="sm">Find a Coach</Button>
              </Link>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leave a Review</CardTitle>
                <CardDescription>Share your experience to help other athletes</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
                    <FormField control={form.control} name="coachId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a coach you've worked with" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {acceptedCoaches.map((coach) => (
                              <SelectItem key={coach.id} value={coach.userId}>
                                <div className="flex items-center gap-2">
                                  <span>{coach.name}</span>
                                  {alreadyReviewedIds.has(coach.userId) && (
                                    <Badge variant="secondary" className="text-xs">Reviewed</Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="rating" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating</FormLabel>
                        <FormControl>
                          <div>
                            <StarRating value={field.value} onChange={(v) => form.setValue("rating", v)} />
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.value === 0 ? "Click to rate" : ["", "Poor", "Fair", "Good", "Great", "Excellent!"][field.value]}
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="comment" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comment <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                        <FormControl>
                          <Textarea placeholder="What did you enjoy about the session? What improved?" className="resize-none" rows={4} {...field} />
                        </FormControl>
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                      {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : <><Send className="mr-2 h-4 w-4" />Submit Review</>}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mine">
          {myReviews.length > 0 ? (
            <div className="space-y-4">
              {myReviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={review.coachProfile?.avatarUrl || undefined} />
                        <AvatarFallback>{review.coachProfile?.name?.[0] || "C"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{review.coachProfile?.name || "Coach"}</p>
                        <StarRating value={review.rating} readonly />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-muted pl-3 mt-2">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-medium mb-1">No reviews written yet</p>
              <p className="text-sm text-muted-foreground">Your submitted reviews will appear here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
