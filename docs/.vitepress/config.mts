import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "gcode-core-events",
  description: "Documentation for gcode-core-events",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/getting-started' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Quick Start', link: '/getting-started' }
        ]
      },
      {
        text: 'Architecture & Integrations',
        items: [
          { text: 'Backend Integration', link: '/backend-integration-strategy' },
          { text: 'Oracle ADB Schema', link: '/oracle-adb-schema-gap-prompt' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
