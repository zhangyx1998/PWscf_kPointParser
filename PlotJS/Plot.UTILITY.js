Plot.prototype.DPI_Scale = function(x,unit = 'px'){
    if (x == undefined) return undefined;
    var devicePixelRatio  = window.devicePixelRatio || 1,
        backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
                            this.ctx.mozBackingStorePixelRatio ||
                            this.ctx.msBackingStorePixelRatio ||
                            this.ctx.oBackingStorePixelRatio ||
                            this.ctx.backingStorePixelRatio || 1;
    var r =  devicePixelRatio / backingStoreRatio;
    if (typeof(x) == "object"){
        unit = x.unit;
        x = x.val;
    }
    if (typeof(x) == "string"){
        unit = x.match(/(px|em)/g)[0];
        x = parseFloat(x);
    }
    switch (unit){
        case 'px':
            return r * x;
        case 'em':
            return r * x * parseFloat(getComputedStyle(document.body).fontSize);
    }
    return x
}

Plot.prototype.alpha_cover = function(area, alpha){
    var x = Math.min(...area.X),
        y = Math.min(...area.Y),
        w = Math.max(...area.X) - x + 1,
        h = Math.max(...area.Y) - y + 1;
    // Get canvas content.
    var canvas_data = this.ctx.getImageData(x, y, w, h);
    var px = 3;
    while (px in canvas_data.data){
        canvas_data.data[px] = (canvas_data.data[px] * alpha);
        px += 4;
    }
    window.canvas_data = canvas_data;
    // Put alpha-ed image data back.
    this.ctx.putImageData(canvas_data, x, y);
}

Plot.prototype.alpha_focus = function(area, alpha){
    var x = Math.min(...area.X),
        y = Math.min(...area.Y),
        w = Math.max(...area.X) - x,
        h = Math.max(...area.Y) - y;
    // Get canvas content.
    var canvas_data = this.ctx.getImageData(x, y, w, h);
    var entire_canvas_data = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var px = 3;
    while (px in entire_canvas_data.data){
        entire_canvas_data.data[px] = Math.floor(entire_canvas_data[px] * alpha);
        px += 4;
    }
    // // Clear existing image.
    // this.ctx.clearRect(x, y, w, h);
    // Put alpha-ed image data back.
    this.ctx.putImageData(entire_canvas_data, 0, 0);
    this.ctx.putImageData(canvas_data, x, y);
}

// set ctx style according to given configs.
// note that the later a config in array, the grater the priority.
Plot.prototype.set_ctx = function(configs = [], config = {...this.theme.default}){
    if (Array.isArray(configs)){
        for (var i in configs){
            config = PlotJS.util.apply_config(config, configs[i]);
        }
    }
    else{
        config = PlotJS.util.apply_config(config, configs);
    }
    this.ctx.strokeStyle    = config.$strokeStyle == undefined ? config.$color : config.$strokeStyle;
    this.ctx.fillStyle      = config.$fillStyle == undefined ? config.$color : config.$fillStyle;
    this.ctx.lineWidth      = this.DPI_Scale(config.$lineWidth);
    this.ctx.font           = this.DPI_Scale(config.$font_size).toString() + "px " + config.$font_family;
    this.ctx.textBaseline   = config.$textBaseline;
    this.ctx.textAlign      = config.$textAlign;
    this.ctx.setLineDash(config.$dash);
    return config;
}

/** */
Plot.prototype.line = function(x1, y1, x2, y2, config1, config2){
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    if (config1) this.lineTip(x1, y1, x1 - x2, y1 - y2, config1);
    if (config2) this.lineTip(x2, y2, x2 - x1, y2 - y1, config2);
}

Plot.prototype.lineTip = function(x, y, dx, dy, config = this.theme.default){
    if (Array.isArray(config)) config = this.set_ctx(config);
    config = this.set_ctx([config]);
    if (config.$lineTip.$_triangle){
        let size = this.DPI_Scale(config.$lineTip.$_triangle);
        [dx, dy] = PlotJS.util.normalize([dx, dy], size);
        [ x,  y] = [x - dx, y - dy];
        this.ctx.beginPath();
        this.ctx.moveTo(x + dx, y + dy);
        for (var i = 0; i < 3; i++){
            [dx, dy] = PlotJS.util.rotate([dx, dy], 120, "deg");
            this.ctx.lineTo(x + dx, y + dy);
        }
        if (config.$lineTip.$_stroke) this.ctx.stroke();
        if (config.$lineTip.$_fill) this.ctx.fill();
    }
    if (config.$lineTip.$_square){
        let size = this.DPI_Scale(config.$lineTip.$_square);
        [dx, dy] = PlotJS.util.rotate(PlotJS.util.normalize([dx, dy], size), 45, "deg");
        this.ctx.beginPath();
        this.ctx.moveTo(x + dx, y + dy);
        for (var i = 0; i < 4; i++){
            [dx, dy] = PlotJS.util.rotate([dx, dy], 90, "deg");
            this.ctx.lineTo(x + dx, y + dy);
        }
        if (config.$lineTip.$_stroke) this.ctx.stroke();
        if (config.$lineTip.$_fill) this.ctx.fill();
    }
    if (config.$lineTip.$_circle){
        let size = this.DPI_Scale(config.$lineTip.$_circle);
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * Math.SQRT1_2, 0, 2 * Math.PI);
        if (config.$lineTip.$_stroke) this.ctx.stroke();
        if (config.$lineTip.$_fill) this.ctx.fill();
    }
}

