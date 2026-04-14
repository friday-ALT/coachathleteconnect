import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Search, Star, Trophy, User, Loader2, ArrowRight, CheckCircle, Sparkles, Target, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import yassineImage from "@assets/IMG_8811_1766408856173.jpeg";

const stats = [
  { value: "500+", label: "Athletes Trained", icon: Users },
  { value: "50+", label: "Expert Coaches", icon: Trophy },
  { value: "4.9", label: "Average Rating", icon: Star },
  { value: "24/7", label: "Support Available", icon: Shield },
];

const features = [
  {
    icon: Search,
    title: "Smart Coach Discovery",
    description: "Find coaches by location, skill level, specialties, and availability. AI-powered matching for perfect fits."
  },
  {
    icon: Calendar,
    title: "Seamless Scheduling",
    description: "Book sessions in seconds. Real-time availability, instant confirmations, and smart reminders."
  },
  {
    icon: Target,
    title: "Personalized Training",
    description: "Tailored sessions for your goals. Track progress and get actionable feedback from experts."
  },
  {
    icon: Star,
    title: "Verified Reviews",
    description: "Trust transparent ratings from real athletes. Every review is from a completed session."
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    setActiveRole, 
    hasAthleteProfile, 
    hasCoachProfile, 
    activeRole,
    isLoading: roleLoading
  } = useRole();
  const [, setLocation] = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Redirect unauthenticated users to Welcome screen
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/welcome");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (!authLoading && !roleLoading && isAuthenticated && activeRole) {
      if (activeRole === "athlete") {
        setLocation("/athlete/dashboard");
      } else if (activeRole === "coach") {
        setLocation("/coach/dashboard");
      }
    }
  }, [authLoading, roleLoading, isAuthenticated, activeRole, setLocation]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleAthleteClick = async () => {
    if (isAuthenticated && hasAthleteProfile) {
      await setActiveRole("athlete");
      setLocation("/athlete/dashboard");
    } else if (isAuthenticated) {
      setLocation("/auth/onboarding/athlete/step1");
    } else {
      setLocation("/auth/signup");
    }
  };

  const handleCoachClick = async () => {
    if (isAuthenticated && hasCoachProfile) {
      await setActiveRole("coach");
      setLocation("/coach/dashboard");
    } else if (isAuthenticated) {
      setLocation("/auth/onboarding/coach/step1");
    } else {
      setLocation("/auth/signup");
    }
  };

  const isLoading = authLoading || roleLoading;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.15), transparent 40%)`
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-24 lg:pb-32">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">The #1 Platform for Soccer Training</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={fadeInUp}
              className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Connect with
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
                Elite Soccer Coaches
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="mb-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              The modern marketplace connecting ambitious athletes with expert coaches. 
              Book personalized training sessions and unlock your full potential.
            </motion.p>
            
            {/* CTA Buttons */}
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="min-h-12 px-8 text-base font-semibold group"
                  onClick={handleAthleteClick}
                  data-testid="button-athlete-mode"
                >
                  {isAuthenticated && hasAthleteProfile ? "Enter as Athlete" : "I'm an Athlete"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-12 px-8 text-base font-semibold group"
                  onClick={handleCoachClick}
                  data-testid="button-coach-mode"
                >
                  {isAuthenticated && hasCoachProfile ? "Enter as Coach" : "I'm a Coach"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div 
              variants={fadeInUp}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Verified Coaches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Satisfaction Guaranteed</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-y border-border/50 bg-muted/30" data-testid="section-stats">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1" data-testid={`text-stat-value-${index}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works - Two Sides */}
      <section className="py-16 md:py-24" data-testid="section-how-it-works">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-how-it-works">
              Built for Both Sides
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're looking to train or teach, CoachConnect has you covered.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Athletes Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden h-full bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-blue-200/50 dark:border-blue-800/50" data-testid="card-for-athletes">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <CardContent className="p-8 relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-blue-500/10">
                    <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Athletes</h3>
                  <p className="text-muted-foreground mb-6">
                    Find your perfect coach and level up your game with personalized training.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Browse coaches by location & skill", "Book sessions with real-time availability", "Track progress & leave reviews"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20">
                          <CheckCircle className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAthleteClick}
                    data-testid="button-for-athletes"
                  >
                    {isAuthenticated && hasAthleteProfile ? "Go to Dashboard" : "Find a Coach"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coaches Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="relative overflow-hidden h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" data-testid="card-for-coaches">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <CardContent className="p-8 relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-primary/10">
                    <Trophy className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">For Coaches</h3>
                  <p className="text-muted-foreground mb-6">
                    Get discovered by athletes and grow your coaching business.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {["Create your professional profile", "Manage bookings & availability", "Build your reputation with reviews"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                          <CheckCircle className="h-3 w-3 text-primary" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={handleCoachClick}
                    data-testid="button-for-coaches"
                  >
                    {isAuthenticated && hasCoachProfile ? "Go to Dashboard" : "Start Coaching"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-muted/30" data-testid="section-features">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-features">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed to make training sessions seamless.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-elevate transition-all duration-300" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 md:py-24" data-testid="section-founder">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-founder">
              Meet the Founder
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built by athletes, for athletes.
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden" data-testid="card-founder">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-muted/50">
                    <div className="aspect-square md:aspect-auto md:h-full">
                      <img 
                        src={yassineImage} 
                        alt="Yassine Rhoumar" 
                        className="w-full h-full object-cover"
                        data-testid="img-founder"
                      />
                    </div>
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-2" data-testid="text-founder-name">Yassine Rhoumar</h3>
                    <p className="text-sm text-primary font-medium mb-4" data-testid="text-founder-role">Founder & CEO</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Built from the perspective of a Division I athlete with experience in the DC United system, 
                      CoachConnect was created to give back to the game by connecting players with trusted coaches 
                      nationwide. Our mission is to empower athletes through technical excellence, mentorship, 
                      and access to high-level training—wherever they play.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden" data-testid="section-cta">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-chart-2/5" />
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="heading-cta">
              Ready to Level Up?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join hundreds of athletes and coaches already using CoachConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" variant="outline" className="min-h-12 px-8" data-testid="button-browse-coaches">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Coaches
                </Button>
              </Link>
              <Button 
                size="lg" 
                className="min-h-12 px-8"
                onClick={() => setLocation("/auth/signup")}
                data-testid="button-get-started"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">CoachConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CoachConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
