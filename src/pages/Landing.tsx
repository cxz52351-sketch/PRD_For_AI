import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  CheckCircle,
  MessageCircle,
  Chrome,
  Globe,
  Lightbulb,
  Target,
  Star
} from "lucide-react";
import { useTranslation } from "@/lib/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function FontLoader() {
  return (
    <style>{`
      /* === Premium Typography & Advanced Styling === */
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&display=swap');
      
      .font-display { 
        font-family: 'Playfair Display', Georgia, serif;
        letter-spacing: -0.02em; 
        font-weight: 600;
        line-height: 1.2;
      }
      
      .font-sans-premium {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        letter-spacing: -0.01em;
      }
      
      .brand-logo { 
        font-family: 'Inter', system-ui, sans-serif; 
        letter-spacing: -0.025em; 
        font-weight: 800;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #d946ef 50%, #ec4899 75%, #f472b6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 400% 400%;
        animation: gradient-shift 6s ease-in-out infinite;
      }
      
      @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      .glass-effect {
        backdrop-filter: blur(20px) saturate(180%);
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      }
      
      .mesh-gradient {
        background: 
          radial-gradient(at 40% 20%, hsla(292,100%,80%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 0%, hsla(324,100%,85%,0.3) 0px, transparent 50%),
          radial-gradient(at 0% 50%, hsla(340,100%,88%,0.4) 0px, transparent 50%),
          radial-gradient(at 80% 50%, hsla(315,100%,76%,0.5) 0px, transparent 50%),
          radial-gradient(at 0% 100%, hsla(270,100%,82%,0.3) 0px, transparent 50%),
          radial-gradient(at 80% 100%, hsla(300,100%,78%,0.4) 0px, transparent 50%),
          radial-gradient(at 0% 0%, hsla(330,100%,80%,0.4) 0px, transparent 50%),
          linear-gradient(135deg, #f8f5ff 0%, #ede4ff 100%);
      }
      
      .premium-shadow {
        box-shadow: 
          0 0 0 1px rgba(255, 255, 255, 0.05),
          0 4px 6px -1px rgba(0, 0, 0, 0.1), 
          0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 10px 15px -3px rgba(0, 0, 0, 0.1);
      }
      
      .hover-lift {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .hover-lift:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      }
      
      .premium-button {
        background: linear-gradient(135deg, #E9B6D4 0%, #B688CC 50%, #9A6FB8 100%);
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
        color: white;
        box-shadow: 0 4px 12px rgba(182, 136, 204, 0.3);
      }
      
      .premium-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        transition: left 0.6s;
      }
      
      .premium-button:hover::before {
        left: 100%;
      }
      
      .premium-button:hover {
        background: linear-gradient(135deg, #D4A2C7 0%, #A876BA 50%, #8B5FA5 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(182, 136, 204, 0.5);
        color: white;
      }
      
      .floating-orb {
        position: absolute;
        border-radius: 50%;
        opacity: 0.7;
        animation: float 6s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      .sophisticated-card {
        background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 
          0 8px 32px rgba(31, 38, 135, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
      }
    `}</style>
  );
}

