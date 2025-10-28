import React, {
  useState,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import {
  useDisplacementMap,
  type DisplacementMapOptions,
} from "@/hooks/useDisplacementMap";
import { cn } from "@/utils";

/**
 * @interface GlassFilterProps
 * @property {string} id - SVG滤镜的唯一ID
 * @property {string} displacementMapUrl - 位移图的Data URL
 * @property {number} scale - 位移的缩放因子 (通常是最大位移值)
 * @property {number} width - 滤镜效果的宽度
 * @property {number} height - 滤镜效果的高度
 */
interface GlassFilterProps {
  id: string;
  displacementMapUrl: string;
  scale: number;
  width: number;
  height: number;
}

/**
 * GlassFilter 组件
 * 渲染一个包含 feDisplacementMap 的SVG滤镜。
 * @param {GlassFilterProps} props - 组件的属性
 */
const GlassFilter: React.FC<GlassFilterProps> = ({
  id,
  displacementMapUrl,
  scale,
  width,
  height,
}) => {
  if (!displacementMapUrl) {
    return null;
  }

  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0 }}
      aria-hidden="true">
      <defs>
        <filter id={id} colorInterpolationFilters="sRGB">
          {/* 从Data URL加载位移图 */}
          <feImage
            href={displacementMapUrl}
            x={0}
            y={0}
            width={width}
            height={height}
            result="displacementMap"
          />
          {/*
            应用位移效果:
            - in="SourceGraphic": 输入是原始的元素图形。
            - in2="displacementMap": 使用我们生成的位移图。
            - scale: 控制位移的强度。
            - xChannelSelector="R": 使用红色通道控制水平位移。
            - yChannelSelector="G": 使用绿色通道控制垂直位移。
          */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="displacementMap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
};

export interface LiquidGlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<DisplacementMapOptions, "width" | "height"> {
  children: React.ReactNode;
  blur?: number;
  saturation?: number;
  cornerRadius?: number;
}

export const LiquidGlassCard = React.forwardRef<
  HTMLDivElement,
  LiquidGlassCardProps
>(
  (
    {
      children,
      blur = 0,
      saturation = 120,
      cornerRadius = 24,
      borderWidth = 50,
      glassThickness = 20,
      refractiveIndex = 1.75,
      surfaceFunction,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const [size, setSize] = useState({ width: 0, height: 0 });
    const filterId = useId();

    useEffect(() => {
      const element = internalRef.current;
      if (!element) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });

      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, []);

    const { displacementMapUrl, maxDisplacement } = useDisplacementMap({
      width: size.width,
      height: size.height,
      borderWidth,
      cornerRadius,
      glassThickness,
      refractiveIndex,
      surfaceFunction,
    });

    const isBackdropFilterSupported = CSS.supports(
      "backdrop-filter",
      "blur(10px)"
    );

    const backdropStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      borderRadius: `${cornerRadius}px`,
      backdropFilter: isBackdropFilterSupported
        ? `${blur > 0 ? `blur(${blur}px)` : ""} saturate(${saturation}%)`
        : "none",
      filter: isBackdropFilterSupported ? `url(#${filterId})` : "none",
      backgroundColor: isBackdropFilterSupported ? "transparent" : undefined,
    };

    return (
      <div
        ref={internalRef}
        className={cn(
          "relative overflow-hidden inset-ring-1 inset-ring-(--accent-4)/25 hover:inset-ring-(--accent-4)/75 transition-all duration-300",
          className
        )}
        style={{
          borderRadius: `${cornerRadius}px`,
          ...style,
        }}
        {...props}>
        <div className="glass-backdrop -z-1" style={backdropStyle} />

        {isBackdropFilterSupported && (
          <GlassFilter
            id={filterId}
            displacementMapUrl={displacementMapUrl}
            scale={maxDisplacement}
            width={size.width}
            height={size.height}
          />
        )}

        {children}
      </div>
    );
  }
);
LiquidGlassCard.displayName = "LiquidGlassCard";
