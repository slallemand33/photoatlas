"use client";

import { useEffect, useRef } from "react";

type GeoPoint = [longitude: number, latitude: number];
type ProjectedPoint = [x: number, y: number, z: number];

const BLADE_COUNT = 9;
const PIVOT_RADIUS = 0.9;
const BLADE_LENGTH = 1.05;
const BLADE_KICKBACK = 0.5;
const BLADE_WIDTH = 1.4;
const BLADE_ANGLE_CLOSED = (6 * Math.PI) / 180;
const BLADE_ANGLE_OPEN = (60 * Math.PI) / 180;
const DEG_TO_RAD = Math.PI / 180;
const FULL_CIRCLE = Math.PI * 2;
const GLOBE_CENTER_LONGITUDE = -12;
const GLOBE_CENTER_LATITUDE = 30;
const CYCLE_DURATION_SECONDS = 9;

const LAND_POLYGONS = [
  `-168 65 -162 70 -156 71 -141 70 -128 70 -115 68 -95 68 -90 72 -82 69 -86 66 -93 62 -94 58 -88 56 -82 53 -79 52 -78 57 -77 62 -70 61 -65 60 -62 57 -56 52 -60 50 -66 50 -64 47 -61 46 -66 44 -70 43 -70 41.5 -74 40 -76 37 -76 35 -81 31 -80 27 -80 25.5 -82 27 -83 29.5 -86 30.3 -89 30 -91 29 -94 29.5 -97 27 -97.5 22 -96 19 -94 18 -91 19 -90 21 -87 21 -88 16 -84 15.5 -83 11 -80 9 -79.5 8.5 -83 8 -86 11 -90 13.5 -95 16 -101 17.5 -105 20 -106 23.5 -109 26 -112 29 -114.7 31.5 -114 28 -110 23 -112 24.5 -115 28 -117 32.5 -120.5 34.5 -122.5 37.5 -124 40.5 -124 46 -124.5 48.5 -128 51 -131 54 -135 58 -140 60 -148 60.5 -152 59 -158 57 -164 55 -158 58.5 -162 60 -165 62 -166 64`,
  `-77.5 8.5 -75 11 -72 12 -68 10.7 -62 10.5 -60 8 -57 6 -52 5 -50 1.5 -50 -0.5 -44 -2.5 -39 -3.5 -35 -5.5 -35 -9 -38 -13 -39 -17.5 -41 -22 -45 -23.5 -48.5 -26 -48.5 -28.5 -52 -32 -54 -34.5 -58 -34.5 -57 -37 -62 -39 -65 -41 -63.5 -42.5 -65.5 -45 -67.5 -46.5 -66 -48 -69 -51 -68.5 -53 -71 -54 -74 -52 -75 -47 -73.5 -42 -73.5 -37 -71.6 -33 -71.5 -28 -70.5 -23 -70.3 -18 -75 -15 -77 -12 -79 -7 -81 -5 -80 -2 -80 1 -78 3 -77 7`,
  `-73 78 -60 82 -35 83.5 -20 81 -18 77 -20 70 -25 68 -33 66 -41 63 -44 60 -49 61 -53 66 -55 70 -60 76`,
  `-80 73 -68 70 -62 67 -65 63 -72 64 -78 65 -75 68 -85 70`,
  `-59 47.5 -53 47 -53 51 -56 51.5`,
  `-85 22 -80 23 -74 20 -78 20 -82 22.5`,
  `-74 19.5 -69 19.5 -68.5 18.3 -72 18`,
  `-9 37 -9 43 -2 43.5 -1.5 46 -4.5 48.5 -1.5 48.7 1.5 50 4 51.5 8 53.8 8.5 57 10.5 57.7 10.5 55 12.5 54.5 14 54 19 54.5 21 57 24 57.5 24 59.3 29 60 22 60.2 21.5 63 25 65 22 65.8 17.5 62.5 17 60 19 59.5 16.5 56.5 13 55.4 12 57.5 10.5 59.5 8 58 5.5 59 5 62 10 64 14 67.5 19 70 26 71 32 70 41 67 34 66 41 66 44 68 53 68.5 60 69 68 69 69 73 75 72.5 80 73.5 87 75 100 77 108 76 113 74 125 73 130 71 140 72.5 150 71 160 70 170 70 175 67 178 65 177 63 170 60 163 59.5 160 54 156 51 155.5 57 150 59.5 143 59 137 54 141 52 140 48 135 43 131 43 129.5 40.5 129 35.5 126.5 34.5 126 37.5 125 39.5 121.5 39 122 40.5 119 39 118 37.5 122.5 37 120 35.5 121.5 32 122 30 121 28 119 25.5 116 22.8 111 21.5 108 21.5 106 19 109 15 109 12 105 8.7 104.5 10.5 101 12.5 100 13.5 99.5 10 100.5 7 103.5 4 104 1.4 101.3 2.8 98.5 8 98 13 97.5 16.5 94.5 16 94 19 92 21.5 90.5 22 87 21.5 85 19.5 82 16.5 80 15 80 10 78 8.5 76.5 9.5 75 13 73 17.5 72.8 21 70 21 69 22.5 67 24.8 62 25.2 57 25.7 56.5 27 53 26.7 50 30 48.5 29.8 48 28 50 26.5 51.5 24.3 56 24.8 56.5 26 58.5 23.5 59.8 22.3 57 18.8 52 16.5 45 13 43 13 42.7 16 39 21.5 35 28 34.5 29.5 32.5 30 34 31.2 35 33 36 36.5 33 36 30.5 36.5 28 36.7 26.5 38.3 26.2 40.2 26 40.8 24 40.5 23 39.5 24 38 22.7 36.5 21.5 37 21 38.5 19.5 40 19.5 42 16 43.5 13.5 45.5 12.3 45 12.5 44 16 41.5 18.5 40.2 17 39 16 38 15.7 40 12 42 10.5 43.5 8.5 44.4 6.5 43.2 4 43.4 3 42.5 0.5 40.5 0 38.7 -0.7 37.6 -2 36.7 -5.5 36`,
  `-5.5 35.8 -2 35.2 3 36.8 10 37.2 11 35 10 33.5 15 32.3 20 32 20 30.5 25 31.7 30 31.3 32.5 31.2 32.5 30 34 27.5 37 22 38.5 18 41 14.5 43 12.5 44 10.5 51 11.8 51 10 48 5 43 0 40 -3 39 -6 40.5 -11 40.5 -15 35 -20 35.5 -24 32.8 -26 32 -29 28 -33 25 -34 20 -34.8 18.3 -34 18 -31 15 -27 14.5 -22 12 -17 13.5 -12 12.5 -6 9 -1 9.5 3.8 8.5 4.5 5 5.5 2 6.3 -2 5 -4.5 5.2 -7.5 4.4 -11 6.8 -13 9 -15 11 -17 14.7 -16.5 19 -16 22 -14 26 -10 29 -9.5 32 -6.5 34`,
  `44 -25 47 -25 50 -15.5 49.5 -12 47 -15 44 -17 43.5 -22`,
  `-5.5 50 1.5 51 1.7 52.8 0 53.5 -2 55.8 -2 57.6 -3.5 58.6 -5.5 58.5 -6 56.5 -5 55 -3 54.5 -3 53.3 -4.5 53.2 -5 51.7 -3.5 51.3`,
  `-10 51.8 -6 52 -6 54.5 -8 55.2 -10 54 -9.5 53`,
  `-24 65.5 -22 66.4 -16 66.5 -13.5 65 -18 63.5 -22 63.8`,
  `130.8 33.8 135 34.5 137 34.8 140 35.5 141 38.5 142 40.5 140 41 139.5 38 136.5 37 133 35.5`,
  `140 42 143 42 145 43.5 142 45.5 141 43`,
  `80 6 81.8 7.5 80 9.8 79.8 8`,
  `95 5.5 98 4 104 -1 106 -5.8 103 -5 100 -1.5 96 3`,
  `109 1.5 111 1.8 115 5 118 5.5 119 1 117 -1 116 -4 111 -3 110 -1`,
  `105.5 -6.5 108 -6.5 114 -7.5 114.5 -8.5 108 -7.8 106 -7`,
  `131 -1 135 -3.5 141 -2.6 147 -6 150 -10 147 -9.5 143 -9 141 -9 138 -8 137 -5 133 -4`,
  `120 18.5 122 18.3 122 14 124 13 121 13.5 120 15`,
  `114 -22 114 -26 115 -34 118 -35 123 -34 129 -31.5 135 -34.5 138 -35 140 -38 145 -38.8 150 -37.5 153 -31 153.5 -27 152 -24 149 -20.5 146 -18.7 145.5 -15 143.5 -14 142.5 -10.7 141.5 -13 140 -17.5 136 -15.5 135 -12 131 -12 129.5 -15 126 -14 122 -17.5 119 -20`,
  `173 -35 175.5 -37 178 -38 175 -41.5 173 -39.5`,
  `172.5 -40.5 174 -41.5 171 -44.5 169 -46.5 166.5 -46 170 -43`,
].map(parsePolygonString);

