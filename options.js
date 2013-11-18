var Options = function(base) {
  var _base = base;

  return {
    get : function(key, cb) {
      chrome.extension.sendRequest({
        method: "OptionsGet",
        base: _base,
        key: key
      }, function(response) {
        if (typeof cb === 'function') {
          cb(response.data);
        }
      });
    },

    set : function(key, val, cb) {
      chrome.extension.sendRequest({
        method: "OptionsSet",
        base: _base,
        key: key,
        val: val
      }, function(response) {
        if (typeof cb === 'function') {
          cb(response.data);
        }
      });
    },

    getHTML5 : function(cb) {
      return this.get('HTML5', cb);
    },

    setHTML5 : function(val, cb) {
      return this.set('HTML5', val, cb);
    },

    getEnabled : function(cb) {
      return this.get('Enabled', cb);
    },

    setEnabled : function(val, cb) {
      return this.set('Enabled', val, cb);
    }
  }
}
