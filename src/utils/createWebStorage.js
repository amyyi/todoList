
// 如果瀏覽器不支援sessionStorage時, 用baseStorage替代
const baseStorage = (() => {

  let dataStorage = [];

  return {
    getItem: function(key) {
      return dataStorage[key];
    },
    setItem: function(key, value) {
      dataStorage[key] = value;
    },
    removeItem: function(key) {
      dataStorage[key] = null;
    },
    clear: function() {
      dataStorage = [];
    },
    key: function(pindex = 0) {

      let i = 0;
      let key = '';
      const index = +pindex;

      for (key in dataStorage) {

        if (i === index) {
          return key;
        }
        i += 1;
      }
      return null;
    },
    length: dataStorage.length
  };
})();

let storage = null;

const checkKey = (key) => {

  if (!key) {
    throw new ReferenceError('key值不得為空值');
  }

  if (typeof key === 'function' || typeof key === 'object') {
    throw new TypeError('key值請輸入字串');
  }
  return key ? key + '' : '';
};

const checkValue = (value) => {
  return value || '';
};

const checkExpire = (psecond) => {

  let second = parseInt(psecond, 10);

  if (isNaN(second) || second < 0) {
    second = 0; // 代表無限
  }
  second = Math.floor(second);

  return second;
};

/*
const clearExpireData = () => {

  let i = 0;
  const len = storage.length;
  const now = new Date().getTime();
  let expireDataCount = 0;

  for (i = 0; i < len; i += 1) {
    const data = storage[i];

    if (data && data.expireTime < now && data.expireTime > 0) {
      storage.removeItem(i);
      expireDataCount += 1;
    }
  }

  if (!expireDataCount) {
    return false;
  }
  return true;
};
*/

export default function createWebStorage() {

  storage = window.localStorage || baseStorage;

  return {

    // obj如果func要用this互相取得，不可用fat arrow, babel會解析成undefined@@
    set: function(pkey, pvalue, pexpire) {

      // 每次set資料前, 先把過期的資料刪光光
      //clearExpireData();

      const value = checkValue(pvalue);
      const expire = checkExpire(pexpire);
      const updateTime = new Date().getTime();
      const expireTime = (expire === 0) ? 0 : updateTime + expire * 1000;

      let key = checkKey(pkey);
      let data = {
        key: key,
        data: value,
        expire: expire,
        updateTime: updateTime,
        expireTime: expireTime
      };

      const clearAllNoExpireData = ((that) => {

        return () => {

          let i = 0;
          const len = storage.length;

          for (; i < len; i += 1) {
            key = storage.key(i);

            if (that.get(key).expireTime === 0) {
              that.remove(key);
            }
          }
        };
      })(this);

      data = JSON.stringify(data);

      /*
        如果sessionStorage滿了, 就將expire為永久的項目清除,
        如果永久的也沒了, 就直接將data拋出不寫入sessionStorage中
      */
      try {
        storage.setItem(key, data);
      } catch (e) {

        if (clearAllNoExpireData()) {
          storage.setItem(key, data);
        }
        return data;
      }
      return data;
    },
    get: function(pkey) {
      const key = checkKey(pkey);
      const now = new Date().getTime();
      let data = storage.getItem(key) || null;

      if (data) {
        data = JSON.parse(data);
      }

      if (data && data.expireTime < now && data.expireTime > 0) {
        this.remove(key);
        data = null;
      }
      return data;
    },
    remove: function(pkey) {

      const key = checkKey(pkey);
      storage.removeItem(key);

      let result = false;

      if (!storage[key]) {
        result = true;
      }
      return result;
    },
    clearAll: function() {
      storage.clear();
      return true;
    }
  };
}
