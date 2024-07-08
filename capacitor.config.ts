import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yiies.callkit.test',
  appName: 'angular-web-rtc-test',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
