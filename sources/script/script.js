const $WIDE_ITEM = 1;
const $HIGH_ITEM = 2;
const $MAIN_ITEM = 3;
var linesNbr = 4, columnsNbr = 5;
let wideItemsToBuildCnt = 3, highItemsToBuildCnt = 2;
var elemsWidthPC = (100 / columnsNbr), elemsHeightPC = (100 / linesNbr);
var availableNormalPos = new Array(), availableWidePos = new Array(), availableHighPos = new Array();
let pfGrid;

// Document javascriptation
//-------------------------
window.addEventListener('load', function() {
	// Grid initialisation
	//--------------------
	$('.pf_grid').isotope({
		itemSelector: '.grid-item',
		percentPosition: true,
		masonry: { columnWidth: '.grid-sizer' }
	})
	//$grid.imagesLoaded().progress(function () { $grid.isotope('layout'); });

	// Grid filling
	//-------------
	pfGrid = document.getElementById('pf_grid');
	//========== Available positions initialisation ==========
	for (let i = 0; i < linesNbr; i++) {
		for (let j = 0; j < columnsNbr; j++) {
			availableNormalPos.push({ x: i, y: j});
			if (i < linesNbr && j < (columnsNbr - 1))
				availableWidePos.push({ x: i, y: j });
			if (i < (linesNbr - 1) && j < columnsNbr)
				availableHighPos.push({ x: i, y: j });
		}
	}
	//========== Determine the large items positions ==========
	let mainItemPos, wideItemsPos = new Array(wideItemsToBuildCnt), highItemsPos = new Array(highItemsToBuildCnt);
	//-----
	mainItemPos = { x: (Math.floor(Math.random() * (linesNbr - 1))),
						 y: (Math.floor(Math.random() * (columnsNbr - 1)))};
	DisableRelatedPositions($MAIN_ITEM, mainItemPos);
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
	availableNormalPos.forEach(elem => AddGridItem(elem));
	wideItemsPos.forEach(elem => AddGridItem(elem, { wide: true }));
	highItemsPos.forEach(elem => AddGridItem(elem, { high: true }));
	AddGridItem(mainItemPos, { wide: true, high: true }, 'menu-item');
})

// Grid functions
//---------------
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
function AddGridItem(elem, params = {}, id = null) {
	let gridItem = document.createElement('div');
	gridItem.classList.add((elem.x == 0 && elem.y == 0) ? 'grid-sizer' : 'grid-item');
	if (params.wide) gridItem.classList.add('grid-item--width2');
	if (params.high) gridItem.classList.add('grid-item--height2');
	if (id !== null) gridItem.id = id;
	console.log(gridItem);
	gridItem.style.width = (elemsWidthPC * (params.wide ? 2 : 1)) + "%";
	gridItem.style.height = (elemsHeightPC * (params.high ? 2 : 1)) + "%";
	gridItem.style.left = (elem.y * elemsWidthPC) + "%";
	gridItem.style.top = (elem.x * elemsHeightPC) + "%";
	//-----
	gridItem.innerHTML = `(${elem.x},${elem.y})`;
	//-----
	pfGrid.appendChild(gridItem);
}
