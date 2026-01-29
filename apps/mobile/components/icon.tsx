import { View, type ViewStyle } from "react-native";
import { Svg, Path, Circle, Rect, Line } from "react-native-svg";

type IconName =
  | "chevronleft"
  | "chevronright"
  | "close"
  | "check"
  | "plus"
  | "search"
  | "settings"
  | "user"
  | "lock"
  | "eye"
  | "eyeoff"
  | "copy"
  | "trash"
  | "edit"
  | "share"
  | "folder"
  | "key"
  | "shield"
  | "bell"
  | "logout";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface IconProps {
  name: IconName;
  size?: Size;
  color?: string;
  style?: ViewStyle;
}

const sizes: Record<Size, number> = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
};

const paths: Record<IconName, (color: string) => JSX.Element> = {
  chevronleft: (c) => (
    <Path d="M15 18l-6-6 6-6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  chevronright: (c) => (
    <Path d="M9 18l6-6-6-6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  close: (c) => (
    <Path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  check: (c) => (
    <Path d="M20 6L9 17l-5-5" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  plus: (c) => (
    <Path d="M12 5v14M5 12h14" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  search: (c) => (
    <>
      <Circle cx="11" cy="11" r="8" stroke={c} strokeWidth={2} fill="none" />
      <Path d="M21 21l-4.35-4.35" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  ),
  settings: (c) => (
    <>
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={2} fill="none" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={c} strokeWidth={2} fill="none" />
    </>
  ),
  user: (c) => (
    <>
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="12" cy="7" r="4" stroke={c} strokeWidth={2} fill="none" />
    </>
  ),
  lock: (c) => (
    <>
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={c} strokeWidth={2} fill="none" />
      <Path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  eye: (c) => (
    <>
      <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c} strokeWidth={2} fill="none" />
      <Circle cx="12" cy="12" r="3" stroke={c} strokeWidth={2} fill="none" />
    </>
  ),
  eyeoff: (c) => (
    <>
      <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Line x1="1" y1="1" x2="23" y2="23" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  copy: (c) => (
    <>
      <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke={c} strokeWidth={2} fill="none" />
      <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  trash: (c) => (
    <>
      <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  edit: (c) => (
    <>
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  share: (c) => (
    <>
      <Circle cx="18" cy="5" r="3" stroke={c} strokeWidth={2} fill="none" />
      <Circle cx="6" cy="12" r="3" stroke={c} strokeWidth={2} fill="none" />
      <Circle cx="18" cy="19" r="3" stroke={c} strokeWidth={2} fill="none" />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={c} strokeWidth={2} />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={c} strokeWidth={2} />
    </>
  ),
  folder: (c) => (
    <Path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  key: (c) => (
    <>
      <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  shield: (c) => (
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  ),
  bell: (c) => (
    <>
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  logout: (c) => (
    <>
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
};

export function Icon({
  name,
  size = "md",
  color = "rgba(255,255,255,0.7)",
  style,
}: IconProps) {
  const dimension = sizes[size];

  return (
    <View style={style}>
      <Svg width={dimension} height={dimension} viewBox="0 0 24 24">
        {paths[name](color)}
      </Svg>
    </View>
  );
}
