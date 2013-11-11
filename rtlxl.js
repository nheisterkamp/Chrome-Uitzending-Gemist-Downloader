function buttonHook() {
  var btn = $('button.icon.download');
  btn.attr("title", "Download aflevering"), $(btn).tipsy({
    gravity: "n"
  });
}
