// Create Vue instance
window.app = new Vue({
    el: "#kPointParser",
    data:{
        fileName : undefined,
		k_points : {},
		Bands:{
			data : {},
			nbnd : 0,
			low  : 0,
			high : 0
		},
		dialog:{
			Bands: false,
			Export: false
		}
    },
	methods:{
		clear(){
			this.fileName = undefined;
			this.k_points = {};
			this.$forceUpdate();
		},
		prompt_for_mark(i){
			this.k_points[i].mark = prompt(
				this.k_points[i].mark &&
				`Change current k-point's mark (currently ${this.k_points[i].mark})` ||
				`Change current k-point's mark (currently unset)` +
				'\nFrequently used symbols: Γ Δ Σ Λ Π Φ',
				this.k_points[i].mark || ''
			).trim() || '';
			this.$forceUpdate();
		},
		dist(i){
			_dist = (a, b)=>{
				return (//Math.sqrt(
					Math.pow(a[0] - b[0], 2) +
					Math.pow(a[1] - b[1], 2) +
					Math.pow(a[2] - b[2], 2)
				)
			}
			return i > 0 ? _dist(this.k_points[i-1].k_point.coords, this.k_points[i].k_point.coords) : 'N/A';
		},
		show_data(i){
			console.log([i, this.k_points[i]])
			data_string = ['#\teigenvalue\toccupation'];
			var j = 0;
			for (j = 0; j < this.k_points[i].eigenvalues.data.length; j++){
				data_string.push(`${j}\t${this.k_points[i].eigenvalues.data[j]}\t${this.k_points[i].occupations.data[j]||0}`)
			}
			alert(data_string.join('\n'));
		}
	}
});