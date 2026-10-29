import React, {memo} from 'react';
import {Marker} from 'react-native-maps';
import {Coordinates} from '../model/types';
import {useMarkerViewTracking} from '../model/useMarkerViewTracking';

export interface PlaceMarkerProps {
  id: string;
  coordinate: Coordinates;
  title: string;
  description: string;
  pinColor: string;
  onSelect: (id: string) => void;
}

const PlaceMarkerComponent: React.FC<PlaceMarkerProps> = ({
  id,
  coordinate,
  title,
  description,
  pinColor,
  onSelect,
}) => {
  const {tracksViewChanges, handlePress} = useMarkerViewTracking({
    id,
    coordinate,
    title,
    description,
    pinColor,
    onSelect,
  });

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      pinColor={pinColor}
      tracksViewChanges={tracksViewChanges}
      onPress={handlePress}
    />
  );
};

export const PlaceMarker = memo(PlaceMarkerComponent);
