import { useMemo, useState } from "react";
import { User, Mail, Award, UserCircle, Edit2, Save, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../../utils/supabase/info";
import { sanitizeString, validatePassword } from "../../utils/validation";

interface ProfileTabProps {
  user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");

  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const createdAtLabel = useMemo(() => {
    if (!user.createdAt) return "N/A";
    try {
      return new Date(user.createdAt).toLocaleDateString();
    } catch {
      return "N/A";
    }
  }, [user.createdAt]);

  const handleSaveProfile = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("You are not signed in.");
      return;
    }

    const sanitizedFullName = sanitizeString(fullName);
    const sanitizedUsername = sanitizeString(username);
    const sanitizedPhone = sanitizeString(phoneNumber);

    if (!sanitizedFullName) {
      toast.error("Full name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/user/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            fullName: sanitizedFullName,
            username: sanitizedUsername || null,
            phoneNumber: sanitizedPhone || null,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated");
      setIsEditing(false);

      // Keep localStorage user in sync so refreshes show updated info.
      try {
        const stored = localStorage.getItem("user");
        const parsed = stored ? JSON.parse(stored) : {};
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...parsed,
            ...data.profile,
          })
        );
      } catch {
        // non-fatal
      }
    } catch (e) {
      console.error("Update profile error:", e);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("You are not signed in.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast.error("Password requirements not met", {
        description: validation.errors.join(", "),
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9340b842/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.error || "Failed to change password");
        return;
      }

      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      console.error("Change password error:", e);
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400">Your athlete information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <UserCircle size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">{fullName || user.fullName}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-blue-400 text-sm mt-1 capitalize">{user.role} Account</p>
            </div>
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
              {isEditing ? (saving ? "Saving..." : "Save") : "Edit"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold">Contact Information</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{user.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Full name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                    placeholder="Username"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-2">Phone number</label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-purple-400" size={20} />
                <h3 className="text-white font-semibold">Programs Enrolled</h3>
              </div>
              <p className="text-gray-400 text-sm">
                {user.programs?.length || 0} active program{user.programs?.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Change Password */}
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <KeyRound className="text-green-400" size={20} />
                <h3 className="text-white font-semibold">Change Password</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="New password"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-gray-500 text-xs">
                  Must be 8+ chars and include uppercase, lowercase, number, and special character.
                </p>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {user.assignedCoach && (
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-green-400" size={20} />
                  <h3 className="text-white font-semibold">Assigned Coach</h3>
                </div>
                <p className="text-gray-400 text-sm">{user.assignedCoach.name}</p>
                {user.assignedCoach.bio && (
                  <p className="text-gray-500 text-sm mt-2">{user.assignedCoach.bio}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-900 border border-white/10 rounded-lg p-6">
          <h3 className="text-white text-xl font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Member Since</p>
              <p className="text-white font-semibold">
                {createdAtLabel}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Programs</p>
              <p className="text-white font-semibold">{user.programs?.length || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Account Type</p>
              <p className="text-white font-semibold capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
