export type MethodNamingPolicy = (hubName: string) => string;

export const DefaultMethodNamingPolicy: MethodNamingPolicy =
  hubName => hubName.charAt(0).toUpperCase() + hubName.slice(1);
