import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

export const useBottomSheetAnimation = (visible: boolean) => {
  const slideOffset = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (visible) {
      slideOffset.setValue(420);
      Animated.spring(slideOffset, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        stiffness: 240,
        mass: 0.9,
      }).start();
    }
  }, [visible, slideOffset]);

  return {
    slideOffset,
  };
};

