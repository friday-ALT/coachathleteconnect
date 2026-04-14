import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Users, Calendar, Clock, Target } from "lucide-react";
import type { CoachProfile } from "@shared/schema";
import type { TimeSlot } from "@/lib/availability";
import { formatTime } from "@/lib/availability";

const TRAINING_TYPES = [
  { value: "dribbling", label: "Dribbling & Ball Control" },
  { value: "shooting", label: "Shooting & Finishing" },
  { value: "passing", label: "Passing & Vision" },
  { value: "defending", label: "Defending & Tackling" },
  { value: "goalkeeping", label: "Goalkeeping" },
  { value: "conditioning", label: "Fitness & Conditioning" },
  { value: "tactics", label: "Tactics & Game Intelligence" },
  { value: "set-pieces", label: "Set Pieces (Corners, Free Kicks)" },
  { value: "1v1", label: "1v1 Skills" },
  { value: "general", label: "General Training / Mixed" },
] as const;

const requestSchema = z.object({
  groupSize: z.coerce.number().int().min(1, "At least 1 athlete required").max(20, "Maximum 20 athletes"),
  trainingType: z.string().min(1, "Please select a training type"),
  drillDetails: z.string().min(10, "Please describe what you want to work on (at least 10 characters)"),
  equipmentNeeded: z.string().optional(),
});

interface SessionRequestFormProps {
  coach: CoachProfile;
  selectedSlot: TimeSlot;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionRequestForm({ coach, selectedSlot, isOpen, onClose }: SessionRequestFormProps) {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      groupSize: 1,
      trainingType: "",
      drillDetails: "",
      equipmentNeeded: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestSchema>) => {
      const trainingLabel = TRAINING_TYPES.find(t => t.value === data.trainingType)?.label || data.trainingType;
      const fullNote = data.equipmentNeeded 
        ? `${data.drillDetails}\n\nEquipment/Setup Needed: ${data.equipmentNeeded}`
        : data.drillDetails;
      
      return await apiRequest("POST", "/api/requests", {
        groupSize: data.groupSize,
        desiredPosition: trainingLabel,
        note: fullNote,
        coachId: coach.userId,
        requestedDate: selectedSlot.date,
        requestedStartTime: selectedSlot.startTime,
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: `Your training request has been sent to ${coach.name}. They will respond soon.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const formattedDate = new Date(selectedSlot.date + 'T12:00:00').toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-session-request">
        <DialogHeader>
          <DialogTitle>Request Training Session</DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            <span>Book a session with {coach.name}</span>
            <span className="flex items-center gap-2 text-foreground font-medium">
              <Calendar className="h-4 w-4" />
              {formattedDate} at {formatTime(selectedSlot.startTime)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="groupSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Athletes Attending
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={20} 
                      placeholder="1" 
                      {...field} 
                      data-testid="input-group-size" 
                    />
                  </FormControl>
                  <FormDescription>How many athletes will be at this session?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Training Focus
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-training-type">
                        <SelectValue placeholder="What do you want to work on?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TRAINING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="drillDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specific Drills & Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you want to work on. For example:
- Specific drills you want to practice
- Skills to improve (weak foot, headers, etc.)
- Current skill level
- Any upcoming games/tryouts to prepare for"
                      className="resize-none min-h-[100px]"
                      {...field}
                      data-testid="input-drill-details"
                    />
                  </FormControl>
                  <FormDescription>
                    Be specific so the coach can prepare the right exercises
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipmentNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment or Setup Requests (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., cones, goals, specific ball type..."
                      {...field}
                      data-testid="input-equipment"
                    />
                  </FormControl>
                  <FormDescription>
                    Anything special the coach should bring or set up?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending} 
                data-testid="button-submit-request"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
