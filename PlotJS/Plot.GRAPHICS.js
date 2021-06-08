/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 * 
 *  ------------------------------------------------------ */

/**
 * Create and update canvas content immediately.
 */
Plot.prototype.draw = function(){
    // Clear entire canvas before proceeding
    this.clear()
    // Allocate draw areas
    this.allocate_area();
    // draw series
    this.draw_series();
    // draw series
    this.draw_rules();
    // draw series
    this.draw_guideline();
    // draw tickmarks
    this.draw_tickmark();
    // draw navigation bar
    this.draw_navi();
    // draw series
    this.draw_cursor();
    // debug
    if (this.$debug) this.draw_debug_info();
}

Plot.prototype.clear = function(){
    if (
        (this.DPI_Scale(this.canvas.offsetWidth) != this.canvas.width)
        ||
        (this.DPI_Scale(this.canvas.offsetHeight) != this.canvas.height)
    ){
        this.canvas.width = this.DPI_Scale(this.canvas.offsetWidth);
        this.canvas.height = this.DPI_Scale(this.canvas.offsetHeight);
    }
    else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

Plot.prototype.draw_cursor = function(){
    this.canvas.style.cursor = this.viewport.cursor.style;
    this.draw_text(
        this.viewport.cursor.hint,
        this.viewport.cursor,
        this.set_ctx([this.theme.cursor])
    )
}

Plot.prototype.draw_series = function(){
    var cof = {
        x:{
            source: this.viewport.X,
            target: this.area.plot.X
        },
        y:{
            source: undefined,
            target: this.area.plot.Y
        }
    }
    for (var s in this.Data){
        var ptr = 0;
        if (this.Data[s].PlotJS[this.ID].display !== false){
            // Determine display style
            var status = "normal";
            // If current series has been selected.
            if (s in this.viewport.selected.series){
                status = this.viewport.cursor.down && this.viewport.cursor.down.drag ? "drag" : "selected";
            }
            // If current series line is being hovered (means focused)
            else if (s == this.viewport.cursor.magnify.series){
                if (this.viewport.cursor.down)
                    if (this.viewport.cursor.down.drag){
                        status = "drag";
                    }
                    else{
                        status = "down";
                    }
                else{
                    status = "hover";
                }
            }
            // If current series is not being hovered.
            else{
                // If cursor is dragging on another UNSELECTED element.
                if (
                    !Object.keys(this.viewport.selected.series).length &&
                    this.viewport.cursor.down &&
                    this.viewport.cursor.magnify.series
                ){
                    status = "drag";
                }
                // Finally, if focus is on something else.
                else if (
                    this.viewport.cursor.magnify.series ||
                    Object.keys(this.viewport.selected.series).length
                ){
                    status = "dashed";
                }
            }
            this.Data[s].PlotJS[this.ID].status = status;
            if (this.$debug) this.$debug.push(s + " " + status);
            this.set_ctx([
                this.theme.series,
                this.Data[s],
                this.theme.series[status],
            ])
            // Calculate drag offset, if in a drag event.
            var drag_offest = 0;
            if (status == "drag"){
                var starting_y = PlotJS.util.range_project(this.Data[s].PlotJS[this.ID].Y || this.viewport.Y , this.area.plot.Y, this.viewport.cursor.down.y),
                    draging_y  = PlotJS.util.range_project(this.Data[s].PlotJS[this.ID].Y || this.viewport.Y , this.area.plot.Y, this.viewport.cursor.y);
                drag_offest = draging_y - starting_y;
            }
            // Do the real work.
            cof.y.source = this.Data[s].PlotJS[this.ID].Y || this.viewport.Y;
            while (this.Data[s].data[ptr + 1] != undefined && this.Data[s].data[ptr + 1][0] <= this.viewport.X[0]){
                ptr++;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(...PlotJS.util.range_project2d(cof, [this.Data[s].data[ptr][0], this.Data[s].data[ptr][1] + drag_offest]));
            while (this.Data[s].data[++ptr] && this.Data[s].data[ptr - 1][0] <= this.viewport.X[1]){
                this.ctx.lineTo(...PlotJS.util.range_project2d(cof, [this.Data[s].data[ptr][0], this.Data[s].data[ptr][1] + drag_offest]));
            }
            this.ctx.stroke();
        }
    }
}

Plot.prototype.draw_navi = function(){
    // Current Plotting Area
    var area = this.area.navi;
    // Backdrop filter
    this.alpha_cover(area, this.theme.navi.backdrop);
}

Plot.prototype.draw_tickmark = function(){
    // Current Plotting Area
    var area = this.area.axis,
        ticks = this.config.tick.major_rule_ticks,
        max_allowed_ticks = PlotJS.util.range_length(area.X) / this.DPI_Scale(this.config.tick.min_rule_distance),
        min_tick_distance = PlotJS.util.range_length(this.viewport.X)/max_allowed_ticks,
        unit_index = 0;
    // Backdrop filter
    this.alpha_cover(area, this.theme.tick.backdrop);
    // Find suitable unit base
    while (
        this.config.axis.unit_scale[unit_index+1] != undefined
        &&
        this.config.axis.unit_scale[unit_index] >= min_tick_distance * ticks
    ){
        unit_index++;
    }
    var unit_scale = this.config.axis.unit_scale[unit_index],
        unit_name = this.config.axis.unit_name[unit_index],
        minor_tick_step = unit_scale * Math.ceil(ticks * min_tick_distance / unit_scale) / ticks,
        major_tick_counter = -1,
        first_tick = Math.ceil(this.viewport.X[0]/minor_tick_step) - ticks,
        last_tick = Math.floor(this.viewport.X[1]/minor_tick_step) + ticks,
        first_major_tick = ticks * (Math.ceil(this.viewport.X[0]/(ticks * minor_tick_step)) - 1),
        tick = first_tick;
    // Draw horizontal axis line
    this.set_ctx([this.theme.tick, this.theme.tick.horizontal_line]);
    this.line(area.X[0], area.Y[1], area.X[1], area.Y[1]);
    
    while (tick <= last_tick){
        var tick_position = tick * minor_tick_step,
            tick_coordinate = PlotJS.util.range_project(area.X, this.viewport.X, tick_position),
            tick_height = 0;
        if (first_major_tick == tick){
            major_tick_counter = 0;
        }
        if (major_tick_counter == 0){
            // major tick (text)
            this.draw_text(
                [
                    {
                        str: Math.round(tick_position / unit_scale).toString(),
                        style: this.set_ctx([this.theme.tick, this.theme.tick.primary_text])
                    },
                    {
                        str: unit_name + this.config.axis.general_unit,
                        style: this.set_ctx([this.theme.tick, this.theme.tick.sub_text])
                    }
                ],
                {x: tick_position, y:area.Y[1]},
                this.set_ctx([this.theme.tick])
            )
            // major tick
            this.set_ctx([this.theme.tick, this.theme.tick.major]);
            tick_height = this.theme.tick.major.height;
            major_tick_counter = ticks - 1;
        }
        else if (major_tick_counter == ticks/2){
            // half_major(sub) tick
            this.set_ctx([this.theme.tick, this.theme.tick.sub]);
            tick_height = this.theme.tick.sub.height;
            major_tick_counter --;
        }
        else{
            // minor tick
            this.set_ctx([this.theme.tick, this.theme.tick.minor]);
            tick_height = this.theme.tick.minor.height;
            if (major_tick_counter > 0){
                major_tick_counter --;
            }
        }
        this.line(
            tick_coordinate, area.Y[1],
            tick_coordinate, area.Y[1] - this.DPI_Scale(tick_height)
        );
        tick ++;
    }
}

Plot.prototype.draw_rules = function(){
    for (var rule in this.viewport.rules){
        // Draw rules
        var coord_x = this.viewport.rules[rule].coord_x;
        if (coord_x >= this.viewport.X[0] && coord_x <= this.viewport.X[1]){
            var theme = [this.theme.rule],
                drag_offest = 0;
            if (rule in this.viewport.selected.rules){
                theme.push(this.theme.rule.selected);
            }
            if (this.viewport.cursor.focus_area == "plot"){
                // hover
                if (rule == this.viewport.cursor.magnify.rule){
                    theme.push(this.theme.rule.hover);
                }

                // down
                if (
                    this.viewport.cursor.down
                &&  rule == this.viewport.cursor.magnify.rule
                ){
                    theme.push(this.theme.rule.down);
                }

                // drag
                if (
                    this.viewport.cursor.down && this.viewport.cursor.down.drag && this.viewport.cursor.magnify.rule
                && (rule == this.viewport.cursor.magnify.rule || rule in this.viewport.selected.rules)
                ){
                    theme.push(this.theme.rule.drag);
                    drag_offest += this.viewport.cursor.x - this.viewport.cursor.down.x;
                }
            }
            theme = this.set_ctx([...theme, this.viewport.rules[rule]]);
            var canvas_coord_x = PlotJS.util.range_project(this.area.plot.X, this.viewport.X, coord_x + drag_offest);
            this.line(
                canvas_coord_x, this.area.plot.Y[0],
                canvas_coord_x, this.area.plot.Y[1]
            );
            // Draw rule text
			label = ("label" in this.viewport.rules[rule] && this.viewport.rules[rule].label) || rule;
            var display_coord_x = (coord_x + drag_offest).toString();
            this.draw_text(
                this.theme.rule.show_value && [label, display_coord_x] || [label],
                {x: coord_x + drag_offest, y: this.area.plot.Y[0] - this.DPI_Scale(Math.max(this.theme.tick.major.height, 0))},
                this.set_ctx(theme)
            );
            this.dispatchEvent("onRuleDraw", rule, coord_x + drag_offest);
        }
    }
}

Plot.prototype.draw_guideline = function(){
    // If cursor is in plot area
    if (this.viewport.cursor.focus_area == "plot"){
        var coord_x = this.viewport.cursor.down ? this.viewport.cursor.down.x : this.viewport.cursor.x;
        if (this.viewport.cursor.magnify.rule) coord_x = this.viewport.rules[this.viewport.cursor.magnify.rule].coord_x;
        // If cursor is NOT magnified to a rule: draw vertical guideline
        if (!this.viewport.cursor.magnify.rule){
            // Draw cursor guideline
            var theme = [this.theme.guideline];
            if (this.viewport.cursor.down){
                if (this.viewport.cursor.down.drag){
                    // Drag
                    theme.push(this.theme.guideline.drag);
                }
                else{
                    // Pressed Down
                    theme.push(this.theme.guideline.down);
                }
            }
            else{
                // Hover
                theme.push(this.theme.guideline.hover);
            }
            theme = this.set_ctx(theme);
            this.line(
                PlotJS.util.range_project(this.area.plot.X, this.viewport.X, coord_x), this.area.plot.Y[0],
                PlotJS.util.range_project(this.area.plot.X, this.viewport.X, coord_x), this.area.plot.Y[1]
            )
            // Draw guideline text
            var display_coord_x = coord_x.toString();
            this.draw_text(
                [display_coord_x],
                {x: coord_x, y: this.area.plot.Y[0] - this.DPI_Scale(this.theme.tick.major.height)},
                theme
            )
        }
        // Draw horizontal guidelines, if any.
        for (var s in this.viewport.cursor.intersection){
            if (
                this.Data[s].PlotJS[this.ID].status == "selected" ||
                // this.Data[s].PlotJS[this.ID].status == "normal"   ||
                this.Data[s].PlotJS[this.ID].status == "drag"     ||
                this.Data[s].PlotJS[this.ID].status == "down"     ||
                this.Data[s].PlotJS[this.ID].status == "hover"
            ){
                // Coordinates of current working intersection point.
                var coord = this.series_to_canvas(
                        this.viewport.cursor.x,
                        this.viewport.cursor.intersection[s],
                        s
                    ),
                    theme = [
                        this.theme.guideline,
                        this.Data[s],
                        this.theme.guideline.horizontal
                    ];
                // Render vertical drag offset
                coord.y += this.viewport.cursor.down  && this.viewport.cursor.down.drag && this.viewport.cursor.magnify.series ? 
                        this.viewport.cursor.y - this.viewport.cursor.down.y :
                        0;
                // Render horizontal drag offest
                if (
                    this.viewport.cursor.down && this.viewport.cursor.down.drag && this.viewport.cursor.magnify.rule
                ){
                    coord_x = this.viewport.rules[this.viewport.cursor.magnify.rule].coord_x + this.viewport.cursor.x - this.viewport.cursor.down.x;
                }
                this.set_ctx(theme);
                this.line(
                    this.area.plot.X[0], coord.y,
                    this.area.plot.X[1], coord.y
                );
                this.draw_text(
                    [s, this.viewport.cursor.intersection[s].toString() + ("unit" in this.Data[s] ? this.Data[s].unit : "")],
                    {x: coord_x, y: coord.y},
                    this.set_ctx(theme)
                )
            }
        }
    }
}

Plot.prototype.draw_debug_info = function(){
    this.$debug.push("Cursor" + JSON.stringify(
        {
            x: this.viewport.cursor.x,
            y: this.viewport.cursor.y,
        }
    ));
    this.$debug.push("down: " + JSON.stringify(this.viewport.cursor.down));
    this.$debug.push(JSON.stringify(this.viewport.cursor.magnify));
    this.$debug.push("Selected Rules: " + Object.keys(this.viewport.selected.rules).join(', '));
    this.$debug.push("Selected Series: " + Object.keys(this.viewport.selected.series).join(', '));
    // this.$debug.push("Intersection: " + JSON.stringify(this.viewport.cursor.intersection));
    // this.$debug.push("Select: " + JSON.stringify(this.viewport.cursor.select));
    // this.$debug.push("H_Range: " + JSON.stringify(this.viewport.X));
    // this.$debug.push("<D>H_Range: " + JSON.stringify(this.viewport.cursor.down_range));
    // this.$debug.push("Position: " + JSON.stringify(this.viewport.cursor.position));
    // this.$debug.push("<D>Position: " + JSON.stringify(this.viewport.cursor.down_position));
    for (var s in this.Data){
        this.$debug.push(
            "Data <" + s + "> " + this.Data[s].PlotJS[this.ID].status
        )
    }
    this.draw_text(
        this.$debug,
        // leave coordinates empty to enable auto float.
        {},
        this.set_ctx([{
            $color:"gray",
            $font_size:"1em",
            $typesetting:{
                $_baseline:"top",
                $_floatArea:"plot"
            }
        }])
    );
    this.$debug = ["","<DEBUG MODE>"];
    if (this.viewport.cursor != undefined && this.viewport.cursor.down){
        var coord1 = PlotJS.util.xy(this.viewport.cursor.down),
            coord2 = PlotJS.util.xy(this.viewport.cursor);
        // pinpoint to original position.
        coord1.x = PlotJS.util.range_project(this.area.plot.X, this.viewport.cursor.down.X, coord1.x);
        // If dragging the axis:
        if (!this.viewport.cursor.magnify.rule && !this.viewport.cursor.magnify.series)
            coord2.x = (PlotJS.util.range_project(this.area.plot.X, this.viewport.X, coord2.x) + coord1.x) / 2;
        // If dragging on elements 
        else
            coord2.x = PlotJS.util.range_project(this.area.plot.X, this.viewport.X, coord2.x);
        this.set_ctx([]);
        if (this.viewport.cursor.down.drag)
            this.line(
                coord1.x, coord1.y,
                coord2.x, coord2.y,
                {$lineTip: {
                    $_fill: true,
                    $_circle: 5.0
                }},
                {$lineTip: {
                    $_fill  : true,
                    $_triangle: 5.0
                }},
            )
        else
            this.line(
                coord1.x, coord1.y,
                coord2.x, coord2.y
            )
    }
    // this.debug_rect(this.area.plot);
    // this.debug_rect(this.area.axis);
    // this.debug_rect(this.area.navi);
}

/**
 * L2: draw text
 * @param lines [{str:<string>, style?: [<object>]}] || [<string>] 
 * @param coord {x:<number>, y:<number>, canvas_x?:numbet} - NOTE: in plot coordinates.
 * @param theme {} - This is ONLY used for $typesetting.
 */
Plot.prototype.draw_text = function(
        lines, coord = {},
        // If coord.x/coord.y is left blank,
        // text will float to edge.
        // coord may have plot_coord_x, this will overwrite coord.x
        theme = this.theme.default
        // theme is expected to be the return value of set_ctx()
    ){
    // If lines have no specific style, the style set before entering draw_text()
    // will be applied to it.
    this.ctx.save();
    // Isolate sensitive objects.
    coord = Object.assign({},coord);
    lines = Object.assign({},lines);
    // Find float solution and locate coord to starting point.
    var align;
    [coord, align] = PlotJS.util.locate_text(
        coord,
        // size
        this.text_size(lines, theme),
        theme.$typesetting.$_baseline,
        theme.$typesetting.$_align,
        // area
        theme.$typesetting.$_floatArea ? this.area[theme.$typesetting.$_floatArea] : undefined,
        this
    );
    // baseline will always be treated as "top".
    var margin_above = 0;
    for (var i in lines){
        let line_theme = [theme, theme.$typesetting];
        if (typeof(lines[i]) == "string") lines[i] = {str: lines[i]};
        if (!('str' in lines[i])) lines[i].str = "";
        // Get line-specific themes.
        if ("style" in lines[i]){
            line_theme.push(lines[i].style);
        }
        // Set ctx, and convert line_theme form array to cs_object
        line_theme = this.set_ctx(line_theme);
        // Pick out margin settings from finally applied theme.
        var margin = this.DPI_Scale(line_theme.$typesetting.$_margin),
            offset_x = 0;
        // Set offset_x
        if (align == "left")  offset_x =  margin;
        if (align == "right") offset_x = -margin;
        // Caculate margin-involved coord.y
        coord.y += Math.max(margin, margin_above);
        // Force override text placement arguments, because we have already
        // moved the insertion cursor to left-top corner of the text box.
        this.ctx.textBaseline = "top";
        this.ctx.textAlign = align;
        // If this line requires a stroke.
        if (line_theme.$typesetting.$_stroke){
            // Stroke
            this.ctx.strokeText(
                lines[i].str,
                coord.x + offset_x,
                coord.y
            )
        }
        // If this line requires fill.
        if (line_theme.$typesetting.$_fill){
            // Fill text
            this.ctx.fillText(
                lines[i].str,
                coord.x + offset_x,
                coord.y
            )
        }
        // Calculate the bounding box height of current drawing line.
        var line_size = this.text_size(lines[i].str);
        // // Draw bounding box for debug
        if (this.$debug){
            let c_x = coord.x + offset_x;
            let c_y = coord.y;
            let box_X = [c_x - line_size.width/2, c_x + line_size.width/2];
            if (align == "left" ) box_X = [c_x, c_x + line_size.width];
            if (align == "right") box_X = [c_x - line_size.width, c_x];
            this.debug_rect({
                X: box_X,
                Y: [c_y, c_y + line_size.height]
            });
        }
        coord.y += line_size.height;
        margin_above = margin;
    }
}