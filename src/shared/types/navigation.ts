import {NavigatorScreenParams} from '@react-navigation/native';
import {
  Coordinates,
  Place,
  PlaceCategory,
} from '../../entities/place/model/types';

export type MainTabParamList = {
  HomeTab: undefined;
  MapTab:
    | {
        focusCoordinates?: Coordinates;
        selectedPlaceId?: string;
        previewPlace?: Place;
        focusTimestamp?: number;
      }
    | undefined;
  SearchTab: undefined;
  TripTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  PlaceDetails: {placeId: string; previewPlace?: Place};
  AddPlace:
    | {
        initialCoordinates?: Coordinates;
        initialTitle?: string;
        initialAddress?: string;
        initialCategory?: PlaceCategory;
      }
    | undefined;
};
