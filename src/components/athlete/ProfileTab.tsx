import { User, Mail, Award, UserCircle } from "lucide-react";

interface ProfileTabProps {
  user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-4xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400">Your athlete information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-gray-900 border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <UserCircle size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-2xl font-bold">{user.fullName}</h2>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-blue-400 text-sm mt-1 capitalize">{user.role} Account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="text-blue-400" size={20} />
                <h3 className="text-white font-semibold">Contact Information</h3>
              </div>
              <p className="text-gray-400 text-sm">{user.email}</p>
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
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
