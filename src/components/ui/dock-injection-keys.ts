import type { ComputedRef, InjectionKey, Ref } from "vue";
import type { DataOrientation } from "./dock-types";

export const MOUSE_X_INJECTION_KEY = Symbol("mouse-x") as InjectionKey<Ref<number>>;
export const MOUSE_Y_INJECTION_KEY = Symbol("mouse-y") as InjectionKey<Ref<number>>;

export const MAGNIFICATION_INJECTION_KEY = Symbol("magnification") as InjectionKey<
  ComputedRef<number>
>;

export const DISTANCE_INJECTION_KEY = Symbol("distance") as InjectionKey<ComputedRef<number>>;
export const ICON_SIZE_INJECTION_KEY = Symbol("icon-size") as InjectionKey<ComputedRef<number>>;

export const ORIENTATION_INJECTION_KEY = Symbol("orientation") as InjectionKey<DataOrientation>;
