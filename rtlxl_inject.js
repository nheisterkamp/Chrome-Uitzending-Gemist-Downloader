var o = Options("rtlxl");

o.getEnabled(function(val) {
  if (val === false) {
    return;
  }

  function domLoaded() {
    if ($('.icon.download').length > 0) {
      return;
    }
    
    var episodeId = getEpisodeId();
    
    if(!episodeId) {
	    return;
    }

    getDownloadUrl(episodeId, function(videoUrl) {
      if (!videoUrl) {
        return;
      }

      var btn = $('<a'+
                  ' href="'+videoUrl+'"'+
                  ' download="'+getVideoTitle()+'.mp4"'+
                  ' title="Download aflevering: '+getVideoTitle()+'.mp4"'+
                  ' class="icon download all-link">'),
          icn = $('<div '+
                  'style="background: url(\''+
                    chrome.extension.getURL('img/download-2.png')+
                  '\') no-repeat center;">');

      icn.appendTo(btn);
      $('.video-actions').append(btn);
      injectStylesheet("content.css");
      injectScript("rtlxl.js");

      o.getHTML5(function(val) {
        if (val === false) {
          return;
        }

        wrappertId = 'video-container';
        wrappert = $('#'+wrappertId);

        newPlayerOnTheBlock =
        $('<video id="player" style="width: 100%;" controls autoplay>'
          + '  <source src="'+videoUrl+'" type="video/mp4">'
          + '</video>');
        wrappert.replaceWith(newPlayerOnTheBlock);
      });
    });
  }

  function getVideoTitle() {
    var program = $('.video-title > h1').text(),
        episode = $('.video-title > h2').text();
        date  = $('meta[property="video:release_date"]').attr("content").trim();

    var title = [program, episode].join(' - ');

    if (date) {
      var d = date.split(" ");
      var pDate = new Date(Date.parse(d[0]));

      if (pDate) {
        title = pDate.format("yyyy-MM-dd")+' - '+title;
      }
    }

    return title;
  }

  function getEpisodeId() {
    var e = $('#content > .content-wrapper > .video-content > div');
    return e.attr('data-uuid');
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

        if (r.material.length > 0) {
          var url = r.material[0].videolink;
          url = url.replace(/\/pc\//, '/rtlxl/network/a3t/');
          callback(url);
        }
        else {
          return callback();
        }
      }
    });
  }

  $(document).ready(domLoaded);
  setInterval(domLoaded, 1000); //check download button every second
});
