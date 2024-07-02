import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const ActiveChatActions = createActionGroup({
  source: 'ActiveChat',
  events: {
    Set: props<{ chatId: string }>(),
    Clear: emptyProps(),
  },
});
