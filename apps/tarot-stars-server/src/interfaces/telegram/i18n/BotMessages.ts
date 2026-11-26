import { SupportedLanguage } from '../../../domain/entities/NewTarotSchema';

export interface BotMessages {
  welcome: {
    title: string;
    description: string;
    instructions: {
      daily: string;
      app: string;
      history: string;
      help: string;
    };
  };
  commands: {
    start: string;
    daily: string;
    history: string;
    app: string;
    menu: string;
    help: string;
  };
  buttons: {
    dailyReading: string;
    openApp: string;
    viewHistory: string;
    viewInApp: string;
  };
  messages: {
    pleaseRegister: string;
    alreadyDrawnToday: string;
    drawingCard: string;
    noHistory: string;
    openMiniApp: string;
    operationFailed: string;
    startupFailed: string;
    drawFailed: string;
    historyFailed: string;
  };
  help: {
    title: string;
    commands: {
      daily: string;
      app: string;
      history: string;
      help: string;
    };
    features: {
      title: string;
      dailyCard: string;
      professionalReading: string;
      historyRecord: string;
      miniApp: string;
    };
    closing: string;
  };
  history: {
    title: string;
    position: {
      upright: string;
      reversed: string;
    };
  };
}

const messages: Record<SupportedLanguage, BotMessages> = {
  zh: {
    welcome: {
      title: '🔮 欢迎来到塔罗星辰！',
      description: '✨ 我是你的专属塔罗导师，可以为你提供每日塔罗牌指引。',
      instructions: {
        daily: '🃏 使用 /daily 获取今日塔罗牌',
        app: '📱 使用 /app 打开塔罗小程序',
        history: '📚 使用 /history 查看历史记录',
        help: '❓ 使用 /help 获取帮助'
      }
    },
    commands: {
      start: '🔮 开始使用塔罗星辰',
      daily: '🌟 获取今日塔罗牌',
      history: '📚 查看历史记录',
      app: '📱 打开小程序',
      menu: '📋 打开功能菜单',
      help: '❓ 获取帮助'
    },
    buttons: {
      dailyReading: '🃏 今日塔罗',
      openApp: '📱 打开小程序',
      viewHistory: '📚 历史记录',
      viewInApp: '📱 在小程序中查看'
    },
    messages: {
      pleaseRegister: '请先使用 /start 命令注册。',
      alreadyDrawnToday: '🌟 你今天已经抽过牌了！每天只能抽取一次塔罗牌哦。\n\n使用 /history 查看今日的解读。',
      drawingCard: '🔮 正在为你抽取今日塔罗牌...',
      noHistory: '📚 你还没有任何塔罗牌记录。\n\n使用 /daily 开始你的第一次抽牌吧！',
      openMiniApp: '🌟 点击下方按钮打开塔罗星辰小程序，体验更丰富的塔罗功能！',
      operationFailed: '操作失败，请稍后重试',
      startupFailed: '❌ 启动失败，请稍后重试。',
      drawFailed: '❌ 抽牌失败，请稍后重试。',
      historyFailed: '❌ 获取历史记录失败，请稍后重试。'
    },
    help: {
      title: '🔮 *塔罗星辰使用指南*',
      commands: {
        daily: '🃏 */daily* \- 获取今日塔罗牌指引',
        app: '📱 */app* \- 打开塔罗小程序',
        history: '📚 */history* \- 查看历史抽牌记录',
        help: '❓ */help* \- 显示此帮助信息'
      },
      features: {
        title: '✨ *特色功能：*',
        dailyCard: '• 每日一牌：每天为你抽取专属塔罗牌',
        professionalReading: '• 专业解读：详细的牌面含义和建议',
        historyRecord: '• 历史记录：保存你的所有抽牌记录',
        miniApp: '• 小程序：更丰富的交互体验'
      },
      closing: '🌟 愿塔罗的智慧指引你的人生之路！'
    },
    history: {
      title: '📚 *你的塔罗牌历史记录*',
      position: {
        upright: '正位',
        reversed: '逆位'
      }
    }
  },
  en: {
    welcome: {
      title: '🔮 Welcome to Tarot Stars!',
      description: '✨ I am your personal tarot guide, here to provide daily tarot card insights.',
      instructions: {
        daily: '🃏 Use /daily to get your daily tarot card',
        app: '📱 Use /app to open the tarot mini app',
        history: '📚 Use /history to view your reading history',
        help: '❓ Use /help to get assistance'
      }
    },
    commands: {
      start: '🔮 Start using Tarot Stars',
      daily: '🌟 Get daily tarot card',
      history: '📚 View reading history',
      app: '📱 Open mini app',
      menu: '📋 Open function menu',
      help: '❓ Get help'
    },
    buttons: {
      dailyReading: '🃏 Daily Tarot',
      openApp: '📱 Open App',
      viewHistory: '📚 View History',
      viewInApp: '📱 View in App'
    },
    messages: {
      pleaseRegister: 'Please use /start command to register first.',
      alreadyDrawnToday: '🌟 You have already drawn a card today! You can only draw one tarot card per day.\n\nUse /history to view today\'s reading.',
      drawingCard: '🔮 Drawing your daily tarot card...',
      noHistory: '📚 You don\'t have any tarot card records yet.\n\nUse /daily to start your first card drawing!',
      openMiniApp: '🌟 Click the button below to open Tarot Stars mini app and experience richer tarot features!',
      operationFailed: 'Operation failed, please try again later',
      startupFailed: '❌ Startup failed, please try again later.',
      drawFailed: '❌ Card drawing failed, please try again later.',
      historyFailed: '❌ Failed to get history, please try again later.'
    },
    help: {
      title: '🔮 *Tarot Stars User Guide*',
      commands: {
        daily: '🃏 */daily* \- Get daily tarot card guidance',
        app: '📱 */app* \- Open tarot mini app',
        history: '📚 */history* \- View card drawing history',
        help: '❓ */help* \- Show this help information'
      },
      features: {
        title: '✨ *Featured Functions:*',
        dailyCard: '• Daily Card: Draw your exclusive tarot card every day',
        professionalReading: '• Professional Reading: Detailed card meanings and advice',
        historyRecord: '• History Record: Save all your card drawing records',
        miniApp: '• Mini App: Richer interactive experience'
      },
      closing: '🌟 May the wisdom of tarot guide your life\'s journey!'
    },
    history: {
      title: '📚 *Your Tarot Card History*',
      position: {
        upright: 'Upright',
        reversed: 'Reversed'
      }
    }
  },
  ja: {
    welcome: {
      title: '🔮 タロット・スターズへようこそ！',
      description: '✨ 私はあなた専用のタロットガイドです。毎日のタロットカードの洞察を提供します。',
      instructions: {
        daily: '🃏 /daily で今日のタロットカードを取得',
        app: '📱 /app でタロットミニアプリを開く',
        history: '📚 /history でリーディング履歴を表示',
        help: '❓ /help でヘルプを取得'
      }
    },
    commands: {
      start: '🔮 タロット・スターズを開始',
      daily: '🌟 今日のタロットカードを取得',
      history: '📚 リーディング履歴を表示',
      app: '📱 ミニアプリを開く',
      menu: '📋 機能メニューを開く',
      help: '❓ ヘルプを取得'
    },
    buttons: {
      dailyReading: '🃏 今日のタロット',
      openApp: '📱 アプリを開く',
      viewHistory: '📚 履歴を表示',
      viewInApp: '📱 アプリで表示'
    },
    messages: {
      pleaseRegister: '最初に /start コマンドで登録してください。',
      alreadyDrawnToday: '🌟 今日はすでにカードを引いています！1日に1枚のタロットカードしか引けません。\n\n/history で今日のリーディングを表示してください。',
      drawingCard: '🔮 今日のタロットカードを引いています...',
      noHistory: '📚 まだタロットカードの記録がありません。\n\n/daily で最初のカード引きを始めましょう！',
      openMiniApp: '🌟 下のボタンをクリックしてタロット・スターズミニアプリを開き、より豊富なタロット機能を体験してください！',
      operationFailed: '操作に失敗しました。後でもう一度お試しください',
      startupFailed: '❌ 起動に失敗しました。後でもう一度お試しください。',
      drawFailed: '❌ カード引きに失敗しました。後でもう一度お試しください。',
      historyFailed: '❌ 履歴の取得に失敗しました。後でもう一度お試しください。'
    },
    help: {
      title: '🔮 *タロット・スターズ使用ガイド*',
      commands: {
        daily: '🃏 */daily* \- 今日のタロットカードガイダンスを取得',
        app: '📱 */app* \- タロットミニアプリを開く',
        history: '📚 */history* \- カード引き履歴を表示',
        help: '❓ */help* \- このヘルプ情報を表示'
      },
      features: {
        title: '✨ *特徴的な機能：*',
        dailyCard: '• 今日のカード：毎日あなた専用のタロットカードを引く',
        professionalReading: '• プロフェッショナルリーディング：詳細なカードの意味とアドバイス',
        historyRecord: '• 履歴記録：すべてのカード引き記録を保存',
        miniApp: '• ミニアプリ：より豊富なインタラクティブ体験'
      },
      closing: '🌟 タロットの知恵があなたの人生の旅路を導きますように！'
    },
    history: {
      title: '📚 *あなたのタロットカード履歴*',
      position: {
        upright: '正位置',
        reversed: '逆位置'
      }
    }
  },
  ko: {
    welcome: {
      title: '🔮 타로 스타즈에 오신 것을 환영합니다!',
      description: '✨ 저는 당신의 전용 타로 가이드로, 매일 타로 카드 통찰을 제공합니다.',
      instructions: {
        daily: '🃏 /daily 로 오늘의 타로 카드 받기',
        app: '📱 /app 으로 타로 미니 앱 열기',
        history: '📚 /history 로 리딩 기록 보기',
        help: '❓ /help 로 도움말 받기'
      }
    },
    commands: {
      start: '🔮 타로 스타즈 시작하기',
      daily: '🌟 오늘의 타로 카드 받기',
      history: '📚 리딩 기록 보기',
      app: '📱 미니 앱 열기',
      menu: '📋 기능 메뉴 열기',
      help: '❓ 도움말 받기'
    },
    buttons: {
      dailyReading: '🃏 오늘의 타로',
      openApp: '📱 앱 열기',
      viewHistory: '📚 기록 보기',
      viewInApp: '📱 앱에서 보기'
    },
    messages: {
      pleaseRegister: '먼저 /start 명령으로 등록해 주세요.',
      alreadyDrawnToday: '🌟 오늘 이미 카드를 뽑으셨습니다! 하루에 한 장의 타로 카드만 뽑을 수 있습니다.\n\n/history 로 오늘의 리딩을 확인하세요.',
      drawingCard: '🔮 오늘의 타로 카드를 뽑고 있습니다...',
      noHistory: '📚 아직 타로 카드 기록이 없습니다.\n\n/daily 로 첫 번째 카드 뽑기를 시작하세요!',
      openMiniApp: '🌟 아래 버튼을 클릭하여 타로 스타즈 미니 앱을 열고 더 풍부한 타로 기능을 경험하세요!',
      operationFailed: '작업이 실패했습니다. 나중에 다시 시도해 주세요',
      startupFailed: '❌ 시작에 실패했습니다. 나중에 다시 시도해 주세요.',
      drawFailed: '❌ 카드 뽑기에 실패했습니다. 나중에 다시 시도해 주세요.',
      historyFailed: '❌ 기록 가져오기에 실패했습니다. 나중에 다시 시도해 주세요.'
    },
    help: {
      title: '🔮 *타로 스타즈 사용 가이드*',
      commands: {
        daily: '🃏 */daily* \- 오늘의 타로 카드 가이던스 받기',
        app: '📱 */app* \- 타로 미니 앱 열기',
        history: '📚 */history* \- 카드 뽑기 기록 보기',
        help: '❓ */help* \- 이 도움말 정보 표시'
      },
      features: {
        title: '✨ *주요 기능:*',
        dailyCard: '• 오늘의 카드: 매일 당신만의 타로 카드 뽑기',
        professionalReading: '• 전문 리딩: 상세한 카드 의미와 조언',
        historyRecord: '• 기록 보관: 모든 카드 뽑기 기록 저장',
        miniApp: '• 미니 앱: 더 풍부한 인터랙티브 경험'
      },
      closing: '🌟 타로의 지혜가 당신의 인생 여정을 인도하기를!'
    },
    history: {
      title: '📚 *당신의 타로 카드 기록*',
      position: {
        upright: '정위치',
        reversed: '역위치'
      }
    }
  }
};

export class BotMessageService {
  static getMessages(language: SupportedLanguage): BotMessages {
    return messages[language] || messages.zh; // 默认回退到中文
  }

  static getCommandDescriptions(language: SupportedLanguage) {
    const msgs = this.getMessages(language);
    return [
      { command: "start", description: msgs.commands.start },
      { command: "daily", description: msgs.commands.daily },
      { command: "history", description: msgs.commands.history },
      { command: "app", description: msgs.commands.app },
      { command: "menu", description: msgs.commands.menu },
      { command: "help", description: msgs.commands.help }
    ];
  }

  static getSupportedLanguages(): SupportedLanguage[] {
    return Object.keys(messages) as SupportedLanguage[];
  }
}

export default BotMessageService;