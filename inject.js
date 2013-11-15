function injectScript(l) {
  s = document.createElement("script");
  s.src = chrome.extension.getURL(l);
  document.getElementsByTagName("head")[0].appendChild(s);
}

function injectScriptContent(l) {
  var s = document.createElement('script');
  s.appendChild(document.createTextNode('('+ l +')();'));
  document.head.appendChild(s);
}

function injectStylesheet(l) {
  s = document.createElement("link");
  s.rel = 'stylesheet';
  s.href = chrome.extension.getURL(l);
  document.getElementsByTagName("head")[0].appendChild(s);
}