const WATER_POLYGONS = [
  `28 41.5 28.5 44 30 46 33 46 35 45 38 47 40 43 41.5 41.5 35 42 31 41`,
  `47 45 50 46.5 53 45 53 41 54 37 50 37 49 40 47.5 43`,
].map(parsePolygonString);

function parsePolygonString(serializedPolygon: string): GeoPoint[] {
  const coordinates = serializedPolygon.trim().split(/\s+/).map(Number);
  const points: GeoPoint[] = [];

  for (let index = 0; index < coordinates.length; index += 2) {
    points.push([coordinates[index]!, coordinates[index + 1]!]);
  }

  return points;
}

function smoothStep(progress: number) {
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
}

function projectGeoPoint(longitude: number, latitude: number): ProjectedPoint {
  const longitudeOffset = (longitude - GLOBE_CENTER_LONGITUDE) * DEG_TO_RAD;
  const latitudeRadians = latitude * DEG_TO_RAD;
  const centerLatitudeRadians = GLOBE_CENTER_LATITUDE * DEG_TO_RAD;
  const x = Math.cos(latitudeRadians) * Math.sin(longitudeOffset);
  const y =
    Math.cos(centerLatitudeRadians) * Math.sin(latitudeRadians) -
    Math.sin(centerLatitudeRadians) * Math.cos(latitudeRadians) * Math.cos(longitudeOffset);
  const z =
    Math.sin(centerLatitudeRadians) * Math.sin(latitudeRadians) +
    Math.cos(centerLatitudeRadians) * Math.cos(latitudeRadians) * Math.cos(longitudeOffset);

  if (z < 0) {
    const radius = Math.hypot(x, y) || 1;
    return [x / radius, -y / radius, z];
  }

  return [x, -y, z];
}

