import { configureStore } from '@reduxjs/toolkit';
import { TarotApplicationService } from '../../application/services/TarotApplicationService';
import tarotReducer from './tarotSlice';

export const createStore = (tarotService: TarotApplicationService) => {
  return configureStore({
    reducer: {
      tarot: tarotReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            tarotService,
          },
        },
        serializableCheck: {
          ignoredActions: ['tarot/fetchTodayReading/fulfilled', 'tarot/drawNewCard/fulfilled'],
          ignoredPaths: ['tarot.dailyReading.createdAt'],
        },
      }),
  });
};

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];

// Thunk API type
export interface ThunkAPI {
  state: RootState;
  dispatch: AppDispatch;
  extra: {
    tarotService: TarotApplicationService;
  };
}