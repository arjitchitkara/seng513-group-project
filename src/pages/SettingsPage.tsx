import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GlassMorphism } from "@/components/ui/GlassMorphism";
import { Link } from "react-router-dom";
import { Settings, User, Lock, Bell, Palette } from "lucide-react";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [glassUI, setGlassUI] = useState(true);
  const [compact, setCompact] = useState(false);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [emailNotif, setEmailNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [summaryEmails, setSummaryEmails] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const handleSave = () => {
    toast({ title: "Settings Saved!" });
  };

  return (
    <motion.div
      className="container mx-auto p-6 max-w-4xl space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <GlassMorphism className="p-4" intensity="light">
            <nav className="space-y-2">
              <Link to="/settings" className="flex items-center gap-2 p-2 bg-primary/10 rounded-md text-primary font-medium">
                <Settings size={18} />
                <span>General</span>
              </Link>
              <Link to="/settings/account" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-foreground/80 hover:text-foreground transition-colors">
                <User size={18} />
                <span>Account</span>
              </Link>
              <Link to="/settings/privacy" className="flex items-center gap-2 p-2 hover:bg-muted rounded-md text-foreground/80 hover:text-foreground transition-colors">
                <Lock size={18} />
                <span>Privacy</span>
              </Link>
            </nav>
          </GlassMorphism>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Appearance */}
          <GlassMorphism className="p-6" intensity="light">
            <div className="flex items-center gap-2 mb-4">
              <Palette size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
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
          </GlassMorphism>

          {/* Notifications */}
          <GlassMorphism className="p-6" intensity="light">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
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
          </GlassMorphism>

          {/* Other Preferences */}
          <GlassMorphism className="p-6" intensity="light">
            <h2 className="text-lg font-semibold mb-4">Other Preferences</h2>
            <div className="space-y-4">
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
          </GlassMorphism>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={() => {
              setDarkMode(false);
              setCompact(false);
              setGlassUI(true);
              toast({ title: "Settings reset." });
            }}>
              Reset Settings
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
