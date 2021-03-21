import React from 'react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet as StyledComponentsServerStyleSheet } from 'styled-components'
import { ServerStyleSheets as MaterialServerStyleSheets } from '@material-ui/core'
import { RenderPageResult } from 'next/dist/next-server/lib/utils'

import theme from '../theme'

export default class MyDocument extends NextDocument {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta name="theme-color" content={theme.palette.primary.main} />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

MyDocument.getInitialProps = async ctx => {
  const styledComponentsSheet = new StyledComponentsServerStyleSheet()
  const materialUiSheets = new MaterialServerStyleSheets()
  const originalRenderPage = ctx.renderPage

  try {
    ctx.renderPage = (): RenderPageResult | Promise<RenderPageResult> =>
      originalRenderPage({
        enhanceApp: App => (
          props
        ): React.ReactElement<{
          sheet: StyledComponentsServerStyleSheet
        }> =>
          styledComponentsSheet.collectStyles(
            materialUiSheets.collect(<App {...props} />)
          ),
      })

    const initialProps = await NextDocument.getInitialProps(ctx)
    return {
      ...initialProps,
      styles: [
        <React.Fragment key="styles">
          {initialProps.styles}
          {styledComponentsSheet.getStyleElement()}
          {materialUiSheets.getStyleElement()}
        </React.Fragment>,
      ],
    }
  } finally {
    styledComponentsSheet.seal()
  }
}
