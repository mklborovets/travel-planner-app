import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Animated, LayoutChangeEvent, PanResponder} from 'react-native';

const DEFAULT_ROW_STRIDE_PX = 106;
const ROW_BOTTOM_MARGIN_PX = 12;

export interface TripDragCoordinator {
  getNeighborShiftValue: (placeId: string) => Animated.Value;
  reportRowLayout: (placeId: string, height: number) => void;
  startDrag: (fromIndex: number) => void;
  updateDrag: (fromIndex: number, dy: number) => number;
  finishDrag: (
    fromIndex: number,
    dragTranslateY: Animated.Value,
    onDone: () => void,
  ) => void;
}

export interface UseTripDragCoordinatorParams {
  orderedPlaceIds: string[];
  onCommitMove: (fromIndex: number, toIndex: number) => void;
}

export const useTripDragCoordinator = ({
  orderedPlaceIds,
  onCommitMove,
}: UseTripDragCoordinatorParams) => {
  const [isAnyRowDragging, setIsAnyRowDragging] = useState<boolean>(false);
  const shiftValuesRef = useRef<Record<string, Animated.Value>>({});
  const rowStridesRef = useRef<Record<string, number>>({});
  const activeTargetIndexRef = useRef<number>(-1);
  const activeDraggedTranslateRef = useRef<Animated.Value | null>(null);

  const latestRef = useRef({
    orderedPlaceIds,
    onCommitMove,
  });
  latestRef.current = {
    orderedPlaceIds,
    onCommitMove,
  };

  const orderSignature = orderedPlaceIds.join('|');

  useLayoutEffect(() => {
    if (activeDraggedTranslateRef.current) {
      activeDraggedTranslateRef.current.setValue(0);
      activeDraggedTranslateRef.current = null;
    }
    Object.values(shiftValuesRef.current).forEach(anim => {
      anim.stopAnimation();
      anim.setValue(0);
    });
  }, [orderSignature]);

  const getNeighborShiftValue = useCallback(
    (placeId: string): Animated.Value => {
      if (!shiftValuesRef.current[placeId]) {
        shiftValuesRef.current[placeId] = new Animated.Value(0);
      }
      return shiftValuesRef.current[placeId];
    },
    [],
  );

  const reportRowLayout = useCallback((placeId: string, height: number) => {
    if (height > 20) {
      rowStridesRef.current[placeId] = height + ROW_BOTTOM_MARGIN_PX;
    }
  }, []);

  const getStrideForIndex = useCallback((index: number): number => {
    const placeId = latestRef.current.orderedPlaceIds[index];
    if (placeId && rowStridesRef.current[placeId]) {
      return rowStridesRef.current[placeId];
    }
    return DEFAULT_ROW_STRIDE_PX;
  }, []);

  const startDrag = useCallback((fromIndex: number) => {
    activeTargetIndexRef.current = fromIndex;
    setIsAnyRowDragging(true);
  }, []);

  const updateDrag = useCallback(
    (fromIndex: number, dy: number): number => {
      const ids = latestRef.current.orderedPlaceIds;
      const count = ids.length;
      if (count <= 1) {
        return 0;
      }

      const stride = getStrideForIndex(fromIndex);
      const minDy = -fromIndex * stride - 14;
      const maxDy = (count - 1 - fromIndex) * stride + 14;
      const clampedDy = Math.max(minDy, Math.min(maxDy, dy));

      const rawStepDelta = Math.round(clampedDy / stride);
      const nextTargetIndex = Math.max(
        0,
        Math.min(count - 1, fromIndex + rawStepDelta),
      );

      if (nextTargetIndex !== activeTargetIndexRef.current) {
        activeTargetIndexRef.current = nextTargetIndex;
        for (let idx = 0; idx < count; idx += 1) {
          if (idx === fromIndex) {
            continue;
          }
          const neighborId = ids[idx];
          const shiftAnim = getNeighborShiftValue(neighborId);
          let targetShift = 0;
          if (
            fromIndex < nextTargetIndex &&
            idx > fromIndex &&
            idx <= nextTargetIndex
          ) {
            targetShift = -stride;
          } else if (
            fromIndex > nextTargetIndex &&
            idx >= nextTargetIndex &&
            idx < fromIndex
          ) {
            targetShift = stride;
          }
          Animated.spring(shiftAnim, {
            toValue: targetShift,
            useNativeDriver: true,
            speed: 28,
            bounciness: 2,
          }).start();
        }
      }

      return clampedDy;
    },
    [getNeighborShiftValue, getStrideForIndex],
  );

  const finishDrag = useCallback(
    (
      fromIndex: number,
      dragTranslateY: Animated.Value,
      onDone: () => void,
    ) => {
      const ids = latestRef.current.orderedPlaceIds;
      const count = ids.length;
      const targetIndex =
        activeTargetIndexRef.current >= 0 &&
        activeTargetIndexRef.current < count
          ? activeTargetIndexRef.current
          : fromIndex;
      const stride = getStrideForIndex(fromIndex);
      const snapOffsetPx = (targetIndex - fromIndex) * stride;

      Animated.timing(dragTranslateY, {
        toValue: snapOffsetPx,
        duration: 110,
        useNativeDriver: true,
      }).start(() => {
        activeTargetIndexRef.current = -1;
        if (targetIndex !== fromIndex) {
          activeDraggedTranslateRef.current = dragTranslateY;
          latestRef.current.onCommitMove(fromIndex, targetIndex);
        } else {
          dragTranslateY.setValue(0);
          Object.values(shiftValuesRef.current).forEach(anim => {
            anim.stopAnimation();
            anim.setValue(0);
          });
        }
        onDone();
        setIsAnyRowDragging(false);
      });
    },
    [getStrideForIndex],
  );

  const dragCoordinator: TripDragCoordinator = useMemo(
    () => ({
      getNeighborShiftValue,
      reportRowLayout,
      startDrag,
      updateDrag,
      finishDrag,
    }),
    [
      getNeighborShiftValue,
      reportRowLayout,
      startDrag,
      updateDrag,
      finishDrag,
    ],
  );

  return {
    isAnyRowDragging,
    dragCoordinator,
  };
};

