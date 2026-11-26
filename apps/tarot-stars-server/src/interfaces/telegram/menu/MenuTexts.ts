import { SupportedLanguage } from '../../../domain/entities/NewTarotSchema';

export interface MenuTexts {
  mainMenu: {
    title: string;
    welcome: string;
  };
  tarotMenu: {
    title: string;
    dailyReading: string;
    history: string;
    knowledge: string;
    backToMain: string;
  };
  appMenu: {
    title: string;
    openApp: string;
    introduction: string;
    backToMain: string;
  };
  helpMenu: {
    title: string;
    userGuide: string;
    tarotIntroduction: string;
    faq: string;
    backToMain: string;
  };
  messages: {
      pleaseRegister: string;
      alreadyDrawnToday: string;
      alreadyDrawnMessage: string;
      drawingCard: string;
      drawingMessage: string;
      noHistory: string;
      recentReadings: string;
      viewFullHistory: string;
      drawingFailed: string;
      historyFailed: string;
      todayReading: string;
      wishMessage: string;
    };
  content: {
    tarotKnowledge: {
      title: string;
      composition: string;
      majorArcana: string;
      minorArcana: string;
      suits: string;
      wands: string;
      cups: string;
      swords: string;
      pentacles: string;
      conclusion: string;
    };
    appIntroduction: {
      title: string;
      features: string;
      beautifulUI: string;
      interactiveExperience: string;
      detailedAnalysis: string;
      personalTracking: string;
      multipleMethods: string;
      conclusion: string;
    };
    userGuide: {
      title: string;
      quickStart: string;
      step1: string;
      step2: string;
      step3: string;
      mainFeatures: string;
      dailyCard: string;
      historyRecord: string;
      miniApp: string;
      tips: string;
      tip1: string;
      tip2: string;
      tip3: string;
    };
    tarotIntroduction: {
      title: string;
      description: string;
      coreValues: string;
      selfReflection: string;
      innerWisdom: string;
      lifeDirection: string;
      personalGrowth: string;
      principles: string;
      principle1: string;
      principle2: string;
      principle3: string;
      conclusion: string;
    };
    faq: {
      title: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
      q4: string;
      a4: string;
      q5: string;
      a5: string;
    };
  };
}

