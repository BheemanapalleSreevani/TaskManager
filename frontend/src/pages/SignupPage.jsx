import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Eye, EyeOff, FolderKanban, Loader2, Mail, Lock, User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const InputField = ({ label, icon: Icon, error, type = 'text', register, placeholder, rightEl }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">{label}</label>
    <div className={cn(
      "flex h-12 w-full items-center rounded-xl border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1",
      error 
        ? "border-destructive focus-within:ring-destructive" 
        : "border-border focus-within:border-primary focus-within:ring-primary"
    )}>
      {Icon && <Icon size={18} className="text-muted-foreground mr-2 shrink-0" />}
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="flex-1 bg-transparent focus:outline-none placeholder:text-muted-foreground text-foreground"
      />
      {rightEl && <div className="ml-2 shrink-0">{rightEl}</div>}
    </div>
    {error && <p className="text-[0.8rem] font-medium text-destructive mt-1.5 flex items-center gap-1">⚠ {error.message}</p>}
  </div>
);

const SignupPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser({ name: data.name, email: data.email, password: data.password, role: data.role });
      toast.success(`Welcome to TaskFlow, ${user.name}! 🚀`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-zinc-950 dark:bg-zinc-950 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px]" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <div className="relative z-10 w-full max-w-lg px-12">
          <Link to="/" className="flex items-center gap-2 mb-12 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FolderKanban size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">TaskFlow</span>
          </Link>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start building your next big idea.
          </h2>
          <p className="text-zinc-400 text-lg mb-12">
            Create an account to collaborate with your team, manage tasks seamlessly, and ship products faster.
          </p>

          <div className="space-y-6">
            {[
              { title: 'Free forever plan', desc: 'Get started without a credit card.' },
              { title: 'Unlimited projects', desc: 'No limits on your ambition.' },
              { title: 'Role-based access', desc: 'Control who sees what easily.' }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{f.title}</h4>
                  <p className="text-zinc-500 text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FolderKanban size={20} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">TaskFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">Create account</h1>
            <p className="text-muted-foreground">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <InputField
              label="Full Name"
              icon={User}
              placeholder="Jane Doe"
              error={errors.name}
              register={register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
            />
            <InputField
              label="Email address"
              icon={Mail}
              placeholder="name@company.com"
              error={errors.email}
              register={register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
              })}
            />

            {/* Role selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['member', 'admin'].map(role => (
                  <label key={role} className="cursor-pointer relative">
                    <input type="radio" value={role} {...register('role')} className="sr-only peer" defaultChecked={role === 'member'} />
                    <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-border text-muted-foreground text-sm font-medium transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary hover:bg-secondary">
                      {role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
                      <span className="capitalize">{role}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground">Password</label>
              <div className={cn(
                "flex h-12 w-full items-center rounded-xl border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1",
                errors.password ? "border-destructive focus-within:ring-destructive" : "border-border focus-within:border-primary focus-within:ring-primary"
              )}>
                <Lock size={18} className="text-muted-foreground mr-2 shrink-0" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'At least 6 characters' },
                  })}
                  className="flex-1 bg-transparent focus:outline-none placeholder:text-muted-foreground text-foreground"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="ml-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-[0.8rem] font-medium text-destructive mt-1.5 flex items-center gap-1">⚠ {errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl font-medium text-primary-foreground transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
