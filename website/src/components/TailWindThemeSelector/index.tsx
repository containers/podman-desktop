import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import { useEffect } from 'react';

const updadeTailwindDarkTheme = () => {
  const { colorMode } = useColorMode();
  useEffect(() => {
    const html = document.documentElement;
    if (colorMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, [colorMode]);
};

export const ThemeProvider = () => {
  updadeTailwindDarkTheme();
  return <div></div>;
};

export default function TailWindThemeSelector(): JSX.Element {
  updadeTailwindDarkTheme();
  return <div></div>;
}
