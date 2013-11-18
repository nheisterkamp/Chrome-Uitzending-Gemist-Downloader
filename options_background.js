var OptionsBackground = function(base) {
  var _base = base;

  return {
    get : function(key, def) {
      var val = def;

      if (typeof localStorage[_base+'_'+key] !== 'undefined') {
        val = localStorage[_base+'_'+key];
      }

      return val;
    },

    getBool : function(key, def) {
      var val = this.get(key, def);
      if (val === true || val === 1 || val+'' === 'true') {
        return true;
      }

      return false;
    },

    set : function(key, val) {
      return localStorage[_base+'_'+key] = val;
    },

    getHTML5 : function() {
      return this.getBool('html5', false);
    },

    setHTML5 : function(val) {
      return this.set('html5', val);
    },

    getEnabled : function() {
      return this.getBool('enabled', true);
    },

    setEnabled : function(val) {
      return this.set('enabled', val);
    }
  }
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.method == "OptionsGet") {
    sendResponse({
      data: OptionsBackground(request.base)['get'+request.key]()
    });
  }
  else if (request.method == "OptionsSet") {
    sendResponse({
      data: OptionsBackground(request.base)['set'+request.key](request.val)
    });
  }
  else {
    sendResponse({});
  }
});
