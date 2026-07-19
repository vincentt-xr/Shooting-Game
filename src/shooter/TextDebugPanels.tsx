import { SettingsPanel, type SettingsPanelField } from "@vincentt-xr/sdk/debug-ui";

import type { ShooterSettings, ShooterTextLayerId } from "./settings";

type TextPanelValue = {
  x: number;
  y: number;
  width: number;
  height: number;
  resolution: number;
  fontSize: number;
  color: string;
  strokeWidth: number;
  shadowBlur: number;
};

const TEXT_LAYER_IDS: ShooterTextLayerId[] = ["ammoText", "scoreText", "gameMessage"];

const textPanelFields: SettingsPanelField<TextPanelValue>[] = [
  { key: "x", label: "X", type: "number", min: -2, max: 2, step: 0.01 },
  { key: "y", label: "Y", type: "number", min: -2, max: 2, step: 0.01 },
  { key: "width", label: "Width", type: "number", min: 0.05, max: 6, step: 0.01 },
  { key: "height", label: "Height", type: "number", min: 0.05, max: 6, step: 0.01 },
  { key: "resolution", label: "HD Res", type: "number", min: 512, max: 4096, step: 256 },
  { key: "fontSize", label: "Font Size", type: "number", min: 8, max: 360, step: 1 },
  { key: "color", label: "Color", type: "color" },
  { key: "strokeWidth", label: "Stroke", type: "number", min: 0, max: 60, step: 1 },
  { key: "shadowBlur", label: "Shadow", type: "number", min: 0, max: 80, step: 1 },
];

const getTextPanelValue = (settings: ShooterSettings, id: ShooterTextLayerId): TextPanelValue => {
  const text = settings.layers[id].text?.screenText;
  const transform = text?.transformation;
  const style = text?.style;
  return {
    x: transform?.position.x ?? 0,
    y: transform?.position.y ?? 0,
    width: transform?.size.width ?? 0.5,
    height: transform?.size.height ?? 0.5,
    resolution: settings.layers[id].textResolution ?? 2048,
    fontSize: style?.fontSize ?? 84,
    color: style?.color ?? "#ffffff",
    strokeWidth: style?.strokeLayers?.[0]?.width ?? 0,
    shadowBlur: style?.shadowLayers?.[0]?.blur ?? 0,
  };
};

const updateTextLayer = (
  settings: ShooterSettings,
  id: ShooterTextLayerId,
  next: TextPanelValue,
): ShooterSettings => {
  const layer = settings.layers[id];
  if (!layer.text) return settings;
  const currentStroke = layer.text.screenText.style.strokeLayers?.[0] ?? {
    color: "#120807",
    width: 0,
    opacity: 1,
  };
  const currentShadow = layer.text.screenText.style.shadowLayers?.[0] ?? {
    color: "#000000",
    blur: 0,
    offsetX: 8,
    offsetY: -8,
    opacity: 0.6,
  };

  return {
    ...settings,
    layers: {
      ...settings.layers,
      [id]: {
        ...layer,
        textResolution: next.resolution,
        text: {
          ...layer.text,
          screenText: {
            ...layer.text.screenText,
            transformation: {
              ...layer.text.screenText.transformation,
              position: { x: next.x, y: next.y },
              size: { width: next.width, height: next.height },
            },
            style: {
              ...layer.text.screenText.style,
              fontSize: next.fontSize,
              color: next.color,
              aspect: next.width / next.height,
              strokeLayers: next.strokeWidth > 0
                ? [{ ...currentStroke, width: next.strokeWidth }]
                : [],
              shadowLayers: next.shadowBlur > 0
                ? [{ ...currentShadow, blur: next.shadowBlur }]
                : [],
            },
          },
        },
      },
    },
  };
};

export const TextDebugPanels = ({
  settings,
  onChange,
}: {
  settings: ShooterSettings;
  onChange: (next: ShooterSettings) => void;
}) => (
  <>
    {TEXT_LAYER_IDS.map((id, index) => {
      const layer = settings.layers[id];
      return (
        <SettingsPanel<TextPanelValue>
          key={id}
          title={layer.label}
          value={getTextPanelValue(settings, id)}
          fields={textPanelFields}
          copyLabel="Copy"
          copyPayload={(value) => ({ id, ...value })}
          initialPosition={{ x: 16 + index * 310, y: 16 }}
          onChange={(next) => onChange(updateTextLayer(settings, id, next))}
        />
      );
    })}
  </>
);
