"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/applications" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  if (session) {
    router.push("/applications");
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="float-bg float-bg-1" />
      <div className="float-bg float-bg-2" />
      <div className="float-bg float-bg-3" />

      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">JobFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-text-secondary hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-text-secondary hover:text-white transition-colors">
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-text-secondary hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-stagger">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                  <span className="w-2 h-2 rounded-full bg-accent-tertiary animate-pulse" />
                  <span className="text-sm text-text-secondary">Now with AI-powered resume tailoring</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  Track Your <br />
                  <span className="gradient-text">Career Journey</span>
                </h1>

                <p className="text-xl text-text-secondary mb-10 max-w-lg leading-relaxed">
                  The premium job application tracker that helps you organize, tailor, and land your dream role with AI-powered tools.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/register" className="btn-primary text-lg px-8 py-4">
                    Start Free Trial
                  </Link>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="btn-secondary text-lg px-8 py-4 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLoading ? "Signing in..." : "Sign up with Google"}
                  </button>
                </div>

                <div className="flex items-center gap-8 mt-12 text-text-secondary">
                  <div>
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-sm">Jobs Tracked</div>
                  </div>
                  <div className="w-px h-12 bg-glass-border" />
                  <div>
                    <div className="text-3xl font-bold text-white">98%</div>
                    <div className="text-sm">Satisfaction</div>
                  </div>
                  <div className="w-px h-12 bg-glass-border" />
                  <div>
                    <div className="text-3xl font-bold text-white">24/7</div>
                    <div className="text-sm">AI Assistant</div>
                  </div>
                </div>
              </div>

              <div className="relative animate-stagger">
                <div className="glass-card p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary rounded-full blur-3xl opacity-20" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-tertiary rounded-full blur-3xl opacity-20" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-accent-gradient flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Application Dashboard</div>
                        <div className="text-sm text-text-secondary">Real-time tracking</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="glass p-4 rounded-xl">
                        <div className="text-3xl font-bold gradient-text">47</div>
                        <div className="text-sm text-text-secondary">Total Applications</div>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <div className="text-3xl font-bold text-accent-tertiary">12</div>
                        <div className="text-sm text-text-secondary">Interviews</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { company: "Stripe", position: "Senior Engineer", status: "interview", color: "accent-tertiary" },
                        { company: "Vercel", position: "Full Stack Developer", status: "applied", color: "accent-primary" },
                        { company: "Linear", position: "Product Engineer", status: "offer", color: "success" },
                      ].map((job, i) => (
                        <div key={i} className="glass p-4 rounded-xl flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-${job.color} bg-opacity-20 flex items-center justify-center text-sm font-bold text-${job.color}`}>
                            {job.company[0]}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{job.position}</div>
                            <div className="text-sm text-text-secondary">{job.company}</div>
                          </div>
                          <span className={`status-badge status-${job.status}`}>
                            {job.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 glass-card p-4 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">AI Match: 94%</div>
                      <div className="text-sm text-text-secondary">Resume optimized</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-stagger">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need to <span className="gradient-text">Succeed</span>
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Powerful features designed to streamline your job search and maximize your chances of landing the perfect role.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 animate-stagger">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                  title: "Smart Tracking",
                  description: "Organize all your applications with status tracking, notes, contacts, and timeline history.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "AI Resume Tailoring",
                  description: "Let AI analyze job descriptions and optimize your resume for maximum impact.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  ),
                  title: "Cover Letter Generator",
                  description: "Generate compelling, personalized cover letters with AI assistance.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: "PDF Export",
                  description: "Download your tailored resume and cover letter as professional PDFs instantly.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                  title: "Team Collaboration",
                  description: "Create an account and share access with your spouse or career coach.",
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Lightning Fast",
                  description: "Built with modern tech for instant responses and seamless experience.",
                },
              ].map((feature, i) => (
                <div key={i} className="glass-card p-8 group">
                  <div className="w-14 h-14 rounded-2xl bg-accent-gradient flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-stagger">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Simple, Transparent <span className="gradient-text">Pricing</span>
              </h2>
              <p className="text-xl text-text-secondary">
                Start free, upgrade when you need more power.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-stagger">
              <div className="glass-card p-8">
                <div className="text-lg text-text-secondary mb-2">Free</div>
                <div className="text-5xl font-bold mb-6">
                  $0<span className="text-lg text-text-secondary font-normal">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Up to 50 applications", "Basic AI resume tailoring", "1 resume upload", "Email support"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-secondary">
                      <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-secondary w-full text-center block">
                  Get Started
                </Link>
              </div>

              <div className="glass-card p-8 relative overflow-hidden gradient-border">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accent-gradient text-sm font-semibold text-white">
                  Recommended
                </div>
                <div className="text-lg text-text-secondary mb-2">Pro</div>
                <div className="text-5xl font-bold mb-6">
                  $12<span className="text-lg text-text-secondary font-normal">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {["Unlimited applications", "Advanced AI with Nvidia NIMs", "5 resume uploads", "Priority support", "Team collaboration (up to 3)", "Custom cover letter templates"].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-text-secondary">
                      <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-primary w-full text-center block">
                  Start 14-day Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-stagger">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Loved by <span className="gradient-text">Job Seekers</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 animate-stagger">
              {[
                {
                  name: "Sarah Chen",
                  role: "Software Engineer at Google",
                  content: "JobFlow helped me stay organized during my job search. The AI tailoring feature landed me 3x more interviews!",
                },
                {
                  name: "Michael Torres",
                  role: "Product Manager at Meta",
                  content: "Finally, a job tracker that doesn't look like a spreadsheet. Beautiful design and powerful features combined.",
                },
                {
                  name: "Emily Watson",
                  role: "UX Designer at Figma",
                  content: "The cover letter generator saved me hours. It felt like having a personal career coach on call 24/7.",
                },
              ].map((testimonial, i) => (
                <div key={i} className="glass-card p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-text-secondary mb-6 leading-relaxed">{testimonial.content}</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-text-tertiary">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center animate-stagger">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Land Your <span className="gradient-text">Dream Job</span>?
            </h2>
            <p className="text-xl text-text-secondary mb-10">
              Join thousands of professionals who trust JobFlow to manage their career journey.
            </p>
            <Link href="/register" className="btn-primary text-lg px-10 py-5 inline-block">
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-glass-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-gradient flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold gradient-text">JobFlow</span>
          </div>

          <div className="flex items-center gap-8 text-text-secondary text-sm">
            <span>2024 JobFlow. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}