export interface UseDraggableTripRowParams {
  placeId: string;
  index: number;
  dragCoordinator: TripDragCoordinator;
}

export const useDraggableTripRow = ({
  placeId,
  index,
  dragCoordinator,
}: UseDraggableTripRowParams) => {
  const dragTranslateY = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const latestParamsRef = useRef({
    placeId,
    index,
    dragCoordinator,
  });
  latestParamsRef.current = {
    placeId,
    index,
    dragCoordinator,
  };

  const neighborShiftY = dragCoordinator.getNeighborShiftValue(placeId);

  const combinedTranslateY = useMemo(
    () => Animated.add(dragTranslateY, neighborShiftY),
    [dragTranslateY, neighborShiftY],
  );

  const handleRowLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    latestParamsRef.current.dragCoordinator.reportRowLayout(
      latestParamsRef.current.placeId,
      measuredHeight,
    );
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          dragTranslateY.stopAnimation();
          dragTranslateY.setValue(0);
          setIsDragging(true);
          latestParamsRef.current.dragCoordinator.startDrag(
            latestParamsRef.current.index,
          );
        },
        onPanResponderMove: (_, gestureState) => {
          const clampedDy =
            latestParamsRef.current.dragCoordinator.updateDrag(
              latestParamsRef.current.index,
              gestureState.dy,
            );
          dragTranslateY.setValue(clampedDy);
        },
        onPanResponderRelease: () => {
          latestParamsRef.current.dragCoordinator.finishDrag(
            latestParamsRef.current.index,
            dragTranslateY,
            () => {
              setIsDragging(false);
            },
          );
        },
        onPanResponderTerminate: () => {
          latestParamsRef.current.dragCoordinator.finishDrag(
            latestParamsRef.current.index,
            dragTranslateY,
            () => {
              setIsDragging(false);
            },
          );
        },
      }),
    [dragTranslateY],
  );

  return {
    translateY: combinedTranslateY,
    isDragging,
    handleRowLayout,
    panHandlers: panResponder.panHandlers,
  };
};
