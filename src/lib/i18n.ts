// 国际化配置和翻译文件
export type Language = 'zh' | 'en';

export interface TranslationKeys {
  // 通用
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    edit: string;
    delete: string;
    retry: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    search: string;
    clear: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    copy: string;
    share: string;
    settings: string;
    help: string;
    about: string;
    contact: string;
    privacy: string;
    terms: string;
    language: string;
    theme: string;
    profile: string;
    logout: string;
    login: string;
    register: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    forgotPassword: string;
    noAccount: string;
    hasAccount: string;
    welcomeBack: string;
    getStarted: string;
    characters: string;
    lines: string;
    preview: string;
    markdownSupport: string;
    currentMode: string;
    preparingApp: string;
    developing: string;
  };

  // 个人资料页面
  profile: {
    saveSuccess: string;
    saveError: string;
    avatarUploadDeveloping: string;
    activeUser: string;
    personalInfo: string;
    manageAccountInfo: string;
    saving: string;
    emailAddress: string;
    phoneNumber: string;
    notSet: string;
    registrationDate: string;
    usageStats: string;
    activityData: string;
    conversationCount: string;
    fileUploads: string;
    exportRecords: string;
    totalUsageDays: string;
  };

  // 设置页面
  settings: {
    saved: string;
    autoSaved: string;
    general: string;
    appearance: string;
    security: string;
    privacy: string;
    notificationSettings: string;
    manageNotifications: string;
    pushNotifications: string;
    receivePushNotifications: string;
    emailNotifications: string;
    receiveEmailNotifications: string;
    soundAlerts: string;
    playMessageSounds: string;
    chatSettings: string;
    customizeChat: string;
    autoSaveConversations: string;
    autoSaveHistory: string;
    streamingResponse: string;
    typewriterEffect: string;
    sessionTimeout: string;
    privacyControl: string;
    controlVisibility: string;
    publicProfile: string;
    allowOthersView: string;
    showActivityStatus: string;
    showOnlineStatus: string;
    dataManagement: string;
    exportData: string;
    deleteAccount: string;
    dataUsageInfo: string;
    dataUsageDescription: string;
    exportRequestSubmitted: string;
    exportDataDescription: string;
    deleteAccountDeveloping: string;
    minutes: string;
    hour: string;
    hours: string;
    neverTimeout: string;
  };

  // 导航和菜单
  nav: {
    home: string;
    features: string;
    testimonials: string;
    howItWorks: string;
    pricing: string;
    blog: string;
    docs: string;
    support: string;
    dashboard: string;
    conversations: string;
    newChat: string;
    exportChat: string;
    clearData: string;
  };

  // 首页 Landing
  landing: {
    hero: {
      badge: string;
      title: string;
      subtitle: string;
      description: string;
      cta: string;
      features: {
        feature1: string;
        feature2: string;
        feature3: string;
      };
      noCreditCard: string;
    };
    features: {
      title: string;
      subtitle: string;
      description: string;
      list: {
        multimodal: {
          title: string;
          description: string;
        };
        aiGuided: {
          title: string;
          description: string;
        };
        realTimeEdit: {
          title: string;
          description: string;
        };
        chromeExtension: {
          title: string;
          description: string;
        };
      };
    };
    testimonials: {
      title: string;
      subtitle: string;
      reviews: {
        review1: {
          content: string;
          author: string;
          role: string;
        };
        review2: {
          content: string;
          author: string;
          role: string;
        };
        review3: {
          content: string;
          author: string;
          role: string;
        };
      };
    };
    howItWorks: {
      title: string;
      subtitle: string;
      steps: {
        step1: {
          title: string;
          description: string;
          tags: string[];
        };
        step2: {
          title: string;
          description: string;
          tags: string[];
        };
        step3: {
          title: string;
          description: string;
          tags: string[];
        };
      };
    };
    cta: {
      title: string;
      description: string;
      button: string;
      benefits: string;
    };
    footer: {
      sections: {
        product: {
          title: string;
          links: string[];
        };
        support: {
          title: string;
          links: string[];
        };
        company: {
          title: string;
          links: string[];
        };
        resources: {
          title: string;
          links: string[];
        };
      };
      copyright: string;
    };
  };

  // 登录页面
  auth: {
    login: {
      title: string;
      subtitle: string;
      emailTab: string;
      phoneTab: string;
      emailPlaceholder: string;
      phonePlaceholder: string;
      passwordPlaceholder: string;
      loginButton: string;
      loggingIn: string;
      googleLogin: string;
      or: string;
      forgotPassword: string;
      noAccount: string;
      agreement: string;
      loginSuccess: string;
      loginFailed: string;
      googleLoginDev: string;
    };
    register: {
      title: string;
      subtitle: string;
      usernamePlaceholder: string;
      confirmPasswordPlaceholder: string;
      registerButton: string;
      registering: string;
      hasAccount: string;
      agreement: string;
      registerSuccess: string;
      registerFailed: string;
      passwordMismatch: string;
      weakPassword: string;
    };
  };

  // 聊天界面
  chat: {
    newConversation: string;
    exportConversation: string;
    deleteConversation: string;
    retryMessage: string;
    stopResponse: string;
    thinking: string;
    generating: string;
    inputPlaceholder: string;
    fileUpload: string;
    sendMessage: string;
    editInCanvas: string;
    downloadFile: string;
    exportSuccess: string;
    clearAllData: string;
    clearConfirm: string;
    dataCleared: string;
    dataRestored: string;
    fileGenerated: string;
    sendFailed: string;
    networkError: string;
    user: string;
    assistant: string;
    uploadFailed: string;
    stopSuccess: string;
    stopFailed: string;
    cannotStop: string;
    aborted: string;
  };

  // 用户菜单
  user: {
    profile: string;
    settings: string;
    logout: string;
    logoutSuccess: string;
    userPrefix: string;
  };

  // 错误和状态消息
  messages: {
    networkError: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    notFound: string;
    validationError: string;
    unknownError: string;
    comingSoon: string;
  };
}

