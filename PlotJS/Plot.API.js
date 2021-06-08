/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 * 
 *  ------------------------------------------------------ */

/**
 * Load data serieses from given collections of data.
 * @param {*} data 
 */
Plot.prototype.loadData = function(data){
    for (var series in data){
        // If series name exists in <PlotJS_instance>.data
        if (series in this.Data){
            // If a series has already been loaded.
            if (this.Data[series]===data[series]){
                // Do nothing.
            }
            // If these two serieses are different
            else{
                console.exception(`Data series name conflict.Series "${series}" with different data already exists. Load aborted.`)
            }
        }
        // If the series name does not exist in current data object.
        else{
            // Insert plot-specific configurations into data.
            // If PlotJS entery is not found in data
            if (!("PlotJS" in data[series])){
                // Add entery
                data[series].PlotJS = {};
            }
            // If data[series] already have plot-specific params
            if (this.ID in data[series].PlotJS){
                // Link again to avoid possible confilcts.
                data[series].PlotJS[this.ID].instance = this;
            }
            // If data[series] has NOT been initialized by current PlotJS instance
            else{
                data[series].PlotJS[this.ID] = Object.assign({}, this.defaults.data);
            }
            // Make link
            this.Data[series] = data[series];
        }
    }
    this.draw();
}


Plot.prototype.fitViewport = function(){
	var x_lim = [undefined, undefined], y_lim = [undefined, undefined];
	for (var s in this.Data){
		this.Data[s].data.forEach(coords => {
			x_lim[0] = x_lim[0] === undefined ? coords[0] : Math.min(coords[0], x_lim[0]);
			y_lim[0] = y_lim[0] === undefined ? coords[1] : Math.min(coords[1], y_lim[0]);
			x_lim[1] = x_lim[1] === undefined ? coords[0] : Math.max(coords[0], x_lim[1]);
			y_lim[1] = y_lim[1] === undefined ? coords[1] : Math.max(coords[1], y_lim[1]);
		});
	}
	dy = y_lim[1] - y_lim[0];
	y_lim = [y_lim[0] - 0.1 * dy, y_lim[1] + 0.1 * dy];
	this.viewport.X = x_lim;
	this.viewport.Y = y_lim;
	this.viewport.full_data_range = {
		x: x_lim,
		y: y_lim
	}
    this.draw();
}

Plot.prototype.mouse_event_handler = function(evt){
    if(this.$debug) this.$debug.push(
          'ClientX: ' + evt.offsetX + ", "
        + "ClientY: " + evt.offsetY + "; "
        + "CanvasL: " + this.canvas.offsetLeft + ", "
        + "CanvasT: " + this.canvas.offsetTop + ";"
        );
    // If contextmenu is displayed, freeze the canvas, nothing updates.
    if (this.viewport.cursor.contextmenu) return;
    // Otherwise, enter the main logic.
    var cursor_area = this.focus_area(this.cursor_canvas_coord(evt));
    // this.viewport.cursor coordinates will be updated in any condition.
    this.update_cursor_position(evt);

    // If the cursor is being pressed. (onMouseDown)
    if (!this.viewport.cursor.down && (evt.buttons & 1)){
        // Update focus_area in this.viewport.cursor.
        this.viewport.cursor.focus_area = cursor_area;
        // Create and initialize cursor.down entry.
        this.viewport.cursor.down = {
            x: this.viewport.cursor.x,
            y: this.viewport.cursor.y,
            X: this.viewport.X,
            drag: false
        };
        this.dispatchEvent("onMouseDown", this, evt);
    }

    // If the cursor is being released. (onMouseUp)
    if (this.viewport.cursor.down && (evt.buttons ^ 1)){
        this.dispatchEvent("onMouseUp", this, evt);
        this.viewport.cursor.down = undefined;
    }

    // If the cursor is hovering OR cursor is outside canvas. (onMouseMove)
    if (!this.viewport.cursor.down || !cursor_area){
        // Update focus_area in this.viewport.cursor.
        this.viewport.cursor.focus_area = cursor_area;
        // focus_area will be locked otherwise (eg. when cursor is pressed/dragged).
        this.dispatchEvent("onHover", this, evt);
    }

    // Handle drag issues.
    if (this.viewport.cursor.down){
        var delta = {
                x: this.viewport.cursor.x - this.viewport.cursor.down.x,
                y: this.viewport.cursor.y - this.viewport.cursor.down.y
            };
        // If the cursor was previously staying in the drag_dead_zone.
        if (!this.viewport.cursor.down.drag){
            var canvas_delta_x = delta.x
                               * PlotJS.util.range_length(this.area.plot.X)
                               / PlotJS.util.range_length(this.viewport.X);
            if (
                (Math.abs(canvas_delta_x) > this.DPI_Scale(this.config.plot.drag_dead_zone)) ||
                (Math.abs(delta.y) > this.DPI_Scale(this.config.plot.drag_dead_zone))
            ){
                this.viewport.cursor.down.drag = true;
            }
        }
        // If the cursor is considered dragging
        if (this.viewport.cursor.down.drag){
            this.dispatchEvent("onDrag", this, evt);
        }
    }

    // Handle scroll
    if (evt.deltaX || evt.deltaY){
        this.dispatchEvent("onScroll", this, evt);
    }

    this.draw();
}

Plot.prototype.load_listener = function(target_elem = window){
    window.addEventListener("resize",()=>{this.draw()});
    target_elem.addEventListener("mousedown",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("mouseup",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("mouseenter",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("mouseleave",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("mousemove",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("wheel",(evt)=>{this.mouse_event_handler(evt)});
    target_elem.addEventListener("keydown",(evt)=>{this.dispatchEvent("onKeyDown", this, evt)});
    this.draw();
}

Plot.prototype.dispatchEvent = function(evt, ...args){
    for (var module in this.callback){
        if (evt in this.callback[module]){
            this.callback[module][evt](...args);
        }
    }
}