// app/lib/linking.ts
// Central Expo Router linking config for deep links

export const linking = {
  prefixes: ['slumber://'],
  config: {
    screens: {
      '(auth)': {
        screens: {
          forgot: 'forgot',
          reset: 'reset',
        },
      },
      // ...other routes
    },
  },
};
