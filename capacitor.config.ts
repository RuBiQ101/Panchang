import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.siddhidatri.panchang',
  appName: 'Siddhidatri',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
