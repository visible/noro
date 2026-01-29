import { forwardRef, type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

type Variant = "default" | "bordered" | "elevated";

interface CardProps extends Omit<ViewProps, "style"> {
  variant?: Variant;
  children: ReactNode;
  style?: ViewStyle;
  animated?: boolean;
}

const variants: Record<Variant, ViewStyle> = {
  default: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bordered: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  elevated: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Card = forwardRef<View, CardProps>(
  ({ variant = "default", children, style, animated = false, ...props }, ref) => {
    if (animated) {
      return (
        <Animated.View
          ref={ref}
          entering={FadeIn.duration(300)}
          style={[{ borderRadius: 16, padding: 16 }, variants[variant], style]}
          {...props}
        >
          {children}
        </Animated.View>
      );
    }

    return (
      <View
        ref={ref}
        style={[{ borderRadius: 16, padding: 16 }, variants[variant], style]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends Omit<ViewProps, "style"> {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardHeader = forwardRef<View, CardHeaderProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[{ marginBottom: 12 }, style]}
      {...props}
    >
      {children}
    </View>
  )
);

CardHeader.displayName = "CardHeader";

interface CardTitleProps extends Omit<ViewProps, "style"> {
  children: string;
  style?: ViewStyle;
}

export const CardTitle = forwardRef<View, CardTitleProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} {...props}>
      <Animated.Text
        style={[
          {
            fontSize: 17,
            fontWeight: "600",
            color: "#ffffff",
            letterSpacing: -0.2,
          },
          style,
        ]}
      >
        {children}
      </Animated.Text>
    </View>
  )
);

CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends Omit<ViewProps, "style"> {
  children: string;
  style?: ViewStyle;
}

export const CardDescription = forwardRef<View, CardDescriptionProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} {...props}>
      <Animated.Text
        style={[
          {
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            marginTop: 4,
            lineHeight: 20,
          },
          style,
        ]}
      >
        {children}
      </Animated.Text>
    </View>
  )
);

CardDescription.displayName = "CardDescription";

interface CardContentProps extends Omit<ViewProps, "style"> {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardContent = forwardRef<View, CardContentProps>(
  ({ children, style, ...props }, ref) => (
    <View ref={ref} style={style} {...props}>
      {children}
    </View>
  )
);

CardContent.displayName = "CardContent";

interface CardFooterProps extends Omit<ViewProps, "style"> {
  children: ReactNode;
  style?: ViewStyle;
}

export const CardFooter = forwardRef<View, CardFooterProps>(
  ({ children, style, ...props }, ref) => (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
);

CardFooter.displayName = "CardFooter";
