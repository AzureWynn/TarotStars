import axios from 'axios';
import { RiderWaiteTarotCard, TAROT_DECK_TYPES, RIDER_WAITE_DECK } from '../../domain/entities/TarotDeck';
import { MongoConnection } from '../database/MongoConnection';

/**
 * Rider-Waite 塔罗牌数据接口（来自公有API）
 */
interface RiderWaiteApiCard {
  name: string;
  name_short: string;
  type: 'major' | 'minor';
  suit?: string;
  value?: string;
  value_int?: number;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
}

interface RiderWaiteApiResponse {
  nhits: number;
  cards: RiderWaiteApiCard[];
}

/**
 * Rider-Waite 塔罗牌数据服务
 * 专门处理从公有库获取和转换 Rider-Waite 塔罗牌数据
 */
export class RiderWaiteDataService {
  private db = MongoConnection.getInstance().getDb();
  private readonly API_BASE_URL = 'https://tarotapi.dev/api/v1';
  
  /**
   * 从API获取Rider-Waite塔罗牌数据
   */
  async fetchRiderWaiteCards(): Promise<RiderWaiteApiCard[]> {
    try {
      console.log('🔄 Fetching Rider-Waite tarot cards from API...');
      const response = await axios.get<RiderWaiteApiResponse>(`${this.API_BASE_URL}/cards`);
      
      if (response.data && response.data.cards) {
        console.log(`✅ Successfully fetched ${response.data.cards.length} Rider-Waite cards from API`);
        return response.data.cards;
      }
      
      throw new Error('Invalid API response format');
    } catch (error) {
      console.error('❌ Failed to fetch Rider-Waite cards from API:', error);
      throw error;
    }
  }

