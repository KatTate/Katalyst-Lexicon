import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Settings as SettingsIcon, Users, Shield, Bell, 
  Globe, Save, Plus, Trash2, Mail, MoreVertical, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, User, Setting } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";

const ROLE_COLORS: Record<User['role'], string> = {
  'Admin': 'bg-destructive/10 text-destructive border-destructive/20',
  'Approver': 'bg-primary/10 text-primary border-primary/20',
  'Member': 'bg-muted text-muted-foreground border-border',
};

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "Member" as User["role"] });
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const userToDelete = users.find(u => u.id === deleteUserId);

  const { data: settings = [], isLoading: settingsLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  const settingsInitialized = useRef(false);
  
  useEffect(() => {
    if (settings.length > 0 && !settingsInitialized.current) {
      const settingsMap: Record<string, boolean> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setLocalSettings(settingsMap);
      settingsInitialized.current = true;
    }
  }, [settings]);

  const getSetting = (key: string) => localSettings[key] ?? false;

  const createUserMutation = useMutation({
    mutationFn: (data: { name: string; email: string; role: User["role"] }) => 
      api.users.create({ name: data.name, email: data.email, role: data.role, status: "invited" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Invitation Sent", description: "The user has been invited to join." });
      setInviteOpen(false);
      setInviteForm({ name: "", email: "", role: "Member" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to invite user.", variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User["role"] }) => api.users.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Role Updated", description: "User role has been changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User Removed", description: "The user has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove user.", variant: "destructive" });
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (settingsData: { key: string; value: boolean }[]) => api.settings.saveBatch(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings Saved", description: "Your settings have been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    const settingsData = Object.entries(localSettings).map(([key, value]) => ({ key, value }));
    saveSettingsMutation.mutate(settingsData);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-header font-bold text-kat-black flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure permissions, notifications, and system-wide preferences.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-users">
              <Users className="h-4 w-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-permissions">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-notifications">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="visibility" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-visibility">
              <Globe className="h-4 w-4" />
              Visibility
            </TabsTrigger>
          </TabsList>

          {/* Users & Roles Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-header">Team Members</CardTitle>
                  <CardDescription>Manage who has access to the Lexicon and their permissions.</CardDescription>
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white font-bold gap-2" data-testid="button-invite-user">
                      <Plus className="h-4 w-4" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-header font-bold">Invite New User</DialogTitle>
                      <DialogDescription>Send an invitation to join the Katalyst Lexicon.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                          placeholder="Jane Doe"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm(f => ({ ...f, name: e.target.value }))}
                          data-testid="input-invite-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input 
                          type="email"
                          placeholder="jane@katalyst.com"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                          data-testid="input-invite-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={inviteForm.role} onValueChange={(v) => setInviteForm(f => ({ ...f, role: v as User["role"] }))}>
                          <SelectTrigger data-testid="select-invite-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Approver">Approver</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-primary text-white font-bold"
                        onClick={() => createUserMutation.mutate(inviteForm)}
                        disabled={createUserMutation.isPending || !inviteForm.name.trim() || !inviteForm.email.trim()}
                        data-testid="button-send-invite"
                      >
                        {createUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group" data-testid={`user-row-${user.id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={cn(
                            "font-bold text-sm",
                            user.status === 'invited' ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                          )}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-kat-black">{user.name}</h3>
                            {user.status === 'invited' && (
                              <Badge variant="outline" className="text-[10px] bg-kat-warning/20 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>

                        <Select 
                          value={user.role}
                          onValueChange={(v) => updateUserMutation.mutate({ id: user.id, role: v as User["role"] })}
                        >
                          <SelectTrigger className="w-[140px]" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Member">Member</SelectItem>
                            <SelectItem value="Approver">Approver</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", ROLE_COLORS[user.role])}>
                          {user.role}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" data-testid={`button-user-menu-${user.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onSelect={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delete User Confirmation Dialog */}
            <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {userToDelete?.name || "this user"} from the Katalyst Lexicon. They will no longer have access.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteUserId(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      if (deleteUserId) {
                        deleteUserMutation.mutate(deleteUserId);
                        setDeleteUserId(null);
                      }
                    }}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Role Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-header">Role Permissions</CardTitle>
                <CardDescription>What each role can do in the Lexicon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { role: 'Member', desc: 'Browse terms, propose new terms, and suggest edits to existing ones' },
                    { role: 'Approver', desc: 'Review proposals, approve or reject changes, publish terms' },
                    { role: 'Admin', desc: 'Full access including user management and system settings' },
                  ].map(({ role, desc }) => (
                    <div key={role} className="p-4 bg-muted/30 rounded-lg border">
                      <Badge variant="outline" className={cn("text-xs font-bold uppercase mb-2", ROLE_COLORS[role as User['role']])}>
                        {role}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-header">Governance Rules</CardTitle>
                <CardDescription>Configure approval workflows and publishing requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Require Approver Sign-off</Label>
                    <p className="text-sm text-muted-foreground">All new terms must be approved before publishing</p>
                  </div>
                  <Switch 
                    checked={getSetting("require_approver_signoff")}
                    onCheckedChange={(v) => handleToggle("require_approver_signoff", v)}
                    data-testid="switch-require-approver"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Require Change Note for Edits</Label>
                    <p className="text-sm text-muted-foreground">Contributors must provide a reason when editing terms</p>
                  </div>
                  <Switch 
                    checked={getSetting("require_change_note")}
                    onCheckedChange={(v) => handleToggle("require_change_note", v)}
                    data-testid="switch-require-change-note"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Allow Self-Approval</Label>
                    <p className="text-sm text-muted-foreground">Approvers can approve their own submissions</p>
                  </div>
                  <Switch 
                    checked={getSetting("allow_self_approval")}
                    onCheckedChange={(v) => handleToggle("allow_self_approval", v)}
                    data-testid="switch-allow-self-approval"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-header">Email Notifications</CardTitle>
                <CardDescription>Configure when team members receive email updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Send a summary of new and updated terms</p>
                  </div>
                  <Switch 
                    checked={getSetting("weekly_digest")}
                    onCheckedChange={(v) => handleToggle("weekly_digest", v)}
                    data-testid="switch-weekly-digest"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">New Proposal Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify Approvers when new terms are submitted</p>
                  </div>
                  <Switch 
                    checked={getSetting("new_proposal_alerts")}
                    onCheckedChange={(v) => handleToggle("new_proposal_alerts", v)}
                    data-testid="switch-new-proposal-alerts"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Changes Requested Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify Contributors when their proposals need changes</p>
                  </div>
                  <Switch 
                    checked={getSetting("changes_requested_alerts")}
                    onCheckedChange={(v) => handleToggle("changes_requested_alerts", v)}
                    data-testid="switch-changes-requested-alerts"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-header">Public Access</CardTitle>
                <CardDescription>Control external visibility of the Lexicon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Enable Client-Safe Portal</Label>
                    <p className="text-sm text-muted-foreground">Allow external users to view terms marked as "Client-Safe"</p>
                  </div>
                  <Switch 
                    checked={getSetting("enable_client_portal")}
                    onCheckedChange={(v) => handleToggle("enable_client_portal", v)}
                    data-testid="switch-enable-client-portal"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Enable Public Glossary</Label>
                    <p className="text-sm text-muted-foreground">Make terms marked as "Public" visible on the web</p>
                  </div>
                  <Switch 
                    checked={getSetting("enable_public_glossary")}
                    onCheckedChange={(v) => handleToggle("enable_public_glossary", v)}
                    data-testid="switch-enable-public-glossary"
                  />
                </div>
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Label className="font-bold">Client Portal URL</Label>
                  <div className="flex gap-2">
                    <Input value="https://lexicon.katalyst.com/client" readOnly className="bg-white" />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText("https://lexicon.katalyst.com/client");
                        toast({ title: "Copied", description: "URL copied to clipboard." });
                      }}
                      data-testid="button-copy-url"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button 
            className="bg-primary text-white font-bold gap-2"
            onClick={handleSaveAll}
            disabled={saveSettingsMutation.isPending}
            data-testid="button-save-settings"
          >
            {saveSettingsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
