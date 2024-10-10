import { ConnectivityActions } from "@app/store/connectivity/connectivity.actions";
import { createReducer, on } from "@ngrx/store";

export interface ConnectivityState {
    isOnline: boolean;
}

const initialState: ConnectivityState = {
    isOnline: false,
};

export const connectivityReducer = createReducer(
    initialState,
    on(ConnectivityActions.set, (state, { online }) => {
        return {
            ...state,
            isOnline: online,
        };
    })
);
