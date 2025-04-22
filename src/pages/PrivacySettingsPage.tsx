import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { GlassMorphism } from "@/components/ui/GlassMorphism";

const PrivacySettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);
  const [hideDocuments, setHideDocuments] = useState(false);
  const [showEmailToFollowers, setShowEmailToFollowers] = useState(false);

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      // Here you would call your actual privacy settings update function
      // This is a placeholder toast notification
      toast({ 
        title: "Success", 
        description: "Privacy settings have been updated" 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to update privacy settings", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>

      <GlassMorphism className="p-6" intensity="medium">
        <h2 className="text-lg font-semibold mb-4">Profile Privacy</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="privateProfile" className="text-base font-medium">Private Profile</Label>
              <p className="text-sm text-muted-foreground">Only followers can view your profile details</p>
            </div>
            <Switch 
              id="privateProfile" 
              checked={privateProfile} 
              onCheckedChange={setPrivateProfile}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hideStatus" className="text-base font-medium">Hide Activity Status</Label>
              <p className="text-sm text-muted-foreground">Your online status will not be visible to others</p>
            </div>
            <Switch 
              id="hideStatus" 
              checked={hideStatus} 
              onCheckedChange={setHideStatus}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hideDocuments" className="text-base font-medium">Hide Uploaded Documents</Label>
              <p className="text-sm text-muted-foreground">Your document uploads won't appear on your public profile</p>
            </div>
            <Switch 
              id="hideDocuments" 
              checked={hideDocuments} 
              onCheckedChange={setHideDocuments}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showEmailToFollowers" className="text-base font-medium">Show Email to Followers</Label>
              <p className="text-sm text-muted-foreground">Allow your followers to see your email address</p>
            </div>
            <Switch 
              id="showEmailToFollowers" 
              checked={showEmailToFollowers} 
              onCheckedChange={setShowEmailToFollowers}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleSavePrivacy}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Privacy Settings"}
          </Button>
        </div>
      </GlassMorphism>
    </div>
  );
};

export default PrivacySettingsPage; 