// 中文翻译
export const zhTranslations: TranslationKeys = {
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    retry: '重试',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    search: '搜索',
    clear: '清除',
    export: '导出',
    import: '导入',
    download: '下载',
    upload: '上传',
    copy: '复制',
    share: '分享',
    settings: '设置',
    help: '帮助',
    about: '关于',
    contact: '联系我们',
    privacy: '隐私政策',
    terms: '服务条款',
    language: '语言',
    theme: '主题',
    profile: '个人资料',
    logout: '退出登录',
    login: '登录',
    register: '注册',
    username: '用户名',
    email: '邮箱',
    phone: '手机号',
    password: '密码',
    confirmPassword: '确认密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码',
    noAccount: '没有账户',
    hasAccount: '已有账户',
    welcomeBack: '欢迎回来',
    getStarted: '开始使用',
    characters: '字符',
    lines: '行数',
    preview: '预览',
    markdownSupport: '支持Markdown格式',
    currentMode: '当前模式',
    preparingApp: '请稍候，我们正在为您准备应用',
    developing: '功能开发中',
  },
  profile: {
    saveSuccess: '个人资料已更新',
    saveError: '更新个人资料时出现错误，请重试',
    avatarUploadDeveloping: '头像上传功能正在开发中',
    activeUser: '活跃用户',
    personalInfo: '个人信息',
    manageAccountInfo: '管理您的个人账户信息',
    saving: '保存中...',
    emailAddress: '邮箱地址',
    phoneNumber: '手机号码',
    notSet: '未设置',
    registrationDate: '注册时间',
    usageStats: '使用统计',
    activityData: '您在 Indus AI 中的活动数据',
    conversationCount: '对话次数',
    fileUploads: '文件上传',
    exportRecords: '导出记录',
    totalUsageDays: '总使用天数',
  },
  settings: {
    saved: '设置已保存',
    autoSaved: '您的偏好设置已自动保存',
    general: '通用',
    appearance: '外观',
    security: '安全',
    privacy: '隐私',
    notificationSettings: '通知设置',
    manageNotifications: '管理您接收通知的方式',
    pushNotifications: '推送通知',
    receivePushNotifications: '接收应用内推送通知',
    emailNotifications: '邮件通知',
    receiveEmailNotifications: '接收重要更新的邮件通知',
    soundAlerts: '声音提示',
    playMessageSounds: '播放消息提示音',
    chatSettings: '聊天设置',
    customizeChat: '自定义您的聊天体验',
    autoSaveConversations: '自动保存对话',
    autoSaveHistory: '自动保存您的对话记录',
    streamingResponse: '流式响应',
    typewriterEffect: '以打字机效果显示AI回复',
    sessionTimeout: '会话超时时间',
    privacyControl: '隐私控制',
    controlVisibility: '控制您的个人信息可见性',
    publicProfile: '公开个人资料',
    allowOthersView: '允许其他用户查看您的基本信息',
    showActivityStatus: '显示活动状态',
    showOnlineStatus: '显示您的在线状态和最后活动时间',
    dataManagement: '数据管理',
    exportData: '导出数据',
    deleteAccount: '删除账户',
    dataUsageInfo: '数据使用说明',
    dataUsageDescription: '我们仅收集必要的个人信息用于提供服务',
    exportRequestSubmitted: '导出请求已提交',
    exportDataDescription: '我们将在24小时内将您的数据发送到注册邮箱',
    deleteAccountDeveloping: '账户删除功能正在开发中，如需删除账户请联系客服',
    minutes: '分钟',
    hour: '小时',
    hours: '小时',
    neverTimeout: '永不超时',
  },
  nav: {
    home: '首页',
    features: '功能特性',
    testimonials: '用户评价',
    howItWorks: '工作原理',
    pricing: '定价',
    blog: '博客',
    docs: '文档',
    support: '支持',
    dashboard: '工作台',
    conversations: '对话',
    newChat: '新对话',
    exportChat: '导出对话',
    clearData: '清除数据',
  },
  landing: {
    hero: {
      badge: 'PRD For AI，你的产品加速器',
      title: '想法一闪而过？让AI帮你立刻落地',
      subtitle: '解放创造力，专注核心价值',
      description: '无论你是产品经理、AI产品经理、独立开发者还是设计师，只需一句话或一个网页，即可生成专业的 PRD 文档。',
      cta: '立即注册，免费试用',
      features: {
        feature1: '30秒生成专业PRD',
        feature2: '支持多模态输入',
        feature3: 'Chrome插件+Web版',
      },
      noCreditCard: '只需30秒 · 无需信用卡',
    },
    features: {
      title: '解放你的大脑，专注创意',
      subtitle: 'AI产品经理助手',
      description: '告别繁琐的文档工作。只需用自然语言描述你的想法，PRD For AI 就能为你自动生成结构化、可编辑的 PRD 文档。',
      list: {
        multimodal: {
          title: '支持多模态输入',
          description: '支持文字、图片多模态输入',
        },
        aiGuided: {
          title: 'AI引导式需求挖掘',
          description: 'AI引导式需求挖掘',
        },
        realTimeEdit: {
          title: '实时可视化编辑',
          description: '实时可视化编辑',
        },
        chromeExtension: {
          title: 'Chrome插件支持',
          description: '任意网页一键生成PRD',
        },
      },
    },
    testimonials: {
      title: '用户都在说什么',
      subtitle: '数千位产品经理、开发者、设计师的真实反馈',
      reviews: {
        review1: {
          content: '用了 PRD For AI，我编写文档的时间减少了80%！特别是Chrome插件功能，分析竞品网站太方便了。',
          author: '李明',
          role: '产品经理',
        },
        review2: {
          content: '这简直是产品经理的秘密武器！AI生成的PRD结构清晰，而且可以直接编辑，太实用了。',
          author: '王晓',
          role: '创业者',
        },
        review3: {
          content: '作为开发者，我用它来快速理解产品需求。特别喜欢多模态输入，上传个截图就能生成对应的PRD。',
          author: '张伟',
          role: '前端开发',
        },
      },
    },
    howItWorks: {
      title: '三步完成专业 PRD',
      subtitle: '简单几步，从想法到文档',
      steps: {
        step1: {
          title: '输入想法或分析网页',
          description: '可以用自然语言描述您的产品想法，或使用Chrome插件一键分析任意网页，支持文字、图片等多种输入方式',
          tags: ['文字描述', '图片上传', '网页分析'],
        },
        step2: {
          title: 'AI 智能分析生成',
          description: '基于您的输入，AI 自动生成结构化的 PRD 文档，包含产品概述、用户分析、功能规格、用户故事等完整内容',
          tags: ['需求分析', '功能设计', '用户画像'],
        },
        step3: {
          title: '编辑与导出分享',
          description: '在可视化画布中编辑文档，支持实时预览，完成后可导出为多种格式分享给团队，提升协作效率',
          tags: ['可视化编辑', '多格式导出', '团队分享'],
        },
      },
    },
    cta: {
      title: '开始您的智能文档创作之旅',
      description: '加入数千位产品经理的选择，让 AI 助力您的产品规划工作。Chrome插件 + Web版双重体验，想法落地从未如此简单。',
      button: '立即注册，免费试用',
      benefits: '💡 30秒完成安装 · 🎯 即刻提升效率 · 🛡️ 数据安全保护',
    },
    footer: {
      sections: {
        product: {
          title: '产品功能',
          links: ['Web版对话生成', 'Chrome插件分析', '多模态输入', '可视化编辑'],
        },
        support: {
          title: '帮助支持',
          links: ['使用教程', '常见问题', '联系我们', '隐私政策'],
        },
        company: {
          title: '公司信息',
          links: ['关于我们', '团队介绍'],
        },
        resources: {
          title: '学习资源',
          links: ['产品博客', '学习资源', '模板库'],
        },
      },
      copyright: '© 2024 PRD For AI. 让产品规划更智能，让创意触手可及。',
    },
  },
  auth: {
    login: {
      title: '登录账户',
      subtitle: '选择您偏好的登录方式',
      emailTab: '邮箱',
      phoneTab: '手机',
      emailPlaceholder: '输入您的邮箱地址',
      phonePlaceholder: '输入您的手机号码',
      passwordPlaceholder: '输入您的密码',
      loginButton: '登录',
      loggingIn: '登录中...',
      googleLogin: '使用 Google 登录',
      or: '或者',
      forgotPassword: '忘记密码？',
      noAccount: '没有账户？注册',
      agreement: '登录即表示您同意我们的',
      loginSuccess: '登录成功',
      loginFailed: '登录失败',
      googleLoginDev: 'Google登录功能正在开发中，请使用邮箱或手机号登录',
    },
    register: {
      title: '创建账户',
      subtitle: '开始您的 PRD For AI 之旅',
      usernamePlaceholder: '输入您的用户名',
      confirmPasswordPlaceholder: '再次输入密码',
      registerButton: '注册',
      registering: '注册中...',
      hasAccount: '已有账户？登录',
      agreement: '注册即表示您同意我们的',
      registerSuccess: '注册成功',
      registerFailed: '注册失败',
      passwordMismatch: '两次输入的密码不一致',
      weakPassword: '密码强度不够，至少需要8位，包含大小写字母和数字',
    },
  },
  chat: {
    newConversation: '新对话',
    exportConversation: '导出对话',
    deleteConversation: '删除对话',
    retryMessage: '重试',
    stopResponse: '停止响应',
    thinking: 'AI正在思考中...',
    generating: 'AI正在生成回复...',
    inputPlaceholder: '请说出您的需求',
    fileUpload: '上传文件',
    sendMessage: '发送消息',
    editInCanvas: '在画布中编辑',
    downloadFile: '下载生成的文件',
    exportSuccess: '对话已导出为Markdown文件',
    clearAllData: '清除所有数据',
    clearConfirm: '确定要清除所有聊天记录吗？此操作不可撤销。',
    dataCleared: '所有聊天记录已被清除',
    dataRestored: '您之前的聊天记录已从本地存储恢复',
    fileGenerated: '文件生成成功',
    sendFailed: '发送失败',
    networkError: '网络连接异常，请检查网络后重试',
    user: '用户',
    assistant: 'AI助手',
    uploadFailed: '文件上传失败',
    stopSuccess: '已停止响应',
    stopFailed: '停止失败',
    cannotStop: '没有正在进行的响应任务',
    aborted: '已中止本地流连接',
  },
  user: {
    profile: '个人资料',
    settings: '设置',
    logout: '退出登录',
    logoutSuccess: '您已成功退出登录',
    userPrefix: '用户',
  },
  messages: {
    networkError: '网络连接失败，请检查网络设置',
    serverError: '服务器错误，请稍后重试',
    unauthorized: '未授权访问，请重新登录',
    forbidden: '权限不足，无法执行此操作',
    notFound: '请求的资源不存在',
    validationError: '输入数据格式不正确',
    unknownError: '未知错误，请联系技术支持',
    comingSoon: '功能开发中，敬请期待',
  },
};

