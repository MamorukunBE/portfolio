const $NORMAL_ITEM = 0;
const $WIDE_ITEM = 1;
const $HIGH_ITEM = 2;
const $MAIN_ITEM = 3;

var randgrid;
var linesNbr, columnsNbr;
var wideItemsToBuildCnt, highItemsToBuildCnt;
var elemsWidthPC, elemsHeightPC;
var availableNormalPos, availableWidePos, availableHighPos;
var usualItems, usualItemsCursor, defaultItem;
var initialScreenRatio;
var resizeCallback;
var spacingWidthPC, spacingHeightPC, paddingWidthPC, paddingHeightPC;
var hidetimer = 0;

// Initialization
//---------------
function RandGrid(selector, args) {
	// Parameters check
	//-----------------
	linesNbr = args.hasOwnProperty('linesNbr') ? args.linesNbr : 4;
	columnsNbr = args.hasOwnProperty('columnsNbr') ? args.columnsNbr : 5;
	if (args.hasOwnProperty('autoinvert')) {		// Auto invert number of column/lines for high screens
		if (window.innerHeight > window.innerWidth && args.autoinvert) {
			let val = linesNbr;
			linesNbr = columnsNbr;
			columnsNbr = val;
		}
	}
	wideItemsToBuildCnt = args.hasOwnProperty('wideitems') ? args.wideitems : 3;
	highItemsToBuildCnt = args.hasOwnProperty('highitems') ? args.highitems : 2;
	resizeCallback = args.hasOwnProperty('resizer') ? args.resizer : null;
	//-----
	let spacing = args.hasOwnProperty('spacing') ? args.spacing : 0;
	spacingWidthPC = spacing / window.innerWidth * 100;
	spacingHeightPC = spacing / window.innerHeight * 100;
	let gridPadding = args.hasOwnProperty('padding') ? args.padding : 0;
	paddingWidthPC = gridPadding / window.innerWidth * 100;
	paddingHeightPC = gridPadding / window.innerHeight * 100;
	//-----
	initialScreenRatio = window.innerWidth - window.innerHeight;
	let workWidthSize = (window.innerWidth - (spacing * (columnsNbr - 1)) - (gridPadding * 2));
	let workHeightSize = (window.innerHeight - (spacing * (linesNbr - 1)) - (gridPadding * 2));
	let elemsWidth = workWidthSize / columnsNbr;
	let elemsHeight = workHeightSize / linesNbr;
	elemsWidthPC = elemsWidth / window.innerWidth * 100;
	elemsHeightPC = elemsHeight / window.innerHeight * 100;

	// Data retrieval
	//---------------
	if ((randgrid = document.querySelector(selector)) == null)
		return ReportError($ERROR, `Document ${selector} not found`);
	randgrid.classList.add('_rg');
	//-----
	let mainItem;
	if ((mainItem = randgrid.querySelector('.main')) == null)
		ReportError($WARNING, `No .main class found in provided ${selector} items`);
	else
		randgrid.removeChild(mainItem);
	//-----
	usualItems = randgrid.querySelectorAll('.item'), usualItemsCursor = 0;
	if (usualItems.length == 0)
		ReportError($WARNING, `No .item class found in provided ${selector} items`);
	else
		usualItems.forEach(e => randgrid.removeChild(e));
	//-----
	if ((defaultItem = randgrid.querySelector('.default')) == null)
		ReportError($WARNING, `No .default class found in provided ${selector} items`);
	else
		randgrid.removeChild(defaultItem);

	// Remove the hider, now that the DOM users items have been deleted
	//-----------------------------------------------------------------
	document.getElementById('hider').style.display = 'none';

	// Available positions initialisation
	//-----------------------------------
	availableNormalPos = new Array(), availableWidePos = new Array(), availableHighPos = new Array();
	for (let i = 0; i < linesNbr; i++) {
		for (let j = 0; j < columnsNbr; j++) {
			availableNormalPos.push({ x: i, y: j });
			if (i < linesNbr && j < (columnsNbr - 1))
				availableWidePos.push({ x: i, y: j });
			if (i < (linesNbr - 1) && j < columnsNbr)
				availableHighPos.push({ x: i, y: j });
		}
	}
	//========== Main item position, if needed ==========
	if (mainItem != null) {
		let mainItemPos = {
			x: (Math.floor(Math.random() * (linesNbr - 1))),
			y: (Math.floor(Math.random() * (columnsNbr - 1)))
		};
		DisableRelatedPositions($MAIN_ITEM, mainItemPos);
		AddGridItem(mainItemPos, mainItem.innerHTML, { wide: true, high: true, hidetimer: 0 }, '_rg-menu');
	}
	//========== Determine the large items positions ==========
	let wideItemsPos = new Array(wideItemsToBuildCnt), highItemsPos = new Array(highItemsToBuildCnt);
	//-----
	for (let i = 0; i < wideItemsToBuildCnt && availableWidePos.length > 0; i++) {
		let randomizedPos = (Math.floor(Math.random() * (availableWidePos.length - 1)));
		wideItemsPos[i] = availableWidePos[randomizedPos];
		DisableRelatedPositions($WIDE_ITEM, wideItemsPos[i]);
	}
	//-----
	for (let i = 0; i < highItemsToBuildCnt && availableHighPos.length > 0; i++) {
		let randomizedPos = (Math.floor(Math.random() * (availableHighPos.length - 1)));
		highItemsPos[i] = availableHighPos[randomizedPos];
		DisableRelatedPositions($HIGH_ITEM, highItemsPos[i]);
	}
	//========== Draw the items ==========
	wideItemsPos.forEach(elem => AddGridItem(elem, GetNextItemContent($WIDE_ITEM), { wide: true }));
	highItemsPos.forEach(elem => AddGridItem(elem, GetNextItemContent($HIGH_ITEM), { high: true }));
	availableNormalPos.sort(() => .5 - Math.random()).forEach(elem => AddGridItem(elem, GetNextItemContent($NORMAL_ITEM)));

	// Events
	//-------
	window.addEventListener('resize', function(event) {
		let currentScreenRatio = window.innerWidth - window.innerHeight;
		if (initialScreenRatio * currentScreenRatio < 0) {
			initialScreenRatio = currentScreenRatio;

			// Invert lines/columns and sizes
			//-------------------------------
			randgrid.querySelectorAll('._rg-item').forEach(function(elem) {
				let baseWidth = elem.style.width;
				elem.style.width = elem.style.height;
				elem.style.height = baseWidth;
				//-----
				let baseLeft = elem.style.left;
				elem.style.left = elem.style.top;
				elem.style.top = baseLeft;
			});
		}
		//-----
		if (resizeCallback != null)
			resizeCallback();
	});

	return randgrid;
}

