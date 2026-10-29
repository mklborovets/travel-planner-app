import React from 'react';
import {Marker} from 'react-native-maps';
import {Coordinates} from '../model/types';

export interface PlaceMarkerProps {
  coordinate: Coordinates;
  title: string;
  description: string;
  pinColor: string;
  onPress: () => void;
}

export const PlaceMarker: React.FC<PlaceMarkerProps> = ({
  coordinate,
  title,
  description,
  pinColor,
  onPress,
}) => {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      pinColor={pinColor}
      onPress={onPress}
    />
  );
};
