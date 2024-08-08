import { createAction, createActionGroup, emptyProps, props } from "@ngrx/store";
import { IUserUpdatableFields, IUser } from "@models/auth";

export const AuthActions = createActionGroup({
    source: "auth",
    events: {
        Add: props<{ user: IUser }>(),
        Remove: props<{ userId: string }>(),
        Update: props<{
            userId: string;
            updates: { user: IUserUpdatableFields };
        }>(),
        SetActiveUser: props<{ userId: string }>(),
    },
});
