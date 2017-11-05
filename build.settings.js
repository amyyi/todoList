const webpack = require('webpack');
const os = require('os');

const ENV = process.env.ENV || 'local';

const getHostIp = () => {
  const interfaces = os.networkInterfaces();

  return Object.keys(interfaces).reduce((prev, interfaceName) => {
    return interfaces[interfaceName].reduce((prev2, data) => {
      if (data.family === 'IPv4' && !data.internal) {
        return data.address;
      }
      return prev2;
    }, '');
  }, '');
};


const hostIP = getHostIp() || 'localhost';

const defaultDomain = {
  __TIMESTAMP__: new Date().getTime(),
  __ENV__: ENV,
  __DEVELOPMENT__: false,
  __SERVER_URL__: 'http://test.xxx.com',
  __LOCAL_DEFAULT_PORT__: 3000,
  __MOCK_API_HOST__: 'http://localhost',
  __MOCK_API_PORT__: 3030,
  __MOCK_SOCKET_PORT__: 3060,
  __MOCK_API_IS_USE__: true,
  __MOCK_SOCKET_IS_USE__: false,
};

const config = {
  local: {
    webpack: './webpack/config.local.js',
    domain: Object.assign({}, defaultDomain, {
      __DEVELOPMENT__: true
      // __MOCK_API_IS_USE__: true,
      // __MOCK_SOCKET_IS_USE__: true,
    }),
  },
  dev: {
    webpack: './webpack/config.dev.js',
    domain: Object.assign({}, defaultDomain, {
      __DEVELOPMENT__: true,

    }),
  },
};

function getEnvConfig() {
  if (ENV && config[ENV]) {
    return config[ENV];
  }
  return config.local;
}

const build = {
  defineJsConstants() {
    const constants = config[ENV].domain;

    Object.keys(constants).forEach((key) => {
      constants[key] = JSON.stringify(constants[key]);
    });

    return new webpack.DefinePlugin(constants);
  },
  getWebpackConfig() {
    return getEnvConfig().webpack;
  },
  getDomainConfig() {
    return getEnvConfig().domain;
  },
  getHostIP() {
    return hostIP;
  },
};

module.exports = build;