export const MENU_TEXTS: Record<SupportedLanguage, MenuTexts> = {
  zh: {
    mainMenu: {
      title: "🔮 *塔罗星辰主菜单*",
      welcome: "欢迎使用塔罗星辰！选择你需要的功能："
    },
    tarotMenu: {
      title: "🔮 *塔罗功能菜单*",
      dailyReading: "🌟 今日塔罗",
      history: "📚 历史记录",
      knowledge: "🔮 塔罗知识",
      backToMain: "◀️ 返回主菜单"
    },
    appMenu: {
      title: "📱 *小程序功能*",
      openApp: "🚀 打开小程序",
      introduction: "📖 小程序介绍",
      backToMain: "◀️ 返回主菜单"
    },
    helpMenu: {
      title: "❓ *帮助中心*",
      userGuide: "📋 使用指南",
      tarotIntroduction: "🃏 塔罗介绍",
      faq: "❓ 常见问题",
      backToMain: "◀️ 返回主菜单"
    },
    messages: {
      pleaseRegister: "请先使用 /start 命令注册",
      alreadyDrawnToday: "今天已经抽过牌了！",
      alreadyDrawnMessage: "🌟 你今天已经抽过牌了！\n\n每天只能抽取一次塔罗牌哦。使用 /history 查看今日的解读。",
      drawingCard: "正在为你抽取今日塔罗牌...",
      drawingMessage: "🔮 正在为你抽取今日塔罗牌...",
      noHistory: "📚 你还没有任何塔罗牌记录。\n\n使用菜单中的'今日塔罗'开始你的第一次抽牌吧！",
      recentReadings: "📚 *最近的塔罗牌记录*",
      viewFullHistory: "使用 /history 查看完整历史记录",
      drawingFailed: "抽牌失败，请稍后重试",
      historyFailed: "获取历史记录失败",
      todayReading: "每日塔罗",
      wishMessage: "_愿这份指引为你的一天带来智慧与好运！_"
    },
    content: {
      tarotKnowledge: {
        title: "🔮 *塔罗牌知识*",
        composition: "📚 **塔罗牌组成：**",
        majorArcana: "• 大阿卡纳（Major Arcana）：22张，代表人生重大主题",
        minorArcana: "• 小阿卡纳（Minor Arcana）：56张，代表日常生活",
        suits: "🃏 **四个牌组：**",
        wands: "• 权杖（Wands）：火元素，代表激情、创造力",
        cups: "• 圣杯（Cups）：水元素，代表情感、关系",
        swords: "• 宝剑（Swords）：风元素，代表思想、沟通",
        pentacles: "• 金币（Pentacles）：土元素，代表物质、实用",
        conclusion: "✨ 塔罗牌是自我探索和内在智慧的工具！"
      },
      appIntroduction: {
        title: "📱 *塔罗星辰小程序*",
        features: "🌟 **功能特色：**",
        beautifulUI: "• 🎨 精美的塔罗牌界面",
        interactiveExperience: "• 🔮 互动式抽牌体验",
        detailedAnalysis: "• 📊 详细的解读分析",
        personalTracking: "• 📈 个人成长追踪",
        multipleMethods: "• 🎯 多种占卜方式",
        conclusion: "✨ 在小程序中体验更丰富的塔罗功能！"
      },
      userGuide: {
        title: "📋 *使用指南*",
        quickStart: "🚀 **快速开始：**",
        step1: "1\. 使用 /start 注册账户",
        step2: "2\. 使用 /daily 获取今日塔罗牌",
        step3: "3\. 使用 /menu 打开功能菜单",
        mainFeatures: "🔮 **主要功能：**",
        dailyCard: "• 每日一牌：每天抽取专属指引",
        historyRecord: "• 历史记录：查看过往抽牌",
        miniApp: "• 小程序：丰富的交互体验",
        tips: "💡 **小贴士：**",
        tip1: "• 每天只能抽取一次塔罗牌",
        tip2: "• 保持开放的心态接受指引",
        tip3: "• 塔罗牌是自我反思的工具"
      },
      tarotIntroduction: {
        title: "🃏 *塔罗牌介绍*",
        description: "🔮 塔罗牌是一套古老的占卜工具，由78张牌组成。它不是预测未来的魔法，而是帮助我们：",
        coreValues: "✨ **核心价值：**",
        selfReflection: "• 🧠 促进自我反思",
        innerWisdom: "• 💡 启发内在智慧",
        lifeDirection: "• 🎯 明确人生方向",
        personalGrowth: "• 🌱 促进个人成长",
        principles: "🌟 **使用原则：**",
        principle1: "• 保持开放和诚实的心态",
        principle2: "• 将塔罗作为指引而非绝对答案",
        principle3: "• 结合自己的直觉和理性思考",
        conclusion: "💫 愿塔罗的智慧照亮你的人生之路！"
      },
      faq: {
        title: "❓ *常见问题*",
        q1: "**Q: 为什么每天只能抽一次牌？**",
        a1: "A: 每日一牌的设计是为了让你专注于当天的指引，避免过度依赖占卜。",
        q2: "**Q: 塔罗牌准确吗？**",
        a2: "A: 塔罗牌是自我探索的工具，重点在于启发思考而非预测未来。",
        q3: "**Q: 逆位牌是坏事吗？**",
        a3: "A: 逆位牌通常代表内在的挑战或需要关注的方面，不一定是坏事。",
        q4: "**Q: 如何更好地理解牌意？**",
        a4: "A: 结合牌面描述、个人直觉和当前生活状况来理解。",
        q5: "**Q: 数据安全吗？**",
        a5: "A: 我们严格保护用户隐私，只存储必要的抽牌记录。"
      }
    }
  },
  en: {
    mainMenu: {
      title: "🔮 *Tarot Stars Main Menu*",
      welcome: "Welcome to Tarot Stars! Choose the function you need:"
    },
    tarotMenu: {
      title: "🔮 *Tarot Functions Menu*",
      dailyReading: "🌟 Daily Reading",
      history: "📚 History",
      knowledge: "🔮 Tarot Knowledge",
      backToMain: "◀️ Back to Main Menu"
    },
    appMenu: {
      title: "📱 *Mini App Functions*",
      openApp: "🚀 Open Mini App",
      introduction: "📖 App Introduction",
      backToMain: "◀️ Back to Main Menu"
    },
    helpMenu: {
      title: "❓ *Help Center*",
      userGuide: "📋 User Guide",
      tarotIntroduction: "🃏 Tarot Introduction",
      faq: "❓ FAQ",
      backToMain: "◀️ Back to Main Menu"
    },
    messages: {
      pleaseRegister: "Please use /start command to register first",
      alreadyDrawnToday: "You have already drawn a card today!",
      alreadyDrawnMessage: "🌟 You have already drawn a card today!\n\nYou can only draw one tarot card per day. Use /history to view today's reading.",
      drawingCard: "Drawing your daily tarot card...",
      drawingMessage: "🔮 Drawing your daily tarot card...",
      noHistory: "📚 You don't have any tarot card records yet.\n\nUse 'Daily Reading' in the menu to start your first card draw!",
      recentReadings: "📚 *Recent Tarot Card Records*",
      viewFullHistory: "Use /history to view complete history",
      drawingFailed: "Card drawing failed, please try again later",
      historyFailed: "Failed to get history records",
      todayReading: "Daily Reading",
      wishMessage: "_May this guidance bring wisdom and good fortune to your day!_"
    },
    content: {
      tarotKnowledge: {
        title: "🔮 *Tarot Knowledge*",
        composition: "📚 **Tarot Composition:**",
        majorArcana: "• Major Arcana: 22 cards, representing major life themes",
        minorArcana: "• Minor Arcana: 56 cards, representing daily life",
        suits: "🃏 **Four Suits:**",
        wands: "• Wands: Fire element, representing passion and creativity",
        cups: "• Cups: Water element, representing emotions and relationships",
        swords: "• Swords: Air element, representing thoughts and communication",
        pentacles: "• Pentacles: Earth element, representing material and practical matters",
        conclusion: "✨ Tarot is a tool for self-exploration and inner wisdom!"
      },
      appIntroduction: {
        title: "📱 *Tarot Stars Mini App*",
        features: "🌟 **Features:**",
        beautifulUI: "• 🎨 Beautiful tarot card interface",
        interactiveExperience: "• 🔮 Interactive card drawing experience",
        detailedAnalysis: "• 📊 Detailed reading analysis",
        personalTracking: "• 📈 Personal growth tracking",
        multipleMethods: "• 🎯 Multiple divination methods",
        conclusion: "✨ Experience richer tarot functions in the mini app!"
      },
      userGuide: {
        title: "📋 *User Guide*",
        quickStart: "🚀 **Quick Start:**",
        step1: "1\. Use /start to register account",
        step2: "2\. Use /daily to get daily tarot card",
        step3: "3\. Use /menu to open function menu",
        mainFeatures: "🔮 **Main Features:**",
        dailyCard: "• Daily Card: Draw exclusive guidance every day",
        historyRecord: "• History: View past card draws",
        miniApp: "• Mini App: Rich interactive experience",
        tips: "💡 **Tips:**",
        tip1: "• You can only draw one tarot card per day",
        tip2: "• Keep an open mind to accept guidance",
        tip3: "• Tarot is a tool for self-reflection"
      },
      tarotIntroduction: {
        title: "🃏 *Tarot Introduction*",
        description: "🔮 Tarot is an ancient divination tool consisting of 78 cards. It's not magic for predicting the future, but helps us:",
        coreValues: "✨ **Core Values:**",
        selfReflection: "• 🧠 Promote self-reflection",
        innerWisdom: "• 💡 Inspire inner wisdom",
        lifeDirection: "• 🎯 Clarify life direction",
        personalGrowth: "• 🌱 Promote personal growth",
        principles: "🌟 **Usage Principles:**",
        principle1: "• Maintain an open and honest mindset",
        principle2: "• Use tarot as guidance, not absolute answers",
        principle3: "• Combine your intuition with rational thinking",
        conclusion: "💫 May the wisdom of tarot illuminate your life path!"
      },
      faq: {
        title: "❓ *Frequently Asked Questions*",
        q1: "**Q: Why can I only draw one card per day?**",
        a1: "A: The daily card design helps you focus on the day's guidance and avoid over-dependence on divination.",
        q2: "**Q: Are tarot cards accurate?**",
        a2: "A: Tarot is a tool for self-exploration, focusing on inspiring thought rather than predicting the future.",
        q3: "**Q: Are reversed cards bad?**",
        a3: "A: Reversed cards usually represent internal challenges or aspects that need attention, not necessarily bad things.",
        q4: "**Q: How to better understand card meanings?**",
        a4: "A: Combine card descriptions, personal intuition, and current life situations to understand.",
        q5: "**Q: Is data secure?**",
        a5: "A: We strictly protect user privacy and only store necessary card drawing records."
      }
    }
  },
  ja: {
    mainMenu: {
      title: "🔮 *タロットスターズメインメニュー*",
      welcome: "タロットスターズへようこそ！必要な機能を選択してください："
    },
    tarotMenu: {
      title: "🔮 *タロット機能メニュー*",
      dailyReading: "🌟 今日のリーディング",
      history: "📚 履歴",
      knowledge: "🔮 タロット知識",
      backToMain: "◀️ メインメニューに戻る"
    },
    appMenu: {
      title: "📱 *ミニアプリ機能*",
      openApp: "🚀 ミニアプリを開く",
      introduction: "📖 アプリ紹介",
      backToMain: "◀️ メインメニューに戻る"
    },
    helpMenu: {
      title: "❓ *ヘルプセンター*",
      userGuide: "📋 使用ガイド",
      tarotIntroduction: "🃏 タロット紹介",
      faq: "❓ よくある質問",
      backToMain: "◀️ メインメニューに戻る"
    },
    messages: {
      pleaseRegister: "まず /start コマンドで登録してください",
      alreadyDrawnToday: "今日はすでにカードを引いています！",
      alreadyDrawnMessage: "今日はすでにカードを引いています！",
      drawingCard: "今日のタロットカードを引いています...",
      drawingMessage: "今日のタロットカードを引いています...",
      noHistory: "📚 まだタロットカードの記録がありません。\n\nメニューの'今日のリーディング'で最初のカード引きを始めましょう！",
      recentReadings: "📚 *最近のタロットカード記録*",
      viewFullHistory: "/history で完全な履歴を表示",
      drawingFailed: "カード引きに失敗しました。後でもう一度お試しください",
      historyFailed: "履歴の取得に失敗しました",
      todayReading: "今日のリーディング",
      wishMessage: "_このガイダンスがあなたの一日に知恵と幸運をもたらしますように！_"
    },
    content: {
      tarotKnowledge: {
        title: "🔮 *タロット知識*",
        composition: "📚 **タロットの構成：**",
        majorArcana: "• 大アルカナ：22枚、人生の重要なテーマを表す",
        minorArcana: "• 小アルカナ：56枚、日常生活を表す",
        suits: "🃏 **4つのスート：**",
        wands: "• ワンド：火の元素、情熱と創造性を表す",
        cups: "• カップ：水の元素、感情と関係を表す",
        swords: "• ソード：風の元素、思考とコミュニケーションを表す",
        pentacles: "• ペンタクル：土の元素、物質と実用性を表す",
        conclusion: "✨ タロットは自己探求と内なる知恵のツールです！"
      },
      appIntroduction: {
        title: "📱 *タロットスターズミニアプリ*",
        features: "🌟 **機能特徴：**",
        beautifulUI: "• 🎨 美しいタロットカードインターフェース",
        interactiveExperience: "• 🔮 インタラクティブなカード引き体験",
        detailedAnalysis: "• 📊 詳細なリーディング分析",
        personalTracking: "• 📈 個人成長追跡",
        multipleMethods: "• 🎯 複数の占い方法",
        conclusion: "✨ ミニアプリでより豊富なタロット機能を体験してください！"
      },
      userGuide: {
        title: "📋 *使用ガイド*",
        quickStart: "🚀 **クイックスタート：**",
        step1: "1\. /start でアカウント登録",
        step2: "2\. /daily で今日のタロットカードを取得",
        step3: "3\. /menu で機能メニューを開く",
        mainFeatures: "🔮 **主な機能：**",
        dailyCard: "• 今日のカード：毎日専用のガイダンスを引く",
        historyRecord: "• 履歴：過去のカード引きを表示",
        miniApp: "• ミニアプリ：豊富なインタラクティブ体験",
        tips: "💡 **ヒント：**",
        tip1: "• 1日に1回だけタロットカードを引けます",
        tip2: "• オープンな心でガイダンスを受け入れる",
        tip3: "• タロットは自己反省のツールです"
      },
      tarotIntroduction: {
        title: "🃏 *タロット紹介*",
        description: "🔮 タロットは78枚のカードからなる古代の占いツールです。未来を予測する魔法ではなく、私たちを助けます：",
        coreValues: "✨ **核心価値：**",
        selfReflection: "• 🧠 自己反省を促進",
        innerWisdom: "• 💡 内なる知恵を啓発",
        lifeDirection: "• 🎯 人生の方向を明確化",
        personalGrowth: "• 🌱 個人成長を促進",
        principles: "🌟 **使用原則：**",
        principle1: "• オープンで正直な心を保つ",
        principle2: "• タロットを絶対的な答えではなくガイダンスとして使う",
        principle3: "• 直感と理性的思考を組み合わせる",
        conclusion: "💫 タロットの知恵があなたの人生の道を照らしますように！"
      },
      faq: {
        title: "❓ *よくある質問*",
        q1: "**Q: なぜ1日に1回しかカードを引けないのですか？**",
        a1: "A: 毎日のカードデザインは、その日のガイダンスに集中し、占いへの過度な依存を避けるためです。",
        q2: "**Q: タロットカードは正確ですか？**",
        a2: "A: タロットは自己探求のツールで、未来を予測するよりも思考を刺激することに重点を置いています。",
        q3: "**Q: 逆位置のカードは悪いことですか？**",
        a3: "A: 逆位置のカードは通常、内的な挑戦や注意が必要な側面を表し、必ずしも悪いことではありません。",
        q4: "**Q: カードの意味をより良く理解するには？**",
        a4: "A: カードの説明、個人的な直感、現在の生活状況を組み合わせて理解してください。",
        q5: "**Q: データは安全ですか？**",
        a5: "A: 私たちはユーザーのプライバシーを厳格に保護し、必要なカード引き記録のみを保存します。"
      }
    }
  },
  ko: {
    mainMenu: {
      title: "🔮 *타로 스타즈 메인 메뉴*",
      welcome: "타로 스타즈에 오신 것을 환영합니다! 필요한 기능을 선택하세요:"
    },
    tarotMenu: {
      title: "🔮 *타로 기능 메뉴*",
      dailyReading: "🌟 오늘의 리딩",
      history: "📚 기록",
      knowledge: "🔮 타로 지식",
      backToMain: "◀️ 메인 메뉴로 돌아가기"
    },
    appMenu: {
      title: "📱 *미니 앱 기능*",
      openApp: "🚀 미니 앱 열기",
      introduction: "📖 앱 소개",
      backToMain: "◀️ 메인 메뉴로 돌아가기"
    },
    helpMenu: {
      title: "❓ *도움말 센터*",
      userGuide: "📋 사용 가이드",
      tarotIntroduction: "🃏 타로 소개",
      faq: "❓ 자주 묻는 질문",
      backToMain: "◀️ 메인 메뉴로 돌아가기"
    },
    messages: {
      pleaseRegister: "먼저 /start 명령으로 등록해주세요",
      alreadyDrawnToday: "오늘 이미 카드를 뽑았습니다!",
      alreadyDrawnMessage: "오늘 이미 카드를 뽑았습니다!",
      drawingCard: "오늘의 타로 카드를 뽑고 있습니다...",
      drawingMessage: "오늘의 타로 카드를 뽑고 있습니다...",
      noHistory: "📚 아직 타로 카드 기록이 없습니다.\n\n메뉴의 '오늘의 리딩'으로 첫 번째 카드 뽑기를 시작하세요!",
      recentReadings: "📚 *최근 타로 카드 기록*",
      viewFullHistory: "/history로 전체 기록 보기",
      drawingFailed: "카드 뽑기에 실패했습니다. 나중에 다시 시도해주세요",
      historyFailed: "기록 가져오기에 실패했습니다",
      todayReading: "오늘의 리딩",
      wishMessage: "_이 가이던스가 당신의 하루에 지혜와 행운을 가져다주기를 바랍니다!_"
    },
    content: {
      tarotKnowledge: {
        title: "🔮 *타로 지식*",
        composition: "📚 **타로 구성:**",
        majorArcana: "• 메이저 아르카나: 22장, 인생의 중요한 주제를 나타냄",
        minorArcana: "• 마이너 아르카나: 56장, 일상생활을 나타냄",
        suits: "🃏 **4개 수트:**",
        wands: "• 완드: 불의 원소, 열정과 창조성을 나타냄",
        cups: "• 컵: 물의 원소, 감정과 관계를 나타냄",
        swords: "• 소드: 바람의 원소, 사고와 소통을 나타냄",
        pentacles: "• 펜타클: 땅의 원소, 물질과 실용성을 나타냄",
        conclusion: "✨ 타로는 자기 탐구와 내면의 지혜를 위한 도구입니다!"
      },
      appIntroduction: {
        title: "📱 *타로 스타즈 미니 앱*",
        features: "🌟 **기능 특징:**",
        beautifulUI: "• 🎨 아름다운 타로 카드 인터페이스",
        interactiveExperience: "• 🔮 인터랙티브 카드 뽑기 경험",
        detailedAnalysis: "• 📊 상세한 리딩 분석",
        personalTracking: "• 📈 개인 성장 추적",
        multipleMethods: "• 🎯 다양한 점술 방법",
        conclusion: "✨ 미니 앱에서 더 풍부한 타로 기능을 경험하세요!"
      },
      userGuide: {
        title: "📋 *사용 가이드*",
        quickStart: "🚀 **빠른 시작:**",
        step1: "1\. /start로 계정 등록",
        step2: "2\. /daily로 오늘의 타로 카드 받기",
        step3: "3\. /menu로 기능 메뉴 열기",
        mainFeatures: "🔮 **주요 기능:**",
        dailyCard: "• 오늘의 카드: 매일 전용 가이던스 뽑기",
        historyRecord: "• 기록: 과거 카드 뽑기 보기",
        miniApp: "• 미니 앱: 풍부한 인터랙티브 경험",
        tips: "💡 **팁:**",
        tip1: "• 하루에 한 번만 타로 카드를 뽑을 수 있습니다",
        tip2: "• 열린 마음으로 가이던스를 받아들이세요",
        tip3: "• 타로는 자기 성찰의 도구입니다"
      },
      tarotIntroduction: {
        title: "🃏 *타로 소개*",
        description: "🔮 타로는 78장의 카드로 구성된 고대 점술 도구입니다. 미래를 예측하는 마법이 아니라 우리를 도와줍니다:",
        coreValues: "✨ **핵심 가치:**",
        selfReflection: "• 🧠 자기 성찰 촉진",
        innerWisdom: "• 💡 내면의 지혜 계발",
        lifeDirection: "• 🎯 인생 방향 명확화",
        personalGrowth: "• 🌱 개인 성장 촉진",
        principles: "🌟 **사용 원칙:**",
        principle1: "• 열린 마음과 정직한 태도 유지",
        principle2: "• 타로를 절대적 답이 아닌 가이던스로 사용",
        principle3: "• 직감과 이성적 사고를 결합",
        conclusion: "💫 타로의 지혜가 당신의 인생길을 밝혀주기를 바랍니다!"
      },
      faq: {
        title: "❓ *자주 묻는 질문*",
        q1: "**Q: 왜 하루에 한 번만 카드를 뽑을 수 있나요?**",
        a1: "A: 일일 카드 디자인은 그날의 가이던스에 집중하고 점술에 과도하게 의존하는 것을 피하기 위함입니다.",
        q2: "**Q: 타로 카드는 정확한가요?**",
        a2: "A: 타로는 자기 탐구의 도구로, 미래를 예측하기보다는 사고를 자극하는 데 중점을 둡니다.",
        q3: "**Q: 역방향 카드는 나쁜 것인가요?**",
        a3: "A: 역방향 카드는 보통 내적 도전이나 주의가 필요한 측면을 나타내며, 반드시 나쁜 것은 아닙니다.",
        q4: "**Q: 카드 의미를 더 잘 이해하려면?**",
        a4: "A: 카드 설명, 개인적 직감, 현재 생활 상황을 결합하여 이해하세요.",
        q5: "**Q: 데이터는 안전한가요?**",
        a5: "A: 우리는 사용자 개인정보를 엄격히 보호하며 필요한 카드 뽑기 기록만 저장합니다."
      }
    }
  }
};

export function getMenuTexts(language: SupportedLanguage): MenuTexts {
  return MENU_TEXTS[language] || MENU_TEXTS.zh;
}