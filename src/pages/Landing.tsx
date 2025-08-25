import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-aurora">
      {/* 导航栏 */}
      <nav className="backdrop-blur-sm bg-card/10 border-b border-border/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img
                src="/logo-prd-for-ai.svg"
                alt="PRD For AI"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-foreground">PRD For AI</span>
            </div>

            {/* 导航菜单 */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">功能特性</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">工作原理</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">用户评价</a>
            </div>

            {/* 登录注册按钮 */}
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-background/10">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-gradient-soft group">
                  立即注册，免费试用
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl">
                {/* <img
                  src="/logo-prd-for-ai.svg"
                  alt="PRD For AI"
                  className="h-12 w-12"
                /> */}
              </div>
            </div>

            {/* 产品横幅通知 */}
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">PRD For AI，你的产品加速器</span>
            </div>

            {/* 核心标题 - 强调痛点 */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                想法一闪而过？
              </span>
              <br />
              让AI帮你立刻落地
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              {/* <strong>PRD For AI</strong>，你的产品加速器。 */}
              <br />
              无论你是产品经理、AI产品经理、独立开发者还是设计师，只需一句话或一个网页，即可生成专业的 PRD 文档。
            </p>

            {/* 核心价值点 */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 text-sm">
              <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                30秒生成专业PRD
              </div>
              <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                支持多模态输入
              </div>
              <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4 mr-2" />
                Chrome插件+Web版
              </div>
            </div>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/register">
                <Button size="lg" className="btn-gradient-soft group text-lg px-8 py-6 shadow-xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即注册，免费试用
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">只需30秒 · 无需信用卡</div>
            </div>

            {/* 产品演示 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Web版演示 */}
              <Card className="backdrop-blur-sm bg-card/80 shadow-2xl border border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <Globe className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">Web版 - AI对话生成</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-primary/60 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">支持文字、图片等多模态输入</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chrome插件演示 */}
              <Card className="backdrop-blur-sm bg-card/80 shadow-2xl border border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <Chrome className="h-5 w-5 text-primary mr-2" />
                    <span className="font-semibold">Chrome插件 - 一键分析</span>
                  </div>
                  <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Target className="h-12 w-12 text-green-500/60 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">任意网页一键生成PRD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能区 - 解决三大痛点 */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              解放创造力，专注核心价值
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              打破传统文档创作壁垒，让每个人都能轻松将想法转化为专业PRD
            </p>
          </div>

          <div className="space-y-16">
            {/* 痛点1: 从灵感到文档 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">解放你的大脑，专注创意</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  告别繁琐的文档工作。只需用自然语言描述你的想法，
                  PRD For AI 就能为你自动生成结构化、可编辑的 PRD 文档。
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    支持文字、图片多模态输入
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    AI引导式需求挖掘
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    实时可视化编辑
                  </div>
                </div>
              </div>
              <Card className="backdrop-blur-sm bg-card/60 border border-border/30">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-primary/10 to-purple-600/10 p-6 rounded-lg">
                    <div className="mb-4">
                      <div className="text-sm text-muted-foreground mb-2">用户输入:</div>
                      <div className="bg-background/50 p-3 rounded border text-sm">
                        "我想做一个外卖配送优化的APP..."
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-primary mx-auto mb-4" />
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">AI生成PRD:</div>
                      <div className="bg-background/50 p-3 rounded border text-sm">
                        <div className="font-medium">1. 产品概述</div>
                        <div className="font-medium">2. 用户画像分析</div>
                        <div className="font-medium">3. 功能需求...</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 痛点2: 一键竞品分析 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Card className="backdrop-blur-sm bg-card/60 border border-border/30 md:order-first">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Chrome className="h-6 w-6 text-primary mr-2" />
                      <span className="font-medium">Chrome插件</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-background/50 p-3 rounded border text-sm">
                        浏览任意网站 → 点击插件图标 → AI分析生成PRD
                      </div>
                      <div className="text-xs text-muted-foreground">
                        支持电商、社交、工具类等各种网站分析
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">快速拆解，精准学习</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  在任何网站上，只需一键点击，我们的AI就能深入分析其功能、风格和用户旅程。
                  自动生成 PRD，助你秒懂竞品。
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    智能网页结构分析
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    自动提取核心功能
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    生成竞品分析报告
                  </div>
                </div>
              </div>
            </div>

            {/* 痛点3: 人人都是创作者 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">打破专业壁垒，让创作触手可及</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  无论你是开发者、设计师、学生还是创业者，PRD For AI 都是你的最佳助手。
                  我们简化了从想法到落地的每一步，让每个人都能轻松创作。
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">产品经理</div>
                    <div className="text-sm text-muted-foreground">提升文档效率</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">开发者</div>
                    <div className="text-sm text-muted-foreground">快速理解需求</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">设计师</div>
                    <div className="text-sm text-muted-foreground">明确设计方向</div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">创业者</div>
                    <div className="text-sm text-muted-foreground">验证商业想法</div>
                  </div>
                </div>
              </div>
              <Card className="backdrop-blur-sm bg-card/60 border border-border/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold mb-2">用户满意度</div>
                      <div className="flex justify-center items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">4.9/5.0 综合评分</div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-sm text-center text-muted-foreground">
                        "文档编写时间减少80%！"
                        <br />
                        "这简直是产品经理的秘密武器！"
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 产品优势 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              为什么选择 PRD For AI？
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              领先的AI技术 + 产品专业性 + 极致用户体验
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="backdrop-blur-sm bg-card/60 border border-border/30 hover:bg-card/80 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">AI 多模态分析</h3>
                <p className="text-muted-foreground">
                  结合网页代码、截图和 AI 的多模态分析，结果更准确、更完整
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/60 border border-border/30 hover:bg-card/80 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <Chrome className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">无缝集成</h3>
                <p className="text-muted-foreground">
                  作为浏览器插件，与你的工作流无缝衔接，无需切换应用
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/60 border border-border/30 hover:bg-card/80 transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">隐私安全</h3>
                <p className="text-muted-foreground">
                  所有数据仅用于处理你的请求，不会被长期存储，保护用户隐私
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 用户评价 */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-background/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              用户都在说什么
            </h2>
            <p className="text-xl text-muted-foreground">
              数千位产品经理、开发者、设计师的真实反馈
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="backdrop-blur-sm bg-card/60 border border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "用了 PRD For AI，我编写文档的时间减少了80%！特别是Chrome插件功能，
                  分析竞品网站太方便了。"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">李</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">李明</div>
                    <div className="text-xs text-muted-foreground">产品经理</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/60 border border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "这简直是产品经理的秘密武器！AI生成的PRD结构清晰，
                  而且可以直接编辑，太实用了。"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">王</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">王晓</div>
                    <div className="text-xs text-muted-foreground">创业者</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/60 border border-border/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "作为开发者，我用它来快速理解产品需求。
                  特别喜欢多模态输入，上传个截图就能生成对应的PRD。"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold">张</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">张伟</div>
                    <div className="text-xs text-muted-foreground">前端开发</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 工作原理 */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              三步完成专业 PRD
            </h2>
            <p className="text-xl text-muted-foreground">
              简单几步，从想法到文档
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-3">输入想法或分析网页</h3>
                <p className="text-muted-foreground mb-4">
                  可以用自然语言描述您的产品想法，或使用Chrome插件一键分析任意网页，
                  支持文字、图片等多种输入方式
                </p>
                <div className="flex gap-2 text-sm">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">文字描述</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">图片上传</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">网页分析</span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-3">AI 智能分析生成</h3>
                <p className="text-muted-foreground mb-4">
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
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mr-8 mt-2">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground mb-3">编辑与导出分享</h3>
                <p className="text-muted-foreground mb-4">
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

      {/* 最终CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 to-purple-600/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            开始您的智能文档创作之旅
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            加入数千位产品经理的选择，让 AI 助力您的产品规划工作。
            Chrome插件 + Web版双重体验，想法落地从未如此简单。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/register">
              <Button size="lg" className="btn-gradient-soft group text-lg px-8 py-6 shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                立即注册，免费试用
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            💡 30秒完成安装 · 🎯 即刻提升效率 · 🛡️ 数据安全保护
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/20 backdrop-blur-sm bg-card/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo-prd-for-ai.svg"
                  alt="PRD For AI"
                  className="h-8 w-8"
                />
                <span className="text-lg font-bold text-foreground">PRD For AI</span>
              </div>
              <p className="text-muted-foreground">
                让每个想法都能轻松落地，让每个创作者都能专注于核心价值。
                你的AI产品经理，随时随地为你服务。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">产品功能</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Web版对话生成</li>
                <li>Chrome插件分析</li>
                <li>多模态输入</li>
                <li>可视化编辑</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">帮助支持</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>使用教程</li>
                <li>常见问题</li>
                <li>联系我们</li>
                <li>隐私政策</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              © 2024 PRD For AI. 让产品规划更智能，让创意触手可及。
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Made with ❤️ for Product Creators</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;