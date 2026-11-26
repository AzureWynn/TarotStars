#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { MongoConnection } from '../infrastructure/database/MongoConnection';
import {
  CardCategory,
  CardSuit,
  TarotCardNew,
  TarotDeckNew,
  SupportedLanguage,
  CardMultiLanguageContent
} from '../domain/entities/NewTarotSchema';

interface RawCardData {
  id: number;
  arcana: string;
  suit: string | { zh: string; en: string } | null;
  rank: string | { zh: string; en: string } | null;
  number: number;
  name_zh: string;
  name_en: string;
  element: string | null;
  astrology: string | null;
  keywords_upright: string[];
  keywords_reversed: string[];
  meaning_upright: string;
  meaning_reversed: string;
  love_upright: string;
  love_reversed: string;
  career_upright: string;
  career_reversed: string;
  finance_upright: string;
  finance_reversed: string;
  description: string;
  advice: string;
  notes: string;
}

/**
 * 导入78张塔罗牌数据到数据库
 */
async function importTarotCards(): Promise<void> {
  console.log('🚀 Starting tarot card import...');
  console.log('='.repeat(60));
  
  try {
    // 1. 连接数据库
    console.log('🔌 Connecting to database...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tarot-stars';
    const dbName = process.env.MONGODB_DB_NAME || 'tarot-stars';
    await MongoConnection.getInstance().connect(mongoUri, dbName);
    console.log('✅ Database connected successfully');
    
    const db = MongoConnection.getInstance().getDb();
    const categoriesCollection = db.collection<CardCategory>('tarot_categories');
    const suitsCollection = db.collection<CardSuit>('tarot_suits');
    const cardsCollection = db.collection<TarotCardNew>('tarot_cards_multilingual');
    const decksCollection = db.collection<TarotDeckNew>('tarot_decks');
    
    // 2. 创建基础数据
    console.log('\n📝 Creating base data...');
    await createBaseData(categoriesCollection, suitsCollection, decksCollection);
    
    // 3. 读取JSON文件
    console.log('\n📖 Reading tarot card data...');
    const jsonPath = path.join(__dirname, 'tarot_78_full_zh.json');
    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const rawCards: RawCardData[] = JSON.parse(rawData);
    console.log(`✅ Loaded ${rawCards.length} cards from JSON`);
    
    // 4. 收集所有需要翻译的关键词
    console.log('\n🔄 Collecting keywords for translation...');
    const allKeywords = new Set<string>();
    rawCards.forEach(card => {
      card.keywords_upright.forEach(kw => allKeywords.add(kw));
      card.keywords_reversed.forEach(kw => allKeywords.add(kw));
    });
    const uniqueKeywords = Array.from(allKeywords);
    console.log(`   Found ${uniqueKeywords.length} unique keywords to translate`);
    
    // 5. 批量翻译关键词
    console.log('\n🌐 Translating keywords with Ollama (gemma4:e2b)...');
    const translationMap = await batchTranslateKeywords(uniqueKeywords);
    console.log(`✅ Translated ${translationMap.size} keywords`);
    
    // 6. 转换并导入卡牌数据
    console.log('\n🔄 Converting and importing cards...');
    const newCards: TarotCardNew[] = rawCards.map(rawCard => 
      convertCardToNewFormat(rawCard, translationMap)
    );
    
    // 清空现有数据并插入新数据
    await cardsCollection.deleteMany({});
    const result = await cardsCollection.insertMany(newCards);
    console.log(`✅ Successfully imported ${result.insertedCount} cards`);
    
    // 7. 创建索引
    console.log('\n🔧 Creating indexes...');
    await createIndexes(cardsCollection, categoriesCollection, suitsCollection, decksCollection);
    
    // 8. 验证导入结果
    console.log('\n🔍 Verifying import...');
    await verifyImport(cardsCollection, categoriesCollection, suitsCollection, decksCollection);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Tarot card import completed successfully!');
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await MongoConnection.getInstance().disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

/**
 * 批量翻译关键词
 */
async function batchTranslateKeywords(keywords: string[]): Promise<Map<string, string>> {
  const translationMap = new Map<string, string>();
  const batchSize = 20;
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize);
    console.log(`   Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(keywords.length / batchSize)} (${batch.length} keywords)...`);
    
    try {
      const prompt = `Translate these Chinese tarot keywords to English. Return ONLY a JSON object where keys are the original Chinese words and values are English translations.

Keywords: ${batch.join(', ')}

JSON:`;

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'gemma4:e2b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 500
        }
      });

      const generatedText = response.data.response.trim();
      
      // 尝试提取 JSON（处理 markdown 代码块格式）
      const jsonMatch = generatedText.match(/```(?:json)?\s*([\s\S]*?)```/) || generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const translations = JSON.parse(jsonStr);
          Object.entries(translations).forEach(([zh, en]) => {
            translationMap.set(zh, en as string);
          });
          console.log(`     ✅ Batch translated successfully`);
        } catch (parseError) {
          console.warn('     ⚠️ JSON parse error, using original keywords');
          batch.forEach(kw => translationMap.set(kw, kw));
        }
      } else {
        console.warn('     ⚠️ No JSON found, using original keywords');
        batch.forEach(kw => translationMap.set(kw, kw));
      }
    } catch (error: any) {
      console.error(`     ❌ Batch translation failed: ${error.message}`);
      batch.forEach(kw => translationMap.set(kw, kw));
    }
  }
  
  return translationMap;
}

