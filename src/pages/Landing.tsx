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
  return (
    <div className="min-h-screen w-full bg-aurora font-sans-premium text-slate-900 antialiased relative overflow-hidden">
      <FontLoader />

      {/* Floating background elements */}
      <div className="floating-orb w-72 h-72 bg-gradient-to-r from-purple-400/40 to-pink-400/40 top-10 -left-20 blur-3xl" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-96 h-96 bg-gradient-to-r from-purple-300/30 to-pink-300/30 top-1/3 -right-32 blur-3xl" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-80 h-80 bg-gradient-to-r from-violet-300/35 to-fuchsia-300/35 bottom-1/4 -left-40 blur-3xl" style={{ animationDelay: '4s' }} />

      <header className="sticky top-0 z-40 glass-effect">
        <nav className="mx-auto max-w-7xl flex items-center justify-between py-4 px-6 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3 group" aria-label="PRD For AI">
            <img src="/logo-prd-for-ai.svg" alt="PRD For AI Logo" className="h-10 w-10 hover-lift" />
            <span className="brand-logo text-xl text-slate-900 group-hover:text-indigo-600 transition-colors">PRD For AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              功能特性
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              用户评价
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors relative group">
              工作原理
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">登录</Link>
            <Link
              to="/register"
              className="premium-button inline-flex items-center justify-center rounded-xl py-2.5 px-6 text-sm font-semibold text-white"
            >
              立即注册，免费试用
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-600">登录</Link>
            <Link
              to="/register"
              className="premium-button inline-flex items-center justify-center rounded-xl py-2 px-4 text-sm font-semibold text-white"
            >
              注册
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
                PRD For AI，你的产品加速器
              </div>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="gradient-text">
                  想法一闪而过？
                </span>
                <br />让AI帮你立刻落地
              </h1>

              <p className="mx-auto max-w-3xl text-xl text-slate-600 mb-8 leading-relaxed">
                无论你是产品经理、AI产品经理、独立开发者还是设计师，只需一句话或一个网页，即可生成专业的 PRD 文档。
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-indigo-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  30秒生成专业PRD
                </div>
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-purple-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  支持多模态输入
                </div>
                <div className="flex items-center px-4 py-2 glass-effect rounded-full text-pink-700 premium-shadow">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Chrome插件+Web版
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link
                  to="/register"
                  className="premium-button group inline-flex items-center justify-center rounded-2xl py-4 px-8 text-lg font-semibold text-white hover-lift"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即注册，免费试用
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="text-sm text-slate-500">只需30秒 · 无需信用卡</div>
            </div>

            {/* Product Demo */}
            <div className="relative mt-20">
              <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                  <div className="mb-6 flex items-center">
                    <Globe className="h-6 w-6 text-indigo-600 mr-3" />
                    <span className="font-semibold text-lg">Web版 - AI对话生成</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border border-indigo-100">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                      <p className="text-slate-600">支持文字、图片等多模态输入</p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                  <div className="mb-6 flex items-center">
                    <Chrome className="h-6 w-6 text-purple-600 mr-3" />
                    <span className="font-semibold text-lg">Chrome插件 - 一键分析</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center border border-purple-100">
                    <div className="text-center">
                      <Target className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <p className="text-slate-600">任意网页一键生成PRD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <div className="relative py-16 px-6 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 gradient-text">解放创造力，专注核心价值</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">打破传统文档创作壁垒，让每个人都能轻松将想法转化为专业PRD</p>
        </div>

        {/* Features */}
        <section id="features" className="py-20 px-6 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-base font-semibold text-indigo-600 mb-2">AI产品经理助手</h2>
              <p className="font-display text-4xl font-bold text-slate-900 mb-6">解放你的大脑，专注创意</p>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">告别繁琐的文档工作。只需用自然语言描述你的想法，PRD For AI 就能为你自动生成结构化、可编辑的 PRD 文档。</p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 mr-4 mt-1">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">支持多模态输入</h3>
                    <p className="text-slate-600">支持文字、图片多模态输入</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 mr-4 mt-1">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">AI引导式需求挖掘</h3>
                    <p className="text-slate-600">AI引导式需求挖掘</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 mr-4 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">实时可视化编辑</h3>
                    <p className="text-slate-600">实时可视化编辑</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 mr-4 mt-1">
                    <Chrome className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Chrome插件支持</h3>
                    <p className="text-slate-600">任意网页一键生成PRD</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-effect rounded-3xl p-8 premium-shadow hover-lift">
                <div className="aspect-square bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <div className="text-center">
                    <Zap className="h-20 w-20 mx-auto mb-6 text-indigo-500" />
                    <p className="text-xl font-semibold text-slate-700">AI 多模态分析</p>
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
              <h2 className="font-display text-4xl font-bold mb-4 gradient-text">用户都在说什么</h2>
              <p className="text-xl text-slate-600">数千位产品经理、开发者、设计师的真实反馈</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"用了 PRD For AI，我编写文档的时间减少了80%！特别是Chrome插件功能，分析竞品网站太方便了。"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">李</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">李明</div>
                    <div className="text-sm text-slate-500">产品经理</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"这简直是产品经理的秘密武器！AI生成的PRD结构清晰，而且可以直接编辑，太实用了。"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">王</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">王晓</div>
                    <div className="text-sm text-slate-500">创业者</div>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-8 premium-shadow hover-lift">
                <div className="flex items-center space-x-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"作为开发者，我用它来快速理解产品需求。特别喜欢多模态输入，上传个截图就能生成对应的PRD。"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white font-bold">张</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">张伟</div>
                    <div className="text-sm text-slate-500">前端开发</div>
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
                    <p className="text-lg text-gray-700">产品演示视频</p>
                  </div>
                </div>
              </div>
            </div>
            <figure className="relative">
              <blockquote className="text-lg sm:text-xl text-gray-900 pt-2">
                <p>
                  我不敢相信 PRD For AI 能制作如此出色的 PRD。我很震惊。这是一个游戏规则改变者。
                  <br />
                  <br />
                  我对AI文档听起来不够人性化持怀疑态度。PRD For AI 改变了一切。
                  <br />
                  <br />
                  这真的感觉像魔法。
                </p>
              </blockquote>
              <figcaption className="mt-6">
                <div className="font-semibold text-gray-900">赵美丽</div>
                <div className="text-gray-600">首席产品经理</div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="bg-slate-900 py-20">
          <div className="mx-auto max-w-4xl text-center px-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              成为 <span className="gradient-text">10x</span> 产品经理。
              <br />
              只需 <span className="gradient-text">每月几杯咖啡</span> 的价格。
            </h2>
            <p className="mt-8 max-w-2xl mx-auto text-xl text-slate-300">
              我们让 PRD For AI 变得经济实惠，让从工程师到创始人到CPO的每个人都能从AI产品经理中受益。
            </p>
            <div className="mt-12">
              <Link
                to="/register"
                className="premium-button inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg font-semibold text-white hover-lift"
              >
                立即注册
              </Link>
            </div>
          </div>
        </section>

        {/* Everything You Need */}
        <section className="py-16 border-t">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-base font-semibold text-indigo-600">为什么选择 PRD For AI？</h2>
            <p className="font-display text-3xl sm:text-4xl font-bold mt-2 mb-6">AI 为你和你的团队工作</p>
            <p className="text-lg mb-12">PRD For AI 针对你的角色、公司和团队进行了定制，因此你可以在几分钟内获得高质量的产品输出。</p>
          </div>
          <div className="relative overflow-hidden pt-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="glass-effect rounded-xl premium-shadow w-full aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-20 w-20 text-indigo-500 mx-auto mb-4" />
                  <p className="text-xl text-gray-700">产品功能截图</p>
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
                <dt className="inline font-semibold text-gray-900">AI 多模态分析。</dt>{' '}
                <dd className="inline text-gray-700">结合网页代码、截图和 AI 的多模态分析，结果更准确、更完整</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">数据安全私密。</dt>{' '}
                <dd className="inline text-gray-700">所有数据仅用于处理你的请求，不会被长期存储，保护用户隐私</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">自定义配置。</dt>{' '}
                <dd className="inline text-gray-700">保存有关您公司、角色和产品领域的信息，以便 PRD For AI 每次都能完美处理</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">自定义文档模板。</dt>{' '}
                <dd className="inline text-gray-700">使用您自己的PRD模板？将自定义模板添加到您的账户</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">在线客服与社区支持。</dt>{' '}
                <dd className="inline text-gray-700">我们的团队和社区帮助您从产品中获得最大收益</dd>
              </div>
              <div className="relative pl-9">
                <div className="absolute left-1 top-1 h-5 w-5 text-indigo-500">
                  <CheckCircle />
                </div>
                <dt className="inline font-semibold text-gray-900">团队账户。</dt>{' '}
                <dd className="inline text-gray-700">集中计费、共享模板和团队协作功能</dd>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">三步完成专业 PRD</h2>
              <p className="text-xl text-slate-600">简单几步，从想法到文档</p>
            </div>

            <div className="space-y-16">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl premium-shadow">
                    1
                  </div>
                </div>
                <div className="flex-1 lg:text-left text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">输入想法或分析网页</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    可以用自然语言描述您的产品想法，或使用Chrome插件一键分析任意网页，
                    支持文字、图片等多种输入方式
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">文字描述</span>
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">图片上传</span>
                    <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">网页分析</span>
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">AI 智能分析生成</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    基于您的输入，AI 自动生成结构化的 PRD 文档，包含产品概述、用户分析、
                    功能规格、用户故事等完整内容
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">需求分析</span>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">功能设计</span>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">用户画像</span>
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">编辑与导出分享</h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    在可视化画布中编辑文档，支持实时预览，完成后可导出为多种格式分享给团队，
                    提升协作效率
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">可视化编辑</span>
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">多格式导出</span>
                    <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">团队分享</span>
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
              开始您的智能文档创作之旅
            </h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              加入数千位产品经理的选择，让 AI 助力您的产品规划工作。
              Chrome插件 + Web版双重体验，想法落地从未如此简单。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="premium-button group inline-flex items-center justify-center rounded-2xl py-3 px-6 text-lg font-semibold text-white hover-lift"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                立即注册，免费试用
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="text-sm text-slate-600">
              💡 30秒完成安装 · 🎯 即刻提升效率 · 🛡️ 数据安全保护
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
              <h4 className="font-semibold text-slate-900 mb-4">产品功能</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Web版对话生成</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Chrome插件分析</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">多模态输入</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">可视化编辑</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">帮助支持</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">使用教程</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">常见问题</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">隐私政策</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">公司信息</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">关于我们</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">团队介绍</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">学习资源</h4>
              <ul className="space-y-3 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">产品博客</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">学习资源</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">模板库</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-sm text-slate-500">© 2024 PRD For AI. 让产品规划更智能，让创意触手可及。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;