// 英文翻译
export const enTranslations: TranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    retry: 'Retry',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    search: 'Search',
    clear: 'Clear',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    copy: 'Copy',
    share: 'Share',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    contact: 'Contact Us',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    language: 'Language',
    theme: 'Theme',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password',
    noAccount: 'No Account',
    hasAccount: 'Have Account',
    welcomeBack: 'Welcome Back',
    getStarted: 'Get Started',
    characters: 'characters',
    lines: 'lines',
    preview: 'Preview',
    markdownSupport: 'Supports Markdown format',
    currentMode: 'Current mode',
    preparingApp: 'Please wait, we are preparing the application for you',
    developing: 'Feature in Development',
  },
  profile: {
    saveSuccess: 'Profile updated successfully',
    saveError: 'Error updating profile, please try again',
    avatarUploadDeveloping: 'Avatar upload feature is under development',
    activeUser: 'Active User',
    personalInfo: 'Personal Information',
    manageAccountInfo: 'Manage your personal account information',
    saving: 'Saving...',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    notSet: 'Not Set',
    registrationDate: 'Registration Date',
    usageStats: 'Usage Statistics',
    activityData: 'Your activity data in Indus AI',
    conversationCount: 'Conversations',
    fileUploads: 'File Uploads',
    exportRecords: 'Export Records',
    totalUsageDays: 'Total Usage Days',
  },
  settings: {
    saved: 'Settings Saved',
    autoSaved: 'Your preferences have been automatically saved',
    general: 'General',
    appearance: 'Appearance',
    security: 'Security',
    privacy: 'Privacy',
    notificationSettings: 'Notification Settings',
    manageNotifications: 'Manage how you receive notifications',
    pushNotifications: 'Push Notifications',
    receivePushNotifications: 'Receive in-app push notifications',
    emailNotifications: 'Email Notifications',
    receiveEmailNotifications: 'Receive email notifications for important updates',
    soundAlerts: 'Sound Alerts',
    playMessageSounds: 'Play message alert sounds',
    chatSettings: 'Chat Settings',
    customizeChat: 'Customize your chat experience',
    autoSaveConversations: 'Auto-save Conversations',
    autoSaveHistory: 'Automatically save your conversation history',
    streamingResponse: 'Streaming Response',
    typewriterEffect: 'Display AI responses with a typewriter effect',
    sessionTimeout: 'Session Timeout',
    privacyControl: 'Privacy Control',
    controlVisibility: 'Control your personal information visibility',
    publicProfile: 'Public Profile',
    allowOthersView: 'Allow other users to view your basic information',
    showActivityStatus: 'Show Activity Status',
    showOnlineStatus: 'Show your online status and last activity time',
    dataManagement: 'Data Management',
    exportData: 'Export Data',
    deleteAccount: 'Delete Account',
    dataUsageInfo: 'Data Usage Information',
    dataUsageDescription: 'We only collect necessary personal information to provide services',
    exportRequestSubmitted: 'Export Request Submitted',
    exportDataDescription: 'We will send your data to your registered email within 24 hours',
    deleteAccountDeveloping: 'Account deletion feature is under development, please contact customer service if you need to delete your account',
    minutes: 'minutes',
    hour: 'hour',
    hours: 'hours',
    neverTimeout: 'Never timeout',
  },
  nav: {
    home: 'Home',
    features: 'Features',
    testimonials: 'Testimonials',
    howItWorks: 'How It Works',
    pricing: 'Pricing',
    blog: 'Blog',
    docs: 'Documentation',
    support: 'Support',
    dashboard: 'Dashboard',
    conversations: 'Conversations',
    newChat: 'New Chat',
    exportChat: 'Export Chat',
    clearData: 'Clear Data',
  },
  landing: {
    hero: {
      badge: 'PRD For AI, Your Product Accelerator',
      title: 'Ideas Flash By? Let AI Help You Implement Them Instantly',
      subtitle: 'Unleash Creativity, Focus on Core Value',
      description: 'Whether you\'re a product manager, AI product manager, indie developer, or designer, generate professional PRD documents from just a sentence or webpage.',
      cta: 'Sign Up Now, Free Trial',
      features: {
        feature1: 'Generate Professional PRD in 30s',
        feature2: 'Multi-modal Input Support',
        feature3: 'Chrome Extension + Web Version',
      },
      noCreditCard: 'Just 30 seconds · No credit card required',
    },
    features: {
      title: 'Free Your Mind, Focus on Creativity',
      subtitle: 'AI Product Manager Assistant',
      description: 'Say goodbye to tedious documentation work. Just describe your ideas in natural language, and PRD For AI will automatically generate structured, editable PRD documents.',
      list: {
        multimodal: {
          title: 'Multi-modal Input Support',
          description: 'Support text and image multi-modal input',
        },
        aiGuided: {
          title: 'AI-Guided Requirement Mining',
          description: 'AI-guided requirement mining',
        },
        realTimeEdit: {
          title: 'Real-time Visual Editing',
          description: 'Real-time visual editing',
        },
        chromeExtension: {
          title: 'Chrome Extension Support',
          description: 'Generate PRD from any webpage with one click',
        },
      },
    },
    testimonials: {
      title: 'What Users Are Saying',
      subtitle: 'Real feedback from thousands of product managers, developers, and designers',
      reviews: {
        review1: {
          content: 'With PRD For AI, I reduced my documentation time by 80%! The Chrome extension feature for analyzing competitor websites is incredibly convenient.',
          author: 'Li Ming',
          role: 'Product Manager',
        },
        review2: {
          content: 'This is simply a secret weapon for product managers! The AI-generated PRDs are well-structured and directly editable. So practical.',
          author: 'Wang Xiao',
          role: 'Entrepreneur',
        },
        review3: {
          content: 'As a developer, I use it to quickly understand product requirements. I especially love the multi-modal input - just upload a screenshot to generate corresponding PRD.',
          author: 'Zhang Wei',
          role: 'Frontend Developer',
        },
      },
    },
    howItWorks: {
      title: 'Complete Professional PRD in Three Steps',
      subtitle: 'Simple steps from idea to document',
      steps: {
        step1: {
          title: 'Input Ideas or Analyze Webpages',
          description: 'Describe your product ideas in natural language, or use Chrome extension to analyze any webpage with one click, supporting multiple input methods including text and images',
          tags: ['Text Description', 'Image Upload', 'Webpage Analysis'],
        },
        step2: {
          title: 'AI Intelligent Analysis & Generation',
          description: 'Based on your input, AI automatically generates structured PRD documents including product overview, user analysis, feature specifications, user stories, and complete content',
          tags: ['Requirement Analysis', 'Feature Design', 'User Personas'],
        },
        step3: {
          title: 'Edit and Export Sharing',
          description: 'Edit documents in visual canvas with real-time preview support. Export in multiple formats to share with your team and improve collaboration efficiency',
          tags: ['Visual Editing', 'Multi-format Export', 'Team Sharing'],
        },
      },
    },
    cta: {
      title: 'Start Your Intelligent Document Creation Journey',
      description: 'Join thousands of product managers\' choice. Let AI empower your product planning work. Chrome extension + Web version dual experience, turning ideas into reality has never been so simple.',
      button: 'Sign Up Now, Free Trial',
      benefits: '💡 30-second setup · 🎯 Instant efficiency boost · 🛡️ Data security protection',
    },
    footer: {
      sections: {
        product: {
          title: 'Product Features',
          links: ['Web Conversation Generation', 'Chrome Extension Analysis', 'Multi-modal Input', 'Visual Editing'],
        },
        support: {
          title: 'Help & Support',
          links: ['Tutorial', 'FAQ', 'Contact Us', 'Privacy Policy'],
        },
        company: {
          title: 'Company',
          links: ['About Us', 'Team'],
        },
        resources: {
          title: 'Resources',
          links: ['Product Blog', 'Learning Resources', 'Template Library'],
        },
      },
      copyright: '© 2024 PRD For AI. Making product planning smarter, bringing creativity within reach.',
    },
  },
  auth: {
    login: {
      title: 'Login to Account',
      subtitle: 'Choose your preferred login method',
      emailTab: 'Email',
      phoneTab: 'Phone',
      emailPlaceholder: 'Enter your email address',
      phonePlaceholder: 'Enter your phone number',
      passwordPlaceholder: 'Enter your password',
      loginButton: 'Login',
      loggingIn: 'Logging in...',
      googleLogin: 'Login with Google',
      or: 'Or',
      forgotPassword: 'Forgot Password?',
      noAccount: 'No account? Register',
      agreement: 'By logging in, you agree to our',
      loginSuccess: 'Login successful',
      loginFailed: 'Login failed',
      googleLoginDev: 'Google login is under development, please use email or phone to login',
    },
    register: {
      title: 'Create Account',
      subtitle: 'Start your PRD For AI journey',
      usernamePlaceholder: 'Enter your username',
      confirmPasswordPlaceholder: 'Re-enter password',
      registerButton: 'Register',
      registering: 'Registering...',
      hasAccount: 'Have an account? Login',
      agreement: 'By registering, you agree to our',
      registerSuccess: 'Registration successful',
      registerFailed: 'Registration failed',
      passwordMismatch: 'Passwords do not match',
      weakPassword: 'Password is too weak, requires at least 8 characters with uppercase, lowercase letters and numbers',
    },
  },
  chat: {
    newConversation: 'New Conversation',
    exportConversation: 'Export Conversation',
    deleteConversation: 'Delete Conversation',
    retryMessage: 'Retry',
    stopResponse: 'Stop Response',
    thinking: 'AI is thinking...',
    generating: 'AI is generating response...',
    inputPlaceholder: 'Tell me your requirements',
    fileUpload: 'Upload File',
    sendMessage: 'Send Message',
    editInCanvas: 'Edit in Canvas',
    downloadFile: 'Download generated file',
    exportSuccess: 'Conversation exported as Markdown file',
    clearAllData: 'Clear All Data',
    clearConfirm: 'Are you sure you want to clear all chat history? This action cannot be undone.',
    dataCleared: 'All chat history has been cleared',
    dataRestored: 'Your previous chat history has been restored from local storage',
    fileGenerated: 'File generated successfully',
    sendFailed: 'Send failed',
    networkError: 'Network connection error, please check your network and try again',
    user: 'User',
    assistant: 'AI Assistant',
    uploadFailed: 'File upload failed',
    stopSuccess: 'Response stopped',
    stopFailed: 'Failed to stop',
    cannotStop: 'No ongoing response task',
    aborted: 'Local stream connection aborted',
  },
  user: {
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    logoutSuccess: 'You have successfully logged out',
    userPrefix: 'User',
  },
  messages: {
    networkError: 'Network connection failed, please check network settings',
    serverError: 'Server error, please try again later',
    unauthorized: 'Unauthorized access, please login again',
    forbidden: 'Insufficient permissions to perform this action',
    notFound: 'The requested resource does not exist',
    validationError: 'Input data format is incorrect',
    unknownError: 'Unknown error, please contact technical support',
    comingSoon: 'Feature under development, stay tuned',
  },
};

// 翻译映射
export const translations = {
  zh: zhTranslations,
  en: enTranslations,
};

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 语言名称映射
export const LANGUAGE_NAMES = {
  zh: '中文',
  en: 'English',
};

// 获取浏览器语言
export const getBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('en')) return 'en';

  return DEFAULT_LANGUAGE;
};

// 存储语言偏好
export const saveLanguagePreference = (language: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('prd-ai-language', language);
  }
};

// 获取存储的语言偏好
export const getSavedLanguagePreference = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const saved = localStorage.getItem('prd-ai-language') as Language;
  return saved && (saved === 'zh' || saved === 'en') ? saved : getBrowserLanguage();
};
