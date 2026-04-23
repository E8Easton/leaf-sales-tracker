import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Leaf Sales Tracker</title>
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body, #root { height: 100%; background: #0D0D0D; }
            body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0D0D0D; }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
