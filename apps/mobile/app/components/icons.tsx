import Svg, { Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export function FaceIdIcon({ size = 32, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M7 3H5a2 2 0 0 0-2 2v2m4 14H5a2 2 0 0 1-2-2v-2m14-14h2a2 2 0 0 1 2 2v2m-4 14h2a2 2 0 0 0 2-2v-2"
      />
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M8 8v1m8-1v1m-4 2v2.5c0 .5-.5 1-1 1"
      />
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M9 16c.5.5 1.5 1 3 1s2.5-.5 3-1"
      />
    </Svg>
  );
}

export function FingerprintIcon({ size = 32, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4m1.09-6.75a4.13 4.13 0 0 1 5.17 4c0 2.28-.31 4.64-.9 6.75m-6.46-8.18A4.14 4.14 0 0 0 7.8 12c0 3.08-.46 5.97-1.3 8m12-8c0 .9-.05 1.78-.13 2.65m-2.07-4.98A6.14 6.14 0 0 0 12 5.87a6.14 6.14 0 0 0-6 5.02m.01 6.56c.54-1.94.86-4.12.89-6.43A4.11 4.11 0 0 1 12 7.87c1.56 0 2.93.86 3.63 2.13M2 12c0-5.52 4.48-10 10-10s10 4.48 10 10a17.7 17.7 0 0 1-.65 4.75"
      />
    </Svg>
  );
}

export function MailIcon({ size = 20, color = "rgba(255,255,255,0.4)" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={2}
        y={4}
        width={20}
        height={16}
        rx={2}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
      />
    </Svg>
  );
}

export function LockIcon({ size = 20, color = "rgba(255,255,255,0.4)" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={11}
        width={18}
        height={11}
        rx={2}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M7 11V7a5 5 0 0 1 10 0v4"
      />
    </Svg>
  );
}