// convert series coordinates to canvas coordinates
Plot.prototype.series_to_canvas = function(x, y, series){
    var cof = {
        x:{
            source: this.viewport.X,
            target: this.area.plot.X
        },
        y:{
            source: this.Data[series].PlotJS[this.ID].Y || this.viewport.Y,
            target: this.area.plot.Y
        }
    };
    return PlotJS.util.range_project2d(cof, {x:x, y:y});
}

Plot.prototype.update_cursor_position = function(evt){
var cursor_canvas_coord = this.cursor_canvas_coord(evt),
    // If the cursor is dragging, use the range captured at start of drag.
    absolute_x = this.viewport.cursor.down ?
                        this.viewport.cursor.down.X
                        : this.viewport.X;
    this.viewport.cursor.x = PlotJS.util.range_project(
                                absolute_x,
                                [0, this.canvas.width],
                                cursor_canvas_coord.x
                            );
    this.viewport.cursor.y = cursor_canvas_coord.y
}

Plot.prototype.zoom_x = function(ratio){
    var x_center = this.viewport.cursor.x,
        offest = [
            this.viewport.X[0] - x_center,
            this.viewport.X[1] - x_center,
        ]
    this.viewport.X = [
        x_center + offest[0] * ratio,
        x_center + offest[1] * ratio,
    ];
}

Plot.prototype.zoom_y = function(ratio){
    // If no series was selected
    if (!Object.keys(this.viewport.selected.series).length){
        // zoom the default view and all serieses
        this.viewport.Y = PlotJS.util.scale_range(this.viewport.Y, ratio);
        for (var s in this.Data){
            if (this.Data[s].PlotJS[this.ID].Y)
                this.Data[s].PlotJS[this.ID].Y = PlotJS.util.scale_range(this.Data[s].PlotJS[this.ID].Y, ratio)
        }
    }
    for (var s in this.viewport.selected.series){
        // If Series have not been initialized with a range(Y), copy the viewport Y.
        if (!this.viewport.selected.series[s].PlotJS[this.ID].Y) this.viewport.selected.series[s].PlotJS[this.ID].Y = this.viewport.Y;
        // zoom Y 
        this.viewport.selected.series[s].PlotJS[this.ID].Y = PlotJS.util.scale_range(this.viewport.selected.series[s].PlotJS[this.ID].Y, ratio);
    }
}

Plot.prototype.focus_area = function(canvas_coord){
    var area = undefined;
    for (var a in this.area){
        if (PlotJS.util.in_range(this.area[a], canvas_coord)){
            area = a;
        }
    }
    if (this.$debug){
        this.$debug.push(`Focus area: ${area}`);
    }
    return area;
}

Plot.prototype.cursor_canvas_coord = function(evt){
    var cof = {
            x:{
                target: [0, this.canvas.width],
                source: [0, this.canvas.offsetWidth]
            },
            y:{
                target: [0, this.canvas.height],
                source: [0, this.canvas.offsetHeight]
            }
        };
    return PlotJS.util.range_project2d(cof, {x: evt.offsetX, y: evt.offsetY});
}

Plot.prototype.allocate_area = function(){
    // Caculate draw area
    var test_text = [
            {str:"Test", style: this.set_ctx([this.theme.tick, this.theme.tick.primary_text])},
            {str:"Test", style: this.set_ctx([this.theme.tick, this.theme.tick.sub_text])}
        ],
        axis_height = this.text_size(test_text).height, // padding
        navi_height = this.DPI_Scale(this.theme.navi.height);
    this.area = {
        plot: {
            X: [0, this.canvas.width],
            Y: [
                this.canvas.height - axis_height - navi_height,
                0
            ]
        },
        axis: {
            X: [0, this.canvas.width],
            Y: [
                this.canvas.height - navi_height,
                this.canvas.height - axis_height - navi_height
            ]
        },
        navi:{
            X: [0, this.canvas.width],
            Y: [
                this.canvas.height,
                this.canvas.height - navi_height
            ]
        }
    }
}

// returns the size of given combination of lines
// return {width: <number>, height: <number>}
Plot.prototype.text_size = function(lines, theme = this.theme.default){
    if (typeof(lines) == "string"){
        var size = this.ctx.measureText(lines);
        size.height = size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
        return size;
    }
    var height = 0, width = 0, margin_above = 0,
        lines = Object.assign({},lines);
    for (var i in lines){
        if (typeof(lines[i]) == "string") lines[i] = {str: lines[i]};
        if (!('str' in lines[i])){
            lines[i].str = "";
        }
        // Declare line specific theme, initiated by "theme".
        var line_theme = theme;
        // If this line has a separate style entry (object), apply it.
        if("style" in lines[i]) line_theme = this.set_ctx([theme, lines[i].style]);
        // Pick out the margin from finally applied theme config.
        var margin = this.DPI_Scale(line_theme.$typesetting.$_margin);
        // Compare previous margin and current margin, and apply the larger one. 
        height += Math.max(margin, margin_above);
        // Spacing of current line will be next margin_above.
        margin_above = margin;
        var size = this.ctx.measureText(lines[i].str);
            size.height = size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
        height += size.height;
        width =  Math.max(width, size.width + 2 * margin);
    }
    height += margin_above;
    return {height: height, width: width};
}

