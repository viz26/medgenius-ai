import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import GlassCard from "@/components/ui/GlassCard";
import { Save, User, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme/ThemeProvider";

const Settings = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated successfully.",
    });
  };

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      <Navbar />
      
      <main className="flex-grow pt-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              Account Settings
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your account preferences and settings
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Professional Title</label>
                    <Input placeholder="E.g., Medical Researcher, Physician, etc." />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="A brief description about yourself..."
                    ></textarea>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="notifications">
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                    </div>
                    <Switch 
                      checked={theme === "dark"}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveProfile}>Save Preferences</Button>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>

            <TabsContent value="security">
              <GlassCard>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <div className="space-y-4">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={handleSaveProfile}>Update Password</Button>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
