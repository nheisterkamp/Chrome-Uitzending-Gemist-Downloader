var mainEpisodeId = null;
setInterval(function(){
	checkMainEpisodeDownload();
	checkEpisodeListDownloads();
}, 300);

// !Download buttons
$('.download_episode').live('click', function(event) {
	event.preventDefault();
	var videoUrl = $(this).data('video-url');
	var videoSerie = $(this).data('video-serie');
	var videoEpisode = $(this).data('video-episode');
	var episodeDate = extractDate(videoEpisode);

	if (episodeDate != null) {
	    videoEpisode = episodeDate.format("yyyy-MM-dd HH:mm");
	}

	downloadEpisode(videoUrl, videoSerie + ' - ' + videoEpisode);
});

// !Main video
function checkMainEpisodeDownload() {
	if($('#episode-page').length == 0)
		return;
	
	var currentEpisodeId = $('#episode-data').data('episode-id');
	var isActive = $('#episode-data').data('is-active');
	
	if(isActive && currentEpisodeId != mainEpisodeId) {
		mainEpisodeId = currentEpisodeId;
		
		// Remove previous button
		$('#share-options .embed.download').remove();
		
		getDownloadUrl(currentEpisodeId, function(videoUrl) {
			if(typeof videoUrl === 'string')
			{
				var serieTitle = $('#meta-information .series').attr('title');
				var episodeTitle = $('#meta-information .episode').attr('title');
				
				$('#share-options').append('<div class="embed download"><img alt="Download" src="'+chrome.extension.getURL('img/download.png')+'" /><a href="#" data-video-url="'+videoUrl+'" data-video-serie="'+serieTitle+'" data-video-episode="'+episodeTitle+'" class="download_episode">Download</a></div>');
				
				$('.share-images').css({
					marginTop:	'10px',
					marginLeft:	'0px'
				})
				.find('img').first().css('margin-left', '0px');
			}
		});
	}
}

// !Episode list
function checkEpisodeListDownloads() {
	$('ul.episodes li.active').not('.download-checked').each(function() {
		var element = $(this);
		var episodeId = element.data('remote-id');
		var serieTitle = $('#meta-information .series').attr('title');
		
		if(typeof serieTitle != 'string')
			serieTitle = $('#series-page .blackbox .left h2 a').first().text();
		
		element.addClass('download-checked');
		
		getDownloadUrl(episodeId, function(videoUrl) {
			if(typeof videoUrl === 'string')
			{
				// Get episode title
				var titleElement = element.find('.description a.knav_link').clone();
				titleElement.find('img, span').remove();
				var episodeTitle = $.trim(titleElement.text());
				
				// Create button
				var downloadButton = $('<img>').attr({
					 class:					'download_episode',
					 alt:					'Download',
					 title:					'Download deze aflevering',
					 src:					chrome.extension.getURL('img/download-black.png'),
					 'data-video-url':		videoUrl,
					 'data-video-serie':	serieTitle,
					 'data-video-episode':	episodeTitle
				});
				
				element.find('.description h3').first().after(downloadButton);
			}
		});
	});
}

// !Functions
function getDownloadUrl(episodeId, callback) {
	$.ajax({
		url: '/player/'+episodeId,
		cache: false,
		dataType: 'text'
	})
	.success(function(response) {
		var videoUrl = null;
		var video = $(response).filter('#video_object');
		if(video.length > 0) {
			video[0].pause();
			videoUrl = video.find('source')[0].src;
			video.remove();
		}
		
		if(typeof callback === 'function')
			callback(videoUrl);
	})
	.fail(function() {
		if(typeof callback === 'function')
			callback(null);
	});
}

function downloadEpisode(videoUrl, videoName) {
	var videoName = videoName.replace(',', '').replace(':', '').replace('?', '');
	videoName = encodeURIComponent(videoName).replace('%3A', '');
	chrome.extension.sendRequest({
			action: "forceDownload",
			url: videoUrl,
			filename: videoName + '.mp4'
		}, function() {
			window.location = videoUrl;
	});
}

function extractDate(episodeName) {
    try {
        var episodeName = episodeName.toLowerCase();
        var remove = ["ma", "di", "wo", "do", "vr", "za", "zo"];
        var dutchMonthAbbreviations = ["jan", "feb", "maa", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

        for (var i = 0; i < remove.length; i++) {
            episodeName = episodeName.replace(remove[i], "");
        }

        for (var i = 0; i < dutchMonthAbbreviations.length; i++) {
            episodeName = episodeName.replace(dutchMonthAbbreviations[i], Date.monthAbbreviations[i]);
        }

        episodeName = $.trim(episodeName);

        return Date.parseString(episodeName, "d NNN yyyy, H:mm");
    }
    catch (exception) {
        return null;
    }
}