function drawProjectedClosedPath(context: CanvasRenderingContext2D, polygon: GeoPoint[]) {
  const projectedPoints = polygon.map(([longitude, latitude]) => projectGeoPoint(longitude, latitude));
  const pointCount = projectedPoints.length;
  const previousPoint = projectedPoints[pointCount - 1]!;
  const firstPoint = projectedPoints[0]!;

  context.beginPath();
  context.moveTo((previousPoint[0] + firstPoint[0]) / 2, (previousPoint[1] + firstPoint[1]) / 2);

  for (let index = 0; index < pointCount; index += 1) {
    const currentPoint = projectedPoints[index]!;
    const nextPoint = projectedPoints[(index + 1) % pointCount]!;
    context.quadraticCurveTo(
      currentPoint[0],
      currentPoint[1],
      (currentPoint[0] + nextPoint[0]) / 2,
      (currentPoint[1] + nextPoint[1]) / 2,
    );
  }

  context.closePath();
}

function PhotoAtlasAperture({ className = "" }: { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrapperElement = wrapperRef.current;
    const canvasElement = canvasRef.current;

    if (!wrapperElement || !canvasElement) {
      return;
    }

    const context = canvasElement.getContext("2d");

    if (!context) {
      return;
    }

    let lensScale = 0;
    let centerX = 0;
    let centerY = 0;
    let backBuffer: HTMLCanvasElement | null = null;
    let frontBuffer: HTMLCanvasElement | null = null;
    let animationFrameId = 0;
    let cycleStartTime: number | null = null;
    let reducedMotion = false;
    let darkThemeEnabled = false;
    let pageBackgroundColor = "rgb(244, 239, 228)";

    const createBuffer = (width: number, height: number) => {
      const buffer = document.createElement("canvas");
      buffer.width = width;
      buffer.height = height;
      return buffer;
    };

    const transparentVersion = (rgbColor: string) => {
      const matchedRgb = rgbColor.match(/^rgb\(([^)]+)\)$/);
      return matchedRgb ? `rgba(${matchedRgb[1]},0)` : "rgba(0,0,0,0)";
    };

    const syncTheme = () => {
      const rootElement = document.documentElement;
      darkThemeEnabled = rootElement.classList.contains("dark") || rootElement.dataset.theme === "dark";
      pageBackgroundColor = getComputedStyle(document.body).backgroundColor || "rgb(244, 239, 228)";
      canvasElement.style.opacity = "0.5";
    };

    const drawGlobe = (targetContext: CanvasRenderingContext2D, radius: number) => {
      targetContext.save();
      targetContext.scale(radius, radius);
      targetContext.beginPath();
      targetContext.arc(0, 0, 1, 0, FULL_CIRCLE);
      targetContext.clip();

      const oceanGradient = targetContext.createRadialGradient(-0.3, -0.35, 0.1, 0, 0, 1);
      oceanGradient.addColorStop(0, "#e6eff3");
      oceanGradient.addColorStop(0.6, "#c3d4de");
      oceanGradient.addColorStop(1, "#93aabb");
      targetContext.fillStyle = oceanGradient;
      targetContext.fillRect(-1, -1, 2, 2);

      targetContext.strokeStyle = "rgba(255,255,255,.38)";
      targetContext.lineWidth = 0.005;

      const drawVisibleLine = (points: GeoPoint[]) => {
        targetContext.beginPath();
        let segmentVisible = false;

        for (const [longitude, latitude] of points) {
          const [projectedX, projectedY, projectedZ] = projectGeoPoint(longitude, latitude);
          if (projectedZ < 0) {
            segmentVisible = false;
            continue;
          }

          if (segmentVisible) {
            targetContext.lineTo(projectedX, projectedY);
          } else {
            targetContext.moveTo(projectedX, projectedY);
          }

          segmentVisible = true;
        }

        targetContext.stroke();
      };

      for (let longitude = -180; longitude < 180; longitude += 30) {
        const gridPoints: GeoPoint[] = [];
        for (let latitude = -85; latitude <= 85; latitude += 5) {
          gridPoints.push([longitude, latitude]);
        }
        drawVisibleLine(gridPoints);
      }

      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const gridPoints: GeoPoint[] = [];
        for (let longitude = -180; longitude <= 180; longitude += 5) {
          gridPoints.push([longitude, latitude]);
        }
        drawVisibleLine(gridPoints);
      }

      targetContext.lineJoin = "round";

      for (const polygon of LAND_POLYGONS) {
        drawProjectedClosedPath(targetContext, polygon);
        targetContext.strokeStyle = "rgba(232,244,250,.5)";
        targetContext.lineWidth = 0.04;
        targetContext.stroke();
      }

      const landGradient = targetContext.createLinearGradient(0, -1, 0, 1);
      [
        [0, "#d3d2bd"],
        [0.3, "#b4bd8f"],
        [0.5, "#d8c597"],
        [0.72, "#c4c28f"],
        [1, "#cdbf98"],
      ].forEach(([stop, color]) => landGradient.addColorStop(stop as number, color as string));

      for (const polygon of LAND_POLYGONS) {
        drawProjectedClosedPath(targetContext, polygon);
        targetContext.fillStyle = landGradient;
        targetContext.fill();
        targetContext.strokeStyle = "rgba(112,98,66,.55)";
        targetContext.lineWidth = 0.005;
        targetContext.stroke();
      }

      for (const polygon of WATER_POLYGONS) {
        drawProjectedClosedPath(targetContext, polygon);
        targetContext.fillStyle = "#a9c0cf";
        targetContext.fill();
      }

      const globeShade = targetContext.createRadialGradient(-0.38, -0.42, 0.05, 0, 0, 1.05);
      globeShade.addColorStop(0, "rgba(255,255,255,.4)");
      globeShade.addColorStop(0.45, "rgba(255,255,255,0)");
      globeShade.addColorStop(1, "rgba(45,58,85,.34)");
      targetContext.fillStyle = globeShade;
      targetContext.fillRect(-1, -1, 2, 2);
      targetContext.restore();

      targetContext.save();
      targetContext.scale(radius, radius);
      const atmosphere = targetContext.createRadialGradient(0, 0, 0.96, 0, 0, 1.1);
      atmosphere.addColorStop(0, "rgba(170,205,235,0)");
      atmosphere.addColorStop(0.25, "rgba(170,205,235,.35)");
      atmosphere.addColorStop(1, "rgba(170,205,235,0)");
      targetContext.fillStyle = atmosphere;
      targetContext.beginPath();
      targetContext.arc(0, 0, 1.1, 0, FULL_CIRCLE);
      targetContext.fill();
      targetContext.strokeStyle = "rgba(90,105,125,.4)";
      targetContext.lineWidth = 0.006;
      targetContext.beginPath();
      targetContext.arc(0, 0, 1, 0, FULL_CIRCLE);
      targetContext.stroke();
      targetContext.restore();
    };

    const buildBackBuffer = (width: number, height: number) => {
      backBuffer = createBuffer(width, height);
      const backContext = backBuffer.getContext("2d");

      if (!backContext) {
        return;
      }

      backContext.translate(centerX, centerY);
      backContext.scale(lensScale, lensScale);

      const lensBackground = backContext.createRadialGradient(0, 0, 0, 0, 0, 1);
      lensBackground.addColorStop(0, "#fcfaf4");
      lensBackground.addColorStop(1, "#e7dfcf");
      backContext.fillStyle = lensBackground;
      backContext.beginPath();
      backContext.arc(0, 0, 1, 0, FULL_CIRCLE);
      backContext.fill();

      backContext.save();
      backContext.shadowColor = "rgba(70,60,40,.25)";
      backContext.shadowBlur = 0.07 * lensScale;
      backContext.shadowOffsetY = 0.02 * lensScale;
      backContext.fillStyle = "#b9cbd6";
      backContext.beginPath();
      backContext.arc(0, 0, 0.6, 0, FULL_CIRCLE);
      backContext.fill();
      backContext.restore();

      drawGlobe(backContext, 0.6);
    };

    const buildFrontBuffer = (width: number, height: number) => {
      frontBuffer = createBuffer(width, height);
      const frontContext = frontBuffer.getContext("2d");

      if (!frontContext) {
        return;
      }

      frontContext.translate(centerX, centerY);
      frontContext.scale(lensScale, lensScale);

      const ring = (innerRadius: number, outerRadius: number, fill: CanvasFillStrokeStyles["fillStyle"]) => {
        frontContext.beginPath();
        frontContext.arc(0, 0, outerRadius, 0, FULL_CIRCLE);
        frontContext.arc(0, 0, innerRadius, 0, FULL_CIRCLE, true);
        frontContext.fillStyle = fill;
        frontContext.fill("evenodd");
      };

      const outerRingGradient = frontContext.createLinearGradient(-1.4, -1.4, 1.4, 1.4);
      [
        [0, "#5a5c61"],
        [0.35, "#2b2c30"],
        [0.7, "#17181a"],
        [1, "#3d3e43"],
      ].forEach(([stop, color]) => outerRingGradient.addColorStop(stop as number, color as string));
      ring(1.22, 1.38, outerRingGradient);

      const brushedMetalGradient = frontContext.createConicGradient(0, 0, 0);
      let textureSeed = 7;
      const random = () => {
        textureSeed = (textureSeed * 16807) % 2147483647;
        return textureSeed / 2147483647;
      };

      for (let index = 0; index <= 24; index += 1) {
        const value = Math.round(112 + 46 * Math.sin(index * 1.7) + 20 * Math.sin(index * 0.6));
        brushedMetalGradient.addColorStop(index / 24, `rgb(${value},${value + 2},${value + 6})`);
      }

      ring(1.08, 1.22, brushedMetalGradient);

      for (let index = 0; index < 180; index += 1) {
        const radius = 1.085 + random() * 0.13;
        const startAngle = random() * FULL_CIRCLE;
        frontContext.strokeStyle = random() > 0.5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)";
        frontContext.lineWidth = 0.0015;
        frontContext.beginPath();
        frontContext.arc(0, 0, radius, startAngle, startAngle + 0.3 + random() * 1.2);
        frontContext.stroke();
      }

      const innerBarrelGradient = frontContext.createRadialGradient(0, 0, 0.99, 0, 0, 1.08);
      innerBarrelGradient.addColorStop(0, "#0c0d0f");
      innerBarrelGradient.addColorStop(1, "#46484d");
      ring(0.99, 1.08, innerBarrelGradient);

      frontContext.strokeStyle = "rgba(225,227,230,.55)";
      frontContext.lineWidth = 0.008;
      frontContext.beginPath();
      frontContext.arc(0, 0, 1.38, 0, FULL_CIRCLE);
      frontContext.stroke();

      frontContext.strokeStyle = "rgba(0,0,0,.5)";
      frontContext.lineWidth = 0.006;
      [1.22, 1.08].forEach((radius) => {
        frontContext.beginPath();
        frontContext.arc(0, 0, radius, 0, FULL_CIRCLE);
        frontContext.stroke();
      });

      frontContext.strokeStyle = "rgba(215,217,220,.6)";
      frontContext.lineWidth = 0.004;
      for (let index = 0; index < 90; index += 1) {
        const angle = (index / 90) * FULL_CIRCLE;
        const notchLength = index % 9 === 0 ? 0.07 : 0.035;
        frontContext.beginPath();
        frontContext.moveTo(Math.cos(angle) * 1.34, Math.sin(angle) * 1.34);
        frontContext.lineTo(Math.cos(angle) * (1.34 - notchLength), Math.sin(angle) * (1.34 - notchLength));
        frontContext.stroke();
      }

      frontContext.fillStyle = "rgba(235,236,238,.8)";
      frontContext.beginPath();
      frontContext.moveTo(0, -1.215);
      frontContext.lineTo(-0.02, -1.18);
      frontContext.lineTo(0.02, -1.18);
      frontContext.fill();

      const innerVignette = frontContext.createRadialGradient(0, 0, 0.7, 0, 0, 1);
      innerVignette.addColorStop(0, "rgba(0,0,0,0)");
      innerVignette.addColorStop(1, "rgba(0,0,0,.3)");
      frontContext.fillStyle = innerVignette;
      frontContext.beginPath();
      frontContext.arc(0, 0, 1, 0, FULL_CIRCLE);
      frontContext.fill();

      const reflection = frontContext.createLinearGradient(-0.7, -0.8, 0.7, 0.8);
      reflection.addColorStop(0, "rgba(255,255,255,.1)");
      reflection.addColorStop(0.35, "rgba(255,255,255,0)");
      frontContext.fillStyle = reflection;
      frontContext.beginPath();
      frontContext.arc(0, 0, 1, 0, FULL_CIRCLE);
      frontContext.fill();

      frontContext.strokeStyle = "rgba(255,255,255,.22)";
      frontContext.lineWidth = 0.018;
      frontContext.lineCap = "round";
      frontContext.beginPath();
      frontContext.arc(0, 0, 0.9, 200 * DEG_TO_RAD, 255 * DEG_TO_RAD);
      frontContext.stroke();
    };

    const drawBlade = (bladeIndex: number, bladeAngle: number) => {
      context.save();
      context.rotate((bladeIndex * FULL_CIRCLE) / BLADE_COUNT);
      context.beginPath();
      context.arc(0, 0, 1, 0, FULL_CIRCLE);
      context.clip();

      const edgeX = -Math.cos(bladeAngle);
      const edgeY = Math.sin(bladeAngle);
      const normalX = Math.sin(bladeAngle);
      const normalY = Math.cos(bladeAngle);
      const anchorX = PIVOT_RADIUS - BLADE_KICKBACK * edgeX;
      const anchorY = -BLADE_KICKBACK * edgeY;
      const tipX = PIVOT_RADIUS + BLADE_LENGTH * edgeX;
      const tipY = BLADE_LENGTH * edgeY;
      const curveX = (anchorX + tipX) / 2 - normalX * 0.12;
      const curveY = (anchorY + tipY) / 2 - normalY * 0.12;

      const defineBladePath = () => {
        context.beginPath();
        context.moveTo(anchorX, anchorY);
        context.quadraticCurveTo(curveX, curveY, tipX, tipY);
        context.lineTo(tipX + normalX * BLADE_WIDTH + edgeX * 0.3, tipY + normalY * BLADE_WIDTH + edgeY * 0.3);
        context.lineTo(anchorX + normalX * BLADE_WIDTH, anchorY + normalY * BLADE_WIDTH);
        context.closePath();
      };

      const bladeGradient = context.createLinearGradient(PIVOT_RADIUS, 0, PIVOT_RADIUS + normalX * 0.7, normalY * 0.7);
      bladeGradient.addColorStop(0, "#6d6f74");
      bladeGradient.addColorStop(0.3, "#47494d");
      bladeGradient.addColorStop(1, "#2a2b2f");

      context.shadowColor = "rgba(0,0,0,.42)";
      context.shadowBlur = 0.045 * lensScale;
      defineBladePath();
      context.fillStyle = bladeGradient;
      context.fill();

      context.shadowColor = "transparent";
      const highlight = context.createLinearGradient(anchorX, anchorY, tipX, tipY);
      highlight.addColorStop(0, "rgba(255,255,255,0)");
      highlight.addColorStop(0.5, "rgba(255,255,255,.08)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      defineBladePath();
      context.fillStyle = highlight;
      context.fill();

      context.strokeStyle = "rgba(236,238,241,.55)";
      context.lineWidth = 0.006;
      context.beginPath();
      context.moveTo(anchorX, anchorY);
      context.quadraticCurveTo(curveX, curveY, tipX, tipY);
      context.stroke();
      context.restore();
    };

    const drawPins = () => {
      for (let bladeIndex = 0; bladeIndex < BLADE_COUNT; bladeIndex += 1) {
        context.save();
        context.rotate((bladeIndex * FULL_CIRCLE) / BLADE_COUNT);
        context.translate(PIVOT_RADIUS, 0);
        context.fillStyle = "#111214";
        context.beginPath();
        context.arc(0, 0, 0.045, 0, FULL_CIRCLE);
        context.fill();

        const pinGradient = context.createRadialGradient(-0.01, -0.01, 0, 0, 0, 0.033);
        pinGradient.addColorStop(0, "#f1f2f4");
        pinGradient.addColorStop(1, "#7c7e84");
        context.fillStyle = pinGradient;
        context.beginPath();
        context.arc(0, 0, 0.033, 0, FULL_CIRCLE);
        context.fill();
        context.restore();
      }
    };

    const computeProgress = (elapsedMilliseconds: number) => {
      if (reducedMotion) {
        return 1;
      }

      const elapsedSeconds = elapsedMilliseconds / 1000;
      const cycleTime = elapsedSeconds % CYCLE_DURATION_SECONDS;

      if (cycleTime < 3) {
        return smoothStep(cycleTime / 3);
      }
      if (cycleTime < 4.5) {
        return 1;
      }
      if (cycleTime < 7.5) {
        return 1 - smoothStep((cycleTime - 4.5) / 3);
      }
      return 0;
    };

    const render = (timestamp: number) => {
      if (cycleStartTime === null) {
        cycleStartTime = timestamp;
      }

      const animationProgress = computeProgress(timestamp - cycleStartTime);
      const bladeAngle = BLADE_ANGLE_CLOSED + (BLADE_ANGLE_OPEN - BLADE_ANGLE_CLOSED) * animationProgress;

      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);

      if (backBuffer) {
        context.drawImage(backBuffer, 0, 0);
      }

      context.setTransform(lensScale, 0, 0, lensScale, centerX, centerY);
      for (let bladeIndex = 0; bladeIndex < BLADE_COUNT; bladeIndex += 1) {
        drawBlade(bladeIndex, bladeAngle);
      }
      drawPins();

      context.setTransform(1, 0, 0, 1, 0, 0);
      if (frontBuffer) {
        context.drawImage(frontBuffer, 0, 0);
      }

      const vignette = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 0.8 * lensScale);
      vignette.addColorStop(0, darkThemeEnabled ? "rgba(12,13,15,.16)" : "rgba(244,239,228,.42)");
      vignette.addColorStop(1, transparentVersion(pageBackgroundColor));
      context.fillStyle = vignette;
      context.fillRect(0, 0, canvasElement.width, canvasElement.height);

      if (!reducedMotion) {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };

    const setup = () => {
      syncTheme();

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = wrapperElement.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width * devicePixelRatio));
      const height = Math.max(1, Math.round(bounds.height * devicePixelRatio));

      canvasElement.width = width;
      canvasElement.height = height;
      centerX = width / 2;
      centerY = height / 2;
      lensScale = 0.33 * Math.min(width, height);

      buildBackBuffer(width, height);
      buildFrontBuffer(width, height);

      window.cancelAnimationFrame(animationFrameId);
      cycleStartTime = null;

      if (reducedMotion) {
        render(0);
      } else {
        animationFrameId = window.requestAnimationFrame(render);
      }
    };

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = reducedMotionQuery.matches;

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      setup();
    };

    const resizeObserver = new ResizeObserver(() => {
      setup();
    });
    resizeObserver.observe(wrapperElement);

    const themeObserver = new MutationObserver(() => {
      setup();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    setup();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-[48%] overflow-hidden sm:h-[28rem] sm:w-[28rem] lg:h-[38rem] lg:w-[38rem] ${className}`.trim()}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export { PhotoAtlasAperture };