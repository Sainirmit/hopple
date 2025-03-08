"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.PropsWithChildren<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
