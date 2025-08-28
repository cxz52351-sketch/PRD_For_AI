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
      /* === Custom font faces for PRD For AI === */
      /* Brand Display (multiple weights mapped to provided woff2) */
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/24c66e387ee021e3-s.p.woff2') format('woff2'); font-weight: 200 900; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/30d74baa196fe88a-s.p.woff2') format('woff2'); font-weight: 300; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/6313b6ee8c8b908c-s.p.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/84455f2b5a591033-s.p.woff2') format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/b225322b6767d8d2-s.p.woff2') format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/e4af272ccee01ff0-s.p.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
      @font-face { font-family: 'ChatPRD-UI'; src: url('https://www.chatprd.ai/_next/static/media/e80eeba139636561-s.p.woff2') format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }

      /* Roboto (body) */
      @font-face { font-family: 'RobotoCustom'; src: url('https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2') format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
      @font-face { font-family: 'RobotoCustom'; src: url('https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2') format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }

      :root { --font-sans: 'RobotoCustom', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', 'Noto Sans', 'Helvetica Neue', Arial, sans-serif; --font-brand: 'ChatPRD-UI', var(--font-sans); }
      .font-display { font-family: var(--font-brand); letter-spacing: -0.01em; }
      .brand-logo { font-family: var(--font-brand); letter-spacing: -0.02em; }
      .use-roboto { font-family: var(--font-sans); }
    `}</style>
  );
}

const Landing = () => {
  return (
    <div className="min-h-screen w-full bg-white text-slate-900 antialiased use-roboto">
      <FontLoader />
      
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <nav className="mx-auto max-w-7xl flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group" aria-label="PRD For AI">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-pink-600 p-[2px]">
              <div className="h-full w-full rounded bg-white/95 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-indigo-600">PRD</span>
              </div>
            </div>
            <span className="brand-logo font-bold tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">PRD For AI</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold hover:text-indigo-600">功能特性</a>
            <a href="#testimonials" className="text-sm font-semibold hover:text-indigo-600">用户评价</a>
            <a href="#how-it-works" className="text-sm font-semibold hover:text-indigo-600">工作原理</a>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900">登录</Link>
            <Link
              to="/register"
              className="group inline-flex items-center justify-center rounded-md py-1.5 px-3 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all"
            >
              立即注册，免费试用
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-gray-700">登录</Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-md py-1.5 px-3 text-sm font-semibold bg-indigo-600 text-white"
            >
              立即注册，免费试用
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden" aria-label="Hero">
          <div className="relative py-6 sm:py-12 lg:pb-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
              <div className="text-center">
                <span className="inline-flex items-center px-4 sm:px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-violet-300 text-sm font-medium text-slate-600 relative">
                  <span className="absolute inset-0 bg-white rounded-full blur-sm" aria-hidden="true" />
                  <span className="relative">
                    <Sparkles className="w-4 h-4 text-yellow-500 mr-2 inline" />
                    PRD For AI，你的产品加速器
                  </span>
                </span>
                <h1 className="font-display text-4xl leading-tight text-slate-800 sm:text-7xl sm:leading-none mt-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                    想法一闪而过？
                  </span>
                  <br />让AI帮你立刻落地
                </h1>
                <p className="mx-auto max-w-2xl pt-6 sm:pt-8 text-lg md:text-xl text-slate-900">
                  <br />
                  无论你是产品经理、AI产品经理、独立开发者还是设计师，只需一句话或一个网页，即可生成专业的 PRD 文档。
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm mt-6">
                  <div className="flex items-center px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    30秒生成专业PRD
                  </div>
                  <div className="flex items-center px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    支持多模态输入
                  </div>
                  <div className="flex items-center px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Chrome插件+Web版
                  </div>
                </div>

                <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row sm:items-center justify-center gap-3 sm:gap-6">
                  <Link
                    to="/register"
                    className="relative w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-lg leading-none inline-flex items-center shadow-lg hover:bg-indigo-700 transition"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    立即注册，免费试用
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="text-sm text-slate-600 mt-4">只需30秒 · 无需信用卡</div>
              </div>
            </div>

            {/* Product Demo */}
            <div className="max-w-7xl mx-auto relative mt-10 sm:mt-16">
              <div className="grid md:grid-cols-2 gap-8 items-center px-4">
                <div className="backdrop-blur-sm bg-white/80 shadow-2xl border border-gray-100 rounded-xl p-6">
                  <div className="mb-4 flex items-center">
                    <Globe className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-semibold">Web版 - AI对话生成</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-indigo-600/60 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">支持文字、图片等多模态输入</p>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-sm bg-white/80 shadow-2xl border border-gray-100 rounded-xl p-6">
                  <div className="mb-4 flex items-center">
                    <Chrome className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="font-semibold">Chrome插件 - 一键分析</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Target className="h-12 w-12 text-green-500/60 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">任意网页一键生成PRD</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <div className="relative z-20 py-8 sm:py-16 md:pt-24 px-4 md:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-600">解放创造力，专注核心价值</h2>
          <p className="mt-6 text-md font-semibold">打破传统文档创作壁垒，让每个人都能轻松将想法转化为专业PRD</p>
        </div>

        {/* Features */}
        <section id="features" aria-label="Features for product managers" className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-base font-semibold text-indigo-600">AI产品经理助手</h2>
              <p className="mt-2 text-3xl sm:text-4xl font-semibold font-display text-gray-900">解放你的大脑，专注创意</p>
              <p className="mt-6 text-lg text-gray-600">告别繁琐的文档工作。只需用自然语言描述你的想法，PRD For AI 就能为你自动生成结构化、可编辑的 PRD 文档。</p>
              <dl className="mt-10 space-y-6">
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                    <Lightbulb className="h-5 w-5 text-indigo-600" />
                  </div>
                  <dt className="inline font-semibold text-gray-900">支持多模态输入</dt>{' '}
                  <dd className="inline text-gray-600">支持文字、图片多模态输入</dd>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  <dt className="inline font-semibold text-gray-900">AI引导式需求挖掘</dt>{' '}
                  <dd className="inline text-gray-600">AI引导式需求挖掘</dd>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  </div>
                  <dt className="inline font-semibold text-gray-900">实时可视化编辑</dt>{' '}
                  <dd className="inline text-gray-600">实时可视化编辑</dd>
                </div>
                <div className="relative pl-10">
                  <div className="absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50">
                    <Chrome className="h-5 w-5 text-indigo-600" />
                  </div>
                  <dt className="inline font-semibold text-gray-900">Chrome插件支持</dt>{' '}
                  <dd className="inline text-gray-600">任意网页一键生成PRD</dd>
                </div>
              </dl>
            </div>
            <div className="relative isolate overflow-hidden rounded-3xl bg-[#6366f1] px-6 pt-8 sm:pl-16 sm:pr-0 sm:pt-16">
              <div className="absolute -inset-y-px -left-3 -z-10 w-full origin-bottom-left skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white" aria-hidden="true" />
              <div className="-mb-12 w-full max-w-[57rem] rounded-tl-xl bg-gray-800 ring-1 ring-white/10 aspect-video flex items-center justify-center">
                <div className="text-white text-center">
                  <Zap className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg">AI 多模态分析</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 sm:rounded-3xl" aria-hidden="true" />
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-12" />

        {/* Testimonials */}
        <section id="testimonials" className="bg-gradient-to-t from-[#FF8653] via-[#DF65C4] to-[#675BD2] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-medium font-display text-white text-center">用户都在说什么</h2>
            <p className="mt-2 text-base sm:text-lg text-white text-center">数千位产品经理、开发者、设计师的真实反馈</p>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 sm:p-8 rounded-xl bg-white/90 shadow ring-1 ring-black/5">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-900">用了 PRD For AI，我编写文档的时间减少了80%！特别是Chrome插件功能，分析竞品网站太方便了。</p>
                <div className="mt-6 text-xs text-gray-600">
                  <div>李明</div>
                  <div className="text-[10px]">产品经理</div>
                </div>
              </div>
              <div className="p-6 sm:p-8 rounded-xl bg-white/90 shadow ring-1 ring-black/5">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-900">这简直是产品经理的秘密武器！AI生成的PRD结构清晰，而且可以直接编辑，太实用了。</p>
                <div className="mt-6 text-xs text-gray-600">
                  <div>王晓</div>
                  <div className="text-[10px]">创业者</div>
                </div>
              </div>
              <div className="p-6 sm:p-8 rounded-xl bg-white/90 shadow ring-1 ring-black/5">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-900">作为开发者，我用它来快速理解产品需求。特别喜欢多模态输入，上传个截图就能生成对应的PRD。</p>
                <div className="mt-6 text-xs text-gray-600">
                  <div>张伟</div>
                  <div className="text-[10px]">前端开发</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Quote */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 grid xl:grid-cols-2 gap-10 items-start">
            <div className="w-full">
              <div className="relative rounded-lg border border-gray-300 overflow-hidden aspect-video">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-indigo-600/60 mx-auto mb-4" />
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
        <section className="bg-indigo-700 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center px-4">
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
              成为 <span className="font-extrabold">10x</span> 产品经理。
              <br />
              只需 <span className="font-extrabold">每月几杯咖啡</span> 的价格。
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-lg text-indigo-200">
              我们让 PRD For AI 变得经济实惠，让从工程师到创始人到CPO的每个人都能从AI产品经理中受益。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/register" className="rounded-md bg-white px-3.5 py-2.5 text-md font-semibold text-indigo-600 shadow hover:bg-indigo-50">立即注册</Link>
            </div>
          </div>
        </section>

        {/* Everything You Need */}
        <section className="py-16 border-t">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-base font-semibold text-indigo-600">为什么选择 PRD For AI？</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-display font-bold">AI 为你和你的团队工作</p>
            <p className="mt-6 text-lg">PRD For AI 针对你的角色、公司和团队进行了定制，因此你可以在几分钟内获得高质量的产品输出。</p>
          </div>
          <div className="relative overflow-hidden pt-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="rounded-xl shadow-2xl ring-1 ring-gray-900/10 w-full aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
                <div className="text-center">
                  <Target className="h-20 w-20 text-indigo-600/60 mx-auto mb-4" />
                  <p className="text-xl text-gray-700">产品功能截图</p>
                </div>
              </div>
              <div className="relative" aria-hidden="true">
                <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-white pt-[7%]" />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bullets */}
        <section className="py-6">
          <div className="mx-auto max-w-7xl px-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  AI 多模态分析。
                </dt>{' '}
                <dd className="inline text-gray-700">结合网页代码、截图和 AI 的多模态分析，结果更准确、更完整</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  数据安全私密。
                </dt>{' '}
                <dd className="inline text-gray-700">所有数据仅用于处理你的请求，不会被长期存储，保护用户隐私</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  自定义配置。
                </dt>{' '}
                <dd className="inline text-gray-700">保存有关您公司、角色和产品领域的信息，以便 PRD For AI 每次都能完美处理</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  自定义文档模板。
                </dt>{' '}
                <dd className="inline text-gray-700">使用您自己的PRD模板？将自定义模板添加到您的账户</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  在线客服与社区支持。
                </dt>{' '}
                <dd className="inline text-gray-700">我们的团队和社区帮助您从产品中获得最大收益</dd>
              </div>
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <CheckCircle className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                  团队账户。
                </dt>{' '}
                <dd className="inline text-gray-700">集中计费、共享模板和团队协作功能</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">三步完成专业 PRD</h2>
              <p className="text-xl text-slate-700">简单几步，从想法到文档</p>
            </div>

            <div className="space-y-12">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">输入想法或分析网页</h3>
                  <p className="text-slate-700 mb-4">
                    可以用自然语言描述您的产品想法，或使用Chrome插件一键分析任意网页，
                    支持文字、图片等多种输入方式
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 rounded-full">文字描述</span>
                    <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 rounded-full">图片上传</span>
                    <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 rounded-full">网页分析</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">AI 智能分析生成</h3>
                  <p className="text-slate-700 mb-4">
                    基于您的输入，AI 自动生成结构化的 PRD 文档，包含产品概述、用户分析、
                    功能规格、用户故事等完整内容
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full">需求分析</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full">功能设计</span>
                    <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full">用户画像</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">编辑与导出分享</h3>
                  <p className="text-slate-700 mb-4">
                    在可视化画布中编辑文档，支持实时预览，完成后可导出为多种格式分享给团队，
                    提升协作效率
                  </p>
                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full">可视化编辑</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full">多格式导出</span>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full">团队分享</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-700/10 to-purple-600/10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-6">
              开始您的智能文档创作之旅
            </h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              加入数千位产品经理的选择，让 AI 助力您的产品规划工作。
              Chrome插件 + Web版双重体验，想法落地从未如此简单。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center rounded-md py-3 px-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:from-indigo-700 hover:to-indigo-800 hover:shadow-xl transition-all"
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
      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-600 to-pink-600 p-[2px]">
              <div className="h-full w-full rounded bg-white/95 flex items-center justify-center">
                <span className="text-[10px] font-semibold text-indigo-600">PRD</span>
              </div>
            </div>
            <span className="brand-logo text-lg">PRD For AI</span>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900">产品功能</h4>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>Web版对话生成</li>
                <li>Chrome插件分析</li>
                <li>多模态输入</li>
                <li>可视化编辑</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">帮助支持</h4>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>使用教程</li>
                <li>常见问题</li>
                <li>联系我们</li>
                <li>隐私政策</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">公司信息</h4>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>关于我们</li>
                <li>团队介绍</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">学习资源</h4>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li>产品博客</li>
                <li>学习资源</li>
                <li>模板库</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-xs text-gray-500">© 2024 PRD For AI. 让产品规划更智能，让创意触手可及。</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;