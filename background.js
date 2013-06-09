chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	if(request.action == 'forceDownload' && sender.tab) {
		var filters = {
			urls: ['*://*.omroep.nl/*', '*://*.uitzendinggemist.nl/*'],
			tabId: sender.tab.id,
			windowId: sender.tab.windowId
		};
		
		var fileUrl = request.url;
		
		chrome.webRequest.onBeforeRequest.addListener(function(details) {
			modifyHeadersToForceDownload(sender.tab.windowId, sender.tab.id, details.requestId, request.filename);
		}, {urls: [fileUrl], tabId: sender.tab.id, windowId: sender.tab.windowId});
		
		sendResponse();
	}
});

function modifyHeadersToForceDownload(windowId, tabId, requestId, filename) {
	chrome.webRequest.onHeadersReceived.addListener(function(details) {
		if(details.requestId == requestId) {
			
			if(details.statusLine && details.statusLine.toString().indexOf('200') != -1)
			{
				var newHeaders = details.responseHeaders;
				newHeaders[newHeaders.length] = {
					name: "Content-Disposition",
					value: "attachment; filename=\""+filename+"\""};
				return {responseHeaders: newHeaders};
			}
			else
				return {responseHeaders: details.responseHeaders};
		}
	}, {urls: ['*://*.omroep.nl/*', '*://*.uitzendinggemist.nl/*'], tabId: tabId, windowId: windowId},
	['responseHeaders', 'blocking']);
}