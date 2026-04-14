import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Star, MessageSquare } from "lucide-react";
import type { CoachProfile, Review, User } from "@shared/schema";

const reviewSchema = z.object({
  coachId: z.string().min(1, "Please select a coach"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

interface ReviewWithDetails extends Review {
  coachProfile?: CoachProfile;
  coachUser?: User;
}

export default function Reviews() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: acceptedCoaches } = useQuery<CoachProfile[]>({
    queryKey: ["/api/reviews/accepted-coaches"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch("/api/reviews/accepted-coaches", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  const { data: myReviews } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/reviews/my-reviews"],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch("/api/reviews/my-reviews", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      coachId: "",
      rating: 0,
      comment: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      return await apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/accepted-coaches"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderStars = (rating: number, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = interactive ? i <= (hoveredRating || rating) : i <= rating;
      stars.push(
        <Star
          key={i}
          className={`h-6 w-6 ${interactive ? "cursor-pointer" : ""} ${
            filled ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => interactive && form.setValue("rating", i)}
          onMouseEnter={() => interactive && setHoveredRating(i)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      );
    }
    return stars;
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Reviews</h1>
        <p className="text-muted-foreground">Rate coaches you've worked with</p>
      </div>

      {/* Add Review Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="coachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Coach</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-coach">
                          <SelectValue placeholder="Choose a coach you've worked with" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {acceptedCoaches && acceptedCoaches.length > 0 ? (
                          acceptedCoaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.userId}>
                              {coach.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value=" " disabled>
                            No coaches available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex gap-1" data-testid="rating-stars">
                        {renderStars(field.value, true)}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience..."
                        className="resize-none"
                        {...field}
                        data-testid="input-comment"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-review">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* My Reviews */}
      <div>
        <h2 className="mb-4 text-2xl font-semibold">My Reviews</h2>
        {myReviews && myReviews.length > 0 ? (
          <div className="space-y-4">
            {myReviews.map((review) => (
              <Card key={review.id} data-testid={`review-${review.id}`}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.coachProfile?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {review.coachProfile?.name[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold" data-testid={`text-coach-name-${review.id}`}>
                        {review.coachProfile?.name || "Coach"}
                      </p>
                      <div className="flex gap-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground" data-testid={`text-comment-${review.id}`}>
                      {review.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
            <MessageSquare className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No reviews yet</h3>
            <p className="text-sm text-muted-foreground">
              Your reviews will appear here after you submit them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
