import { SupportedLanguage } from '../types/common';

// 多语言卡牌内容类型
export interface MultiLanguageCardContent {
  name: string;
  description: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  keywords: {
    upright: string[];
    reversed: string[];
  };
}

// 完整的多语言塔罗牌内容
export const MULTILINGUAL_TAROT_CONTENTS: Record<string, Record<SupportedLanguage, MultiLanguageCardContent>> = {
  // 大阿卡纳 (Major Arcana)
  'fool': {
    zh: {
      name: '愚者',
      description: '愚者代表新的开始、纯真和冒险精神，象征着踏上人生旅程的第一步',
      meaning: {
        upright: '新开始、纯真、自发性、自由精神',
        reversed: '鲁莽、冒险、愚蠢、缺乏方向'
      },
      keywords: {
        upright: ['新开始', '纯真', '冒险', '自由'],
        reversed: ['鲁莽', '愚蠢', '缺乏计划', '冲动']
      }
    },
    en: {
      name: 'The Fool',
      description: 'The Fool represents new beginnings, innocence, and adventure, symbolizing the first step on life\'s journey',
      meaning: {
        upright: 'New beginnings, innocence, spontaneity, free spirit',
        reversed: 'Recklessness, risk-taking, foolishness, lack of direction'
      },
      keywords: {
        upright: ['new beginnings', 'innocence', 'adventure', 'freedom'],
        reversed: ['recklessness', 'foolishness', 'lack of planning', 'impulsiveness']
      }
    },
    ja: {
      name: '愚者',
      description: '愚者は新しい始まり、純真さ、冒険心を表し、人生の旅路の第一歩を象徴します',
      meaning: {
        upright: '新しい始まり、純真さ、自発性、自由な精神',
        reversed: '無謀さ、リスクテイク、愚かさ、方向性の欠如'
      },
      keywords: {
        upright: ['新しい始まり', '純真さ', '冒険', '自由'],
        reversed: ['無謀', '愚かさ', '計画性の欠如', '衝動性']
      }
    },
    ko: {
      name: '바보',
      description: '바보는 새로운 시작, 순수함, 모험 정신을 나타내며, 인생 여정의 첫 걸음을 상징합니다',
      meaning: {
        upright: '새로운 시작, 순수함, 자발성, 자유로운 정신',
        reversed: '무모함, 위험 감수, 어리석음, 방향성 부족'
      },
      keywords: {
        upright: ['새로운 시작', '순수함', '모험', '자유'],
        reversed: ['무모함', '어리석음', '계획성 부족', '충동성']
      }
    }
  },
  
  'magician': {
    zh: {
      name: '魔术师',
      description: '魔术师代表意志力、技能和创造力，象征着将想法转化为现实的能力',
      meaning: {
        upright: '意志力、技能、集中、创造力',
        reversed: '操控、欺骗、缺乏技能、分散注意力'
      },
      keywords: {
        upright: ['意志力', '技能', '创造力', '专注'],
        reversed: ['操控', '欺骗', '缺乏技能', '分心']
      }
    },
    en: {
      name: 'The Magician',
      description: 'The Magician represents willpower, skill, and creativity, symbolizing the ability to turn ideas into reality',
      meaning: {
        upright: 'Willpower, skill, concentration, creativity',
        reversed: 'Manipulation, deception, lack of skill, scattered energy'
      },
      keywords: {
        upright: ['willpower', 'skill', 'creativity', 'focus'],
        reversed: ['manipulation', 'deception', 'lack of skill', 'distraction']
      }
    },
    ja: {
      name: '魔術師',
      description: '魔術師は意志力、技術、創造力を表し、アイデアを現実に変える能力を象徴します',
      meaning: {
        upright: '意志力、技術、集中力、創造力',
        reversed: '操作、欺瞞、技術不足、散漫なエネルギー'
      },
      keywords: {
        upright: ['意志力', '技術', '創造力', '集中'],
        reversed: ['操作', '欺瞞', '技術不足', '注意散漫']
      }
    },
    ko: {
      name: '마법사',
      description: '마법사는 의지력, 기술, 창조력을 나타내며, 아이디어를 현실로 바꾸는 능력을 상징합니다',
      meaning: {
        upright: '의지력, 기술, 집중력, 창조력',
        reversed: '조작, 기만, 기술 부족, 산만한 에너지'
      },
      keywords: {
        upright: ['의지력', '기술', '창조력', '집중'],
        reversed: ['조작', '기만', '기술 부족', '주의 산만']
      }
    }
  },
  
  'high-priestess': {
    zh: {
      name: '女祭司',
      description: '女祭司代表直觉、神秘和内在智慧，象征着潜意识和精神洞察力',
      meaning: {
        upright: '直觉、潜意识、神秘、内在智慧',
        reversed: '缺乏直觉、秘密、断开连接、内在混乱'
      },
      keywords: {
        upright: ['直觉', '神秘', '内在智慧', '潜意识'],
        reversed: ['缺乏直觉', '秘密', '断开', '混乱']
      }
    },
    en: {
      name: 'The High Priestess',
      description: 'The High Priestess represents intuition, mystery, and inner wisdom, symbolizing the subconscious and spiritual insight',
      meaning: {
        upright: 'Intuition, subconscious, mystery, inner wisdom',
        reversed: 'Lack of intuition, secrets, disconnection, inner turmoil'
      },
      keywords: {
        upright: ['intuition', 'mystery', 'inner wisdom', 'subconscious'],
        reversed: ['lack of intuition', 'secrets', 'disconnection', 'confusion']
      }
    },
    ja: {
      name: '女教皇',
      description: '女教皇は直感、神秘、内なる知恵を表し、潜在意識と精神的洞察力を象徴します',
      meaning: {
        upright: '直感、潜在意識、神秘、内なる知恵',
        reversed: '直感の欠如、秘密、断絶、内なる混乱'
      },
      keywords: {
        upright: ['直感', '神秘', '内なる知恵', '潜在意識'],
        reversed: ['直感の欠如', '秘密', '断絶', '混乱']
      }
    },
    ko: {
      name: '여사제',
      description: '여사제는 직관, 신비, 내면의 지혜를 나타내며, 잠재의식과 영적 통찰력을 상징합니다',
      meaning: {
        upright: '직관, 잠재의식, 신비, 내면의 지혜',
        reversed: '직관 부족, 비밀, 단절, 내면의 혼란'
      },
      keywords: {
        upright: ['직관', '신비', '내면의 지혜', '잠재의식'],
        reversed: ['직관 부족', '비밀', '단절', '혼란']
      }
    }
  },
  
  // 小阿卡纳示例 - 宝剑十
  'ten-of-swords': {
    zh: {
      name: '宝剑十',
      description: '宝剑十代表痛苦的结束、背叛和触底反弹，象征着困难时期的终结',
      meaning: {
        upright: '痛苦结束、背叛、触底反弹、新的开始',
        reversed: '恢复、重生、宽恕、避免灾难'
      },
      keywords: {
        upright: ['痛苦结束', '背叛', '触底反弹', '困难'],
        reversed: ['恢复', '重生', '宽恕', '避免灾难']
      }
    },
    en: {
      name: 'Ten of Swords',
      description: 'Ten of Swords represents the end of pain, betrayal, and hitting rock bottom, symbolizing the end of difficult times',
      meaning: {
        upright: 'End of pain, betrayal, rock bottom, new beginning',
        reversed: 'Recovery, regeneration, forgiveness, avoiding disaster'
      },
      keywords: {
        upright: ['end of pain', 'betrayal', 'rock bottom', 'difficulties'],
        reversed: ['recovery', 'regeneration', 'forgiveness', 'avoiding disaster']
      }
    },
    ja: {
      name: '剣の10',
      description: '剣の10は痛みの終わり、裏切り、どん底を表し、困難な時期の終了を象徴します',
      meaning: {
        upright: '痛みの終わり、裏切り、どん底、新しい始まり',
        reversed: '回復、再生、許し、災難の回避'
      },
      keywords: {
        upright: ['痛みの終わり', '裏切り', 'どん底', '困難'],
        reversed: ['回復', '再生', '許し', '災難回避']
      }
    },
    ko: {
      name: '검의 10',
      description: '검의 10은 고통의 끝, 배신, 바닥을 치는 것을 나타내며, 어려운 시기의 종료를 상징합니다',
      meaning: {
        upright: '고통의 끝, 배신, 바닥, 새로운 시작',
        reversed: '회복, 재생, 용서, 재난 회피'
      },
      keywords: {
        upright: ['고통의 끝', '배신', '바닥', '어려움'],
        reversed: ['회복', '재생', '용서', '재난 회피']
      }
    }
  }
};

