import Svg, { Path, Rect, Circle } from "react-native-svg";
import type { ItemType } from "../stores";

interface IconProps {
  size?: number;
  color?: string;
}

const typeicons: Record<ItemType, string> = {
  login: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
  note: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  card: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z",
  identity: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  ssh: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z",
  api: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  otp: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
  passkey: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
};

export function TypeIcon({ type, size = 20, color = "#ffffff" }: IconProps & { type: ItemType }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d={typeicons[type]} />
    </Svg>
  );
}

export function XIcon({ size = 24, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 24, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </Svg>
  );
}

export function CopyIcon({ size = 18, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m11.25-3h-3.75a1.125 1.125 0 00-1.125 1.125v3.75c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125v-3.75c0-.621-.504-1.125-1.125-1.125zm0 0V3.375c0-.621-.504-1.125-1.125-1.125h-3.375c-.621 0-1.125.504-1.125 1.125v.75" />
    </Svg>
  );
}

export function EyeIcon({ size = 18, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

export function EyeSlashIcon({ size = 18, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </Svg>
  );
}

export function CheckIcon({ size = 16, color = "#22c55e" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </Svg>
  );
}

export function PlusIcon({ size = 24, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = "#666666" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Svg>
  );
}

export function StarIcon({ size = 20, color = "#ffffff", filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"}>
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </Svg>
  );
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
      <Rect x={3} y={11} width={18} height={11} rx={2} stroke={color} strokeWidth={1.5} />
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export function StarOutlineIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </Svg>
  );
}

export function PencilIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </Svg>
  );
}

export function TagIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <Path stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </Svg>
  );
}
