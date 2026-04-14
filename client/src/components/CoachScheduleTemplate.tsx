import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2, Plus, Edit2, Trash2, Copy, Calendar, Clock, MapPin, Users, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CoachScheduleTemplate, CoachScheduleTemplateItem } from "@shared/schema";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

const TRAINING_TYPES = ["1-on-1", "Small Group", "Team Training", "Skills Camp", "Fitness", "Goalkeeping"];

type TemplateWithItems = CoachScheduleTemplate & { items: CoachScheduleTemplateItem[] };

interface SessionFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  trainingType: string;
  groupSize: number | null;
  notes: string;
}

const defaultSessionForm: SessionFormData = {
  dayOfWeek: 1,
  startTime: "09:00",
  endTime: "10:00",
  title: "",
  location: "",
  trainingType: "",
  groupSize: null,
  notes: "",
};

export default function CoachScheduleTemplate() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [editingItem, setEditingItem] = useState<CoachScheduleTemplateItem | null>(null);
  const [sessionForm, setSessionForm] = useState<SessionFormData>(defaultSessionForm);
  const [copyFromDay, setCopyFromDay] = useState(0);
  const [copyToDay, setCopyToDay] = useState(1);

  const { data: template, isLoading } = useQuery<TemplateWithItems | null>({
    queryKey: ["/api/schedule-templates"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: Partial<SessionFormData>) => {
      return await apiRequest("POST", "/api/schedule-templates/items", data);
    },
    onSuccess: () => {
      toast({ title: "Session Added", description: "Training session added to your schedule." });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
      setIsAddDialogOpen(false);
      setSessionForm(defaultSessionForm);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SessionFormData> }) => {
      return await apiRequest("PUT", `/api/schedule-templates/items/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Session Updated", description: "Training session updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setSessionForm(defaultSessionForm);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/schedule-templates/items/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Session Deleted", description: "Training session removed from your schedule." });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyDayMutation = useMutation({
    mutationFn: async ({ fromDay, toDay }: { fromDay: number; toDay: number }) => {
      return await apiRequest("POST", "/api/schedule-templates/copy-day", { fromDay, toDay });
    },
    onSuccess: () => {
      toast({ title: "Day Copied", description: "Sessions copied successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
      setIsCopyDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (data: { isPublic?: number }) => {
      return await apiRequest("PUT", "/api/schedule-templates", data);
    },
    onSuccess: () => {
      toast({ title: "Settings Updated", description: "Schedule visibility updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/schedule-templates"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleOpenAddDialog = (day: number) => {
    setSelectedDay(day);
    setSessionForm({ ...defaultSessionForm, dayOfWeek: day });
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (item: CoachScheduleTemplateItem) => {
    setEditingItem(item);
    setSessionForm({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.title,
      location: item.location || "",
      trainingType: item.trainingType || "",
      groupSize: item.groupSize,
      notes: item.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleAddSession = () => {
    if (!sessionForm.title || !sessionForm.startTime || !sessionForm.endTime) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    createItemMutation.mutate(sessionForm);
  };

  const handleUpdateSession = () => {
    if (!editingItem) return;
    updateItemMutation.mutate({ id: editingItem.id, data: sessionForm });
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const getSessionsForDay = (day: number) => {
    if (!template?.items) return [];
    return template.items
      .filter((item) => item.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const hasAnySession = template?.items && template.items.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Training Schedule
            </CardTitle>
            <CardDescription>
              Create your typical weekly training schedule. Athletes can view this to see when you usually offer sessions.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="public-toggle" className="text-sm">Public</Label>
              <Switch
                id="public-toggle"
                checked={template?.isPublic === 1}
                onCheckedChange={(checked) => updateTemplateMutation.mutate({ isPublic: checked ? 1 : 0 })}
                data-testid="switch-schedule-public"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCopyDialogOpen(true)}
              disabled={!hasAnySession}
              data-testid="button-copy-day"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Day
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hasAnySession ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No training sessions set yet.</p>
              <p className="text-sm mb-4">Add your first session to start building your weekly schedule.</p>
              <Button onClick={() => handleOpenAddDialog(1)} data-testid="button-add-first-session">
                <Plus className="h-4 w-4 mr-1" />
                Add First Session
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="1" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                {DAYS_OF_WEEK.map((day) => (
                  <TabsTrigger key={day.value} value={String(day.value)} className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">{day.short}</span>
                    <span className="sm:hidden">{day.short.charAt(0)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {DAYS_OF_WEEK.map((day) => {
                const sessions = getSessionsForDay(day.value);
                return (
                  <TabsContent key={day.value} value={String(day.value)} className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold">{day.label}</h3>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAddDialog(day.value)}
                        data-testid={`button-add-session-${day.value}`}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Session
                      </Button>
                    </div>
                    {sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No sessions on {day.label}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {sessions.map((session) => (
                          <Card key={session.id} className="overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium" data-testid={`text-session-title-${session.id}`}>
                                    {session.title}
                                  </span>
                                  {session.trainingType && (
                                    <Badge variant="secondary">{session.trainingType}</Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.startTime} - {session.endTime}
                                  </span>
                                  {session.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {session.location}
                                    </span>
                                  )}
                                  {session.groupSize && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      Up to {session.groupSize}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditDialog(session)}
                                  data-testid={`button-edit-session-${session.id}`}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSession(session.id)}
                                  data-testid={`button-delete-session-${session.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Training Session</DialogTitle>
            <DialogDescription>
              Add a new session to {DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.label}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="e.g., Morning Skills Training"
                data-testid="input-session-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  data-testid="input-start-time"
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  data-testid="input-end-time"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                placeholder="e.g., City Park Field #2"
                data-testid="input-location"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="trainingType">Training Type</Label>
                <Select
                  value={sessionForm.trainingType}
                  onValueChange={(value) => setSessionForm({ ...sessionForm, trainingType: value })}
                >
                  <SelectTrigger data-testid="select-training-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="groupSize">Max Group Size</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min={1}
                  value={sessionForm.groupSize || ""}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, groupSize: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="e.g., 6"
                  data-testid="input-group-size"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Private Notes</Label>
              <Textarea
                id="notes"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                placeholder="Notes for yourself (not visible to athletes)"
                data-testid="textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSession}
              disabled={createItemMutation.isPending}
              data-testid="button-save-session"
            >
              {createItemMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Training Session</DialogTitle>
            <DialogDescription>Update session details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Session Title *</Label>
              <Input
                id="edit-title"
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="e.g., Morning Skills Training"
                data-testid="input-edit-session-title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startTime">Start Time *</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  data-testid="input-edit-start-time"
                />
              </div>
              <div>
                <Label htmlFor="edit-endTime">End Time *</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  data-testid="input-edit-end-time"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                placeholder="e.g., City Park Field #2"
                data-testid="input-edit-location"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-trainingType">Training Type</Label>
                <Select
                  value={sessionForm.trainingType}
                  onValueChange={(value) => setSessionForm({ ...sessionForm, trainingType: value })}
                >
                  <SelectTrigger data-testid="select-edit-training-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-groupSize">Max Group Size</Label>
                <Input
                  id="edit-groupSize"
                  type="number"
                  min={1}
                  value={sessionForm.groupSize || ""}
                  onChange={(e) =>
                    setSessionForm({ ...sessionForm, groupSize: e.target.value ? parseInt(e.target.value) : null })
                  }
                  placeholder="e.g., 6"
                  data-testid="input-edit-group-size"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Private Notes</Label>
              <Textarea
                id="edit-notes"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                placeholder="Notes for yourself (not visible to athletes)"
                data-testid="textarea-edit-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSession}
              disabled={updateItemMutation.isPending}
              data-testid="button-update-session"
            >
              {updateItemMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Copy Day Schedule</DialogTitle>
            <DialogDescription>
              Copy all sessions from one day to another. This will replace existing sessions on the target day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From</Label>
              <Select value={String(copyFromDay)} onValueChange={(v) => setCopyFromDay(parseInt(v))}>
                <SelectTrigger data-testid="select-copy-from-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label} ({getSessionsForDay(day.value).length} sessions)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select value={String(copyToDay)} onValueChange={(v) => setCopyToDay(parseInt(v))}>
                <SelectTrigger data-testid="select-copy-to-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.filter((d) => d.value !== copyFromDay).map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => copyDayMutation.mutate({ fromDay: copyFromDay, toDay: copyToDay })}
              disabled={copyDayMutation.isPending}
              data-testid="button-confirm-copy"
            >
              {copyDayMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Copy Sessions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
