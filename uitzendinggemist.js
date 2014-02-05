var o = Options('ug');
var currentEpisodeId;

o.getEnabled(function(val) {
  if (val === false) {
    return;
  }

  $(document).ready(function() {
    setTimeout(addMainEpisodeDownloadButton, 100);
    setInterval(addMainEpisodeDownloadButton, 5000);
  });
});

function addMainEpisodeDownloadButton() {
  var episodeId = getEpisodeId();
  if(episodeId == currentEpisodeId) { // Don't do anyting if nothing has changed
	  return;
  }
  
  $(".download_episode").parent().remove();
  
  if(!episodeId) {
	  return;
  }
  
  currentEpisodeId = episodeId;
  getDownloadUrl(episodeId, function(videoUrl) {
  	var videoFile = getEpisodeTitle();
    var button  = $('<div class="embed download block"></div>'),
        link    = $(button).append($(
                    '<a href="'+videoUrl+'"'+
                    ' class="download_episode"'+
                    ' title="'+videoFile+'.mp4"'+
                    ' download="'+videoFile+'.mp4">'+
                      'Download'+
                    '</a>'
                  ));

    var so = $('#share-options');
    if (so.length > 0) {
      $(button).prepend($('<i class="npo-icon-"><img alt="Download" src="'+
        chrome.extension.getURL('img/download.png')+'"></i>'
      ));
      so = $('#share-options');
    }
    else {
      so = $('.span-sidebar > .metadata > div > div:first-child');
      if (so.length > 0) {
        $(button).prepend($('<i class="npo-icon-jump-box"></i>'));
        so = $('.span-sidebar > .metadata > div > div:first-child');
      }
    }
    so.append(button);

    o.getHTML5(function(val) {
      if (val == false) {
        return;
      }

      wrappert = $('#player_npoplayer_wrapper');
      if (wrappert.length === 0) {
        wrappert = $('.video-player-container');
      }
      if(wrappert.length === 0) {
	      wrappert = $("#player");
      }

      newPlayerOnTheBlock =
      $ ( '<video id="player" style="width: 100%;" controls autoplay>'
        + '  <source src="'+videoUrl+'" type="video/mp4">'
        + '</video>'
        );

      wrappert.replaceWith(newPlayerOnTheBlock);
      
      // Mark current episode, this won't work anymore when using HTML5 because it depends on a jwplayer event
      var oldListItem = $("#episodes li.episode.nowplaying");
      oldListItem.removeClass("nowplaying");
      oldListItem.find(".image > a.episode-image > div.now-playing").remove();
      
      var localId = getLocalId();
      if(!localId) {
	      return;
      }
      
      var listItem = $("#episode_" + localId);
      listItem.addClass("nowplaying");
      listItem.find(".image > a.episode-image").prepend("<div class='now-playing'></div>")
    });
  });
}

function getEpisodeTitle() {
  var serieTitle    = $('#meta-information .series').attr('title'),
      episodeTitle  = $('#meta-information .episode').attr('title'),
      infoDate      = $('table.information'+
                        ' > tbody'+
                        ' > tr:nth-child(2)'+
                        ' > td:first-child'
                      ).text();

  if (!serieTitle || !episodeTitle) {
    var a = $('.share-modal.modal.hide.fade > div > h2').text(),
        s = a.split(': ');

    if (s.length > 1) {
      serieTitle = s[0];
      episodeTitle = s[1];
    }
    else if (a) {
      episodeTitle = a;
      serieTitle = a;
    }
    infoDate = $( '.span-sidebar'+
                  ' > .metadata'+
                  ' > div'+
                  ' > div:first-child'+
                  ' > div:first-child'
                ).text().trim().toLowerCase();
  }

  var episodeDate = extractDate(infoDate || episodeTitle);

  if (episodeDate != null) {
    episodeDate = episodeDate.format("yyyy-MM-dd")+' - ';
  }
  if (!episodeDate) {
    episodeDate = '';
  }

  return videoFile = episodeDate+serieTitle+' - '+episodeTitle;
}

function getEpisodeId() {
  return $('#episode-data').data('player-id') ||
         $('.share-modal.modal.hide.fade').data('mid');
}

function getLocalId() {
	return $('#episode-data').data("local-id");
}

function getDownloadUrl(episodeId, callback) {
  function parseToken(r, e) {
    var t = r.responseText,
    m = new RegExp('token = "(.*)";', 'g'),
    s = m.exec(t);

    if (s && s.length>1) {
      var token = s[1];
      if (token) {
        useToken(token);
      }
    }
  }

  function useToken(token) {
    $.ajax({
      url: 'http://ida.omroep.nl/odi/?prid='+episodeId+
           '&puboptions=h264_bb,h264_std,h264_sb&adaptive=no&part=1&token='+
           token,
      success: parseIda
    });
  }

  function parseIda(r, e) {
    var s = r.streams;

    if (s.length>0) {
      var stream = s[0],
      streamJson = stream.replace(/jsonp/g, 'json');

      $.ajax({
        url: streamJson,
        success: parseOdi
      });
    }
  }

  function parseOdi(r, e) {
    if (typeof r.url!=='undefined') {
      callback(r.url);
    }
  }

  $.ajax({
    url: 'http://ida.omroep.nl/npoplayer/i.js',
    cache: false,
    complete: parseToken
  });
}

function downloadEpisode(videoUrl, videoName) {
  var videoName = videoName.replace(',', '')
  .replace(':', '')
  .replace('?', '');

  videoName = encodeURIComponent(videoName).replace('%3A', '');
  chrome.extension.sendRequest({
    action: "forceDownload",
    url: videoUrl,
    filename: videoName+'.mp4'
  }, function() {
    window.location = videoUrl;
  });
}

function extractDate(episodeName) {
  try {
    var episodeName = episodeName.toLowerCase();
    var remove = ["ma", "di", "wo", "do", "vr", "za", "zo"];
    var dutchMonthAbbreviations = [
    "jan", "feb", "maa",
    "apr", "mei", "jun",
    "jul", "aug", "sep",
    "okt", "nov", "dec"
    ];

    for (var i = 0; i < remove.length; i++) {
      episodeName = episodeName.replace(remove[i], "");
    }

    for (var i = 0; i < dutchMonthAbbreviations.length; i++) {
      episodeName = episodeName.replace(
        dutchMonthAbbreviations[i],
        Date.monthAbbreviations[i]
        );
    }

    episodeName = $.trim(episodeName);

    return  Date.parseString(episodeName, "d NNN yyyy, H:mm") ||
            Date.parseString(episodeName, "d NNN yyyy H:mm");
  }
  catch (exception) {
    return null;
  }
}
