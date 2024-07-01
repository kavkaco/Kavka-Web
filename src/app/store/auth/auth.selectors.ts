import {
  createFeature,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { IAccount } from '../../models/auth';

export const selectAccounts =
  createFeatureSelector<ReadonlyArray<IAccount>>('accountsList');

export const selectCollectionState =
  createFeatureSelector<ReadonlyArray<string>>('collection');

export const selectAccountsCollection = createSelector(
  selectAccounts,
  selectCollectionState,
  (authAccounts, collection) => {
    console.log(collection);
    console.log(authAccounts);

    return collection;
  }
);
// export const selectAccountsList = createFeatureSelector<ReadonlyArray<IAccount>>('accountsList')
// export const selectAccountsList = (state: { accountsList: IAccount[]; }) => state.accountsList
