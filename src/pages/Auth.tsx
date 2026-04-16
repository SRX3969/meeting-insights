import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, Sparkles, Shield, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface AuthProps {
  mode: "login" | "signup";
}

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [heardFrom, setHeardFrom] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").update({
            full_name: fullName,
            username: username || null,
            date_of_birth: dateOfBirth || null,
            heard_from: heardFrom || null,
          }).eq("user_id", data.user.id);
        }

        toast.success("Account created! Accessing your dashboard...");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] flex overflow-hidden selection:bg-primary/10 font-sans">
      {/* Cinematic Left Panel - Marketing Focus */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
         {/* Mesh Background */}
         <div className="absolute inset-0 z-0 bg-primary">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary via-purple-600 to-indigo-800" />
            <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] bg-white/20 rounded-full blur-[120px] animate-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '2s' }} />
         </div>

         <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 group">
               <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                  <Brain className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
               </div>
               <span className="text-2xl font-black tracking-tighter text-white">Notemind</span>
            </Link>
         </div>

         <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black text-white uppercase tracking-widest backdrop-blur-md">
               <Sparkles className="h-3.5 w-3.5" />
               <span>New: Task Auto-Assignment</span>
            </div>
            <h2 className="text-5xl xl:text-7xl font-black text-white tracking-tighter leading-[0.95]">
               The intelligent brain <br/> for your team.
            </h2>
            <div className="space-y-6 pt-4">
               {[
                 { icon: CheckCircle2, text: "Automated Meeting Summaries" },
                 { icon: Zap, text: "1-Click Action Item Export" },
                 { icon: Shield, text: "Enterprise-grade Data Security" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 text-white/80 font-bold slide-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                   <item.icon className="h-5 w-5 text-white" />
                   {item.text}
                 </div>
               ))}
            </div>
         </div>

         <div className="relative z-10">
            <div className="p-8 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-between">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                  ))}
               </div>
               <div className="text-right">
                  <div className="text-lg font-black text-white leading-none">5,000+</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Productive Founders Joined</div>
               </div>
            </div>
         </div>
      </div>

      {/* Auth Right Panel - Refined Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

         <div className="w-full max-w-md space-y-10 relative z-10 slide-up">
            <div className="text-center lg:text-left space-y-3">
               <h1 className="text-4xl font-black tracking-tighter text-[#0A0A0A]">
                  {mode === "login" ? "Welcome back" : "Get started today"}
               </h1>
               <p className="text-muted-foreground font-semibold">
                  {mode === "login"
                    ? "Enter your credentials to access your brain."
                    : "Create your free account and start shipping faster."}
               </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid gap-6">
                  {mode === "signup" && (
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                           <Input
                             id="fullName"
                             value={fullName}
                             onChange={(e) => setFullName(e.target.value)}
                             placeholder="Jane Cooper"
                             required
                             className="h-12 rounded-2xl bg-white border-black/5 focus-visible:ring-primary shadow-sm font-semibold"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                           <Input
                             id="username"
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             placeholder="janeco"
                             className="h-12 rounded-2xl bg-white border-black/5 focus-visible:ring-primary shadow-sm font-semibold"
                           />
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</Label>
                     <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@company.com"
                        required
                        className="h-12 rounded-2xl bg-white border-black/5 focus-visible:ring-primary shadow-sm font-semibold"
                     />
                  </div>

                  <div className="space-y-2 text-left">
                     <div className="flex justify-between items-center mb-1">
                        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                        {mode === "login" && <a href="#" className="text-[10px] font-black uppercase text-primary hover:underline">Forgot?</a>}
                     </div>
                     <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-12 rounded-2xl bg-white border-black/5 focus-visible:ring-primary shadow-sm font-semibold"
                     />
                  </div>

                  {mode === "signup" && (
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Where did you find us?</Label>
                           <Select value={heardFrom} onValueChange={setHeardFrom}>
                              <SelectTrigger className="h-12 rounded-2xl bg-white border-black/5 font-semibold">
                                 <SelectValue placeholder="Social Media, Google..." />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="twitter">X / Twitter</SelectItem>
                                 <SelectItem value="google">Google Search</SelectItem>
                                 <SelectItem value="friend">Friend / Colleague</SelectItem>
                                 <SelectItem value="producthunt">Product Hunt</SelectItem>
                                 <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                  )}
               </div>

               <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                  {loading ? "Initializing Brain..." : mode === "login" ? "Sign In" : "Create Account"}
               </Button>
            </form>

            <div className="pt-2 text-center font-bold text-sm text-muted-foreground">
               {mode === "login" ? (
                 <>
                   Don't have an account?{" "}
                   <Link to="/auth/signup" className="text-primary font-black hover:underline underline-offset-4 decoration-2">
                     Sign up free
                   </Link>
                 </>
               ) : (
                 <>
                   Already have an account?{" "}
                   <Link to="/auth/login" className="text-primary font-black hover:underline underline-offset-4 decoration-2">
                     Sign in
                   </Link>
                 </>
               )}
            </div>

            <div className="pt-8 border-t border-black/5 flex justify-center gap-8 grayscale opacity-50">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SOC2 Compliant</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GDPR Ready</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">256-bit AES</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Auth;
