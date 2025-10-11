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
