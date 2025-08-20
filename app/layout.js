import '../styles/index.css'
import React from 'react'
import { AccountProvider } from '../context'
import Layout from '../components/Layout'

export const metadata = {
  title: 'Abundance Protocol',
  description: 'Decentralized curation and tipping platform',
  other: {
    'fc:frame': '{"version":"next","imageUrl":"https://impact.abundance.id/images/icon-02.png","button":{"title":"Impact 2.0","action":{"type":"launch_frame","name":"Impact 2.0","url":"https://impact.abundance.id","splashImageUrl":"https://impact.abundance.id/images/icon.png","splashBackgroundColor":"#011222"}}}',
    'fc:miniapp': 'true',
    'fc:miniapp:name': 'Impact 2.0',
    'fc:miniapp:description': 'Get boosted and rewarded for your impact on Farcaster',
    'fc:miniapp:icon': 'https://impact.abundance.id/images/icon-02.png',
    'fc:miniapp:url': 'https://impact.abundance.id',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AccountProvider initialAccount={{ points: '$IMPACT', qdau: 0, impact: 0 }}>
          <Layout>
            {children}
          </Layout>
        </AccountProvider>
      </body>
    </html>
  )
}
