import React, { useRef, useState, useMemo } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import styled from "styled-components/native";
import { ImageCounter, ImageCounterText } from "./style";
import { getProdutoImageSource } from "@/core/images/imageSource"; // [IMAGENS][PATCH]

const { width, height } = Dimensions.get("screen");

interface ModalImageZoomProps {
  isVisible: boolean;
  onClose: () => void;
  images: { imagemUrl?: string; imagemLocal?: string | null }[]; // [IMAGENS][PATCH]
}

export const ModalImageZoom: React.FC<ModalImageZoomProps> = ({
  isVisible,
  onClose,
  images,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  const isZoomedShared = useSharedValue(false);

  useDerivedValue(() => {
    runOnJS(setZoomed)(isZoomedShared.value);
  }, []);

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: isZoomedShared.value ? 0 : 1,
  }));

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToImage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
  };

  return (
    <Modal visible={isVisible} animationType="fade">
      <ModalContainer>
        <CloseButton onPress={onClose}>
          <Feather name="x-circle" size={55} color="black" />
        </CloseButton>

        {/* Seta esquerda */}
        {currentIndex > 0 && (
          <Animated.View
            style={[
              arrowStyle,
              {
                position: "absolute",
                left: 10,
                zIndex: 20,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 30,
              },
            ]}
            pointerEvents={zoomed ? "none" : "auto"}
          >
            <TouchableOpacity onPress={() => goToImage(currentIndex - 1)}>
              <Ionicons name="chevron-back" size={50} color="black" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Seta direita */}
        {currentIndex < images.length - 1 && (
          <Animated.View
            style={[
              arrowStyle,
              {
                position: "absolute",
                right: 10,
                zIndex: 20,
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 30,
              },
            ]}
            pointerEvents={zoomed ? "none" : "auto"}
          >
            <TouchableOpacity onPress={() => goToImage(currentIndex + 1)}>
              <Ionicons name="chevron-forward" size={50} color="black" />
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          scrollEnabled={scrollEnabled}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {images.map((img, index) => (
            <ZoomableImage
              key={index}
              imagemLocal={img.imagemLocal} // [IMAGENS][PATCH]
              imagemUrl={img.imagemUrl} // [IMAGENS][PATCH]
              onZoomChange={(zoomed) => {
                setScrollEnabled(!zoomed);
              }}
              isZoomedShared={isZoomedShared}
            />
          ))}
        </ScrollView>

        <ImageCounter>
          <ImageCounterText>
            Imagem {currentIndex + 1} de {images.length}
          </ImageCounterText>
        </ImageCounter>
      </ModalContainer>
    </Modal>
  );
};

// 🧩 Zoom individual
interface ZoomableImageProps {
  imagemLocal?: string | null; // [IMAGENS][PATCH]
  imagemUrl?: string; // [IMAGENS][PATCH]
  onZoomChange?: (zoomed: boolean) => void;
  isZoomedShared: Animated.SharedValue<boolean>;
}

export const ZoomableImage = ({
  imagemLocal,
  imagemUrl,
  onZoomChange,
  isZoomedShared,
}: ZoomableImageProps) => {
  const scale = useSharedValue(1);
  const startScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const emitZoomState = (value: number) => {
    "worklet";
    const zoomed = value > 1.01;
    if (isZoomedShared.value !== zoomed) {
      isZoomedShared.value = zoomed;
      runOnJS(onZoomChange || (() => {}))(zoomed);
    }
  };

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      const newScale = clamp(startScale.value * e.scale, 1, 4);
      scale.value = newScale;
      emitZoomState(newScale);
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = 1;
        translationX.value = 0;
        translationY.value = 0;
        emitZoomState(1);
      } else {
        scale.value = 2;
        emitZoomState(2);
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translationX.value;
      startY.value = translationY.value;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        translationX.value = startX.value + e.translationX;
        translationY.value = startY.value + e.translationY;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    doubleTap,
    Gesture.Simultaneous(pinch, pan)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  // [IMAGENS][PATCH] usa helper centralizado
  const source = useMemo(() => {
    return getProdutoImageSource({ imagemLocal, imagens: imagemUrl ? [imagemUrl] : undefined });
  }, [imagemLocal, imagemUrl]);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.Image
        source={source}
        style={[styles.image, animatedStyle]}
        resizeMode="contain"
      />
    </GestureDetector>
  );
};

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  image: {
    width,
    height,
  },
});

const ModalContainer = styled(GestureHandlerRootView)`
  flex: 1;
  background-color: #fff;
  justify-content: center;
  align-items: center;
`;

const CloseButton = styled(TouchableOpacity)`
  position: absolute;
  top: 60px;
  right: 40px;
  z-index: 10;
  padding: 2px;
  background-color: white;
  border-radius: 50px;
`;
