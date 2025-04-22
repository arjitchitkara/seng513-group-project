import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { GlassMorphism } from "@/components/ui/GlassMorphism";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const AccountSettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ 
        title: "Error", 
        description: "New passwords don't match", 
        variant: "destructive" 
      });
      return;
    }
    
    setLoading(true);
    try {
      // Here you would call your actual password update function
      // This is a placeholder toast notification
      toast({ 
        title: "Success", 
        description: "Password has been updated" 
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update password", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Account deletion handler
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirmed) {
      setLoading(true);
      try {
        // Here you would call your actual account deletion function
        // This is a placeholder
        toast({ 
          title: "Account Deleted", 
          description: "Your account has been successfully deleted" 
        });
        // Redirect to home page or sign-in page after deletion
        navigate("/");
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "Failed to delete account", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="space-y-6">
        {/* Security Section */}
        <GlassMorphism className="p-6" intensity="light">
          <h2 className="text-lg font-semibold mb-4">Password & Security</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input 
                id="newPassword" 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </GlassMorphism>

        {/* Account Management */}
        <GlassMorphism className="p-6" intensity="light">
          <h2 className="text-lg font-semibold mb-4">Account Management</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                If you delete your account, all your data will be permanently removed.
                This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </GlassMorphism>
      </div>
    </div>
  );
};

export default AccountSettingsPage; 