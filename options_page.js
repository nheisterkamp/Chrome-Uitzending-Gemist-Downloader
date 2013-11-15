var el  = function(id) { return document.getElementById(id); };
var chk = function(id) { return el(id).checked; };

var OptionsPage = function() {
  return {
    showStatus : function(val) {
      var status = document.getElementById("status");
      status.innerHTML = val;

      setTimeout(function() {
        status.innerHTML = "";
      }, 2500);
    },

    saveOptions : function() {
      Options('ug').setEnabled(chk('ug_enabled'));
      Options('ug').setHTML5(chk('ug_html5'));
      Options('rtlxl').setEnabled(chk('rtlxl_enabled'));
      Options('rtlxl').setHTML5(chk('rtlxl_html5'));

      this.showStatus("Opties opgeslagen");
    },

    restoreOptions : function() {
      Options('ug').getEnabled(function(b) {
        el('ug_enabled').checked = b;
      });
      Options('ug').getHTML5(function(b) {
        el('ug_html5').checked = b;
      });
      Options('rtlxl').getEnabled(function(b) {
        el('rtlxl_enabled').checked = b;
      });
      Options('rtlxl').getHTML5(function(b) {
        el('rtlxl_html5').checked = b;
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var op = new OptionsPage();
  document.querySelector('#save').onclick = function() {
    op.saveOptions();
  };
  op.restoreOptions();
});
