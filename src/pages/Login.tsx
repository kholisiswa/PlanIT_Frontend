import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleTheme } from "@/components/ToggleTheme";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";

// =======================
// NAVBAR COMPONENT
// =======================
function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 select-none cursor-default">
      <div className="container h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <img
            src="favicon.png"
            alt={APP_TITLE}
            className="w-8 h-8 rounded-lg object-cover select-none"
          />
          <span className="font-semibold text-foreground select-none cursor-default">
            {APP_TITLE}
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <ToggleTheme />
        </div>
      </div>
    </nav>
  );
}

// =======================
// LOGIN PAGE
// =======================
export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  // @ts-ignore
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // @ts-ignore
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Login berhasil! Sedang memeriksa sesi...");

      const user = await utils.auth.me.fetch();

      if (user) {
        toast.success("Selamat datang kembali, " + user.name + "!");
      } else {
        toast.error("Gagal memuat data pengguna");
      }
    },
  });

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {}
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar />

      {/* MAIN PAGE */}
      <div className="min-h-screen w-full bg-linear-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4 relative overflow-hidden pt-28 select-none cursor-default">

        {/* BG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Content */}
        <div className="w-full max-w-md relative z-10">

          {/* Logo & Title */}
          <div className="text-center mb-8 select-none cursor-default">
            <div className="flex justify-center mb-4">
              <img
                src="favicon.png"
                alt={APP_TITLE}
                className="w-8 h-8 rounded-full shadow-lg object-cover select-none"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {APP_TITLE}
            </h1>
            <p className="text-muted-foreground">Masuk ke akun Anda</p>
          </div>

          {/* Login Card */}
          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="gap-1">
              <CardTitle className="text-2xl select-none cursor-default">
                Selamat Datang Kembali
              </CardTitle>
              <CardDescription className="select-none cursor-default">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email-address"
                  className="text-sm font-medium text-foreground select-none cursor-default"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email-address"
                    type="email"
                    placeholder=""
                    className="pl-10 h-10"
                    disabled={loading || isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground select-none cursor-default"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    className="pl-10 h-10"
                    disabled={loading || isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember me */}
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded border-border"
                  disabled={loading || isSubmitting}
                />
                <span className="text-sm text-muted-foreground">
                  Ingatkan Saya
                </span>
              </label>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={loading || isSubmitting}
                className="w-full h-10 gap-2 group cursor-pointer select-none"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative select-none cursor-default">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Atau Dengan
                  </span>
                </div>
              </div>

              {/* OAuth */}
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                disabled={loading || isSubmitting}
                className="w-full h-10 gap-2 cursor-pointer select-none"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12s5.374 12 12 12 12-5.373 12-12-5.374-12-12-12zm6.21 18.046c-3.52 1.15-7.412 1.15-10.932 0-1.02-.334-1.678-1.32-1.678-2.42v-1.5c0-.552.448-1 1-1h15c.552 0 1 .448 1 1v1.5c0 1.1-.658 2.086-1.678 2.42zM12 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z" fill="#4285F4" />
                </svg>
                Sign in with Google
              </Button>
            </CardContent>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border/50 text-center text-sm text-muted-foreground select-none cursor-default">
              Belum Punya Akun?{" "}
              <a href="/register" className="text-primary hover:underline cursor-pointer">
                Buat
              </a>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
