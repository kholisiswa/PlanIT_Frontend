import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToggleTheme } from "@/components/ToggleTheme";
import { APP_TITLE } from "@/const";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

// =======================
//   REGISTER PAGE (CLEAN)
// =======================

export default function Register() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !authLoading) navigate("/dashboard");
  }, [isAuthenticated, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;
      if (/[^a-zA-Z\d]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert("Semua field wajib diisi!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      await loginMutation.mutateAsync({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      navigate("/dashboard");
    } catch (error: any) {
      alert(error.message || "Registrasi gagal. Coba lagi.");
      setIsSubmitting(false);
    }
  };

  const passwordStrengthColor = {
    0: "bg-muted",
    1: "bg-destructive",
    2: "bg-yellow-500",
    3: "bg-blue-500",
    4: "bg-green-500",
  }[passwordStrength];

  const isLoading =
    isSubmitting ||
    authLoading ||
    registerMutation.isPending ||
    loginMutation.isPending;

  return (
    <div className="min-h-screen w-full bg-background flex flex-col select-none cursor-default">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <img
              src="https://cdn-icons-png.freepik.com/512/8019/8019118.png"
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

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="w-full max-w-md relative z-10 mt-10 select-none cursor-default">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="https://cdn-icons-png.freepik.com/512/8019/8019118.png"
                alt={APP_TITLE}
                className="w-16 h-16 rounded-full shadow-lg object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {APP_TITLE}
            </h1>
            <p className="text-muted-foreground">
              Silakan membuat akun terlebih dahulu
            </p>
          </div>

          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl">Buat Akun</CardTitle>
              <CardDescription>
                Bergabunglah dengan kami dan mulai mengelola tugas Anda secara
                efisien
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* FULL NAME */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    name="name"
                    placeholder=""
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-10 cursor-text select-text"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-10 cursor-text select-text"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    name="password"
                    placeholder=""
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 h-10 cursor-text select-text"
                    disabled={isLoading}
                  />
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 h-1 rounded-full transition-colors ${
                            i < passwordStrength
                              ? passwordStrengthColor
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength <= 1 && "Kata sandi lemah"}
                      {passwordStrength === 2 && "Kata sandi sedang"}
                      {passwordStrength === 3 && "Kata sandi cukup kuat"}
                      {passwordStrength === 4 && "Kata sandi kuat"}
                    </p>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder=""
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 h-10 cursor-text select-text"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* TERMS */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border cursor-pointer mt-0.5"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground select-none cursor-default">
                  I agree to the{" "}
                  <a className="text-primary hover:underline cursor-pointer">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a className="text-primary hover:underline cursor-pointer">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* SUBMIT */}
              <Button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full h-10 gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buat Akun...
                  </>
                ) : (
                  <>
                    Buat Akun
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

              {/* OAUTH */}
              <Button
                variant="outline"
                disabled={isLoading}
                className="w-full h-10 gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.35 11.1h-9.17v2.96h5.27c-.23 1.27-.92 2.35-1.96 3.08v2.57h3.17c1.86-1.71 2.93-4.23 2.93-7.2 0-.62-.06-1.22-.17-1.81z" />
                </svg>
                Sign up with Google
              </Button>
            </CardContent>

            <div className="px-6 py-4 border-t border-border/50 text-center text-sm text-muted-foreground select-none cursor-default">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline cursor-pointer"
              >
                Masuk
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
