// src/pages/Settings.tsx
// ----------------------------
// IMPORTS
// ----------------------------
import { DashboardLayoutCustom } from "@/components/DashboardLayoutCustom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

import {
  Bell,
  User,
  Download,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function Settings() {
  const { user, refresh: refreshAuth } = useAuth();

  const [activeSection, setActiveSection] = useState("account");

  // PASSWORD VISIBILITY
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // FORM DATA
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // LOAD USER DATA
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // TRPC PROFILE / PASSWORD
  const updateProfile = trpc.auth.updateProfile.useMutation();
  const changePassword = trpc.auth.changePassword.useMutation();

  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // SAVE PROFILE
  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    setIsProfileLoading(true);
    try {
      await updateProfile.mutateAsync({ name: formData.name });
      toast.success("Profile updated successfully!");
      refreshAuth();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
    setIsProfileLoading(false);
  };

  // CHANGE PASSWORD
  const handlePasswordUpdate = async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("All fields must be filled");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password updated!");

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to update password");
    }
    setIsPasswordLoading(false);
  };

  // =============================
  // NOTIFICATIONS
  // =============================
  const notifQuery = trpc.notification.get.useQuery();
  const notifUpdate = trpc.notification.update.useMutation();

  const [notif, setNotif] = useState({
    emailNotifications: true,
    taskDueReminder: true,
    newTaskAssigned: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (notifQuery.data) setNotif(notifQuery.data);
  }, [notifQuery.data]);

  const handleNotifChange = (key: keyof typeof notif) => {
    setNotif((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveNotifSettings = async () => {
    try {
      await notifUpdate.mutateAsync(notif);
      toast.success("Notification settings saved");
      notifQuery.refetch();
    } catch {
      toast.error("Failed to save notification settings");
    }
  };

  // =============================
  // EXPORT (TRPC HOOKS)
  // =============================
  const exportJson = trpc.export.json.useQuery(undefined, { enabled: false });
  const exportCsv = trpc.export.csv.useQuery(undefined, { enabled: false });
  const exportPdf = trpc.export.pdf.useQuery(undefined, { enabled: false });

  // STORAGE USAGE
  const storageQuery = trpc.export.storageUsage.useQuery(undefined, {
    enabled: true,
    refetchInterval: 30000,
  });

  // FORMAT SIZE
  const human = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`;
  };

  const storage = storageQuery.data ?? {
    size: { projects: 0, tasks: 0, tags: 0, taskTags: 0 },
    total: 0,
  };

  const limitBytes = 10 * 1024 * 1024 * 1024; // 10GB
  const percentUsed = Math.min(
    100,
    Math.round((storage.total / limitBytes) * 100)
  );

  // =============================
  // DOWNLOAD HELPER
  // =============================
  const downloadFile = (filename: string, content: string, mime = "text/plain") => {
    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
  };

  // =============================
  // EXPORT HANDLER
  // =============================
  const handleExport = async (format: "csv" | "json" | "pdf") => {
    try {
      if (format === "json") {
        const res = await exportJson.refetch();
        downloadFile(
          "planit-export.json",
          JSON.stringify(res.data?.data ?? [], null, 2),
          "application/json"
        );
      }

      if (format === "csv") {
        const res = await exportCsv.refetch();
        downloadFile("planit-export.csv", res.data?.csv || "", "text/csv");
      }

      if (format === "pdf") {
        const res = await exportPdf.refetch();
        downloadFile("planit-export.txt", res.data?.pdfText || "");
      }

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export data");
    }
  };

  // =============================
  // SIDEBAR
  // =============================
  const sections: SettingSection[] = [
    {
      id: "account",
      title: "Account",
      description: "Manage your account settings",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Control how you receive updates",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "data",
      title: "Data & Export",
      description: "Export or review your data",
      icon: <Download className="w-5 h-5" />,
    },
  ];

  // =============================
  // UI — ACCOUNT
  // =============================
  const renderAccountSection = () => (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder=""
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={formData.email} disabled placeholder="" />
          </div>

          <Button onClick={handleSaveProfile} disabled={isProfileLoading}>
            {isProfileLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* PASSWORD */}
      {/* PASSWORD */}
<Card className="border-border/50">
  <CardHeader>
    <CardTitle>Password</CardTitle>
    <CardDescription>Change your password</CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    {(
      [
        { key: "currentPassword", label: "Current Password", vis: "current" },
        { key: "newPassword", label: "New Password", vis: "new" },
        { key: "confirmPassword", label: "Confirm Password", vis: "confirm" },
      ] as {
        key: keyof typeof formData;
        label: string;
        vis: keyof typeof passwordVisibility;
      }[]
    ).map((f) => (
      <div key={f.key} className="space-y-2">
        <label className="text-sm font-medium">{f.label}</label>
        <div className="relative">
          <Input
            type={passwordVisibility[f.vis] ? "text" : "password"}
            name={f.key}
            value={formData[f.key]}
            onChange={handleInputChange}
          />

          <button
            type="button"
            className="absolute right-3 top-2.5"
            onClick={() => togglePassword(f.vis)}
          >
            {passwordVisibility[f.vis] ? (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Eye className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    ))}

    <Button onClick={handlePasswordUpdate} disabled={isPasswordLoading}>
      {isPasswordLoading ? "Updating..." : "Update Password"}
    </Button>
  </CardContent>
</Card>

    </div>
  );

  // =============================
  // UI — NOTIFICATIONS
  // =============================
  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {[
            {
              key: "emailNotifications",
              title: "Email Notifications",
              desc: "Receive updates via email",
            },
            {
              key: "taskDueReminder",
              title: "Task Due Reminders",
              desc: "Get notified before due dates",
            },
            {
              key: "newTaskAssigned",
              title: "In-App Notifications",
              desc: "Receive notifications inside the app",
            },
            {
              key: "marketingEmails",
              title: "Marketing Emails",
              desc: "Receive occasional promotional updates",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={notif[item.key as keyof typeof notif]}
                onChange={() => handleNotifChange(item.key as any)}
                className="w-4 h-4"
              />

              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </label>
          ))}

          <Button className="mt-4" onClick={saveNotifSettings}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // =============================
  // UI — EXPORT + STORAGE
  // =============================
  const renderDataSection = () => (
    <div className="space-y-6">
      {/* EXPORT */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>Download your data in different formats</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {[
            { key: "csv", format: "CSV", desc: "Spreadsheet format (Excel)" },
            { key: "json", format: "JSON", desc: "Structured developer format" },
            { key: "pdf", format: "PDF", desc: "Printable text format" },
          ].map((item) => (
            <div
              key={item.format}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <p className="font-medium">{item.format} Export</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(item.key as any)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* STORAGE */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Data Storage</CardTitle>
          <CardDescription>Your storage usage details</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {human(storage.total)} / {human(limitBytes)}
              </span>
            </div>

            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Usage: {percentUsed}%</span>
              <span>
                Last updated:{" "}
                {storageQuery.isFetching
                  ? "updating..."
                  : new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-sm pt-2">
              <div>
                <p className="text-muted-foreground text-xs">Projects</p>
                <p className="font-medium">{human(storage.size.projects || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tasks</p>
                <p className="font-medium">{human(storage.size.tasks || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Tags</p>
                <p className="font-medium">{human(storage.size.tags || 0)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Task-Tags</p>
                <p className="font-medium">{human(storage.size.taskTags || 0)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // =============================
  // MAIN PAGE RENDER
  // =============================
  return (
    <DashboardLayoutCustom>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and application preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="space-y-2 sticky top-20">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {section.icon}
                  <span className="flex-1 text-sm font-medium">
                    {section.title}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3">
            {activeSection === "account" && renderAccountSection()}
            {activeSection === "notifications" && renderNotificationsSection()}
            {activeSection === "data" && renderDataSection()}
          </div>
        </div>
      </div>
    </DashboardLayoutCustom>
  );
}
