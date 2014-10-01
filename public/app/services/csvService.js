'use strict';

angular.module('myApp').service('CsvService', function ($q) {
	var CsvService = {};
	
	CsvService.getDataFrom = function (file, candidateRow) {
		var deferred = $q.defer();
		try {
			var r = new FileReader();
			r.onload = function(e) { 
				var contents = e.target.result;
				
				var res = processData(contents, file, candidateRow);
				
				deferred.resolve(res);
			}
			r.readAsText(file);
		
		} catch (e) {
			deferred.reject(e);
		}
		return deferred.promise;
	};
	
	function processData(allText, file, candidateRow) {
		var headerLine = candidateRow;
		var data = getData(allText);
		var candidateHeaderLine = locateHeader(data);
		var wb = {
			'name': file.name,
			'rows': data,
			'candidateHeaderLine': candidateHeaderLine
		};
		var wsCollection = [ wb ];
		
		return { 'fileName': file.name,
				 'workSheets':	wsCollection,
				 'currentWorkSheet': 'default',
				 'candidateHeaderLine': candidateHeaderLine,
				 'error'   : null
				 //'headers': headers,
				 //'lines'  : lines
		};
	}
	
	function getData(allText) {
		var lines = [];
		var strDelimiter = ",";
		var allTextLines = allText.split(/\r\n|\n/);
		for (var i=0; i<allTextLines.length; i++) {
			var rowCells = parseCsvLine(allTextLines[i], strDelimiter);
			//Skip empty rows: no data
			if (rowCells.length>0){
				lines.push({line: i, cells: rowCells});
			}
		}
		return lines;
	}
	function locateHeader(worksheetData) {
		var candidate = 0;
		var lineSize = 0;
		var index = 0;
		for(var i in worksheetData) {
			var row = worksheetData[i];
			if (row.cells.length > lineSize) {
				//New candidate found
				candidate = index;
				lineSize = row.cells.length;
			}
			index++;
		}
		return candidate;
	}
	
	function parseCsvLine(lineData, delimiter) {	
		delimiter = delimiter || ',';
		/*var csvRegex = new RegExp(
		(
			// Delimiters.
			//"(\\" + delimiter + "|\\r?\\n|\\r|^)" +
			"(\\" + delimiter + ")" +
			// Quoted fields.
			"(?:\\s*\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
			// Standard fields.
			"([^\"\\" + delimiter + "\\r\\n]*))"
		),
		"gi"
		);*/

		var res = [];
		var cellData = null; 
		var arrMatches;
		
		var scanIndex = 0;
		var token = { 
			value: null,
			scanIndex : 0
		};
		while (token = getToken(lineData, token, delimiter)) {
			if (token.value == '') {
				res.push(null);
			} else {
				res.push(token.value);
			}
		}
		
		
		
		
		/*while (arrMatches = csvRegex.exec( lineData )){
			if (lineData=="") break;			
			if (arrMatches[2]){
				//unquote
				cellData = unQuote(arrMatches[2]);
			} 
			else if (arrMatches[1] == ',') {
				cellData = null;
			}
			else {
				// We found a non-quoted value.
				cellData = arrMatches[3];
			}
			if (cellData === undefined) break;
			res.push(cellData);			
		}*/
		return res;
	}
	
	function getToken(text, lastToken, delimiter) {		
		var scanIndex = lastToken.scanIndex;		
		while (scanIndex < text.length) {
			var ch = text[scanIndex];
		
			if (isSpace(ch)) {
				scanIndex++; //skip space
			}
			else if (ch == delimiter) {
				//empty entry
				return {
					'value' 	: null,
					'scanIndex' : scanIndex + 1
				};
			} else {
				var nextComma = text.indexOf(delimiter, scanIndex);
				var nextQuote = text.indexOf('"', scanIndex);
				if ((nextComma < nextQuote || nextQuote == -1) && nextComma > -1 ) {
					return {
						//simple value
						'value' 	: text.substr(scanIndex, nextComma-scanIndex),
						'scanIndex' : nextComma + 1
					};
				} else if (nextQuote > -1) {
					var secondQuote = text.indexOf('"', nextQuote+1);
					if (secondQuote > -1) {
						var nextToken = text.indexOf(delimiter, secondQuote);
						if (nextToken == -1) {
							nextToken = text.length;
						} else {
							nextToken++;
						}
						
						return {
							//quoted value
							'value' 	: text.substr(nextQuote+1, secondQuote-(nextQuote+1)),
							'scanIndex' : nextToken
						};
					}
					else {
						return {
							//unclosed quote: return the rest:
							'value' 	: text.substr(nextQuote+1),
							'scanIndex' : text.length
						};
					}
				}
				else {
					return {
							//last value in line
							'value' 	: text.substr(scanIndex),
							'scanIndex' : text.length
						};
				}
			}
		}
		return null; //end of stream
	}
	
	function isSpace(ch) {
		return ch==' ' || ch=='\t' || ch=='\r' || ch=='\n';
	}
	
	
	function unQuote(a) {
		if (a.charAt(0) === '"' && a.charAt(a.length-1) === '"') {
			return a.substr(1, a.length-2);
		}
		return a;
	}
	
	
	return CsvService;
});