  /**
   * 将API数据转换为标准化的多语言塔罗牌格式
   */
  private convertToEnhancedTarotCard(apiCard: RiderWaiteApiCard, cardIndex: number): RiderWaiteTarotCard {
    const chineseTranslation = this.getChineseTranslation(apiCard.name);
    const englishKeywords = this.extractEnglishKeywords(apiCard.meaning_up, apiCard.meaning_rev);
    const chineseKeywords = this.translateKeywords(englishKeywords);
    
    // 生成标准化ID和卡牌编号
    const cardId = this.generateCardId(apiCard, cardIndex);
    const cardNumber = apiCard.type === 'major' ? (apiCard.value_int ?? cardIndex + 1) : cardIndex + 1;
    
    return {
      id: cardId,
      deckId: TAROT_DECK_TYPES.RIDER_WAITE,
      cardNumber: cardNumber,
      suit: apiCard.suit,
      rank: this.extractRank(apiCard.name, apiCard.value),
      category: apiCard.type,
      
      // 标准化多语言内容
      content: {
        zh: {
          name: chineseTranslation.name,
          description: chineseTranslation.description,
          meaning: {
            upright: this.translateMeaning(apiCard.meaning_up, 'zh'),
            reversed: this.translateMeaning(apiCard.meaning_rev, 'zh')
          },
          keywords: {
            upright: chineseKeywords.upright,
            reversed: chineseKeywords.reversed
          }
        },
        en: {
          name: apiCard.name,
          description: apiCard.desc || `${apiCard.name} represents the essence of ${apiCard.type} arcana.`,
          meaning: {
            upright: apiCard.meaning_up,
            reversed: apiCard.meaning_rev
          },
          keywords: {
            upright: englishKeywords.upright,
            reversed: englishKeywords.reversed
          }
        }
      },
      
      // 图片资源
      images: {
        original: `/images/rider-waite/original/${apiCard.name_short}.jpg`,
        thumbnail: `/images/rider-waite/thumbnails/${apiCard.name_short}_thumb.jpg`,
        watermark: `/images/rider-waite/watermark/${apiCard.name_short}_wm.jpg`
      },
      
      // 元数据
      metadata: {
        sourceUrl: `${this.API_BASE_URL}/cards/${apiCard.name_short}`,
        license: 'Public Domain',
        tags: this.generateTags(apiCard)
      },
      
      // Rider-Waite 特有属性
      riderWaiteMetadata: {
        originalArtist: 'Pamela Colman Smith',
        symbolism: this.getSymbolism(apiCard.name),
        astrologicalCorrespondence: this.getAstrologicalCorrespondence(apiCard.name),
        hebrewLetter: apiCard.type === 'major' ? this.getHebrewLetter(apiCard.value_int) : undefined,
        numerology: apiCard.value_int
      },
      
      // 系统字段
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 生成标准化的卡牌ID
   */
  private generateCardId(apiCard: RiderWaiteApiCard, index: number): string {
    if (apiCard.type === 'major') {
      return `rw-major-${String(apiCard.value_int || index).padStart(2, '0')}`;
    } else {
      const suit = apiCard.suit || 'unknown';
      const value = apiCard.value || String(index);
      return `rw-minor-${suit}-${value}`.toLowerCase().replace(/\s+/g, '-');
    }
  }

  /**
   * 提取牌的等级（如 ace, two, king 等）
   */
  private extractRank(cardName: string, value?: string): string | undefined {
    if (value) return value.toLowerCase();
    
    const rankPatterns = {
      'ace': /ace/i,
      'two': /two/i,
      'three': /three/i,
      'four': /four/i,
      'five': /five/i,
      'six': /six/i,
      'seven': /seven/i,
      'eight': /eight/i,
      'nine': /nine/i,
      'ten': /ten/i,
      'page': /page/i,
      'knight': /knight/i,
      'queen': /queen/i,
      'king': /king/i
    };
    
    for (const [rank, pattern] of Object.entries(rankPatterns)) {
      if (pattern.test(cardName)) {
        return rank;
      }
    }
    
    return undefined;
  }

  /**
   * 获取中文翻译
   */
  private getChineseTranslation(englishName: string): { name: string; description: string } {
    const translations: { [key: string]: { name: string; description: string } } = {
      // 大阿卡纳
      'The Fool': { name: '愚者', description: '愚者代表新的开始、纯真和冒险精神，象征着无限的可能性和对未知的勇敢探索。' },
      'The Magician': { name: '魔术师', description: '魔术师代表意志力、创造力和实现目标的能力，象征着将想法转化为现实的力量。' },
      'The High Priestess': { name: '女祭司', description: '女祭司代表直觉、神秘和内在智慧，象征着潜意识的深层知识和精神洞察力。' },
      'The Empress': { name: '皇后', description: '皇后代表丰饶、母性和创造力，象征着生命力、养育和自然的丰盛。' },
      'The Emperor': { name: '皇帝', description: '皇帝代表权威、结构和父性力量，象征着领导力、秩序和稳定的基础。' },
      'The Hierophant': { name: '教皇', description: '教皇代表传统、精神指导和宗教智慧，象征着传统价值观和精神导师的指引。' },
      'The Lovers': { name: '恋人', description: '恋人代表爱情、关系和重要选择，象征着和谐、结合和人生重大决定。' },
      'The Chariot': { name: '战车', description: '战车代表意志力、决心和胜利，象征着通过自律和专注克服障碍。' },
      'Strength': { name: '力量', description: '力量代表内在力量、勇气和耐心，象征着温柔的坚韧和精神上的勇气。' },
      'The Hermit': { name: '隐士', description: '隐士代表内省、寻求真理和精神指导，象征着独处中的智慧和内在的光明。' },
      'Wheel of Fortune': { name: '命运之轮', description: '命运之轮代表变化、循环和命运，象征着生命的起伏和宇宙的循环规律。' },
      'Justice': { name: '正义', description: '正义代表公平、真理和因果报应，象征着道德平衡和公正的判断。' },
      'The Hanged Man': { name: '倒吊人', description: '倒吊人代表牺牲、等待和新的视角，象征着通过放下获得新的理解。' },
      'Death': { name: '死神', description: '死神代表结束、转变和重生，象征着生命周期的自然转换和新的开始。' },
      'Temperance': { name: '节制', description: '节制代表平衡、耐心和中庸之道，象征着和谐的融合和适度的美德。' },
      'The Devil': { name: '恶魔', description: '恶魔代表束缚、诱惑和物质主义，象征着需要克服的内在阴影和限制。' },
      'The Tower': { name: '塔', description: '塔代表突然的变化、破坏和启示，象征着旧结构的崩塌和真相的揭露。' },
      'The Star': { name: '星星', description: '星星代表希望、灵感和精神指引，象征着在黑暗中的光明和对未来的信心。' },
      'The Moon': { name: '月亮', description: '月亮代表幻觉、恐惧和潜意识，象征着内在的不确定性和隐藏的真相。' },
      'The Sun': { name: '太阳', description: '太阳代表快乐、成功和活力，象征着生命的喜悦、成就和正面的能量。' },
      'Judgement': { name: '审判', description: '审判代表重生、内在呼唤和宽恕，象征着精神的觉醒和新生命的开始。' },
      'The World': { name: '世界', description: '世界代表完成、成就和圆满，象征着旅程的终点和目标的实现。' },
      
      // 小阿卡纳 - 权杖
      'Ace of Wands': { name: '权杖王牌', description: '权杖王牌代表新的创意、灵感和机会，象征着创造力的火花和新项目的开始。' },
      'Two of Wands': { name: '权杖二', description: '权杖二代表个人力量、计划和未来规划，象征着远见和对未来的掌控。' },
      'Three of Wands': { name: '权杖三', description: '权杖三代表扩展、远见和贸易，象征着计划的实施和国际化的视野。' },
      'Four of Wands': { name: '权杖四', description: '权杖四代表庆祝、和谐和家庭，象征着稳定的基础和值得庆祝的成就。' },
      'Five of Wands': { name: '权杖五', description: '权杖五代表冲突、竞争和挑战，象征着意见分歧和建设性的竞争。' },
      'Six of Wands': { name: '权杖六', description: '权杖六代表胜利、公众认可和成功，象征着领导力和公开的赞誉。' },
      'Seven of Wands': { name: '权杖七', description: '权杖七代表挑战、坚持和防御，象征着在逆境中坚持立场的勇气。' },
      'Eight of Wands': { name: '权杖八', description: '权杖八代表快速行动、进展和消息，象征着事情的快速发展和沟通。' },
      'Nine of Wands': { name: '权杖九', description: '权杖九代表韧性、坚持和最后的推动，象征着在困难中的坚韧不拔。' },
      'Ten of Wands': { name: '权杖十', description: '权杖十代表负担、责任和努力工作，象征着承担重责和接近目标的努力。' },
      'Page of Wands': { name: '权杖侍从', description: '权杖侍从代表探索、兴奋和自由精神，象征着年轻的热情和新的冒险。' },
      'Knight of Wands': { name: '权杖骑士', description: '权杖骑士代表冲动、冒险和能量，象征着行动导向和冒险精神。' },
      'Queen of Wands': { name: '权杖王后', description: '权杖王后代表自信、决心和独立，象征着女性的领导力和创造性能量。' },
      'King of Wands': { name: '权杖国王', description: '权杖国王代表领导力、愿景和企业家精神，象征着成熟的领导者和创新者。' }
      
      // 可以继续添加其他花色的翻译...
    };
    
    return translations[englishName] || {
      name: englishName,
      description: `${englishName}在韦特塔罗牌中的含义和象征意义。`
    };
  }

  /**
   * 提取英文关键词
   */
  private extractEnglishKeywords(uprightMeaning: string, reversedMeaning: string): {
    upright: string[];
    reversed: string[];
  } {
    const extractKeywords = (text: string): string[] => {
      return text
        .split(/[,;.]/) // 按标点分割
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0 && keyword.length < 20) // 过滤空值和过长的词
        .slice(0, 6); // 最多6个关键词
    };
    
    return {
      upright: extractKeywords(uprightMeaning),
      reversed: extractKeywords(reversedMeaning)
    };
  }

  /**
   * 翻译关键词
   */
  private translateKeywords(englishKeywords: { upright: string[]; reversed: string[] }): {
    upright: string[];
    reversed: string[];
  } {
    const keywordTranslations: { [key: string]: string } = {
      // 正面关键词
      'new beginnings': '新开始',
      'innocence': '纯真',
      'spontaneity': '自发性',
      'free spirit': '自由精神',
      'willpower': '意志力',
      'desire': '欲望',
      'creation': '创造',
      'manifestation': '显化',
      'intuition': '直觉',
      'unconscious': '潜意识',
      'mystery': '神秘',
      'wisdom': '智慧',
      'fertility': '丰饶',
      'femininity': '女性气质',
      'beauty': '美丽',
      'nature': '自然',
      'authority': '权威',
      'structure': '结构',
      'control': '控制',
      'father figure': '父亲形象',
      'tradition': '传统',
      'conformity': '遵从',
      'morality': '道德',
      'love': '爱情',
      'relationships': '关系',
      'choices': '选择',
      'determination': '决心',
      'victory': '胜利',
      'inner strength': '内在力量',
      'courage': '勇气',
      'patience': '耐心',
      'soul searching': '灵魂探索',
      'seeking truth': '寻求真理',
      'guidance': '指导',
      'change': '变化',
      'cycles': '循环',
      'destiny': '命运',
      'fairness': '公平',
      'truth': '真理',
      'cause and effect': '因果',
      'sacrifice': '牺牲',
      'waiting': '等待',
      'new perspective': '新视角',
      'endings': '结束',
      'transformation': '转变',
      'rebirth': '重生',
      'balance': '平衡',
      'moderation': '节制',
      'middle path': '中庸之道',
      'bondage': '束缚',
      'temptation': '诱惑',
      'materialism': '物质主义',
      'sudden change': '突然变化',
      'upheaval': '剧变',
      'revelation': '启示',
      'hope': '希望',
      'inspiration': '灵感',
      'spirituality': '精神性',
      'illusion': '幻觉',
      'fear': '恐惧',
      'subconscious': '潜意识',
      'joy': '快乐',
      'success': '成功',
      'vitality': '活力',
      'inner calling': '内在呼唤',
      'forgiveness': '宽恕',
      'completion': '完成',
      'achievement': '成就',
      'fulfillment': '圆满',
      
      // 负面关键词
      'recklessness': '鲁莽',
      'risk-taking': '冒险',
      'foolishness': '愚蠢',
      'lack of direction': '缺乏方向',
      'manipulation': '操纵',
      'deception': '欺骗',
      'lack of energy': '缺乏能量',
      'confusion': '混乱',
      'lack of inner voice': '缺乏内在声音',
      'secrets': '秘密',
      'disconnection': '断开连接',
      'creative block': '创造力阻塞',
      'dependence': '依赖',
      'emptiness': '空虚',
      'tyranny': '专制',
      'lack of discipline': '缺乏纪律',
      'inflexibility': '不灵活'
    };
    
    const translateArray = (keywords: string[]): string[] => {
      return keywords.map(keyword => {
        const lowerKeyword = keyword.toLowerCase().trim();
        return keywordTranslations[lowerKeyword] || keyword;
      });
    };
    
    return {
      upright: translateArray(englishKeywords.upright),
      reversed: translateArray(englishKeywords.reversed)
    };
  }

  /**
   * 翻译含义描述
   */
  private translateMeaning(englishMeaning: string, targetLanguage: 'zh' | 'en'): string {
    if (targetLanguage === 'en') {
      return englishMeaning;
    }
    
    // 简化的中文翻译逻辑
    // 在实际项目中，这里可以集成专业的翻译API
    const meaningTranslations: { [key: string]: string } = {
      'new beginnings, innocence, spontaneity, free spirit': '新的开始、纯真、自发性、自由精神',
      'recklessness, taken advantage of, inconsideration': '鲁莽、被利用、不考虑后果',
      'willpower, desire, creation, manifestation': '意志力、欲望、创造、显化',
      'manipulation, poor planning, untapped talents': '操纵、计划不周、未开发的才能'
    };
    
    // 尝试直接匹配
    const directTranslation = meaningTranslations[englishMeaning.toLowerCase()];
    if (directTranslation) {
      return directTranslation;
    }
    
    // 如果没有直接翻译，返回原文（后续可以集成翻译服务）
    return englishMeaning;
  }

  /**
   * 生成标签
   */
  private generateTags(apiCard: RiderWaiteApiCard): string[] {
    const tags = ['rider-waite', 'traditional', 'classic'];
    
    if (apiCard.type === 'major') {
      tags.push('major-arcana', 'spiritual-journey');
    } else {
      tags.push('minor-arcana', 'daily-life');
      if (apiCard.suit) {
        tags.push(`suit-${apiCard.suit}`);
      }
    }
    
    // 根据牌名添加特定标签
    if (apiCard.name.includes('King') || apiCard.name.includes('Queen')) {
      tags.push('court-card', 'leadership');
    }
    
    if (apiCard.name.includes('Ace')) {
      tags.push('new-beginnings', 'potential');
    }
    
    return tags;
  }

  /**
   * 获取象征意义
   */
  private getSymbolism(cardName: string): string[] {
    const symbolismMap: { [key: string]: string[] } = {
      'The Fool': ['白玫瑰', '悬崖', '小狗', '太阳', '背包'],
      'The Magician': ['无限符号', '四元素', '红玫瑰', '白百合', '祭坛'],
      'The High Priestess': ['月亮', '石榴', '帷幕', '水', '十字架'],
      'The Empress': ['维纳斯符号', '麦穗', '瀑布', '森林', '皇冠'],
      'The Emperor': ['公羊头', '宝座', '权杖', '山脉', '盔甲']
      // 可以继续添加更多牌的象征意义
    };
    
    return symbolismMap[cardName] || ['传统塔罗象征'];
  }

  /**
   * 获取占星对应
   */
  private getAstrologicalCorrespondence(cardName: string): string | undefined {
    const astroMap: { [key: string]: string } = {
      'The Fool': '天王星',
      'The Magician': '水星',
      'The High Priestess': '月亮',
      'The Empress': '金星',
      'The Emperor': '白羊座',
      'The Hierophant': '金牛座',
      'The Lovers': '双子座',
      'The Chariot': '巨蟹座',
      'Strength': '狮子座',
      'The Hermit': '处女座',
      'Wheel of Fortune': '木星',
      'Justice': '天秤座',
      'The Hanged Man': '海王星',
      'Death': '天蝎座',
      'Temperance': '射手座',
      'The Devil': '摩羯座',
      'The Tower': '火星',
      'The Star': '水瓶座',
      'The Moon': '双鱼座',
      'The Sun': '太阳',
      'Judgement': '冥王星',
      'The World': '土星'
    };
    
    return astroMap[cardName];
  }

  /**
   * 获取希伯来字母对应（仅大阿卡纳）
   */
  private getHebrewLetter(cardNumber?: number): string | undefined {
    if (cardNumber === undefined) return undefined;
    
    const hebrewLetters = [
      'Aleph', 'Beth', 'Gimel', 'Daleth', 'Heh', 'Vav', 'Zayin',
      'Cheth', 'Teth', 'Yod', 'Kaph', 'Lamed', 'Mem', 'Nun',
      'Samekh', 'Ayin', 'Peh', 'Tzaddi', 'Qoph', 'Resh', 'Shin', 'Tav'
    ];
    
    return hebrewLetters[cardNumber] || undefined;
  }

  /**
   * 执行完整的Rider-Waite数据迁移
   */
  async performRiderWaiteMigration(): Promise<void> {
    try {
      console.log('🚀 Starting Rider-Waite tarot cards migration...');
      
      // 1. 确保塔罗牌版本记录存在
      await this.ensureDeckRecord();
      
      // 2. 获取API数据
      const apiCards = await this.fetchRiderWaiteCards();
      
      // 3. 对大阿卡纳按照value_int排序，确保正确的顺序
      const sortedApiCards = apiCards.sort((a, b) => {
        if (a.type === 'major' && b.type === 'major') {
          return (a.value_int || 0) - (b.value_int || 0);
        }
        return 0; // 小阿卡纳保持原顺序
      });
      
      // 4. 转换为增强格式
      const enhancedCards: RiderWaiteTarotCard[] = sortedApiCards.map((apiCard, index) => 
        this.convertToEnhancedTarotCard(apiCard, index)
      );
      
      console.log(`🔄 Converted ${enhancedCards.length} cards to enhanced format`);
      
      // 4. 保存到数据库
      await this.saveCardsToDatabase(enhancedCards);
      
      console.log('✅ Rider-Waite migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Rider-Waite migration failed:', error);
      throw error;
    }
  }

  /**
   * 确保塔罗牌版本记录存在
   */
  private async ensureDeckRecord(): Promise<void> {
    const decksCollection = this.db.collection('tarot_decks');
    
    const existingDeck = await decksCollection.findOne({ id: TAROT_DECK_TYPES.RIDER_WAITE });
    
    if (!existingDeck) {
      await decksCollection.insertOne(RIDER_WAITE_DECK);
      console.log('📚 Created Rider-Waite deck record');
    } else {
      console.log('📚 Rider-Waite deck record already exists');
    }
  }

  /**
   * 保存卡牌到数据库
   */
  private async saveCardsToDatabase(cards: RiderWaiteTarotCard[]): Promise<void> {
    const cardsCollection = this.db.collection('enhanced_tarot_cards');
    
    // 清除现有的Rider-Waite卡牌
    await cardsCollection.deleteMany({ deckId: TAROT_DECK_TYPES.RIDER_WAITE });
    console.log('🗑️ Cleared existing Rider-Waite cards');
    
    // 插入新卡牌
    await cardsCollection.insertMany(cards);
    console.log(`💾 Saved ${cards.length} Rider-Waite cards to database`);
    
    // 创建索引
    await this.createIndexes(cardsCollection);
  }

  /**
   * 创建数据库索引
   */
  private async createIndexes(collection: any): Promise<void> {
    try {
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ deckId: 1 });
      await collection.createIndex({ category: 1 });
      await collection.createIndex({ suit: 1 });
      await collection.createIndex({ cardNumber: 1 });
      await collection.createIndex({ isActive: 1 });
      await collection.createIndex({ 'metadata.tags': 1 });
      
      console.log('📊 Database indexes created for enhanced tarot cards');
    } catch (error) {
      console.warn('⚠️ Index creation warning:', error);
    }
  }
}