/**
 * 创建基础数据（分类、花色、牌组）
 */
async function createBaseData(
  categoriesCollection: any,
  suitsCollection: any,
  decksCollection: any
): Promise<void> {
  const now = Date.now();
  
  const categories: CardCategory[] = [
    {
      categoryId: 'major_arcana',
      order: 1,
      content: {
        zh: { name: '大阿卡纳', description: '大阿卡纳牌代表人生的重大主题和精神旅程' },
        en: { name: 'Major Arcana', description: 'Major Arcana cards represent major life themes and spiritual journey' },
        ja: { name: '大アルカナ', description: '大アルカナカードは人生の重要なテーマと精神的な旅を表します' },
        ko: { name: '메이저 아르카나', description: '메이저 아르카나 카드는 인생의 주요 주제와 영적 여정을 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      categoryId: 'minor_arcana',
      order: 2,
      content: {
        zh: { name: '小阿卡纳', description: '小阿卡纳牌代表日常生活的具体情况和挑战' },
        en: { name: 'Minor Arcana', description: 'Minor Arcana cards represent everyday situations and challenges' },
        ja: { name: '小アルカナ', description: '小アルカナカードは日常生活の具体的な状況と課題を表します' },
        ko: { name: '마이너 아르카나', description: '마이너 아르카나 카드는 일상생활의 구체적인 상황과 도전을 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  const suits: CardSuit[] = [
    {
      suitId: 'cups',
      categoryId: 'minor_arcana',
      order: 1,
      element: 'water',
      content: {
        zh: { name: '圣杯', description: '代表情感、直觉、关系和精神层面' },
        en: { name: 'Cups', description: 'Represents emotions, intuition, relationships and spiritual matters' },
        ja: { name: 'カップ', description: '感情、直感、人間関係、精神的な事柄を表します' },
        ko: { name: '컵', description: '감정, 직감, 관계, 영적 문제를 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      suitId: 'wands',
      categoryId: 'minor_arcana',
      order: 2,
      element: 'fire',
      content: {
        zh: { name: '权杖', description: '代表行动、创造力、激情和事业' },
        en: { name: 'Wands', description: 'Represents action, creativity, passion and career' },
        ja: { name: 'ワンド', description: '行動、創造性、情熱、キャリアを表します' },
        ko: { name: '완드', description: '행동, 창의성, 열정, 경력을 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      suitId: 'swords',
      categoryId: 'minor_arcana',
      order: 3,
      element: 'air',
      content: {
        zh: { name: '宝剑', description: '代表思想、沟通、冲突和挑战' },
        en: { name: 'Swords', description: 'Represents thoughts, communication, conflict and challenges' },
        ja: { name: 'ソード', description: '思考、コミュニケーション、対立、課題を表します' },
        ko: { name: '소드', description: '생각, 의사소통, 갈등, 도전을 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      suitId: 'pentacles',
      categoryId: 'minor_arcana',
      order: 4,
      element: 'earth',
      content: {
        zh: { name: '金币', description: '代表物质、金钱、工作和实际事务' },
        en: { name: 'Pentacles', description: 'Represents material matters, money, work and practical affairs' },
        ja: { name: 'ペンタクル', description: '物質的な事柄、お金、仕事、実用的な事柄を表します' },
        ko: { name: '펜타클', description: '물질적 문제, 돈, 일, 실용적인 문제를 나타냅니다' }
      },
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  const decks: TarotDeckNew[] = [
    {
      deckId: 'rider-waite',
      content: {
        zh: {
          name: '韦特塔罗牌',
          description: '最经典和广泛使用的塔罗牌，由亚瑟·爱德华·韦特设计，帕梅拉·科尔曼·史密斯绘制',
          artist: '帕梅拉·科尔曼·史密斯',
          publisher: '莱德公司'
        },
        en: {
          name: 'Rider-Waite Tarot',
          description: 'The most classic and widely used tarot deck, designed by Arthur Edward Waite and illustrated by Pamela Colman Smith',
          artist: 'Pamela Colman Smith',
          publisher: 'Rider Company'
        },
        ja: {
          name: 'ライダー・ウェイト・タロット',
          description: '最もクラシックで広く使用されているタロットデッキ',
          artist: 'パメラ・コールマン・スミス',
          publisher: 'ライダー社'
        },
        ko: {
          name: '라이더-웨이트 타로',
          description: '가장 클래식하고 널리 사용되는 타로 덱',
          artist: '파멜라 콜먼 스미스',
          publisher: '라이더 컴퍼니'
        }
      },
      totalCards: 78,
      publishYear: 1909,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  await categoriesCollection.deleteMany({});
  await suitsCollection.deleteMany({});
  await decksCollection.deleteMany({});
  
  await categoriesCollection.insertMany(categories);
  await suitsCollection.insertMany(suits);
  await decksCollection.insertMany(decks);
  
  console.log('✅ Base data created: 2 categories, 4 suits, 1 deck');
}

/**
 * 将原始卡牌数据转换为新格式
 */
function convertCardToNewFormat(rawCard: RawCardData, translationMap: Map<string, string>): TarotCardNew {
  const now = Date.now();
  
  const cardId = generateCardId(rawCard);
  const categoryId = rawCard.arcana === 'Major' ? 'major_arcana' : 'minor_arcana';
  const suitStr = typeof rawCard.suit === 'string' ? rawCard.suit : rawCard.suit?.en;
  const suitId = suitStr ? mapSuit(suitStr) : undefined;
  
  const enKeywordsUpright = rawCard.keywords_upright.map(kw => translationMap.get(kw) || kw);
  const enKeywordsReversed = rawCard.keywords_reversed.map(kw => translationMap.get(kw) || kw);
  
  const content: { [K in SupportedLanguage]: CardMultiLanguageContent } = {
    zh: {
      name: rawCard.name_zh,
      description: rawCard.description,
      keywords: {
        upright: rawCard.keywords_upright,
        reversed: rawCard.keywords_reversed
      },
      meaning: {
        upright: rawCard.meaning_upright,
        reversed: rawCard.meaning_reversed
      }
    },
    en: {
      name: rawCard.name_en,
      description: `${rawCard.name_en} - ${rawCard.description}`,
      keywords: {
        upright: enKeywordsUpright,
        reversed: enKeywordsReversed
      },
      meaning: {
        upright: rawCard.meaning_upright,
        reversed: rawCard.meaning_reversed
      }
    },
    ja: {
      name: rawCard.name_en,
      description: rawCard.description,
      keywords: {
        upright: rawCard.keywords_upright,
        reversed: rawCard.keywords_reversed
      },
      meaning: {
        upright: rawCard.meaning_upright,
        reversed: rawCard.meaning_reversed
      }
    },
    ko: {
      name: rawCard.name_en,
      description: rawCard.description,
      keywords: {
        upright: rawCard.keywords_upright,
        reversed: rawCard.keywords_reversed
      },
      meaning: {
        upright: rawCard.meaning_upright,
        reversed: rawCard.meaning_reversed
      }
    }
  };
  
  return {
    cardId,
    deckId: 'rider-waite',
    categoryId,
    suitId,
    number: rawCard.number,
    rank: typeof rawCard.rank === 'string' ? rawCard.rank : rawCard.rank?.en || undefined,
    images: {
      original: `/images/rider-waite/original/${cardId}.jpg`,
      thumbnail: `/images/rider-waite/thumbnails/${cardId}_thumb.jpg`
    },
    content,
    metadata: {
      tags: generateTags(rawCard),
      astrology: rawCard.astrology ? { sign: rawCard.astrology } : undefined,
      numerology: {
        number: rawCard.number
      }
    },
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 生成卡牌ID
 */
function generateCardId(rawCard: RawCardData): string {
  if (rawCard.arcana === 'Major') {
    return `rw-major-${rawCard.number.toString().padStart(2, '0')}`;
  } else {
    const suitStr = typeof rawCard.suit === 'string' ? rawCard.suit : rawCard.suit?.en;
    const suit = suitStr ? mapSuit(suitStr) : 'unknown';
    return `rw-${suit}-${rawCard.number.toString().padStart(2, '0')}`;
  }
}

/**
 * 映射花色
 */
function mapSuit(suit: string): string {
  const suitMapping: { [key: string]: string } = {
    'Cups': 'cups',
    'Wands': 'wands',
    'Swords': 'swords',
    'Pentacles': 'pentacles',
    '圣杯': 'cups',
    '权杖': 'wands',
    '宝剑': 'swords',
    '金币': 'pentacles'
  };
  return suitMapping[suit] || suit.toLowerCase();
}

/**
 * 生成标签
 */
function generateTags(rawCard: RawCardData): string[] {
  const tags: string[] = [];
  
  if (rawCard.arcana === 'Major') {
    tags.push('major_arcana');
  } else {
    tags.push('minor_arcana');
    if (rawCard.suit) {
      const suitStr = typeof rawCard.suit === 'string' ? rawCard.suit : rawCard.suit.en;
      tags.push(suitStr.toLowerCase());
    }
  }
  
  if (rawCard.element) {
    tags.push(rawCard.element.toLowerCase());
  }
  
  if (rawCard.astrology) {
    tags.push(rawCard.astrology.toLowerCase());
  }
  
  return tags;
}

/**
 * 创建数据库索引
 */
async function createIndexes(
  cardsCollection: any,
  categoriesCollection: any,
  suitsCollection: any,
  decksCollection: any
): Promise<void> {
  await cardsCollection.createIndex({ cardId: 1 }, { unique: true });
  await cardsCollection.createIndex({ deckId: 1, isActive: 1 });
  await cardsCollection.createIndex({ categoryId: 1, isActive: 1 });
  await cardsCollection.createIndex({ suitId: 1, isActive: 1 });
  await cardsCollection.createIndex({ number: 1 });
  await cardsCollection.createIndex({ 'content.zh.name': 1 });
  await cardsCollection.createIndex({ 'content.en.name': 1 });
  
  await categoriesCollection.createIndex({ categoryId: 1 }, { unique: true });
  await suitsCollection.createIndex({ suitId: 1 }, { unique: true });
  await decksCollection.createIndex({ deckId: 1 }, { unique: true });
  
  console.log('✅ Indexes created');
}

/**
 * 验证导入结果
 */
async function verifyImport(
  cardsCollection: any,
  categoriesCollection: any,
  suitsCollection: any,
  decksCollection: any
): Promise<void> {
  const cardCount = await cardsCollection.countDocuments();
  const categoryCount = await categoriesCollection.countDocuments();
  const suitCount = await suitsCollection.countDocuments();
  const deckCount = await decksCollection.countDocuments();
  
  console.log(`   📊 Statistics:`);
  console.log(`      Cards: ${cardCount}`);
  console.log(`      Categories: ${categoryCount}`);
  console.log(`      Suits: ${suitCount}`);
  console.log(`      Decks: ${deckCount}`);
  
  const majorArcanaCount = await cardsCollection.countDocuments({ categoryId: 'major_arcana' });
  console.log(`      Major Arcana: ${majorArcanaCount}`);
  
  const minorArcanaCount = await cardsCollection.countDocuments({ categoryId: 'minor_arcana' });
  console.log(`      Minor Arcana: ${minorArcanaCount}`);
  
  const sampleCard = await cardsCollection.findOne({});
  if (sampleCard) {
    console.log(`\n   🎴 Sample card:`);
    console.log(`      ID: ${sampleCard.cardId}`);
    console.log(`      Name (ZH): ${sampleCard.content.zh.name}`);
    console.log(`      Name (EN): ${sampleCard.content.en.name}`);
    console.log(`      Category: ${sampleCard.categoryId}`);
    console.log(`      Keywords (EN upright): ${sampleCard.content.en.keywords.upright.slice(0, 3).join(', ')}`);
  }
}

// 执行导入
if (require.main === module) {
  importTarotCards().catch((error) => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}

export { importTarotCards };
