import { useEffect, useState } from 'react';

/** 监听 html 上的 .dark 类（admin 的暗色方案挂在 documentElement），供官方 mermaid 选主题用 */
export function useDarkMode(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document === 'undefined' ? false : document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