const Landing = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-aurora font-sans-premium text-slate-900 antialiased relative overflow-hidden">
      <FontLoader />

      {/* Floating background elements */}
      <div className="floating-orb w-72 h-72 bg-gradient-to-r from-purple-400/40 to-pink-400/40 top-10 -left-20 blur-3xl" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 top-1/3 -right-32 blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bg-gradient-to-r from-violet-300/35 to-fuchsia-300/35 bottom-1/4 -left-40 blur-3xl" style={{ animationDelay: '4s' }} />

      <header className="sticky top-0 z-40 glass-effect">
        <nav className="mx-auto max-w-7xl flex items-center justify-between py-4 px-0">
          {/* 左侧：Logo + 品牌名 - 靠左边界 */}
          <Link to="/" className="flex items-center gap-3 group pl-2 sm:pl-3 lg:pl-4" aria-label="PRD For AI">
            <img src="/logo-prd-for-ai.svg" alt="PRD For AI Logo" className="h-10 w-10 hover-lift" />
            <span className="brand-logo text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">PRD For AI</span>
          </Link>

          {/* 中间：导航链接 - 聚集在页面正中间 */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              {t.nav.features}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              {t.nav.testimonials}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              {t.nav.howItWorks}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          {/* 右侧：语言切换器 + 登录 + 注册按钮 - 靠右边界 */}
          <div className="hidden lg:flex items-center gap-4 pr-0">
            <LanguageSwitcher />
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t.common.login}</Link>
            <Link
              to="/register"
              className="premium-button inline-flex items-center justify-center rounded-xl py-2.5 px-6 text-sm font-semibold text-white"
            >
              {t.landing.hero.cta}
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <LanguageSwitcher showText={false} />
            <Link to="/login" className="text-sm font-medium text-slate-600">{t.common.login}</Link>
            <Link
              to="/register"
              className="premium-button inline-flex items-center justify-center rounded-xl py-2 px-4 text-sm font-semibold text-white"
            >
              {t.common.register}
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-6 sm:px-8 lg:px-10" aria-label="Hero">
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 mb-8 glass-effect rounded-full text-sm font-medium text-slate-700 premium-shadow">
                <Sparkles className="w-4 h-4 text-indigo-500 mr-2" />
                {t.landing.hero.badge}
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">
                  {t.landing.hero.title.includes('？')
                    ? t.landing.hero.title.split('？')[0] + '？'
                    : t.landing.hero.title.split('?')[0] + '?'
                  }
                </span>
                <br />
                <span className="text-slate-900">
                  {t.landing.hero.title.includes('？')
                    ? t.landing.hero.title.split('？')[1]
                    : t.landing.hero.title.split('?')[1]
                  }
                </span>
              </h1>

              <p className="mx-auto max-w-3xl text-xl text-slate-600 mb-8 leading-relaxed">
                {t.landing.hero.description}
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-indigo-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.landing.hero.features.feature1}
                </div>
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-purple-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.landing.hero.features.feature2}
                </div>
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-pink-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t.landing.hero.features.feature3}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  to="/register"
                  className="premium-button group inline-flex items-center justify-center rounded-2xl py-4 px-8 text-lg font-semibold text-white hover-lift"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.landing.hero.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="text-sm text-slate-500">{t.landing.hero.noCreditCard}</div>
            </div>

            {/* Product Demo */}
            <div className="relative mt-20">
              <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                  <div className="mb-6 flex items-center">
                    <Globe className="h-6 w-6 text-indigo-600 mr-3" />
                    <span className="font-semibold text-lg">{t.landing.hero.webVersion}</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                      <p className="text-slate-600">{t.landing.hero.multimodalInput}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                  <div className="mb-6 flex items-center">
                    <Chrome className="h-6 w-6 text-purple-600 mr-3" />
                    <span className="font-semibold text-lg">{t.landing.hero.chromeExtension}</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center border border-purple-100">
                    <div className="text-center">
                      <Target className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-slate-600">{t.landing.hero.anyWebpageOneClick}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <div className="relative py-16 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 gradient-text">{t.landing.hero.subtitle}</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">{t.landing.hero.breakBarriers}</p>
        </div>

        {/* Features */}
        <section id="features" className="py-20 px-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-base font-semibold text-indigo-600 mb-2">{t.landing.features.subtitle}</h2>
              <p className="font-display text-4xl font-bold text-slate-900 mb-6">{t.landing.features.title}</p>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">{t.landing.features.description}</p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 mr-4 mt-1">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{t.landing.features.list.multimodal.title}</h3>
                    <p className="text-slate-600">{t.landing.features.list.multimodal.description}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 mr-4 mt-1">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{t.landing.features.list.aiGuided.title}</h3>
                    <p className="text-slate-600">{t.landing.features.list.aiGuided.description}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{t.landing.features.list.realTimeEdit.title}</h3>
                    <p className="text-slate-600">{t.landing.features.list.realTimeEdit.description}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 mr-4 mt-1">
                    <Chrome className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{t.landing.features.list.chromeExtension.title}</h3>
                    <p className="text-slate-600">{t.landing.features.list.chromeExtension.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-effect rounded-3xl p-8 premium-shadow hover-lift">
                <div className="aspect-square bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <div className="text-center">
                    <Zap className="h-20 w-20 mx-auto mb-6 text-indigo-500" />
                    <p className="text-xl font-semibold text-slate-700">{t.landing.hero.aiMultimodalAnalysis}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12" />

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-6 sm:px-8 lg:px-10 bg-gradient-to-r from-slate-50 to-indigo-50">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold mb-4 gradient-text">{t.landing.testimonials.title}</h2>
              <p className="text-xl text-slate-600">{t.landing.testimonials.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{t.landing.testimonials.reviews.review1.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{t.landing.testimonials.reviews.review1.author.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t.landing.testimonials.reviews.review1.author}</div>
                    <div className="text-sm text-slate-500">{t.landing.testimonials.reviews.review1.role}</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{t.landing.testimonials.reviews.review2.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{t.landing.testimonials.reviews.review2.author.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t.landing.testimonials.reviews.review2.author}</div>
                    <div className="text-sm text-slate-500">{t.landing.testimonials.reviews.review2.role}</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{t.landing.testimonials.reviews.review3.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">{t.landing.testimonials.reviews.review3.author.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{t.landing.testimonials.reviews.review3.author}</div>
                    <div className="text-sm text-slate-500">{t.landing.testimonials.reviews.review3.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Quote */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6 grid xl:grid-cols-2 gap-10 items-start">
            <div className="w-full">
              <div className="relative rounded-xl border border-gray-200 overflow-hidden aspect-video bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <p className="text-lg text-gray-700">{t.landing.hero.productDemoVideo}</p>
                  </div>
                </div>
              </div>
            </div>
            <figure className="relative">
              <blockquote className="text-lg sm:text-xl text-gray-900 pt-2">
                <p>
                  {t.landing.hero.testimonial1}
                  <br />
                  <br />
                  {t.landing.hero.testimonial2}
                  <br />
                  <br />
                  {t.landing.hero.testimonial3}
                </p>
              </blockquote>
              <figcaption className="mt-6">
                <div className="font-semibold text-gray-900">{t.landing.hero.zhaoMeili}</div>
                <div className="text-gray-600">{t.landing.hero.chiefProductManager}</div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="bg-slate-900 py-20">
          <div className="mx-auto max-w-4xl text-center px-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              {t.landing.hero.become10XProductManager.replace('10X', '').trim()}
              <span className="gradient-text">10X</span>
              {t.landing.hero.become10XProductManager.split('10X')[1]}
              <br />
              {t.landing.hero.justNeedPrice.split('{price}')[0]}
              <span className="gradient-text">{t.landing.hero.justFewCupsCoffee}</span>
              {t.landing.hero.justNeedPrice.split('{price}')[1]}
            </h2>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-300">
              {t.landing.hero.weMakePRDAffordable}
            </p>
            <div className="mt-12">
              <Link
                to="/register"
                className="premium-button inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white hover-lift"
              >
                {t.landing.hero.registerNow}
              </Link>
            </div>
          </div>
        </section>

        {/* Everything You Need */}
        <section className="py-16 border-t">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-base font-semibold text-indigo-600">{t.landing.hero.whyChoosePRD}</h2>
            <p className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-6">{t.landing.hero.aiWorksForYou}</p>
            <p className="text-lg mb-12">{t.landing.hero.prdCustomizedForYou}</p>
          </div>
          <div className="relative overflow-hidden pt-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="glass-effect rounded-xl premium-shadow w-full aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-20 w-20 text-indigo-500 mx-auto mb-4" />
                  <p className="text-xl text-gray-700">{t.landing.hero.productFeatureScreenshots}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bullets */}
        <section className="py-6">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.aiMultimodalAnalysis}。</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.combineWebpageCode}</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.dataSecurityPrivacy}</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.allDataOnlyForProcessing}</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.customConfiguration}</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.saveCompanyRoleInfo}</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.customDocumentTemplates}</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.useYourOwnTemplates}</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.onlineCustomerService}</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.ourTeamAndCommunity}</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">{t.landing.hero.teamAccount}</dt>{' '}
                <dd className="inline text-gray-700">{t.landing.hero.centralizedBilling}</dd>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">{t.landing.howItWorks.title}</h2>
              <p className="text-xl text-slate-600">{t.landing.howItWorks.subtitle}</p>
            </div>

            <div className="space-y-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl premium-shadow">
                    1
                  </div>
                </div>
                <div className="flex-1 lg:text-left text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.landing.howItWorks.steps.step1.title}</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {t.landing.howItWorks.steps.step1.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {t.landing.howItWorks.steps.step1.tags.map((tag, index) => (
                      <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl premium-shadow">
                    2
                  </div>
                </div>
                <div className="flex-1 lg:text-left text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.landing.howItWorks.steps.step2.title}</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {t.landing.howItWorks.steps.step2.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {t.landing.howItWorks.steps.step2.tags.map((tag, index) => (
                      <span key={index} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl premium-shadow">
                    3
                  </div>
                </div>
                <div className="flex-1 lg:text-left text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{t.landing.howItWorks.steps.step3.title}</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {t.landing.howItWorks.steps.step3.description}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    {t.landing.howItWorks.steps.step3.tags.map((tag, index) => (
                      <span key={index} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {t.landing.cta.title}
            </h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              {t.landing.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="premium-button group inline-flex items-center justify-center rounded-2xl py-3 px-6 text-lg font-semibold text-white hover-lift"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t.landing.cta.button}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="text-sm text-slate-600">
              {t.landing.cta.benefits}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo-prd-for-ai.svg" alt="PRD For AI Logo" className="h-10 w-10" />
            <span className="brand-logo text-xl text-slate-900">PRD For AI</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm mb-12">
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">{t.landing.footer.sections.product.title}</h4>
              <ul className="space-y-3 text-slate-600">
                {t.landing.footer.sections.product.links.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-slate-900 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">{t.landing.footer.sections.support.title}</h4>
              <ul className="space-y-3 text-slate-600">
                {t.landing.footer.sections.support.links.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-slate-900 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">{t.landing.footer.sections.company.title}</h4>
              <ul className="space-y-3 text-slate-600">
                {t.landing.footer.sections.company.links.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-slate-900 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">{t.landing.footer.sections.resources.title}</h4>
              <ul className="space-y-3 text-slate-600">
                {t.landing.footer.sections.resources.links.map((link, index) => (
                  <li key={index}><a href="#" className="hover:text-slate-900 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-slate-500">{t.landing.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;