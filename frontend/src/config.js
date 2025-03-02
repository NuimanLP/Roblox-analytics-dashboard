const isProd = process.env.NODE_ENV === 'production'

const config = {
  isProd,
  serverUrlPrefix: isProd ? 'https://wd01.cloud-workshop.online/api' : 'http://localhost:1337/api',
  serverReceipt: isProd ? 'https://test-1097208339323.us-central1.run.app' : 'http://localhost:1337',
  windowlocateHome: isProd ? 'https://wd01.cloud-workshop.online' : 'http://localhost:3000',
}

export default config;
