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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Settings as SettingsIcon, Users, Shield, Bell, 
  Globe, Trash2, MoreVertical, Loader2, ShieldAlert, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, User, Setting } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { canAdmin } from "@shared/permissions";

function parseApiError(error: any, fallback: string): string {
  const msg = error?.message || "";
  const colonIdx = msg.indexOf(": ");
  const jsonMatch = colonIdx > 0 ? [msg, msg.substring(colonIdx + 2)] : null;
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.error) return typeof parsed.error === "string" ? parsed.error : fallback;
    } catch {}
  }
  return msg || fallback;
}

const ROLE_COLORS: Record<User['role'], string> = {
  'Admin': 'bg-destructive/10 text-destructive border-destructive/20',
  'Approver': 'bg-primary/10 text-primary border-primary/20',
  'Member': 'bg-muted text-muted-foreground border-border',
};

function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
  if (user.firstName) return user.firstName;
  if (user.email) return user.email;
  return "Unknown User";
}

function getUserInitials(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  if (user.firstName) return user.firstName[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return "?";
}

function formatJoinDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [localSettings, setLocalSettings] = useState<Record<string, boolean>>({});
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const isAdmin = authUser?.role ? canAdmin(authUser.role) : false;

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [users]);

  const userToDelete = users.find(u => u.id === deleteUserId);

  const { data: settings = [], isLoading: settingsLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    enabled: isAdmin,
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

  const updateUserMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User["role"] }) => api.users.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Role Updated", description: "User role has been changed successfully." });
    },
    onError: (error: any) => {
      const message = parseApiError(error, "Failed to update user role.");
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User Removed", description: "The user has been removed." });
    },
    onError: (error: any) => {
      const message = parseApiError(error, "Failed to remove user.");
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const saveSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: boolean }) => api.settings.save(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Setting Saved", description: "Your setting has been updated." });
    },
    onError: (_error: any, variables: { key: string; value: boolean }) => {
      setLocalSettings(prev => ({ ...prev, [variables.key]: !variables.value }));
      toast({ title: "Error", description: "Failed to save setting.", variant: "destructive" });
    },
  });

  const handleToggle = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    saveSettingMutation.mutate({ key, value });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-6 py-20" data-testid="permission-denied">
          <div className="text-center space-y-4">
            <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto" />
            <h1 className="text-2xl font-header font-bold text-kat-black">Permission Denied</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have permission to access system settings. Only administrators can manage users and configure the system.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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
            <TabsTrigger value="governance" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm" data-testid="tab-governance">
              <Shield className="h-4 w-4" />
              Governance
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
              <CardHeader>
                <CardTitle className="text-lg font-header">Team Members</CardTitle>
                <CardDescription>Users are auto-provisioned when they sign in via Replit Auth. Manage their roles below.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="divide-y divide-border" data-testid="user-table">
                    {sortedUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group" data-testid={`user-row-${user.id}`}>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="font-bold text-sm bg-primary/10 text-primary">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-kat-black">{getUserDisplayName(user)}</h3>
                          {user.email && (
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground hidden sm:block">
                          {user.createdAt && formatJoinDate(user.createdAt)}
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
                    This will remove {userToDelete ? getUserDisplayName(userToDelete) : "this user"} from the Katalyst Lexicon. They will no longer have access.
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
                    <div key={role} className="p-4 bg-muted/30 rounded-lg border" data-testid={`role-legend-${role.toLowerCase()}`}>
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

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6" data-testid="section-governance">
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
          <TabsContent value="notifications" className="space-y-6" data-testid="section-notifications">
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
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800" data-testid="text-notifications-coming-soon">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Notification delivery is coming soon — these settings will take effect when notifications are enabled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visibility Tab */}
          <TabsContent value="visibility" className="space-y-6" data-testid="section-visibility">
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

      </div>
    </Layout>
  );
}
