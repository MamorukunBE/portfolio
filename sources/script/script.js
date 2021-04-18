var randgrid;
window.addEventListener('load', function() {
	randgrid = RandGrid('#pf_grid', { linesNbr: 4, columnsNbr: 5, autoinvert: true, wideitems: 3, highitems: 2, resizer: resizeImages, spacing: 7 });
	resizeImages();
	randomDefaultImages();
	randgrid.querySelectorAll('._rg-item').forEach(function(elem) {
		let content = elem.querySelector('.itemcontent');
		if (content != null) {
			content.addEventListener('mouseenter', function(event) {
				// Limit the container translation so it doesn't get out of the screen
				//--------------------------------------------------------------------
				let contentImg = content.querySelector('img');
				//-----
				let borderDeltaWidth = Math.floor((contentImg.offsetWidth - content.offsetWidth) / 2);
				let borderDeltaHeight = Math.floor((contentImg.offsetHeight - content.offsetHeight) / 2);
				//-----
				var imgRect = content.getBoundingClientRect();
				let computedRect = {
					top: imgRect.top - borderDeltaHeight,
					right: imgRect.right + borderDeltaWidth,
					bottom: imgRect.bottom + borderDeltaHeight,
					left: imgRect.left - borderDeltaWidth,
				};
				//-----
				if (computedRect.left < 0)
					borderDeltaWidth += computedRect.left;
				else if (computedRect.right >= window.innerWidth)
					borderDeltaWidth += (computedRect.right - window.innerWidth) + 1;		// Why that damn +1 ??? Because of the shadow perhaps ?
				if (computedRect.top < 0)
					borderDeltaHeight += computedRect.top;
				else if (computedRect.bottom >= window.innerHeight)
					borderDeltaHeight += (computedRect.bottom - window.innerHeight);

				// Inflate the container
				//----------------------
				content.style.width = Math.min(contentImg.offsetWidth, window.innerWidth) + "px";
				content.style.height = Math.min(contentImg.offsetHeight, window.innerHeight) + "px";
				content.style.transform = `translate(-${borderDeltaWidth}px, -${borderDeltaHeight}px)`;
				content.parentNode.style.zIndex = 20;
				content.dataset.inflating = true;
			});
			content.addEventListener('mouseleave', function(event) {
				content.style.width = content.style.height = content.style.transform = null;
				content.querySelector('a').style.pointerEvents = null;
				content.parentNode.style.zIndex = 15;
				content.dataset.inflating = false;
			});
			content.addEventListener('transitionend', function (event) { InflationDone(event, content); })
		}
	});
});
function InflationDone(event, item) {
	if (event.propertyName == 'transform') {
		if (item.dataset.inflating == "true") {
			item.querySelector('a').style.pointerEvents = 'auto';
		} else {
			item.parentNode.style.zIndex = null;
		}
	}
}
function resizeImages() {
	randgrid.querySelectorAll('.itemcontent').forEach(function(content) {
		let img = content.querySelector('img');
		let imgRatio = img.offsetWidth / img.offsetHeight;
		let boxRatio = content.offsetWidth / content.offsetHeight;
		img.style.width = img.style.height = 'auto';
		if (imgRatio < boxRatio)
			img.style.width = content.offsetWidth * 1.2 + "px";
		else
			img.style.height = content.offsetHeight * 1.2 + "px";
	});
}
function randomDefaultImages() {
	let defaultImagesElems = randgrid.querySelectorAll('.defaultcontent img');

	// Get the cats, if needed
	//------------------------
	let defaultImages = [];
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.addEventListener('readystatechange', function () {
		if (this.status == 200 && this.readyState == 4) {
			defaultImages = JSON.parse(this.responseText).results;
			defaultImages.sort(() => .5 - Math.random());
		}
	});
	let picturesKind = ['shore', 'computer', 'internet'];
	let AjaxURL = `https://api.unsplash.com/search/photos?
		client_id=ghJvlpwTJxmjmagmROKQ-SFHVFgsVgqIQKyhynTV8hI
		&page=1
		&query=${picturesKind[Math.floor(Math.random() * picturesKind.length)]}
		&order_by=latest
		&per_page=${Math.max(50, defaultImagesElems.length)}`;
	xmlhttp.open("GET", AjaxURL, false);
	xmlhttp.send();
	//-----
	defaultImagesElems.forEach(function(img, i) {
		img.src = defaultImages[i].urls.small;
	});
}
