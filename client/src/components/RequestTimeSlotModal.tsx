import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Clock, Calendar, ExternalLink, Users } from "lucide-react";
import { Link } from "wouter";
import { computeAvailability, formatTime, getShortDayName, type TimeSlot } from "@/lib/availability";
import type { CoachProfile, CoachAvailabilityRule, CoachAvailabilityException, BookedSession } from "@shared/schema";

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

interface RequestTimeSlotModalProps {
  coach: CoachProfile;
  isOpen: boolean;
  onClose: () => void;
}

const requestSchema = z.object({
  groupSize: z.coerce.number().int().min(1, "At least 1 athlete required").max(20, "Maximum 20 athletes"),
  trainingType: z.string().min(1, "Please select a training type"),
  drillDetails: z.string().min(10, "Please describe what you want to work on (at least 10 characters)"),
  selectedDate: z.string().min(1, "Please select a date"),
  selectedTime: z.string().min(1, "Please select a time slot"),
});

function getNext7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

export default function RequestTimeSlotModal({ coach, isOpen, onClose }: RequestTimeSlotModalProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const dates = useMemo(() => getNext7Days(), []);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const form = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      groupSize: 1,
      trainingType: "",
      drillDetails: "",
      selectedDate: "",
      selectedTime: "",
    },
  });

  const { data: rules = [], isLoading: rulesLoading } = useQuery<CoachAvailabilityRule[]>({
    queryKey: [`/api/availability/${coach.userId}/rules`],
    enabled: isOpen,
  });

  const { data: exceptions = [], isLoading: exceptionsLoading } = useQuery<CoachAvailabilityException[]>({
    queryKey: [`/api/availability/${coach.userId}/exceptions?startDate=${startDate}&endDate=${endDate}`],
    enabled: isOpen,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<BookedSession[]>({
    queryKey: [`/api/availability/${coach.userId}/sessions?startDate=${startDate}&endDate=${endDate}`],
    enabled: isOpen,
  });

  const isLoadingAvailability = rulesLoading || exceptionsLoading || sessionsLoading;

  const slots = useMemo(() => {
    if (!selectedDate || rules.length === 0) return [];
    return computeAvailability(selectedDate, rules, exceptions, sessions).filter(s => s.isAvailable);
  }, [selectedDate, rules, exceptions, sessions]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    form.setValue("selectedDate", date);
    form.setValue("selectedTime", "");
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    form.setValue("selectedTime", slot.startTime);
  };

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof requestSchema>) => {
      const trainingLabel = TRAINING_TYPES.find(t => t.value === data.trainingType)?.label || data.trainingType;
      return await apiRequest("POST", "/api/requests", {
        groupSize: data.groupSize,
        desiredPosition: trainingLabel,
        note: data.drillDetails,
        coachId: coach.userId,
        requestedDate: data.selectedDate,
        requestedStartTime: data.selectedTime,
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: `Your request has been sent to ${coach.name}. They will respond soon!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      form.reset();
      setSelectedDate("");
      setSelectedSlot(null);
      setTimeout(() => {
        onClose();
      }, 500);
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
    setSelectedDate("");
    setSelectedSlot(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col" data-testid="modal-request-timeslot">
        <DialogHeader>
          <DialogTitle>Request Time Slot</DialogTitle>
          <DialogDescription>
            Send a training request to {coach.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select a Date
                  </FormLabel>
                  <Link 
                    href={`/coach/${coach.userId}?tab=availability`}
                    onClick={handleClose}
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                    data-testid="link-view-full-calendar"
                  >
                    View full calendar
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                
                {isLoadingAvailability ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading availability...</span>
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {dates.map((date) => {
                      const d = new Date(date + 'T12:00:00');
                      const isSelected = date === selectedDate;
                      const daySlots = computeAvailability(date, rules, exceptions, sessions);
                      const hasAvailability = daySlots.some(s => s.isAvailable);
                      
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => hasAvailability && handleDateSelect(date)}
                          className={`flex-shrink-0 flex flex-col items-center p-2 rounded-lg border transition-all min-w-[55px] ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground border-primary' 
                              : hasAvailability 
                                ? 'hover-elevate border-border cursor-pointer' 
                                : 'opacity-40 border-border cursor-not-allowed'
                          }`}
                          disabled={!hasAvailability}
                          data-testid={`button-date-${date}`}
                        >
                          <span className="text-xs font-medium">{getShortDayName(d.getDay())}</span>
                          <span className="text-lg font-bold">{d.getDate()}</span>
                          {hasAvailability && !isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="selectedDate"
                  render={() => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input type="hidden" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedDate && (
                <Card>
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Available Times - {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {slots.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        No available time slots for this day
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <Button
                            key={`${slot.date}-${slot.startTime}`}
                            type="button"
                            variant={selectedSlot?.startTime === slot.startTime ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSlotSelect(slot)}
                            data-testid={`button-slot-${slot.startTime}`}
                          >
                            {formatTime(slot.startTime)}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="selectedTime"
                      render={() => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Input type="hidden" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              <FormField
                control={form.control}
                name="groupSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Number of Athletes
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={20} placeholder="1" {...field} data-testid="input-group-size" />
                    </FormControl>
                    <FormDescription>How many athletes will attend this session?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Focus</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-training-type">
                          <SelectValue placeholder="Select what you want to work on" />
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
                    <FormLabel>Training Details & Specific Drills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you want to work on, any specific drills, skill level, goals for the session..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        data-testid="input-drill-details"
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific so the coach can prepare the right drills
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
                  disabled={mutation.isPending || !selectedSlot} 
                  data-testid="button-submit-request"
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
