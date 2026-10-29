import React from 'react';
import {Animated, Modal, Pressable, View} from 'react-native';
import {useBottomSheetAnimation} from '../lib/useBottomSheetAnimation';

export interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  maxHeightClassName?: string;
  children: React.ReactNode;
}

export const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  visible,
  onClose,
  maxHeightClassName = 'max-h-[85%]',
  children,
}) => {
  const {slideOffset} = useBottomSheetAnimation(visible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/50">
        <Pressable onPress={onClose} className="flex-1" />
        <Animated.View
          style={{transform: [{translateY: slideOffset}]}}
          className={`${maxHeightClassName} rounded-t-3xl bg-white px-5 pt-5 pb-7`}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

