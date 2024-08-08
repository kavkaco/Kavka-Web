import { IUserUpdatableFields, IUser } from "@models/auth";
import { createActionGroup, props } from "@ngrx/store";

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
