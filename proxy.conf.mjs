const apiUrl = process.env['MENU_API_URL'] ?? 'https://localhost:58709';

export default {
  '/api': {
    target: apiUrl,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
};
