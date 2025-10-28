import { useState, useEffect } from "react";

/**
 * @interface DisplacementMapOptions - useDisplacementMap hook的选项
 * @property {number} width - 画布宽度
 * @property {number} height - 画布高度
 * @property {number} borderWidth - 玻璃效果的边框宽度
 * @property {number} glassThickness - 虚拟玻璃的厚度，影响折射强度
 * @property {number} refractiveIndex - 玻璃的折射率 (IOR)
 * @property {(x: number) => number} [surfaceFunction] - 定义玻璃曲面的函数
 */
export interface DisplacementMapOptions {
  width: number;
  height: number;
  borderWidth?: number;
  cornerRadius?: number;
  glassThickness?: number;
  refractiveIndex?: number;
  surfaceFunction?: (x: number) => number;
}

// 默认的凸圆角矩形表面函数，产生平滑的过渡效果
const defaultSurfaceFunction = (x: number): number => {
  return Math.pow(1.0 - Math.pow(1.0 - x, 4.0), 1.0 / 4.0);
};

/**
 * useDisplacementMap Hook
 * 根据物理折射原理动态计算并生成SVG位移图。
 * @param {DisplacementMapOptions} options - 生成位移图的参数
 * @returns {{ displacementMapUrl: string; maxDisplacement: number }} - 位移图的Data URL和最大位移值
 */
export const useDisplacementMap = ({
  width,
  height,
  borderWidth = 30,
  cornerRadius,
  glassThickness = 20,
  refractiveIndex = 1.5,
  surfaceFunction = defaultSurfaceFunction,
}: DisplacementMapOptions): {
  displacementMapUrl: string;
  maxDisplacement: number;
} => {
  const [displacementMapUrl, setDisplacementMapUrl] = useState<string>("");
  const [maxDisplacement, setMaxDisplacement] = useState<number>(0);

  useEffect(() => {
    // 确保所有尺寸都是整数，避免亚像素渲染问题导致摩尔纹
    const w = Math.round(width);
    const h = Math.round(height);
    const bW = Math.round(borderWidth);
    const cR = Math.round(cornerRadius ?? bW); // 如果未提供cornerRadius，则默认为borderWidth

    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. 预计算从边缘到中心的位移大小
    const numSteps = 127; // 对应8位通道的一半
    const displacementMagnitudes: number[] = [];
    let currentMaxDisplacement = 0;

    for (let i = 0; i <= numSteps; i++) {
      const distanceFromEdge = (i / numSteps) * bW;
      if (distanceFromEdge > bW) {
        displacementMagnitudes.push(0);
        continue;
      }

      const x = distanceFromEdge / bW; // 归一化距离

      const delta = 0.001;
      const y1 = surfaceFunction(Math.max(0, x - delta));
      const y2 = surfaceFunction(Math.min(1, x + delta));
      const derivative = (y2 - y1) / (2 * delta);

      const theta1 = Math.atan(derivative);
      const sinTheta2 = Math.sin(theta1) / refractiveIndex;
      const theta2 = Math.asin(sinTheta2);
      const refractionAngle = theta1 - theta2;

      const displacement = Math.tan(refractionAngle) * glassThickness;
      displacementMagnitudes.push(displacement);
      if (displacement > currentMaxDisplacement) {
        currentMaxDisplacement = displacement;
      }
    }

    setMaxDisplacement(currentMaxDisplacement);

    // 2. 创建位移图图像数据
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    const halfW = w / 2;
    const halfH = h / 2;
    const innerRectHalfW = halfW - cR;
    const innerRectHalfH = halfH - cR;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cx = x - halfW;
        const cy = y - halfH;

        // 使用SDF精确计算到圆角矩形边界的距离
        // q 是点相对于内部矩形右上角的位置
        const qx = Math.abs(cx) - innerRectHalfW;
        const qy = Math.abs(cy) - innerRectHalfH;

        // sdf 是到边界的带符号距离（外部为正，内部为负）
        const sdf =
          Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) +
          Math.min(Math.max(qx, qy), 0) -
          cR;

        // 我们需要的是从边界向内的距离
        const distanceFromEdge = -sdf;

        let vectorX = 0;
        let vectorY = 0;

        if (distanceFromEdge > 0 && distanceFromEdge <= bW) {
          const magnitudeIndex = Math.floor((distanceFromEdge / bW) * numSteps);
          const magnitude = displacementMagnitudes[magnitudeIndex] || 0;

          const normalizedMagnitude =
            currentMaxDisplacement > 0 ? magnitude / currentMaxDisplacement : 0;

          const len = Math.sqrt(cx * cx + cy * cy);
          if (len > 0) {
            vectorX = -(cx / len) * normalizedMagnitude;
            vectorY = -(cy / len) * normalizedMagnitude;
          }
        }

        const r = 128 + vectorX * 127;
        const g = 128 + vectorY * 127;
        const b = 128;
        const a = 255;

        const i = (y * w + x) * 4;
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setDisplacementMapUrl(canvas.toDataURL());
  }, [
    width,
    height,
    borderWidth,
    glassThickness,
    refractiveIndex,
    surfaceFunction,
    cornerRadius,
  ]);

  return { displacementMapUrl, maxDisplacement };
};
