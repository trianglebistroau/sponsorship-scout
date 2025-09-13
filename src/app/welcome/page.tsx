'use client'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, TrendingUp, Award, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const Welcome = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 bg-primary-glow/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-success-glow/30 rounded-full blur-md animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slideUp">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-glow" />
              <span className="text-white/80 font-medium tracking-wide">Creator Coach</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              From 0 to Brand
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Sponsorships
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              We'll help you build your creator path with personalized insights, content strategies, and direct routes to brand partnerships.
            </p>

            <Button 
              size="lg" 
              onClick={() => router.push('/onboarding')}
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-2xl shadow-glow transform transition-all duration-300 hover:scale-105"
            >
                Start Your Creator Journey
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <TrendingUp className="w-12 h-12 text-success-glow mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Smart Content Strategy</h3>
              <p className="text-white/70">Get personalized video ideas that align with trending topics and brand interests</p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <Award className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Brand Readiness Score</h3>
              <p className="text-white/70">Track your progress and know exactly when you're ready for sponsorships</p>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
              <Users className="w-12 h-12 text-primary-glow mx-auto mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">Creator Persona</h3>
              <p className="text-white/70">Discover your unique creator archetype and leverage your natural strengths</p>
            </Card>
          </div>

          <div className="mt-16 text-white/60 animate-slideUp" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm">Trusted by 10,000+ creators worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;