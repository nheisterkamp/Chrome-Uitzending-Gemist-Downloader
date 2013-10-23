$(document).ready(function() {
    setTimeout(
        addMainEpisodeDownloadButton,
        100
    );
});

function addMainEpisodeDownloadButton() {
    var serieTitle = $('#meta-information .series').attr('title'),
        episodeTitle = $('#meta-information .episode').attr('title'),
        button = $('<div class="embed download"></div>'),
        img = $(button).append($(
            '<img alt="Download" src="'+
                chrome.extension.getURL('img/download.png')+'" />'
        )),
        link = $(button).append($(
            '<a href="" class="download_episode">Download</a>'
        ));

    link.click(function() {
        event.preventDefault();
        var serieTitle = $('#meta-information .series').attr('title'),
            episodeTitle = $('#meta-information .episode').attr('title'),
            episodeDate = extractDate(episodeTitle);

        if (episodeDate != null) {
            episodeDate = episodeDate.format("yyyy-MM-dd")+' - ';
        }

        getDownloadUrl(
            $('#episode-data').data('player-id'), function(videoUrl) {
                if (typeof videoUrl==='string') {
                    downloadEpisode(videoUrl, episodeDate+serieTitle);
                }
                else {
                    alert(
                        'Er is iets mis gegaan bij het verkrijgen van de'+
                        ' downloadlink naar de aflevering.'+
                        "\n"+
                        "\n"+
                        'Ververs de pagina en probeer het nogmaals.'
                    );
                }
            }
        );
    });

    $('#share-options').append(button);
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
        else {
            callback();
        }
    }

    function useToken(token) {
        $.ajax({
            url: 'http://ida.omroep.nl/odiplus/?prid='+episodeId+
                    '&puboptions=h264_std&adaptive=no&part=1&token='+token,
            error: callback,
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
        else {
            callback();
        }
    }

    function parseOdi(r, e) {
        if (typeof r.url!=='undefined') {
            callback(r.url);
        }
        else {
            callback();
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

        return Date.parseString(episodeName, "d NNN yyyy, H:mm");
    }
    catch (exception) {
        return null;
    }
}
