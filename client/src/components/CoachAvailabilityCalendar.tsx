import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Calendar, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  computeAvailability,
  computeAvailabilityFromTemplate,
  getNext30Days, 
  formatTime, 
  getDayName, 
  getShortDayName,
  DEFAULT_TIME_OPTIONS,
  type TimeSlot
} from "@/lib/availability";
import type { CoachAvailabilityRule, CoachAvailabilityException, BookedSession, CoachProfile, CoachScheduleTemplateItem } from "@shared/schema";

interface WeeklyRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: number;
}

interface CoachAvailabilityCalendarProps {
  coachId: string;
  coachProfile: CoachProfile;
  isEditable: boolean;
  onSlotSelect?: (slot: TimeSlot) => void;
}

export function CoachAvailabilityCalendar({ 
  coachId, 
  coachProfile,
  isEditable,
  onSlotSelect 
}: CoachAvailabilityCalendarProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(getNext30Days()[0]);
  const [weeklyRules, setWeeklyRules] = useState<WeeklyRule[]>([]);
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false);
  const [exceptionDate, setExceptionDate] = useState<string>("");
  const [exceptionType, setExceptionType] = useState<"BLOCK" | "ADD">("BLOCK");
  const [exceptionStartTime, setExceptionStartTime] = useState<string>("");
  const [exceptionEndTime, setExceptionEndTime] = useState<string>("");
  const [isFullDay, setIsFullDay] = useState(true);

  const dates = getNext30Days();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  const { data: rules = [], isLoading: rulesLoading } = useQuery<CoachAvailabilityRule[]>({
    queryKey: [`/api/availability/${coachId}/rules`],
  });

  const { data: exceptions = [], isLoading: exceptionsLoading } = useQuery<CoachAvailabilityException[]>({
    queryKey: [`/api/availability/${coachId}/exceptions?startDate=${startDate}&endDate=${endDate}`],
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<BookedSession[]>({
    queryKey: [`/api/availability/${coachId}/sessions?startDate=${startDate}&endDate=${endDate}`],
  });

  // Fetch schedule template items for this coach (public endpoint)
  const { data: templateData, isLoading: templateLoading } = useQuery<{
    template: any;
    items: CoachScheduleTemplateItem[];
  } | null>({
    queryKey: [`/api/coaches/${coachId}/schedule`],
  });

  const templateItems = templateData?.items || [];

  const saveRulesMutation = useMutation({
    mutationFn: async (newRules: WeeklyRule[]) => {
      const res = await apiRequest("PUT", "/api/availability/rules", newRules);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/availability/${coachId}/rules`] });
      toast({ title: "Availability saved", description: "Your weekly schedule has been updated." });
      setIsRulesDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to save availability", variant: "destructive" });
    },
  });

  const addExceptionMutation = useMutation({
    mutationFn: async (exception: { date: string; startTime?: string; endTime?: string; exceptionType: "BLOCK" | "ADD" }) => {
      const res = await apiRequest("POST", "/api/availability/exceptions", exception);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/availability/${coachId}/exceptions?startDate=${startDate}&endDate=${endDate}`] });
      toast({ title: "Exception added", description: "Your availability exception has been saved." });
      setIsExceptionDialogOpen(false);
      resetExceptionForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add exception", variant: "destructive" });
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/availability/exceptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/availability/${coachId}/exceptions?startDate=${startDate}&endDate=${endDate}`] });
      toast({ title: "Exception removed" });
    },
  });

  const resetExceptionForm = () => {
    setExceptionDate("");
    setExceptionType("BLOCK");
    setExceptionStartTime("");
    setExceptionEndTime("");
    setIsFullDay(true);
  };

  const handleOpenRulesDialog = () => {
    const existingRules = rules.map(r => ({
      dayOfWeek: r.dayOfWeek,
      startTime: r.startTime,
      endTime: r.endTime,
      isActive: r.isActive,
    }));
    setWeeklyRules(existingRules.length > 0 ? existingRules : []);
    setIsRulesDialogOpen(true);
  };

  const addWeeklyRule = () => {
    setWeeklyRules([...weeklyRules, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: 1 }]);
  };

  const removeWeeklyRule = (index: number) => {
    setWeeklyRules(weeklyRules.filter((_, i) => i !== index));
  };

  const updateWeeklyRule = (index: number, field: keyof WeeklyRule, value: any) => {
    const updated = [...weeklyRules];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyRules(updated);
  };

  const handleSaveRules = () => {
    saveRulesMutation.mutate(weeklyRules);
  };

  const handleAddException = () => {
    if (!exceptionDate) {
      toast({ title: "Error", description: "Please select a date", variant: "destructive" });
      return;
    }
    
    const exception: any = { date: exceptionDate, exceptionType };
    if (!isFullDay) {
      if (!exceptionStartTime || !exceptionEndTime) {
        toast({ title: "Error", description: "Please select start and end times", variant: "destructive" });
        return;
      }
      exception.startTime = exceptionStartTime;
      exception.endTime = exceptionEndTime;
    }
    
    addExceptionMutation.mutate(exception);
  };

  const isLoading = rulesLoading || exceptionsLoading || sessionsLoading || templateLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedDateObj = new Date(selectedDate + 'T12:00:00');
  const dayOfWeek = selectedDateObj.getDay();
  
  // Use template items if available, otherwise fall back to old rules system
  const slots = templateItems.length > 0
    ? computeAvailabilityFromTemplate(selectedDate, templateItems, exceptions, sessions)
    : computeAvailability(selectedDate, rules, exceptions, sessions);
  
  const dateExceptions = exceptions.filter(e => e.date === selectedDate);
  
  // Helper function to compute slots for any date (used in calendar grid)
  const getSlotsForDate = (date: string) => {
    return templateItems.length > 0
      ? computeAvailabilityFromTemplate(date, templateItems, exceptions, sessions)
      : computeAvailability(date, rules, exceptions, sessions);
  };

  return (
    <div className="space-y-6">
      {isEditable && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleOpenRulesDialog} data-testid="button-edit-weekly-schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Edit Weekly Schedule
          </Button>
          <Button variant="outline" onClick={() => setIsExceptionDialogOpen(true)} data-testid="button-add-exception">
            <Plus className="h-4 w-4 mr-2" />
            Add Exception
          </Button>
        </div>
      )}

      {/* Full Monthly Calendar Grid View */}
      <div className="border rounded-lg overflow-hidden">
        {/* Calendar Header - Day Names */}
        <div className="grid grid-cols-7 bg-primary text-primary-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-sm font-semibold border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        {(() => {
          // Get the first date and calculate padding for the first week
          const firstDate = new Date(dates[0] + 'T12:00:00');
          const startDayOfWeek = firstDate.getDay();
          
          // Create calendar cells including empty ones for alignment
          const calendarCells: (string | null)[] = [];
          
          // Add empty cells for days before the first date
          for (let i = 0; i < startDayOfWeek; i++) {
            calendarCells.push(null);
          }
          
          // Add all 30 days
          dates.forEach(date => calendarCells.push(date));
          
          // Pad to complete the last week
          while (calendarCells.length % 7 !== 0) {
            calendarCells.push(null);
          }
          
          // Split into weeks
          const weeks: (string | null)[][] = [];
          for (let i = 0; i < calendarCells.length; i += 7) {
            weeks.push(calendarCells.slice(i, i + 7));
          }
          
          return weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-t">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return (
                    <div 
                      key={`empty-${weekIndex}-${dayIndex}`} 
                      className="min-h-[80px] bg-muted/30 border-r last:border-r-0"
                    />
                  );
                }
                
                const d = new Date(date + 'T12:00:00');
                const isSelected = date === selectedDate;
                const daySlots = getSlotsForDate(date);
                const hasAvailability = daySlots.some(s => s.isAvailable);
                const availableCount = daySlots.filter(s => s.isAvailable).length;
                const isToday = date === getNext30Days()[0];
                
                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[80px] p-2 border-r last:border-r-0 transition-all text-left flex flex-col ${
                      isSelected 
                        ? 'bg-primary/10 ring-2 ring-primary ring-inset' 
                        : hasAvailability 
                          ? 'hover:bg-accent/50' 
                          : 'bg-muted/20'
                    }`}
                    data-testid={`button-date-${date}`}
                  >
                    <span className={`text-sm font-semibold ${
                      isToday ? 'bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center' : ''
                    } ${isSelected ? 'text-primary' : ''}`}>
                      {d.getDate()}
                    </span>
                    {hasAvailability ? (
                      <div className="mt-1 flex-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          {availableCount} slot{availableCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1">No slots</span>
                    )}
                  </button>
                );
              })}
            </div>
          ));
        })()}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {getDayName(dayOfWeek)}, {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </CardTitle>
          <CardDescription>
            {coachProfile.timezone || 'America/New_York'} timezone
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dateExceptions.length > 0 && isEditable && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Exceptions for this day:</p>
              {dateExceptions.map((exc) => (
                <div key={exc.id} className="flex items-center gap-2">
                  <Badge variant={exc.exceptionType === 'BLOCK' ? 'destructive' : 'default'}>
                    {exc.exceptionType}
                  </Badge>
                  <span className="text-sm">
                    {exc.startTime && exc.endTime 
                      ? `${formatTime(exc.startTime)} - ${formatTime(exc.endTime)}`
                      : 'Full day'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteExceptionMutation.mutate(exc.id)}
                    data-testid={`button-delete-exception-${exc.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {slots.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No availability for this day
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <Button
                  key={`${slot.date}-${slot.startTime}`}
                  variant={slot.isAvailable ? "outline" : "ghost"}
                  className={`${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''} ${slot.isException ? 'border-dashed' : ''}`}
                  disabled={!slot.isAvailable || isEditable}
                  onClick={() => slot.isAvailable && onSlotSelect?.(slot)}
                  data-testid={`button-slot-${slot.startTime}`}
                >
                  {formatTime(slot.startTime)}
                  {slot.isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRulesDialogOpen} onOpenChange={setIsRulesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Weekly Availability Schedule</DialogTitle>
            <DialogDescription>
              Set your recurring weekly availability. Athletes will see these time slots.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {weeklyRules.map((rule, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 p-3 border rounded-lg">
                <Select
                  value={rule.dayOfWeek.toString()}
                  onValueChange={(v) => updateWeeklyRule(index, 'dayOfWeek', parseInt(v))}
                >
                  <SelectTrigger className="w-32" data-testid={`select-day-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {getDayName(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={rule.startTime}
                  onValueChange={(v) => updateWeeklyRule(index, 'startTime', v)}
                >
                  <SelectTrigger className="w-28" data-testid={`select-start-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span>to</span>
                
                <Select
                  value={rule.endTime}
                  onValueChange={(v) => updateWeeklyRule(index, 'endTime', v)}
                >
                  <SelectTrigger className="w-28" data-testid={`select-end-${index}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeWeeklyRule(index)}
                  data-testid={`button-remove-rule-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" onClick={addWeeklyRule} className="w-full" data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Block
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRulesDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveRules} 
              disabled={saveRulesMutation.isPending}
              data-testid="button-save-rules"
            >
              {saveRulesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExceptionDialogOpen} onOpenChange={setIsExceptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability Exception</DialogTitle>
            <DialogDescription>
              Block time off or add extra availability for a specific date.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Select value={exceptionDate} onValueChange={setExceptionDate}>
                <SelectTrigger data-testid="select-exception-date">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={exceptionType} onValueChange={(v: "BLOCK" | "ADD") => setExceptionType(v)}>
                <SelectTrigger data-testid="select-exception-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BLOCK">Block Time (Vacation/Unavailable)</SelectItem>
                  <SelectItem value="ADD">Add Extra Availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="fullDay"
                checked={isFullDay}
                onChange={(e) => setIsFullDay(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="fullDay" className="text-sm">
                {exceptionType === 'BLOCK' ? 'Block entire day' : 'Full day availability'}
              </label>
            </div>
            
            {!isFullDay && (
              <div className="flex gap-2 items-center">
                <Select value={exceptionStartTime} onValueChange={setExceptionStartTime}>
                  <SelectTrigger className="w-28" data-testid="select-exception-start">
                    <SelectValue placeholder="Start" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select value={exceptionEndTime} onValueChange={setExceptionEndTime}>
                  <SelectTrigger className="w-28" data-testid="select-exception-end">
                    <SelectValue placeholder="End" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExceptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddException} 
              disabled={addExceptionMutation.isPending}
              data-testid="button-save-exception"
            >
              {addExceptionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Exception
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
