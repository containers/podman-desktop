import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import React, { useEffect } from 'react';

function TailWindThemeSelector(): JSX.Element {
  function updadeTailwindDarkTheme(): void {
    if (!document?.documentElement) {
      return;
    }

    const html = document.documentElement;

    if (html.dataset?.theme === 'dark') {
      html.classList.add('dark');
      setTimeout(() => {
        html.classList.add('dark');
      }, 100);
    } else {
      html.classList.remove('dark');
      setTimeout(() => {
        html.classList.remove('dark');
      }, 100);
    }
  }
  useEffect(() => {
    if (ExecutionEnvironment.canUseDOM) {
      updadeTailwindDarkTheme();
    }
  }, [ExecutionEnvironment.canUseDOM]);

  // monitor the attribute managed by docusaurus
  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) {
      return;
    }
    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-rh' || mutation.attributeName === 'data-theme')
        ) {
          updadeTailwindDarkTheme();
        }
      });
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      childList: false,
      subtree: false,
    });
    return () => {
      mutationObserver.disconnect();
    };
  }, [ExecutionEnvironment.canUseDOM]);

  return <div></div>;
}

export default TailWindThemeSelector;
