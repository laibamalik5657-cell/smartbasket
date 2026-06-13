declare module "*app/*/page.js" {
  import type { ComponentType } from "react";
  const Component: ComponentType<unknown> | { default: ComponentType<unknown> };
  export default Component;
}

declare module "*app/*/page.tsx" {
  import type { ComponentType } from "react";
  const Component: ComponentType<unknown> | { default: ComponentType<unknown> };
  export default Component;
}

declare module "*page.js" {
  import type { ComponentType } from "react";
  const Component: ComponentType<unknown> | { default: ComponentType<unknown> };
  export default Component;
}

declare module "*page.tsx" {
  import type { ComponentType } from "react";
  const Component: ComponentType<unknown> | { default: ComponentType<unknown> };
  export default Component;
}
