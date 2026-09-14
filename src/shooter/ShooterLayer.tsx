import { ScreenImage, ScreenText } from "@vincentt-xr/sdk";

import type { ShooterLayerSettings, ShooterScreenTransform2DSettings } from "./settings";

export const ShooterImageLayer = ({
  layer,
  src,
  position,
  size,
  opacity,
  rotation,
}: {
  layer: ShooterLayerSettings;
  src?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  opacity?: number;
  rotation?: number;
}) => {
  const value = layer.image?.screenImage;
  if (!value?.enabled || !layer.enabled || !layer.visible || !value.transformation.visible) {
    return null;
  }

  const { transformation: transform, image } = value;
  const finalPosition = position ?? transform.position;
  const finalSize = size ?? transform.size;

  return (
    <ScreenImage
      name={layer.id}
      src={src ?? image.src}
      position={[finalPosition.x, finalPosition.y]}
      size={[finalSize.width, finalSize.height]}
      rotation={rotation ?? transform.rotation}
      pivot={transform.pivot}
      stretchMode={image.stretchMode}
      materialType={image.materialType}
      blendMode={image.blendMode}
      opacity={opacity ?? image.opacity}
      color={image.color}
      flipX={image.flipX}
      flipY={image.flipY}
      transparent={image.transparent}
      alphaTest={image.alphaTest}
      overlay={transform.overlay}
      renderOrder={layer.renderOrder}
      visible={layer.visible}
    />
  );
};

export const ShooterTextLayer = ({
  layer,
  text,
  position,
  opacity,
  onScreenTransformChange,
}: {
  layer: ShooterLayerSettings;
  text?: string;
  position?: { x: number; y: number };
  opacity?: number;
  onScreenTransformChange?: (next: ShooterScreenTransform2DSettings) => void;
}) => {
  const value = layer.text?.screenText;
  if (!value?.enabled || !layer.enabled || !layer.visible || !value.transformation.visible) {
    return null;
  }

  const { transformation: transform, style } = value;
  const finalPosition = position ?? transform.position;

  return (
    <ScreenText
      name={layer.id}
      text={text ?? value.content.text}
      position={[finalPosition.x, finalPosition.y]}
      size={[transform.size.width, transform.size.height]}
      rotation={transform.rotation}
      pivot={transform.pivot}
      screenTransform={value.screenTransform}
      onScreenTransformChange={onScreenTransformChange}
      renderOrder={layer.renderOrder}
      overlay={transform.overlay}
      visible={layer.visible}
      fontSize={style.fontSize}
      resolution={layer.textResolution ?? 2048}
      fontFamily={style.fontFamily}
      fontWeight={style.fontWeight}
      fontStyle={style.fontStyle}
      underline={style.underline}
      letterSpacing={style.letterSpacing}
      lineSpacing={style.lineSpacing}
      color={style.color}
      opacity={opacity ?? style.opacity}
      strokeLayers={style.strokeLayers}
      shadowLayers={style.shadowLayers}
      bgColor={style.background.enabled ? style.background.color : "transparent"}
      bgOpacity={style.background.opacity}
      bgFit={style.background.fit}
      bgAutoSize={style.background.autoSize}
      bgFillMode={style.background.fillMode}
      bgWidth={style.background.width}
      bgHeight={style.background.height}
      padding={style.background.padding}
      borderColor={style.background.borderEnabled ? style.background.borderColor : undefined}
      borderWidth={style.background.borderEnabled ? style.background.borderWidth : 0}
      borderRadius={style.background.borderRadius}
      textAlign={value.layout.textAlign}
      verticalAlign={value.layout.verticalAlign}
      overflow={value.layout.overflow}
      resizeToFit={value.layout.resizeToFit}
      minFontSize={value.layout.minFontSize}
    />
  );
};