// L2: called by this.mouse_event_handler()
//     this function returns all intersections with coord
Plot.prototype.intersection = function(coord){
    var intersection = {},
        magnify = {
            series : undefined,
            rule   : undefined
        };
    // first: find intersection with each series line
    var coff = this.config.plot.series_magnify_coff,
        current_closest_distance = undefined;
    for (var s in this.Data){
        if (this.Data[s].data.length
            && this.Data[s].PlotJS[this.ID].status != "hide"
            && this.Data[s].PlotJS[this.ID].status != "dashed"
            && this.Data[s].PlotJS[this.ID].selectable != false
            ){
            // Set ctx to current testing series line style.
            // This is mainly to get the lineWidth parameter.
            this.set_ctx([
                this.theme.series,
                this.theme.series[this.Data[s].PlotJS[this.ID].status],
                this.Data[s].PlotJS[this.ID]
            ]);
            var max_distence = coff * this.ctx.lineWidth,
                max_plot_distance = max_distence
                                  * PlotJS.util.range_length(this.viewport.X)
                                  / PlotJS.util.range_length(this.area.plot.X);
            // find the intersection point, and get max/min of range "max_distance"
            var i = 0, j = 0, Y = undefined; //  j|<-- i -->|k
            while (j + 1 in this.Data[s].data){
                if (this.Data[s].data[j+1][0] <= coord.x) i++;
                if (this.Data[s].data[j][0] > coord.x + max_plot_distance) break;
                if (this.Data[s].data[j][0] >= coord.x - max_plot_distance){
                    // Initialize
                    if (!Y) Y = [this.Data[s].data[j][1], this.Data[s].data[j][1]];
                    // Find min and max
                    Y[0] = Math.min(Y[0], this.Data[s].data[j][1]);
                    Y[1] = Math.max(Y[1], this.Data[s].data[j][1]);
                }
                j++;
            }
            // If value in range
            if (this.Data[s].data[i][0] < coord.x && this.Data[s].data[i+1]){
                intersection[s] = PlotJS.util.range_project(
                    [this.Data[s].data[i][1], this.Data[s].data[i+1][1]],
                    [this.Data[s].data[i][0], this.Data[s].data[i+1][0]],
                    coord.x
                );
            }
            // If value equals point
            else if (this.Data[s].data[i][0] == coord.x){
                intersection[s] = this.Data[s].data[i][1];
            }
            // Get canvas_y
            if(Y){
                var canvas_y_min = PlotJS.util.range_project(this.area.plot.Y, this.Data[s].PlotJS[this.ID].Y || this.viewport.Y, Y[0]),
                    canvas_y_max = PlotJS.util.range_project(this.area.plot.Y, this.Data[s].PlotJS[this.ID].Y || this.viewport.Y, Y[1]),
                    effective_distance  = Math.abs(coord.y - (canvas_y_min + canvas_y_max)/2),
                    half_range_distance = Math.abs(canvas_y_max - canvas_y_min)/2; 
                if (effective_distance <= max_distence + half_range_distance
                    && (current_closest_distance > effective_distance
                    || current_closest_distance == undefined)
                    ){
                    current_closest_distance = effective_distance;
                    magnify.series = s;
                }
            }
        }
    }
    if (magnify.series){
        return [intersection, magnify];
    }
    // then: find corredponding rule, if any.
    var coff = this.config.plot.rule_magnify_coff,
        current_closest_distance = undefined;
    for (var r in this.viewport.rules){
        var rule = this.viewport.rules[r];
        if (PlotJS.util.in_range(this.viewport.X, rule.coord_x)){
            // run set_ctx to retrive coresponding line width
            this.set_ctx([
                this.theme.rule,
                rule
            ]);
            var range_len = this.ctx.lineWidth
                            * coff
                            * PlotJS.util.range_length(this.viewport.X)
                            / PlotJS.util.range_length(this.area.plot.X),
                range = [rule.coord_x - range_len, rule.coord_x + range_len];
            if (Math.abs(rule.coord_x - coord.x) <= range_len
            && (current_closest_distance > Math.abs(rule.coord_x - coord.x)
            || current_closest_distance == undefined)
            ){
                current_closest_distance = Math.abs(rule.coord_x - coord.x);
                magnify.rule = r;
                magnify.series = undefined;
            }
        }
    }
    return [intersection, magnify];
}

Plot.prototype.debug_rect = function(range){
    this.set_ctx([this.theme.debug]);
    this.ctx.strokeRect(range.X[0], range.Y[0], range.X[1] - range.X[0], range.Y[1] - range.Y[0]);
}