// Tools functions
//----------------
function GetNextItemContent(itemType) {
	if (usualItemsCursor >= usualItems.length)
		return (defaultItem == null ? '' : defaultItem.innerHTML);
	else {
		if (itemType == $HIGH_ITEM && usualItems[usualItemsCursor].classList.contains('nohigh'))
			return defaultItem.innerHTML;
		else if (itemType == $WIDE_ITEM && usualItems[usualItemsCursor].classList.contains('nowide'))
			return defaultItem.innerHTML;
		return usualItems[usualItemsCursor++].innerHTML;
	}
}
function RemovePos(posVector, posToRemove) {
	let posFound = posVector.findIndex(pos => (pos.x == posToRemove.x && pos.y == posToRemove.y));
	if (posFound >= 0)
		posVector.splice(posFound, 1);
}
function DisableRelatedPositions(removerType, removerPos) {
	let normalPosToDisable = new Array(), widePosToDisable = new Array(), highPosToDisable = new Array();
	switch (removerType) {
		case $MAIN_ITEM: {
			normalPosToDisable.push({ x: removerPos.x, y: removerPos.y });
			normalPosToDisable.push({ x: removerPos.x, y: removerPos.y + 1 });
			normalPosToDisable.push({ x: removerPos.x + 1, y: removerPos.y });
			normalPosToDisable.push({ x: removerPos.x + 1, y: removerPos.y + 1 });
			widePosToDisable.push({ x: removerPos.x, y: removerPos.y - 1 });
			widePosToDisable.push({ x: removerPos.x + 1, y: removerPos.y - 1 });
			highPosToDisable.push({ x: removerPos.x - 1, y: removerPos.y });
			highPosToDisable.push({ x: removerPos.x - 1, y: removerPos.y + 1 });
			break;
		}
		case $WIDE_ITEM: {
			normalPosToDisable.push({ x: removerPos.x, y: removerPos.y });
			normalPosToDisable.push({ x: removerPos.x, y: removerPos.y + 1 });
			widePosToDisable.push({ x: removerPos.x, y: removerPos.y - 1 });
			highPosToDisable.push({ x: removerPos.x - 1, y: removerPos.y });
			highPosToDisable.push({ x: removerPos.x - 1, y: removerPos.y + 1 });
			break;
		}
		case $HIGH_ITEM: {
			normalPosToDisable.push({ x: removerPos.x, y: removerPos.y });
			normalPosToDisable.push({ x: removerPos.x + 1, y: removerPos.y });
			widePosToDisable.push({ x: removerPos.x, y: removerPos.y - 1 });
			widePosToDisable.push({ x: removerPos.x + 1, y: removerPos.y - 1 });
			highPosToDisable.push({ x: removerPos.x - 1, y: removerPos.y });
			break;
		}
	}
	normalPosToDisable.forEach(function (elem) {
		RemovePos(availableNormalPos, elem);
		RemovePos(availableWidePos, elem);
		RemovePos(availableHighPos, elem);
	})
	widePosToDisable.forEach(elem => RemovePos(availableWidePos, elem));
	highPosToDisable.forEach(elem => RemovePos(availableHighPos, elem));
}
function AddGridItem(elem, content, params = {}, id = null) {
	let gridItem = document.createElement('div');
	if (params.wide) gridItem.classList.add('_rg-wide');
	if (params.high) gridItem.classList.add('_rg-high');
	gridItem.classList.add('_rg-item');
	if (id !== null) gridItem.id = id;
	//-----
	gridItem.style.width = (elemsWidthPC * (params.wide ? 2 : 1) + (params.wide ? spacingWidthPC : 0)) + "%";
	gridItem.style.height = ((elemsHeightPC * (params.high ? 2 : 1)) + (params.high ? spacingHeightPC : 0)) + "%";
	gridItem.style.left = paddingWidthPC + (elem.y * (elemsWidthPC + spacingWidthPC)) + "%";
	gridItem.style.top = paddingHeightPC + (elem.x * (elemsHeightPC + spacingHeightPC)) + "%";
	//-----
	gridItem.style.animationDelay = hidetimer + 'ms';
	hidetimer += 25;
	gridItem.innerHTML = content;
	//-----
	randgrid.appendChild(gridItem);
}

// Error function
//---------------
const $ERROR = 0;
const $WARNING = 1;
function ReportError(type, msg) {
	let computedMsg = `[RandGrid - ${type == $ERROR ? `ERROR` : `WARNING`}] ${msg}`;
	console.log(computedMsg);
	//-----
	if (type == $ERROR) {
		let errorMsg = document.createElement('p');
		errorMsg.innerText = computedMsg;
		document.body.appendChild(errorMsg);
	}
}
