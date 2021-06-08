var input = document.createElement("input");
input.type = "file";
function filterXML(XML_String, entry){
	start = new RegExp(`\\s*<\\s*${entry}(\\s+[\\w|=|\\"|\\d|\\.|\\+|\\-]*)*\\s*>.+`, 'g');
	end   = new RegExp(`<\\/\\s*${entry}\\s*>`, 'g');
	head  = new RegExp(`\\s*<\\s*${entry}(\\s+[\\w|=|\\"|\\d|\\.|\\+|\\-]*)*\\s*>\\s*`, 'g');
	foot  = new RegExp(`\\s*<\\/\\s*${entry}\\s*>\\s*`, 'g');
	return XML_String
					.replace(/[\n|\s]+/g,' ')
					.replace(end, '</' + entry + '>\n')
					.match(start)
					.map(node => {
						var params = [];
						node.match(head)[0].replace(entry, '').replace(/\s*[<|>]\s*/g, '').split(' ').forEach(param => {
							if (param.indexOf('=') < 0) return;
							var name, value;
							[name, value] = param.split('=');
							params[name] = parseFloat(value.replace(/['"]+/g, ''))
						});
						return {
							data  : node.replace(head, '').replace(foot, '').trim(),
							params: params
						}
					});
}

function getFile() {
	input.onchange = (e) => {
		// getting a hold of the file reference
		var file = e.target.files[0];
		// setting up the reader
		var reader = new FileReader();
		reader.readAsText(file, "UTF-8");
		document.getElementById("input_filename").innerHTML = file.name;
		// here we tell the reader what to do when it's done reading...
		reader.onload = (readerEvent) => {
			var i = 0;
			ProcessData(readerEvent.target.result).forEach(p => {
				app.k_points[i] = p;
				if (i > 0){
					p.dist = app.dist(i);
					p.offsetX = app.k_points[i - 1].offsetX + p.dist;
				}
				i ++;
			})
			app.$forceUpdate();
		};
	};
	input.click();
}

function ProcessData(XML_String) {
	return filterXML(XML_String, 'ks_energies').map(node => ({
		k_point:
			filterXML(node.data, 'k_point').map(node => ({
				weight: node.params.weight || 0,
				coords: node.data.split(' ').map(x => parseFloat(x) || 0)
			}))[0],
		npw:
			parseFloat(filterXML(node.data, 'npw')[0].data) || 0,
		eigenvalues:
			filterXML(node.data, 'eigenvalues').map(node => ({
				size: node.params.size || 0,
				data: node.data.split(' ').map(x => parseFloat(x) || 0)
			}))[0],
		occupations:
			filterXML(node.data, 'eigenvalues').map(node => ({
				size: node.params.size || 0,
				data: node.data.split(' ').map(x => parseFloat(x) || 0)
			}))[0],
		mark: '',
		dist: 0,
		offsetX: 0
	}));
}

function checkInput(str){
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		   !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function makePlot(FermiEnergy){
	// Toggle pop-up plot dialog
	app.dialog.Bands = true;
	// Initiate Plot
	window.plot = new Plot(document.getElementById("Bands"),{ID: "BandStructure"});
	var i = 0, data = {};
	// Generate band curves
	while(true){
		var coords = [];
		for (pid in app.k_points){
			var p = app.k_points[pid];
			if (p.eigenvalues.data.length > i){
				coords.push([p.offsetX, p.eigenvalues.data[i] - FermiEnergy])
			}
		}
		if (coords.length > 0){
			data[i] = {
				data: coords,
				unit: 'eV',
				scale: 1.00,
				status    : "dashed", // "normal" | "hover" | "down" | "drag" | "dashed"
				generator: undefined
			}
			i ++;
		}
		else break;
	}
	// Plot vertical marks
	for (pid in app.k_points){
		var p = app.k_points[pid];
		if (p.mark !== ''){
			window.plot.viewport.rules[pid] = {
				coord_x: p.offsetX,
				color: "gray",
				label: p.mark,
				intersection: undefined
			}
		}
	}
	// Save processed data into app.data
	app.Bands = {
		data : data,
		nbnd : i,
		low  : 0,
		high : i - 1
	}
	// Render bands data onto plot
	updatePlotData();
}

function updatePlotData(){
	// Rearrange data curves
	var data = {};
	for (var i = app.Bands.low; i <= app.Bands.high; i++){
		if (i in app.Bands.data){
			data[i] = Object.assign({}, app.Bands.data[i]);
		}
	}
	// Send data
	window.plot.Data = {};
	window.plot.loadData(data);
	window.plot.fitViewport();
}

// document.addEventListener(
//     'onscroll',
//     e => {
// 		// const excludeEl = document.querySelectorAll('.popup-scroll');
// 		// const isExclude = [].some.call(excludeEl, (el) => el.contains(e.target),);
// 		// if (isExclude) {
// 		// 	return true;
// 		// }
// 		if (app.dialog.Bands || app.dialog.Export) e.preventDefault();
//     },
//     { passive: false },
// );

function check_band_limits(){
	// lo
	var input_lo = document.getElementById('Band_lo').innerText;
	if (checkInput(input_lo)){
		var val = parseInt(input_lo);
		if (val >= 0 && val <= app.Bands.high){
			app.Bands.low = val;
		}
	}
	document.getElementById('Band_lo').innerText = `${app.Bands.low}`;
	// hi
	var input_hi = document.getElementById('Band_hi').innerText
	if (checkInput(input_hi)){
		var val = parseInt(input_hi);
		if (val >= app.Bands.low && val < app.Bands.nbnd){
			app.Bands.high = val;
		}
	}
	document.getElementById('Band_hi').innerText = `${app.Bands.high}`;
	updatePlotData();
}

document.getElementById('Band_lo').addEventListener(
	'keydown',
	input_keydown
);
document.getElementById('Band_hi').addEventListener(
	'keydown',
	input_keydown
);

function input_keydown(e){
	console.log(e);
}