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

// Initialization
//---------------
function RandGrid(selector, args) {
	// Parameters check
	//-----------------
	linesNbr = args.hasOwnProperty('linesNbr') ? args.linesNbr : 4;
	columnsNbr = args.hasOwnProperty('columnsNbr') ? args.columnsNbr : 5;
	wideItemsToBuildCnt = args.hasOwnProperty('wideitems') ? args.wideitems : 3;
	highItemsToBuildCnt = args.hasOwnProperty('highitems') ? args.highitems : 2;
	//-----
	initialScreenRatio = window.innerWidth - window.innerHeight;
	elemsWidthPC = (100 / columnsNbr), elemsHeightPC = (100 / linesNbr);
	availableNormalPos = new Array(), availableWidePos = new Array(), availableHighPos = new Array();

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

	// Available positions initialisation
	//-----------------------------------
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
		AddGridItem(mainItemPos, mainItem.innerHTML, { wide: true, high: true }, '_rg-menu');
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
	wideItemsPos.forEach(elem => AddGridItem(elem, GetNextItemContent(elem), { wide: true }));
	highItemsPos.forEach(elem => AddGridItem(elem, GetNextItemContent(elem), { high: true }));	
	availableNormalPos.forEach(elem => AddGridItem(elem, GetNextItemContent(elem)));

	// Events
	//-------
	window.addEventListener('resize', function(event) {
		let currentScreenRatio = window.innerWidth - window.innerHeight;
		if (initialScreenRatio * currentScreenRatio < 0) {
			initialScreenRatio = currentScreenRatio;

			// Invert lines/columns and sizes
			//-------------------------------
			console.log(randgrid, randgrid.querySelectorAll('_rg-item'));
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
	});
}

// Tools functions
//----------------
function GetNextItemContent(gridItem) {
	if (usualItemsCursor >= usualItems.length)
		return (defaultItem == null ? `` : defaultItem.innerHTML);
	else
		return usualItems[usualItemsCursor++].innerHTML;
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
	gridItem.style.width = (elemsWidthPC * (params.wide ? 2 : 1)) + "%";
	gridItem.style.height = (elemsHeightPC * (params.high ? 2 : 1)) + "%";
	gridItem.style.left = (elem.y * elemsWidthPC) + "%";
	gridItem.style.top = (elem.x * elemsHeightPC) + "%";
	//-----
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
