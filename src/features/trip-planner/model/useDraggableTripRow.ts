import {useMemo, useRef, useState} from 'react';
import {Animated, PanResponder} from 'react-native';

const ROW_SWAP_THRESHOLD_PX = 68;

export interface UseDraggableTripRowParams {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDragStateChange: (isDragging: boolean) => void;
}

export const useDraggableTripRow = ({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDragStateChange,
}: UseDraggableTripRowParams) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const callbacksRef = useRef({
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onDragStateChange,
  });
  callbacksRef.current = {
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    onDragStateChange,
  };

  const stepOffsetBaselineRef = useRef<number>(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 3,
        onPanResponderGrant: () => {
          stepOffsetBaselineRef.current = 0;
          setIsDragging(true);
          callbacksRef.current.onDragStateChange(true);
        },
        onPanResponderMove: (_, gestureState) => {
          const relativeDy = gestureState.dy - stepOffsetBaselineRef.current;
          translateY.setValue(relativeDy);

          if (
            relativeDy < -ROW_SWAP_THRESHOLD_PX &&
            callbacksRef.current.canMoveUp
          ) {
            stepOffsetBaselineRef.current -= ROW_SWAP_THRESHOLD_PX;
            translateY.setValue(
              gestureState.dy - stepOffsetBaselineRef.current,
            );
            callbacksRef.current.onMoveUp();
          } else if (
            relativeDy > ROW_SWAP_THRESHOLD_PX &&
            callbacksRef.current.canMoveDown
          ) {
            stepOffsetBaselineRef.current += ROW_SWAP_THRESHOLD_PX;
            translateY.setValue(
              gestureState.dy - stepOffsetBaselineRef.current,
            );
            callbacksRef.current.onMoveDown();
          }
        },
        onPanResponderRelease: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          setIsDragging(false);
          callbacksRef.current.onDragStateChange(false);
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setIsDragging(false);
          callbacksRef.current.onDragStateChange(false);
        },
      }),
    [translateY],
  );

  return {
    translateY,
    isDragging,
    panHandlers: panResponder.panHandlers,
  };
};
