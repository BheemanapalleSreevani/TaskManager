import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { User, Lock, Loader2, Camera } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: { name: user?.name, avatar: user?.avatar },
  });

  const { register: regPw, handleSubmit: handlePw, formState: { errors: pwErrors }, reset: resetPw } = useForm();

  const onUpdateProfile = async (data) => {
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setProfileLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      await authService.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        {/* Avatar */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-6 shadow-sm">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <p className="text-foreground text-xl font-semibold">{user?.name}</p>
            <p className="text-muted-foreground">{user?.email}</p>
            <span className={`inline-flex items-center mt-2 text-xs px-2.5 py-1 rounded-full font-medium ${
              user?.role === 'admin' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-secondary text-secondary-foreground border border-border'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-card border border-border rounded-2xl p-1 shadow-sm">
          {[{ key: 'profile', icon: User, label: 'Profile' }, { key: 'password', icon: Lock, label: 'Password' }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-foreground font-semibold mb-5 flex items-center gap-2">
              <User size={18} className="text-primary" /> Update Profile
            </h2>
            <form onSubmit={handleProfile(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="text-sm text-foreground font-medium mb-1.5 block">Full Name</label>
                <input
                  {...regProfile('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                {profileErrors.name && <p className="text-destructive text-xs mt-1">{profileErrors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm text-foreground font-medium mb-1.5 block">Email</label>
                <input
                  value={user?.email}
                  disabled
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed"
                />
                <p className="text-muted-foreground text-xs mt-1">Email cannot be changed</p>
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 rounded-xl text-primary-foreground font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {profileLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-foreground font-semibold mb-5 flex items-center gap-2">
              <Lock size={18} className="text-primary" /> Change Password
            </h2>
            <form onSubmit={handlePw(onChangePassword)} className="space-y-4">
              {[
                { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                { name: 'newPassword', label: 'New Password', placeholder: '••••••••', minLength: 6 },
                { name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
              ].map(field => (
                <div key={field.name}>
                  <label className="text-sm text-foreground font-medium mb-1.5 block">{field.label}</label>
                  <input
                    type="password"
                    {...regPw(field.name, {
                      required: `${field.label} is required`,
                      ...(field.minLength && { minLength: { value: field.minLength, message: `Minimum ${field.minLength} characters` } }),
                    })}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  {pwErrors[field.name] && <p className="text-destructive text-xs mt-1">{pwErrors[field.name].message}</p>}
                </div>
              ))}
              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 rounded-xl text-primary-foreground font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : 'Change Password'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
