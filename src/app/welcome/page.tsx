import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Sparkles, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute bottom-40 right-32 w-24 h-24 bg-primary-glow/20 rounded-full blur-lg animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-20 w-16 h-16 bg-success-glow/30 rounded-full blur-md animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slideUp">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-glow" />
              <span className="text-white/80 font-medium tracking-wide">
                Creator Coach
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Hey Creator,
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Welcome!
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Ready to turn your TikTok into brand deals? You&apos;re in the
              right place. Think of us as your backstage pass to insights,
              ideas, and opportunities that&apos;ll make sponsors go, "We need
              them!"
            </p>

            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-2xl shadow-glow transform transition-all duration-300 hover:scale-105"
              >
                Let&apos;s get started
              </Button>
            </Link>
          </div>

          {/* Feature cards */}
          <div
            className="grid md:grid-cols-3 gap-6 mt-20 animate-slideUp"
            style={{ animationDelay: "0.3s" }}
          >
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <TrendingUp className="w-12 h-12 text-success-glow mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Personalised Content Analysis
              </h3>
              <p className="text-white/70">
                See what&apos;s working in your TikToks and what could get even
                better
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <Award className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Brand-Ready Recommendations
              </h3>
              <p className="text-white/70">
                Know exactly what brands want and how you can shine for them
              </p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <Users className="w-12 h-12 text-primary-glow mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">
                Idea Inspiration Engine
              </h3>
              <p className="text-white/70">
                Get fresh content ideas tailored to your favourite style and
                growth
              </p>
            </Card>
          </div>

          <div
            className="mt-16 text-white/60 animate-slideUp"
            style={{ animationDelay: "0.6s" }}
          >
            <p className="text-sm">
              You&apos;re on the alpha and your insights can make us better for
              creators like you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
