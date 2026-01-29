import {
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

export const springConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

export const springConfigSoft: WithSpringConfig = {
  damping: 25,
  stiffness: 200,
  mass: 1,
};

export const springConfigBouncy: WithSpringConfig = {
  damping: 12,
  stiffness: 400,
  mass: 0.6,
};

export const springConfigStiff: WithSpringConfig = {
  damping: 30,
  stiffness: 500,
  mass: 0.5,
};

export const timingConfig: WithTimingConfig = {
  duration: 200,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const timingConfigSlow: WithTimingConfig = {
  duration: 400,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const timingConfigFast: WithTimingConfig = {
  duration: 100,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
};

export const animate = {
  spring: (value: number, config = springConfig) => {
    "worklet";
    return withSpring(value, config);
  },

  timing: (value: number, config = timingConfig) => {
    "worklet";
    return withTiming(value, config);
  },

  delay: (delay: number, animation: number) => {
    "worklet";
    return withDelay(delay, animation);
  },

  sequence: (...animations: number[]) => {
    "worklet";
    return withSequence(...animations);
  },

  repeat: (animation: number, count = -1, reverse = true) => {
    "worklet";
    return withRepeat(animation, count, reverse);
  },

  fadeIn: (duration = 200) => {
    "worklet";
    return withTiming(1, { duration, easing: Easing.out(Easing.ease) });
  },

  fadeOut: (duration = 200) => {
    "worklet";
    return withTiming(0, { duration, easing: Easing.in(Easing.ease) });
  },

  scaleIn: (config = springConfig) => {
    "worklet";
    return withSpring(1, config);
  },

  scaleOut: (config = springConfig) => {
    "worklet";
    return withSpring(0, config);
  },

  slideInUp: (from = 50, config = springConfig) => {
    "worklet";
    return withSpring(0, config);
  },

  slideInDown: (from = -50, config = springConfig) => {
    "worklet";
    return withSpring(0, config);
  },

  pressIn: () => {
    "worklet";
    return withSpring(0.97, springConfigStiff);
  },

  pressOut: () => {
    "worklet";
    return withSpring(1, springConfig);
  },

  shake: () => {
    "worklet";
    return withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  },

  pulse: () => {
    "worklet";
    return withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  },

  breathe: () => {
    "worklet";
    return withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  },
} as const;

export const presets = {
  entering: {
    opacity: { from: 0, to: 1, duration: 200 },
    translateY: { from: 20, to: 0, duration: 250 },
  },
  exiting: {
    opacity: { from: 1, to: 0, duration: 150 },
    translateY: { from: 0, to: -10, duration: 150 },
  },
  modal: {
    entering: {
      opacity: { from: 0, to: 1, duration: 200 },
      scale: { from: 0.95, to: 1, spring: springConfig },
    },
    exiting: {
      opacity: { from: 1, to: 0, duration: 150 },
      scale: { from: 1, to: 0.95, duration: 150 },
    },
  },
  sheet: {
    entering: {
      translateY: { from: 300, to: 0, spring: springConfigSoft },
    },
    exiting: {
      translateY: { from: 0, to: 300, duration: 200 },
    },
  },
  list: {
    stagger: 50,
    entering: {
      opacity: { from: 0, to: 1, duration: 200 },
      translateX: { from: -20, to: 0, spring: springConfig },
    },
  },
} as const;
