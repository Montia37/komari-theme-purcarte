import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ControlSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleValueClick = () => {
    setInputValue(value);
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const handleInputBlur = () => {
    let finalValue = inputValue;
    if (finalValue > max) finalValue = max;
    if (finalValue < min) finalValue = min;
    onChange(finalValue);
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <div>
      <label className="block mb-2 text-sm">
        {label}:{" "}
        {isEditing ? (
          <input
            type="number"
            value={inputValue}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="w-20 bg-transparent border-b border-white text-white text-center"
            autoFocus
          />
        ) : (
          <span onClick={handleValueClick} className="cursor-pointer">
            {step === 0.01 ? value.toFixed(2) : value}
          </span>
        )}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
};

type GlassParams = {
  borderWidth: number;
  glassThickness: number;
  refractiveIndex: number;
  blur: number;
  saturation: number;
  cornerRadius: number;
};

const LiquidGlassDemo: React.FC = () => {
  const [params, setParams] = useState<GlassParams>({
    borderWidth: 50,
    glassThickness: 20,
    refractiveIndex: 1.75,
    blur: 0,
    saturation: 120,
    cornerRadius: 24,
  });

  const handleParamChange = (param: keyof GlassParams, value: number) => {
    setParams((prev) => ({ ...prev, [param]: value }));
  };

  const sliderConfigs: {
    label: string;
    key: keyof GlassParams;
    min: number;
    max: number;
    step?: number;
  }[] = [
    { label: "边框宽度", key: "borderWidth", min: 5, max: 100 },
    { label: "玻璃厚度", key: "glassThickness", min: 1, max: 50 },
    { label: "折射率", key: "refractiveIndex", min: 1.0, max: 2.5, step: 0.01 },
    { label: "模糊值", key: "blur", min: 0, max: 50 },
    { label: "饱和度", key: "saturation", min: 0, max: 300 },
    { label: "圆角半径", key: "cornerRadius", min: 0, max: 100 },
  ];

  const cardContents = [
    <>动态效果</>,
    <>
      实时响应
      <br />
      参数调整
    </>,
    <>液态玻璃</>,
    <>
      Purcarte
      <br />
      主题
    </>,
    <>Komari</>,
    <>示例卡片</>,
  ];

  return (
    <div className="p-4 w-[85vw] m-auto text-primary space-y-8">
      <h1 className="text-4xl sm:text-5xl font-bold text-center">
        液态玻璃效果演示
      </h1>

      {/* 控制面板 */}
      <Card className="bg-transparent border-none" {...params}>
        <CardHeader>
          <CardTitle className="text-white">可调参数</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-white">
          {sliderConfigs.map((config) => (
            <ControlSlider
              key={config.key}
              label={config.label}
              value={params[config.key]}
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={(value) => handleParamChange(config.key, value)}
            />
          ))}
        </CardContent>
      </Card>

      {/* 示例网格 */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-6">示例网格</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cardContents.map((content, index) => (
            <Card key={index} {...params}>
              <div className="p-8 flex items-center justify-center h-72">
                <p className="text-center">{content}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiquidGlassDemo;
