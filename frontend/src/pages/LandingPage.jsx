import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, ArrowRight, CheckCircle2, Users, BarChart2, Shield, Zap, Star,
  Menu, X, ChevronDown, Check, Globe, LayoutDashboard, CreditCard, PlayCircle, Code
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const features = [
  { icon: LayoutDashboard, title: 'Visual Project Boards', desc: 'Organize work into customizable boards, lists, and cards that fit your team\'s workflow.' },
  { icon: Zap, title: 'Real-time Sync', desc: 'Experience instantaneous updates across all devices. No refreshing required.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Tag members, assign tasks, and discuss work directly within the context of your projects.' },
  { icon: BarChart2, title: 'Advanced Analytics', desc: 'Gain deep insights into team performance and project bottlenecks with rich visualizations.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption, role-based access control, and comprehensive audit logs.' },
  { icon: Globe, title: 'Work Anywhere', desc: 'Fully responsive design ensures you stay productive on mobile, tablet, or desktop.' },
];

const companies = ['Acme Corp', 'GlobalNet', 'TechFlow', 'DevStudio', 'InnovateInc', 'CloudSync'];

const testimonials = [
  { quote: "TaskFlow completely transformed how our engineering team ships features. It's fast, intuitive, and beautiful.", author: "Sarah Jenkins", role: "CTO at TechFlow", avatar: "S" },
  { quote: "The real-time updates and seamless drag-and-drop make this the best project management tool we've ever used.", author: "Marcus Doe", role: "Product Manager", avatar: "M" },
  { quote: "Finally, a tool that balances powerful enterprise features with a minimal, zero-clutter interface.", author: "Elena Rodriguez", role: "Design Lead", avatar: "E" },
];

const pricing = [
  { name: 'Starter', price: 'Free', desc: 'Perfect for small teams getting started.', features: ['Up to 5 team members', '3 active projects', 'Basic Kanban boards', 'Community support'] },
  { name: 'Pro', price: '$12', desc: 'For growing teams that need more power.', popular: true, features: ['Unlimited team members', 'Unlimited projects', 'Advanced analytics', 'Role-based access', 'Priority support'] },
  { name: 'Enterprise', price: 'Custom', desc: 'For large scale organizations.', features: ['Dedicated success manager', 'Custom integrations', 'SSO & Advanced Security', 'Audit logs', '24/7 phone support'] },
];

