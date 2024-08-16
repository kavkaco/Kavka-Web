import { IUserUpdatableFields } from "@models/auth";
import { createActionGroup, props } from "@ngrx/store";
import { User } from "kavka-core/model/user/v1/user_pb";

export const AuthActions = createActionGroup({
    source: "auth",
    events: {
        Add: props<{ user: User }>(),
        Remove: props<{ userId: string }>(),
        Update: props<{
            userId: string;
            updates: { user: IUserUpdatableFields };
        }>(),
        SetActiveUser: props<{ userId: string }>(),
    },
});
