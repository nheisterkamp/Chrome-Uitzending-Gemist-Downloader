var o = Options("rtlxl")

o.getEnabled(function(val) {
  if (val === false) {
    return;
  }

  injectStylesheet("content.css");
  injectScript("rtlxl.js");

  function domLoaded() {
    if ($('button.icon.download').length > 0) {
      return;
    }

    var btn = $('<button '+
                ' class="icon download">'),
        icn = $('<div '+
                'style="background: url(\''+
                  chrome.extension.getURL('img/download-2.png')+
                '\') no-repeat center;"></button>');

    btn.click(function() {
      getDownloadUrl(getEpisodeId(), function(url) {
        if (typeof url === 'undefined' || !url) {
          alert("Er is iets fout gegaan. Ververs de pagina en probeer opnieuw");
        }
        else {
          downloadEpisode(url, getEpisodeName());
        }
      });
    });

    icn.appendTo(btn);
    $('.video-meta > .actions > .icons').append(btn);
    injectScriptContent("buttonHook()");

    o.getHTML5(function(val) {
      if (val === false) {
        return;
      }

      wrappertId = 'video-container';
      wrappert = $('#'+wrappertId);

      getDownloadUrl(getEpisodeId(), function(videoUrl) {
        newPlayerOnTheBlock =
        $('<video id="player" controls autoplay>'
          + '  <source src="'+videoUrl+'" type="video/mp4">'
          + '</video>');
        wrappert.replaceWith(newPlayerOnTheBlock);
      });
    });
  }

  function getEpisodeId() {
    var e = $('#content > .content-wrapper > .video-content > div');
    return e.attr('data-uuid');
  }

  function getEpisodeName() {
    var name  = $('.video-title > h1').text(),
        title = $('.video-title > h2').text();

    return name+' - '+title;
  }

  function downloadEpisode(videoUrl, videoName) {
    chrome.extension.sendRequest({
      action: "forceDownload",
      url: videoUrl,
      filename: videoName+'.mp4'
    }, function() {
      window.location = videoUrl;
    });
  }

  function getDownloadUrl(episodeId, callback) {
    $.ajax({
      url: "http://www.rtl.nl/system/s4m/vfd/uuid="+
            episodeId+"/d=pc/fmt=progressive/",
      error: callback,
      success: function(r, e) {
        if (typeof r === 'undefined' ||
            typeof r.material === 'undefined' ||
            r.material.length === 0 ||
            typeof r.material[0].videolink === 'undefined') {

          callback();
        }

        var url = r.material[0].videolink;
        url = url.replace(/\/pc\//, '/rtlxl/network/a3t/');
        callback(url);
      }
    });
  }

  $(document).ready(domLoaded);
  setInterval(domLoaded, 5000); //check download button every 5 seconds
});
