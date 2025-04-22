import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [glassUI, setGlassUI] = useState(true);
  const [compact, setCompact] = useState(false);
  const [username, setUsername] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [summaryEmails, setSummaryEmails] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");

  const handleSave = () => {
    toast({ title: "Settings Saved!" });
  };

  return (
    <motion.div
      className="p-6 space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>Dark Mode</span>
          <Switch
            checked={mounted && theme === "dark"}
            onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Glassmorphism UI</span>
          <Switch checked={glassUI} onCheckedChange={setGlassUI} />
        </div>
        <div className="flex items-center justify-between">
          <span>Compact Layout</span>
          <Switch checked={compact} onCheckedChange={setCompact} />
        </div>
      </div>

      {/* Profile */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input type="password" placeholder="Change Password" />
        <Input type="file" accept="image/*" />
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center justify-between">
          <span>Email Notifications</span>
          <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
        </div>
        <div className="flex items-center justify-between">
          <span>Push Notifications</span>
          <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
        </div>
        <div className="flex items-center justify-between">
          <span>Weekly Summary Emails</span>
          <Switch checked={summaryEmails} onCheckedChange={setSummaryEmails} />
        </div>
      </div>

      {/* Privacy */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Privacy</h2>
        <div className="flex items-center justify-between">
          <span>Private Profile</span>
          <Switch checked={privateProfile} onCheckedChange={setPrivateProfile} />
        </div>
        <div className="flex items-center justify-between">
          <span>Hide Activity Status</span>
          <Switch checked={hideStatus} onCheckedChange={setHideStatus} />
        </div>
        <Button variant="outline" onClick={() => toast({ title: "Blocked users manager coming soon!" })}>
          Manage Blocked Users
        </Button>
      </div>

      {/* Other */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Other Preferences</h2>
        <div className="flex items-center justify-between">
          <span>Auto-save Notes</span>
          <Switch checked={autoSave} onCheckedChange={setAutoSave} />
        </div>

        <div>
          <label className="text-sm mb-1 block">Language</label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm mb-1 block">Timezone</label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="EST">EST</SelectItem>
              <SelectItem value="PST">PST</SelectItem>
              <SelectItem value="CET">CET</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button variant="destructive" onClick={() => toast({ title: "Account deletion is irreversible." })}>
          Delete Account
        </Button>
        <Button variant="secondary" onClick={() => {
          setTheme("system");
          setCompact(false);
          setGlassUI(true);
          setPrivateProfile(false);
          setHideStatus(false);
          toast({ title: "All settings reset." });
        }}>
          Reset Settings
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
