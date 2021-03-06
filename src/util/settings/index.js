const gbs = {
  host: 'http://lshao.cn',
  lockr_prefix: 'LAOSHIHAO_',
  cookie_prefix: 'LAOSHIHAO_',
  secret_key: '^#rwd6Ffz$X5alRN',
  domain: '.lshao.cn',
  secret: {
    key_str: 'om8q6fq#A0Yl@qJy',
    iv_str: '0#86gzOcsv1bXyIx'
  }
};
const cbs = {};

if (process.env.NODE_ENV === 'production') {
  gbs.domain = '.lshao.cn';
} else {
  gbs.domain = '.lshao.cn';
  // gbs.lockr_prefix += 'DEV_';
  // gbs.cookie_prefix += 'DEV_';
}

const enums = {
  USER: {
    LOGIN_NAME: 'LOGIN_NAME',
    MENU_LIST: 'MENU_LIST',
    AUTH_TOKEN: 'AUTH_TOKEN',
    REMEMBER_ME: 'REMEMBER_ME',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    REDIRECT_URI: 'REDIRECT_URI'
  },
  CART: {
    LOGIN_NAME: 'LOGIN_NAME',
    AUTH_TOKEN: 'AUTH_TOKEN',
    SHOPPING_CART: 'SHOPPING_CART'
  }
};

export {
  gbs,
  cbs,
  enums
};
