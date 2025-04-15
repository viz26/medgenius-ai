import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PageContainer from '../components/layout/PageContainer';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { UserRole } from '../types/auth';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  LogOut,
  Trash2,
  UserCog,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const { user, updateUserRole, updateUserSettings, signOut, clearHistory } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const handleRoleChange = async (role: UserRole) => {
    try {
      await updateUserRole(role);
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleSettingChange = async (key: keyof typeof user.settings, value: boolean) => {
    try {
      await updateUserSettings({ [key]: value });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleClearHistory = async () => {
    try {
      setIsClearing(true);
      await clearHistory();
      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    } finally {
      setIsClearing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
      setIsSigningOut(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full" />
            ) : (
              <User className="w-16 h-16 p-4 bg-gray-100 rounded-full" />
            )}
            <div>
              <h2 className="text-xl font-semibold">{user.displayName || 'User'}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* Role Selection */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserCog className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Role</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(['patient', 'doctor', 'researcher'] as const).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`p-4 rounded-lg border transition-colors ${
                  user.role === role
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <p className="font-medium capitalize">{role}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SettingsIcon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Smart Suggestions</div>
                <div className="text-sm text-gray-500">
                  Enable AI-powered suggestions based on your usage
                </div>
              </div>
              <Switch
                checked={user.settings?.smartSuggestions ?? false}
                onCheckedChange={(checked) =>
                  handleSettingChange('smartSuggestions', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Email Summaries</div>
                <div className="text-sm text-gray-500">
                  Receive weekly summaries of your activity
                </div>
              </div>
              <Switch
                checked={user.settings?.emailSummaries ?? false}
                onCheckedChange={(checked) =>
                  handleSettingChange('emailSummaries', checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Actions</h2>
          </div>
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleClearHistory}
              disabled={isClearing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Search History
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="p-6 bg-yellow-50">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-800">
                Educational Platform Disclaimer
              </p>
              <p className="text-sm text-yellow-700">
                This platform is for educational purposes only. Always consult with healthcare
                professionals for medical advice. The AI suggestions and analysis provided
                are meant to assist, not replace, professional medical judgment.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
