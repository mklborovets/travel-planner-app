import {useCallback, useEffect, useState} from 'react';
import {Coordinates} from './types';

export interface UseMarkerViewTrackingParams {
  id: string;
  coordinate: Coordinates;
  title: string;
  description: string;
  pinColor: string;
  onSelect: (id: string) => void;
}

export const useMarkerViewTracking = ({
  id,
  coordinate,
  title,
  description,
  pinColor,
  onSelect,
}: UseMarkerViewTrackingParams) => {
  const [tracksViewChanges, setTracksViewChanges] = useState<boolean>(true);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 150);
    return () => {
      clearTimeout(timer);
    };
  }, [
    coordinate.latitude,
    coordinate.longitude,
    title,
    description,
    pinColor,
  ]);

  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return {
    tracksViewChanges,
    handlePress,
  };
};