/**
 * 获取卡牌的多语言内容
 */
export function getCardMultiLanguageContent(cardId: string): Record<SupportedLanguage, MultiLanguageCardContent> | null {
  return MULTILINGUAL_TAROT_CONTENTS[cardId] || null;
}

/**
 * 获取特定语言的卡牌内容
 */
export function getCardContentByLanguage(cardId: string, language: SupportedLanguage): MultiLanguageCardContent | null {
  const content = MULTILINGUAL_TAROT_CONTENTS[cardId];
  return content?.[language] || null;
}

/**
 * 生成默认的多语言内容（用于没有预定义翻译的卡牌）
 */
export function generateDefaultMultiLanguageContent(
  cardId: string, 
  originalName: string, 
  originalDescription: string
): Record<SupportedLanguage, MultiLanguageCardContent> {
  return {
    zh: {
      name: originalName,
      description: originalDescription,
      meaning: {
        upright: '正位含义待补充',
        reversed: '逆位含义待补充'
      },
      keywords: {
        upright: ['关键词1', '关键词2'],
        reversed: ['逆位关键词1', '逆位关键词2']
      }
    },
    en: {
      name: originalName,
      description: originalDescription,
      meaning: {
        upright: 'Upright meaning to be added',
        reversed: 'Reversed meaning to be added'
      },
      keywords: {
        upright: ['keyword1', 'keyword2'],
        reversed: ['reversed keyword1', 'reversed keyword2']
      }
    },
    ja: {
      name: `${originalName}（日本語）`,
      description: `${originalDescription}（日本語版）`,
      meaning: {
        upright: '正位置の意味を追加予定',
        reversed: '逆位置の意味を追加予定'
      },
      keywords: {
        upright: ['キーワード1', 'キーワード2'],
        reversed: ['逆位置キーワード1', '逆位置キーワード2']
      }
    },
    ko: {
      name: `${originalName}（한국어）`,
      description: `${originalDescription}（한국어 버전）`,
      meaning: {
        upright: '정위치 의미 추가 예정',
        reversed: '역위치 의미 추가 예정'
      },
      keywords: {
        upright: ['키워드1', '키워드2'],
        reversed: ['역위치 키워드1', '역위치 키워드2']
      }
    }
  };
}

/**
 * 检查卡牌是否有完整的多语言内容
 */
export function hasCompleteMultiLanguageContent(cardId: string): boolean {
  const content = MULTILINGUAL_TAROT_CONTENTS[cardId];
  if (!content) return false;
  
  const languages: SupportedLanguage[] = ['zh', 'en', 'ja', 'ko'];
  return languages.every(lang => content[lang] && content[lang].name && content[lang].description);
}

/**
 * 获取所有支持多语言的卡牌ID列表
 */
export function getSupportedMultiLanguageCardIds(): string[] {
  return Object.keys(MULTILINGUAL_TAROT_CONTENTS);
}