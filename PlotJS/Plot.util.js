/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 *  This module defines static external methods for Plot.
 *  Functions exported from this module will NOT be plugged
 *  into the prototype of class Plot. They will ONLY be
 *  called as external methods.
 *  ------------------------------------------------------ */

/**
 * Assembles all prototype methods from the 
 */
PlotJS.util.assembly = function(CLASS){
    for (var i = 1; i < arguments.length; i++){
        for (var m in arguments[i]){
            if (typeof(arguments[i][m]) == "function"){
                CLASS.prototype[m] = arguments[i][m];
            }
        }
    }
}

PlotJS.util.apply_config = function(target, source){
    // In case the node reaches its end, which means everything is static.
    if (
        (typeof(target) != "object" || target == null) &&
        (target == undefined || typeof(target) == typeof(source))
    ){
        // In case of template is empty or has a static value.
        return source ? JSON.parse(JSON.stringify(source)) : source;
    }
    else if(typeof(source) != "object"){
        // If target is an object while source is a static value,
        // do nothing.
        return target ? JSON.parse(JSON.stringify(target)) : target;
    }
    else{
        // Otherwise, both template and target is an object or array.
        if (Array.isArray(target) && Array.isArray(source)){
            // source overwrites target.
            clone = []
            for (var node in source){
                clone.push(PlotJS.util.apply_config(source[node]));
            }
            return clone;
        }
        else{
            var clone = {};
            for (var node in target){
                if (node in source){
                    clone[node] = PlotJS.util.apply_config(target[node], source[node]);
                }
                else {
                    // if target do not have node element, use source's own node.
                    clone[node] = PlotJS.util.apply_config(target[node], target[node]);
                }
            }
            // The type of return format (Object/Array) is same as the template.
            return (
                Array.isArray(target) ?
                Object.keys(clone).map((key) => clone[key]) :
                clone
            )
        }
    }
}

/**
 * Pick out x and y entries from given coord object.
 * Returns a new object conatining only x and y.
 * This function does NOT check the data type of x/y.
 * @param {*} coord 
 */
PlotJS.util.xy = function(coord){
    if ('x' in coord && 'y' in coord){
        return {x: coord.x, y:coord.y}
    }
    else{
        console.exception("coordinate x or y not specified");
        return {x: NaN, y:NaN}
    }
}

PlotJS.util.range_length = function(range){
    return Math.abs(range[1] - range[0]);
}

PlotJS.util.range_project = function(target,source,point){
    if (source[0] == source[1]){
        console.exception("range_project() must have a range that is greater than 0");
        return NaN;
    }
    var ratio = (point - source[0])/(source[1] - source[0]);
    return target[0] + ratio * (target[1] - target[0]);
}

PlotJS.util.range_project2d = function(cof, coord){
    if (Array.isArray(coord)){
        return [
            PlotJS.util.range_project(cof.x.target,cof.x.source,coord[0]),
            PlotJS.util.range_project(cof.y.target,cof.y.source,coord[1])
        ]
    }
    else if (typeof(coord) == "object"){
        return {
            x : PlotJS.util.range_project(cof.x.target,cof.x.source,coord.x),
            y : PlotJS.util.range_project(cof.y.target,cof.y.source,coord.y)
        }
    }
    else {
        console.exception("input type error: expected object or array for 'coord'")
    }
    return NaN
}

PlotJS.util.near_int = function(x, err){
    while (x<-0.5) x++;
    while (x>0.5) x--;
    return Math.abs(x) <= err
}

// Accepts 1D or 2+D
PlotJS.util.in_range = function(range, x){
    if (typeof(x) == "object"){
        return PlotJS.util.in_range(range.X, x.x) && PlotJS.util.in_range(range.Y, x.y);
    }
    return (x >= Math.min(...range) && x <= Math.max(...range))
}

// Caculate the distance from point p to line segment ab(l)
PlotJS.util.pl_distance = function(p, a, b){
    var p_a = {
            x: a.x - p.x,
            y: a.y - p.y
        },
        p_b = {
            x: b.x - p.x,
            y: b.y - p.y
        },
        a_b = {
            x: b.x - a.x,
            y: b.y - a.y
        },
        pa_pb = p_a.x * p_b.x + p_a.y * p_b.y;
    if (pa_pb >= 0){
        // Distence to the line
        return 2 * (p.x * (a.y - b.y) + a.x * (b.y - p.y) + b.x * (p.y - a.y))
               / PlotJS.util.vec_length(a_b);
    }
    else {
        return Math.min(PlotJS.util.vec_length(p_a), PlotJS.util.vec_length(p_b));
    }
}

