import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ConnectivityState } from "@app/store/connectivity/connectivity.reducers";

export const selectConnectivityState = createFeatureSelector<ConnectivityState>("connectivity");

export const selectIsOnline = createSelector(
    selectConnectivityState,
    (state: ConnectivityState) => {
        return state.isOnline;
    }
);
