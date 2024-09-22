import vue from '@vitejs/plugin-vue'
import path from 'path'

export default {
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib/shared': path.resolve(__dirname, '../../shared')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}
