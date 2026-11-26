import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TarotCard, SupportedLanguage, DailyReading, ReadingHistory } from '../../domain/entities/TarotCard';
import { ThunkAPI } from './index';

interface TarotState {
  dailyReading: DailyReading | null;
  recentReadings: DailyReading[];
  selectedCard: TarotCard | null;
  loading: boolean;
  error: string | null;
  language: SupportedLanguage;
}

const initialState: TarotState = {
  dailyReading: null,
  recentReadings: [],
  selectedCard: null,
  loading: false,
  error: null,
  language: 'zh' as SupportedLanguage,
};

// Async thunks
export const fetchTodayReading = createAsyncThunk<
  DailyReading,
  string | undefined,
  ThunkAPI
>(
  'tarot/fetchTodayReading',
  async (userId, { extra, rejectWithValue, getState }) => {
    try {
      // 检查是否在Telegram环境中
      const isTelegramEnvironment = !!(window as any).Telegram?.WebApp;
      if (!isTelegramEnvironment) {
        return rejectWithValue('仅在Telegram环境中可用');
      }
      
      // 确保userId存在才进行API调用
      if (!userId) {
        return rejectWithValue('用户ID不可用，无法获取今日占卜');
      }
      
      const state = getState();
      const language = state.tarot.language;
      return await extra.tarotService.getDailyReading(language);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('获取今日占卜失败，请重试');
    }
  }
);

export const drawNewCard = createAsyncThunk<
  TarotCard,
  void,
  ThunkAPI
>(
  'tarot/drawNewCard',
  async (_, { extra, getState }) => {
    const state = getState();
    const language = state.tarot.language;
    return await extra.tarotService.drawRandomCard(language);
  }
);

export const fetchCardDetails = createAsyncThunk<
  TarotCard | null,
  string,
  ThunkAPI
>(
  'tarot/fetchCardDetails',
  async (cardId, { extra, getState }) => {
    const state = getState();
    const language = state.tarot.language;
    return await extra.tarotService.getCardDetails(cardId, language);
  }
);

export const fetchReadingHistory = createAsyncThunk<
  ReadingHistory | null,
  string,
  ThunkAPI
>(
  'tarot/fetchReadingHistory',
  async (userId, { extra, getState, rejectWithValue }) => {
    try {
      // 检查是否在Telegram环境中
      const isTelegramEnvironment = !!(window as any).Telegram?.WebApp;
      if (!isTelegramEnvironment) {
        return rejectWithValue('仅在Telegram环境中可用');
      }
      
      // 确保userId存在才进行API调用
      if (!userId) {
        return rejectWithValue('用户ID不可用，无法获取历史记录');
      }
      
      const state = getState();
      const language = state.tarot.language;
      const result = await extra.tarotService.getReadingHistory(userId, language);
      return { userId, readings: result.items, totalCount: result.total, language } as ReadingHistory;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('获取历史记录失败，请重试');
    }
  }
);

// 语言切换action，设置语言并更新后端用户语言偏好
export const changeLanguage = createAsyncThunk<
  void,
  { language: SupportedLanguage; telegramUserId?: number },
  ThunkAPI
>(
  'tarot/changeLanguage',
  async ({ language: newLanguage, telegramUserId }, { dispatch, extra }) => {
    try {
      // 检查是否在Telegram环境中
      const isTelegramEnvironment = !!(window as any).Telegram?.WebApp;
      
      // 如果在Telegram环境中且提供了Telegram用户ID，更新后端用户语言设置
      if (isTelegramEnvironment && telegramUserId) {
        await extra.tarotService.updateUserLanguage(telegramUserId.toString(), newLanguage);
      }
      // 设置前端语言状态
      dispatch(setLanguage(newLanguage));
    } catch (error) {
      console.error('Failed to update user language:', error);
      // 即使后端更新失败，也要设置前端语言状态
      dispatch(setLanguage(newLanguage));
    }
  }
);

const tarotSlice = createSlice({
  name: 'tarot',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.language = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCard: (state, action: PayloadAction<TarotCard | null>) => {
      state.selectedCard = action.payload;
    },
    addToRecentReadings: (state, action: PayloadAction<DailyReading>) => {
      state.recentReadings.unshift(action.payload);
      // Keep only the last 10 readings
      if (state.recentReadings.length > 10) {
        state.recentReadings = state.recentReadings.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today's reading
      .addCase(fetchTodayReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayReading.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyReading = action.payload;
        // 不要自动添加到历史记录中，历史记录应该只来自 fetchReadingHistory
      })
      .addCase(fetchTodayReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || '获取今日占卜失败，请重试';
      })
      
      // Draw new card
      .addCase(drawNewCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(drawNewCard.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCard = action.payload;
      })
      .addCase(drawNewCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to draw new card';
      })
      
      // Fetch card details
      .addCase(fetchCardDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCard = action.payload;
      })
      .addCase(fetchCardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch card details';
      })
      
      // Fetch reading history
      .addCase(fetchReadingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReadingHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.recentReadings = action.payload.readings || [];
        } else {
          state.recentReadings = [];
        }
      })
      .addCase(fetchReadingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reading history';
      });
  },
});

export const { setLanguage, clearError, setSelectedCard, addToRecentReadings } = tarotSlice.actions;
export default tarotSlice.reducer;