import * as LocalAuthentication from "expo-local-authentication";
import { getpreferences, setpreferences } from "./storage";

export type BiometricType = "fingerprint" | "face" | "iris" | "none";

export type BiometricStatus = {
  available: boolean;
  enrolled: boolean;
  type: BiometricType;
  enabled: boolean;
};

function maptype(types: LocalAuthentication.AuthenticationType[]): BiometricType {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "face";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "fingerprint";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return "iris";
  }
  return "none";
}

export async function getstatus(): Promise<BiometricStatus> {
  const [available, types, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  const prefs = await getpreferences();

  return {
    available,
    enrolled,
    type: maptype(types),
    enabled: prefs.biometric,
  };
}

export async function authenticate(reason?: string): Promise<boolean> {
  const status = await getstatus();

  if (!status.available || !status.enrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason || "authenticate to continue",
    cancelLabel: "cancel",
    disableDeviceFallback: false,
    fallbackLabel: "use passcode",
  });

  return result.success;
}

export async function enable(): Promise<boolean> {
  const status = await getstatus();

  if (!status.available || !status.enrolled) {
    return false;
  }

  const success = await authenticate("enable biometric authentication");
  if (!success) {
    return false;
  }

  await setpreferences({ biometric: true });
  return true;
}

export async function disable(): Promise<boolean> {
  await setpreferences({ biometric: false });
  return true;
}

export async function requirebiometric(): Promise<boolean> {
  const prefs = await getpreferences();

  if (!prefs.biometric) {
    return true;
  }

  return authenticate("unlock noro");
}

export async function issupported(): Promise<boolean> {
  const [available, enrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return available && enrolled;
}
