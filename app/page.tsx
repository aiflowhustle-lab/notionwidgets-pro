'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, CheckCircle, Image, Filter, RefreshCw, Zap } from 'lucide-react';
import { ConditionalAuthProvider } from '@/lib/auth';

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const features = [
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Smart Galleries",
      description: "Automatically sync your Notion images into beautiful, responsive gallery widgets.",
    },
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      title: "Advanced Filtering",
      description: "Filter and organize your content with powerful tagging and categorization.",
    },
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "Easy Embed",
      description: "Copy and paste a simple code snippet to embed anywhere on the web.",
    },
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      title: "Auto-Sync",
      description: "Changes in your Notion database automatically update your widgets in real-time.",
    },
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Fully Responsive",
      description: "Widgets look perfect on any device, from mobile phones to desktop screens.",
    },
    {
      icon: ({ className }: { className?: string }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      ),
      title: "Customizable",
      description: "Tailor the look and feel to match your brand with extensive styling options.",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-white">
                <span className="font-mono text-xs font-bold text-black">NW</span>
              </div>
              <span className="text-lg font-semibold">NotionWidgets Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={loading || isSigningIn}
                  className="px-6 py-2 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all disabled:opacity-50"
                >
                  {loading || isSigningIn ? 'Signing in...' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-32 pb-20 lg:px-8 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="font-serif text-5xl font-normal leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl text-balance">
            Turn Your Content Planning Chaos <span className="italic">Into Flow</span>
          </h1>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={handleSignIn}
              disabled={loading || isSigningIn}
              className="group bg-white text-base font-medium text-black hover:bg-white/90 h-14 px-9 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading || isSigningIn ? 'Signing in...' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => router.push('/w/demo')}
              className="px-6 py-3 border border-white/20 bg-transparent text-white hover:bg-white hover:text-black transition-all"
            >
              View Demo
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
            <span>Free to start • No credit card required</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10">
                <div className="mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to transform your Notion content?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Join thousands of creators who are already using NotionWidgets Pro to showcase their work.
          </p>
          <div className="mt-8">
            <button
              onClick={handleSignIn}
              disabled={loading || isSigningIn}
              className="group bg-white text-base font-medium text-black hover:bg-white/90 h-14 px-9 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center mx-auto"
            >
              {loading || isSigningIn ? 'Signing in...' : 'Get Started Free'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-white">
                <span className="font-mono text-xs font-bold text-black">NW</span>
              </div>
              <span className="text-sm text-white/60">© 2025 NotionWidgets Pro</span>
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
