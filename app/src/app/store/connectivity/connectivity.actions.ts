import { createActionGroup, props } from "@ngrx/store";

export const ConnectivityActions = createActionGroup({
    source: "Connectivity",
    events: {
        Set: props<{ online: boolean }>(),
    },
});