const faqs = [
  { q: "How easy is it to migrate from other tools?", a: "We offer one-click import tools for Trello, Asana, and Jira. Your team can transition in minutes without losing any data." },
  { q: "Is there a limit on file attachments?", a: "Pro and Enterprise plans feature unlimited file storage. The Starter plan includes 5GB of team storage." },
  { q: "Do you offer discounts for non-profits?", a: "Yes! We offer a 50% discount on all premium plans for verified non-profit organizations and educational institutions." },
];

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 md:h-20 flex items-center bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FolderKanban size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">TaskFlow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20"
              >
                Go to Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm font-medium transition-all">
                  Get Started Free <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 bg-background border-b border-border p-4 shadow-xl md:hidden"
          >
            <div className="flex flex-col space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-secondary rounded-lg font-medium">Features</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-secondary rounded-lg font-medium">Customers</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 hover:bg-secondary rounded-lg font-medium">Pricing</a>
              <div className="h-px bg-border my-2" />
              {user ? (
                <Link to="/dashboard" className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-3 bg-secondary text-foreground rounded-lg font-medium text-center">Log In</Link>
                  <Link to="/signup" className="px-4 py-3 bg-foreground text-background rounded-lg font-medium text-center">Get Started Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Abstract Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] pointer-events-none opacity-50 dark:opacity-30 mix-blend-normal">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-sm font-medium mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary" />
              TaskFlow v2.0 is now live
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Manage projects with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">
                unprecedented speed.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Meet the modern standard for team coordination. TaskFlow combines the flexibility of Kanban boards with the power of real-time collaboration.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-lg">
                Start building for free <ArrowRight size={18} />
              </Link>
              <a href="#demo" className="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-full font-medium transition-all flex items-center justify-center gap-2 text-lg">
                <PlayCircle size={18} /> Watch demo
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free forever plan available.</p>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative max-w-6xl mx-auto mt-20 z-20 perspective-1000"
        >
          <div className="rounded-2xl md:rounded-[32px] border border-border bg-card/50 backdrop-blur-xl shadow-2xl p-2 md:p-4 rotate-x-12 transform-gpu shadow-primary/10">
            <div className="rounded-xl md:rounded-[24px] overflow-hidden border border-border/50 bg-background aspect-[16/9] flex items-center justify-center">
              {/* Fake dashboard UI */}
              <div className="w-full h-full flex flex-col">
                <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-muted/30">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-green-400" /></div>
                  <div className="ml-4 h-6 w-64 bg-background border border-border rounded flex items-center px-2 text-[10px] text-muted-foreground"><Shield size={10} className="mr-1"/> taskflow.app/dashboard</div>
                </div>
                <div className="flex-1 flex p-4 gap-4 bg-background">
                  <div className="hidden md:block w-48 space-y-2">
                    <div className="h-8 bg-secondary rounded-lg w-full" />
                    <div className="h-8 bg-muted rounded-lg w-3/4" />
                    <div className="h-8 bg-muted rounded-lg w-5/6" />
                  </div>
                  <div className="flex-1 flex gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 bg-secondary/50 rounded-xl p-3 flex flex-col gap-3">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                        <div className="h-24 bg-card border border-border rounded-lg shadow-sm" />
                        <div className="h-24 bg-card border border-border rounded-lg shadow-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Trusted Companies ──────────────────────────────────── */}
      <section className="py-10 border-y border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">Trusted by innovative teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
            {companies.map((company, i) => (
              <div key={i} className="flex items-center gap-2 text-xl font-bold font-serif italic text-foreground">
                <Code size={24} /> {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for modern workflows</h2>
            <p className="text-lg text-muted-foreground">Stop fighting your tools. TaskFlow adapts to your team's unique processes with powerful yet simple abstractions.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow Visualization ─────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Move work forward, <br />together.</h2>
            <p className="text-lg text-muted-foreground">TaskFlow's intuitive drag-and-drop interface makes managing complex projects feel effortless. See what everyone is doing in real-time without scheduling another sync meeting.</p>
            
            <ul className="space-y-4">
              {['Set granular permissions and roles', 'Attach files and leave contextual comments', 'Track overdue items automatically'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
            {/* Abstract workflow graphics */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 left-10 right-20 h-32 bg-card border border-border rounded-2xl shadow-xl p-4 z-20"
            >
              <div className="w-1/3 h-4 bg-muted rounded mb-4" />
              <div className="w-full h-2 bg-secondary rounded mb-2" />
              <div className="w-5/6 h-2 bg-secondary rounded" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-20 right-10 h-32 bg-card border border-border rounded-2xl shadow-xl p-4 z-10"
            >
              <div className="w-1/4 h-4 bg-primary/20 rounded mb-4" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="w-8 h-8 rounded-full bg-muted" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16">Loved by product teams</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6 text-primary">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} className="fill-current" />)}
                  </div>
                  <p className="text-lg font-medium mb-8">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Start for free, upgrade when you need more power.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((tier, i) => (
              <div key={i} className={cn(
                "relative p-8 rounded-3xl border flex flex-col bg-card",
                tier.popular ? "border-primary shadow-xl shadow-primary/10" : "border-border shadow-sm"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-foreground">{tier.name}</h3>
                <div className="my-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.price !== 'Free' && tier.price !== 'Custom' && <span className="text-muted-foreground font-medium">/user/mo</span>}
                </div>
                <p className="text-muted-foreground text-sm mb-8 h-10">{tier.desc}</p>
                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-medium">
                      <Check size={16} className="text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className={cn(
                  "w-full py-3 rounded-xl font-medium text-center transition-colors",
                  tier.popular ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-secondary text-foreground hover:bg-secondary/80"
                )}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-2xl bg-card overflow-hidden">
              <button 
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                <ChevronDown className={cn("text-muted-foreground transition-transform", activeFaq === i && "rotate-180")} />
              </button>
              <AnimatePresence>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-[3rem] p-12 md:p-20 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Start managing your team effectively.</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">Join thousands of teams who have already made the switch to TaskFlow.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium transition-all text-lg shadow-lg">
              Create your free workspace
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FolderKanban size={20} className="text-primary" />
            <span className="font-bold text-foreground">TaskFlow</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Security</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
