import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleTheme } from "@/components/ToggleTheme";
import { APP_LOGO, APP_TITLE } from "@/const";
import { CheckCircle2, Zap, Shield, BarChart3, User, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const currentYear = new Date().getFullYear();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const features = [
    {
      icon: CheckCircle2,
      title: "Manajemen Tugas yang Mudah",
      description: "Buat, atur, dan lacak tugas Anda dengan antarmuka yang intuitif",
    },
    {
      icon: Zap,
      title: "Secepat Kilat",
      description: "Nikmati kinerja lancar dan pembaruan instan",
    },
    {
      icon: Shield,
      title: "Aman",
      description: "Data Anda dienkripsi dan dilindungi ",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Analisis",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 select-none cursor-default">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="favicon.png"
              alt={APP_TITLE}
              className="w-8 h-8 rounded-lg object-cover pointer-events-none select-none"
            />
            <span className="font-semibold text-foreground">{APP_TITLE}</span>
          </div>

          <div className="flex items-center gap-3">
            <ToggleTheme />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="cursor-pointer select-none rounded-b-md border border-border/70 text-primary hover:bg-primary/10 bg-transparent px-4 h-10 flex items-center gap-2 shadow-none"
            >
              <User className="w-4 h-4" />
              <span className="font-semibold">Log in</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container relative z-10 py-20 sm:py-32">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Kelola Tugas Anda{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  dengan Elegan
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
                Aplikasi manajemen tugas yang mewah dan intuitif yang dirancang untuk membantu Anda tetap teratur dan produktif.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="cursor-pointer select-none"
              >
                Mulai Explore
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="relative py-20 sm:py-32">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Fitur Canggih</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola tugas secara efisien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 cursor-default"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 pointer-events-none">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <div className="container">
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden">
          <CardContent className="pt-12 pb-12">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                Siap untuk memulai?
              </h2>

              <p className="text-lg text-muted-foreground">
                Bergabunglah dengan ribuan pengguna yang sudah mengelola tugas mereka dengan {APP_TITLE}
              </p>

              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="cursor-pointer select-none gap-2 group"
              >
                Create Your Account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-16 bg-primary text-primary-foreground">
        <div className="container py-4 text-center text-sm font-medium select-none cursor-default">
          © {currentYear} PlanIT. All Rights Reserved
        </div>
      </footer>

    </div>
  );
}
