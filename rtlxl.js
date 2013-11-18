function buttonHook() {
  var btn = $('.icon.download');
  if (btn) {
    btn.attr("title", btn.attr("title")), $(btn).tipsy({
      gravity: "n"
    });
  }
}
buttonHook();
