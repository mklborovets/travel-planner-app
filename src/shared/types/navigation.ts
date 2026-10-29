import {NavigatorScreenParams} from '@react-navigation/native';
import {Coordinates} from '../../entities/place/model/types';

export type MainTabParamList = {
  HomeTab: undefined;
  MapTab:
    | {focusCoordinates?: Coordinates; selectedPlaceId?: string}
    | undefined;
  SearchTab: undefined;
  TripTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  PlaceDetails: {placeId: string};
  AddPlace: {initialCoordinates?: Coordinates} | undefined;
};
