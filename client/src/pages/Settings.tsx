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
import { 
  Settings as SettingsIcon, Users, Shield, Bell, Database, 
  Globe, Save, Plus, Trash2, Mail, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Viewer' | 'Contributor' | 'Editor' | 'Approver' | 'Admin';
  status: 'active' | 'invited';
}

const MOCK_USERS: User[] = [
  { id: "1", name: "Sarah Jenkins", email: "sarah@katalyst.com", role: "Admin", status: "active" },
  { id: "2", name: "Mike Ross", email: "mike@katalyst.com", role: "Approver", status: "active" },
  { id: "3", name: "Rachel Zane", email: "rachel@katalyst.com", role: "Editor", status: "active" },
  { id: "4", name: "Harvey Specter", email: "harvey@katalyst.com", role: "Contributor", status: "active" },
  { id: "5", name: "Louis Litt", email: "louis@katalyst.com", role: "Viewer", status: "invited" },
];

const ROLE_COLORS: Record<User['role'], string> = {
  'Admin': 'bg-destructive/10 text-destructive border-destructive/20',
  'Approver': 'bg-primary/10 text-primary border-primary/20',
  'Editor': 'bg-kat-mystical/20 text-kat-charcoal border-kat-mystical/30',
  'Contributor': 'bg-kat-wheat/30 text-kat-charcoal border-kat-wheat/50',
  'Viewer': 'bg-muted text-muted-foreground border-border',
};

export default function Settings() {
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
            <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="h-4 w-4" />
              Users & Roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="visibility" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
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
                <Button className="bg-primary text-white font-bold gap-2">
                  <Plus className="h-4 w-4" />
                  Invite User
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {MOCK_USERS.map(user => (
                    <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
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

                      <Select defaultValue={user.role}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                          <SelectItem value="Contributor">Contributor</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Approver">Approver</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>

                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", ROLE_COLORS[user.role])}>
                        {user.role}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-header">Role Permissions</CardTitle>
                <CardDescription>What each role can do in the Lexicon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { role: 'Viewer', desc: 'Read-only access to all published terms' },
                    { role: 'Contributor', desc: 'Can propose new terms and edits' },
                    { role: 'Editor', desc: 'Refines proposals, requests changes' },
                    { role: 'Approver', desc: 'Ratifies and publishes terms' },
                    { role: 'Admin', desc: 'Full access including system settings' },
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
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Require Change Note for Edits</Label>
                    <p className="text-sm text-muted-foreground">Contributors must provide a reason when editing terms</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Allow Self-Approval</Label>
                    <p className="text-sm text-muted-foreground">Approvers can approve their own submissions</p>
                  </div>
                  <Switch />
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
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">New Proposal Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify Approvers when new terms are submitted</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Changes Requested Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify Contributors when their proposals need changes</p>
                  </div>
                  <Switch defaultChecked />
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="font-bold">Enable Public Glossary</Label>
                    <p className="text-sm text-muted-foreground">Make terms marked as "Public" visible on the web</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <Label className="font-bold">Client Portal URL</Label>
                  <div className="flex gap-2">
                    <Input value="https://lexicon.katalyst.com/client" readOnly className="bg-white" />
                    <Button variant="outline">Copy</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button className="bg-primary text-white font-bold gap-2">
            <Save className="h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </Layout>
  );
}