PlotJS.util.vec_length = function(vec){
    return Math.sqrt(vec.x**2 + vec.y**2);
}

PlotJS.util.scale_range = function(range, ratio){
    var center = (range[1] + range[0]) / 2,
        scope  = (range[1] - range[0]) / 2;
    return [
        center - scope * ratio,
        center + scope * ratio
    ]
}

PlotJS.util.locate_text = function(coord, size, baseline, align, area, plot){
    // If coord and area are both ambiguous.
    if (
        !area && ( 
        (!("x" in coord) || coord.x == undefined) ||
        (!("y" in coord) || coord.y == undefined) 
        )
    ){
        return console.exception("Cannot determine text position");
    }
    // Convert plot_x to canvas_x
    if (("x" in coord) && coord.x != undefined){
        coord.x = PlotJS.util.range_project(plot.area.plot.X, plot.viewport.X, coord.x);
    }
    if ("canvas_x" in coord){
        coord.x = coord.canvas_x;
    }
    // debug
    if (plot.$debug){
        plot.debug_rect({
            X: [coord.x, coord.x + size.width],
            Y: [coord.y, coord.y + size.height],
        })
    }
    if (area){
        // If x or y is not specified, float it to the
        // corners/sides of current plotting area
        if (!("x" in coord) || coord.x == undefined){
            switch (align){
                case "left":
                    coord.x = Math.min(...area.X);
                    break;
                case "center":
                    coord.x = (area.X[0] + area.X[1])/2;
                    break;
                case "right":
                    coord.x = Math.max(...area.X);
                    break;
                default:
                    coord.x = (area.X[0] + area.X[1])/2;
            }
        }
        if (!("y" in coord) || coord.y == undefined){
            switch (baseline){
                case "top":
                    coord.y = Math.min(...area.Y);
                    break;
                case "middle":
                    coord.y = (area.Y[0] + area.Y[1])/2;
                    break;
                case "bottom":
                    coord.y = Math.max(...area.Y);
                    break;
                default:
                    coord.y = (area.Y[0] + area.Y[1])/2;
            }
        }
        // Find float solution
        if (
            baseline == "bottom" 
            && Math.min(...area.Y) > coord.y - size.height 
            && Math.max(...area.Y) >= coord.y + size.height
        ){
            baseline = "top"
        }
        else if (
            baseline == "top" 
            && Math.max(...area.Y) < coord.y + size.height 
            && Math.min(...area.Y) <= coord.y - size.height
        ){
            baseline = "bottom"
        }
        if (
            align == "right" 
            && Math.min(...area.X) > coord.x - size.width 
            && Math.max(...area.X) >= coord.x + size.width
        ){
            align = "left"
        }
        else if (
            align == "left" 
            && Math.max(...area.X) < coord.x + size.width 
            && Math.min(...area.X) <= coord.x - size.width
        ){
            align = "right"
        }
    }
    // Change baseline to top and move insertion point accordingly.
    switch (baseline){
        case "bottom":
            coord.y -= size.height;
            break;
        case "middle":
            coord.y -= size.height / 2;
            break;
        default:
            break;
    }
    return [coord, align]
}

PlotJS.util.normalize = function(vec, length = 1){
    // If the input vector is zero.
    if (!vec[0] && !vec[1]) return [length, 0];
    // Normalize
    var vec_length = Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
    return [length * vec[0] / vec_length, length * vec[1] / vec_length];
}

PlotJS.util.rotate = function(vec, theta, unit = "rad"){
    if (unit == "deg"){
        theta = theta * Math.PI / 180;
    }
    return [
        vec[0] * Math.cos(theta) - vec[1] * Math.sin(theta),
        vec[0] * Math.sin(theta) + vec[1] * Math.cos(theta)
    ]
}

PlotJS.util.makeID = function(length = 8) {
    var result           = '';
    var charTable        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while ( length-- ) {
      result += charTable.charAt(Math.floor(Math.random() * charTable.length));
   }
   return result;
}