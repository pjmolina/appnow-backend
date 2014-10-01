'use strict';

angular.module('myApp').service('XlsxService', function ($q, $window) {
	var XlsxService = {};
	
	XlsxService.getDataFrom = function (file, wsName, candidateRow) {
		var deferred = $q.defer();
		try {
			var reader = new FileReader();
			reader.onload = function(e) { 
				var contents = e.target.result;
				var res = processData(contents, file, wsName, candidateRow);
				deferred.resolve(res);
			}
			reader.readAsBinaryString(file);
		
		} catch (e) {
			deferred.reject(e);
		}
		return deferred.promise;
	};
	
	function processData(binaryContent, file, wsName, headerRow) {
		
		var workbook = $window.XLSX.read(binaryContent, {type: 'binary'});
		
		var cellData = loadData(workbook);
		
		var wsCollection = [];
		workbook.SheetNames.forEach(function(sheetName) {
			var sheetData = findByName(cellData, sheetName);
			if (sheetData != null) {
				var data = getData(sheetName, cellData, 0);
				var candidateHeaderLine = sheetData.candidateHeaderLine;
				wsCollection.push({
					'name': sheetData.name,
					'rows': data,
					'candidateHeaderLine': candidateHeaderLine
				}); 
			}
		});
		
		var wsName = wsName || wsCollection[0].name;
		var worksheet = workbook.Sheets[wsName]; //first one		
		headerRow = headerRow || wsCollection[0].candidateHeaderLine;
		
		
		var res = { 'fileName': file.name,
				 'workSheets':	wsCollection,
				 'currentWorkSheet': wsName,
				 'candidateHeaderLine': headerRow,
				 'error'  : null,
				 //'headers': headers,
				 //'lines'  : lines
		};		
		return res;
	}

	function findByName(collection, name) {
		for(var index in collection) {
			var item = collection[index];
			if (item.name == name)
				return item;
		}
		return null;
	}
	
	var cellRegex = /([A-Z]+)(\d+)/g;
	
	function loadData(workbook) {
		var result = [];
		workbook.SheetNames.forEach(function(sheetName) {
			//var start = new Date().getTime();
			var worksheet = workbook.Sheets[sheetName];
			var ws = { name: sheetName, rows: []};

			var hashRowBucket = {};
			
			var line = 0;
			var col = '';
			var parsed;
			
			for (var row in worksheet) {
				if(row[0] === '!') continue;
				cellRegex.lastIndex = 0;
				parsed = cellRegex.exec(row);
				col = parsed[1];							
				line = Number(parsed[2]);
								
				insertCellValue(hashRowBucket, line, col, worksheet[row]);
			}
			
			ws.rows = hashToArrayRows(hashRowBucket);
			
			//var end = new Date().getTime();
			//var ellapsed = end - start;
			//console.log('loading sheet: ' + sheetName + ' : ' + ellapsed + "ms");

			ws.candidateHeaderLine = locateHeader(ws);
			
			if (ws.rows.length > 0) {
				//Include in preview (discard if has no data)
				fillEmptySpaces(ws);
				result.push(ws);
			}	
		});		
		return result;
	}
	
	function hashToArrayRows(hashRows) {
		var rowsArray = [];
		for (var key in hashRows) {
			rowsArray.push(hashToArrayCells(hashRows[key]));			
		}
		//sort lines
		rowsArray.sort(function(a,b) { return a.line - b.line } );
		return rowsArray;
	}
	
	function hashToArrayCells(rowContent) {
		var cellsArray = [];
		var output = {
			'line'   : rowContent.line,
			'cells' : cellsArray 
		};
		for (var key in rowContent.cells) {
			cellsArray.push(rowContent.cells[key]);			
		}
		//sort lines
		cellsArray.sort(function(a,b) { return convertColToNumber(a.col) - convertColToNumber(b.col) } );
		return output;
	}
	
	function insertCellValue(rows, line, col, cellContent) {
		var row = rows[line]; //locateRow(rows, line);
		if (row == null) {
			//insert row
			row = {'line': line, cells: {} };
			rows[line] = row;
		}
		//insert cell
		var colIndex = convertColToNumber(col);
		row.cells[colIndex] = {'col': col, 'v' : cellContent.v };
	}
	

	function locateHeader(worksheetData) {
		var candidate = 0;
		var lineSize = 0;
		var index = 0;
		for(var i in worksheetData.rows) {
			var row = worksheetData.rows[i];
			if (row.cells.length > lineSize) {
				//New candidate found
				candidate = index;
				lineSize = row.cells.length;
			}
			index++;
		}
		return candidate;
	}
	
	
	var asciiA = 'A'.charCodeAt(0);
	var asciiZ = 'Z'.charCodeAt(0);
	
	function convertColToNumber(colText) {
		var result = 0;
		if (colText.length > 0) {
			result = colText.toUpperCase().charCodeAt(0) - asciiA + 1;
		}
		if (colText.length == 2) {
			result = result * (asciiZ - asciiA) +
					 colText.toUpperCase().charCodeAt(1) - asciiA + 1;
		}
		return result;
	}
	function convertNumberToCol(index) {
		var result = '';
		var base = asciiZ - asciiA;
		var div = index;
		do  {
			var module = div % base;
			div = Math.floor(div/base);
			result += String.fromCharCode(asciiA + module - 1);

		} while (div > 0)

		return result;
	}
	
	function fillEmptySpaces(wbook) {
		var maxCol = getMaxCol(wbook);
		//complete till maxCol
		for(var index in wbook.rows) {
			var row = wbook.rows[index];
			for (var j=0; j<maxCol; j++) {
				var colj =convertNumberToCol(j+1);
				var cell = locateCellByColName(row, colj);
				if (cell == null) {
					//slow
					row.cells.splice(j, 0, {
							col: colj,
							v: null 
						});
				}
			}
		}
	}

	function locateCellByColName(row, colName) {
		for(var index in row.cells) {
			var cell = row.cells[index];
			if (cell.col == colName) {
				return cell;
			}
		}
		return null;
	}
	
	function getMaxCol(wbook) {
		var maxCols = 0;
		for(var index in wbook.rows) {
			var row = wbook.rows[index];
			for (var j in row.cells) {
				var cell = row.cells[j];
				var candidate = convertColToNumber(cell.col);
				if (candidate > maxCols) {
					maxCols = candidate; 
				}
			}
		}
		return maxCols;
	}
	
	
	function getHeaders(wsName, wbData, headerRow) {
		var wb = wbData.filter(function(item) {
			if (item.name == wsName)	
				return item;
		})[0];
		var row = wb.rows[headerRow];
		var result = [];
		
		row.cells.filter(function(item) {
			var cell = item.v.v;
			if (cell != null && cell!='') {
				result.push(cell);
			}			
		}); 
		return result;
	}
	function getData(wsName, wbData, headerRow) {
		var wb = wbData.filter(function(item) {
			if (item.name == wsName)	
				return item;
		})[0];
	
		var rows = []
		if (wb == null || !wb.rows){
			return rows;
		}		
		for(var index = headerRow; index < wb.rows.length; index++) {
			var sourceRow = wb.rows[index];
			var row = {
				'line' : index,
				'cells': getValuesFromCells(sourceRow.cells)
			};
			if (row.cells.length > 0){
				rows.push(row);
			}
		}
		return rows;
	}
	
	function getValuesFromCells(cells) {
		var values  = [];
		cells.filter(function(item){
			values.push(item.v);
		});
		return values;
	}
	
	return XlsxService;
});
