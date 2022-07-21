import React from 'react';
import { useEffect } from 'react';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

function TailWindThemeSelector(): JSX.Element {
  function updadeTailwindDarkTheme() {
    if (!document || !document.documentElement) {
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
        if (mutation.attributeName === 'data-rh' && mutation.type == 'attributes') {
          updadeTailwindDarkTheme();
        } else if (mutation.attributeName === 'data-theme' && mutation.type == 'attributes') {
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
