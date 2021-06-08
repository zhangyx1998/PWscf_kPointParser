/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 *  This module defines the default mouse interactions, it
 *  will be loaded into callback tree of class Plot.
 *  ------------------------------------------------------ */

PlotJS.interactions = {
    onHover(plot, evt){
        // Reset cursor shape and hint text array.
        plot.viewport.cursor.style = "auto";
        plot.viewport.cursor.hint  = [];
        // If mouse hovers in plot area (plot.onFocus)
        if (plot.viewport.cursor.focus_area == "plot"){
            // Update magnified items and intersections
            [
                plot.viewport.cursor.intersection,
                plot.viewport.cursor.magnify
            ]
            =   plot.intersection(plot.viewport.cursor);
        }
        // If mouse Hovers over plot area
        if (plot.viewport.cursor.focus_area == "plot"){
            // If hovering on an element (e.g. series line or rule).
            if (plot.viewport.cursor.magnify.rule || plot.viewport.cursor.magnify.series){
                // If NOT ctrl-hover:
                if (!evt.ctrlKey){
                    // If hovering on a UNSELECTED element:
                    if (
                        !(plot.viewport.cursor.magnify.rule in plot.viewport.selected.rules) &&
                        !(plot.viewport.cursor.magnify.series in plot.viewport.selected.series)
                    ){
                        // Do nothing.
                    }
                    // If hovering on a SELECTED element:
                    else{
                        // Do nothing.
                    }
                }
                // If ctrl-hover on an element:
                else{
                    // Do nothing
                }
            }
            // If hovering on blank area.
            else{
                // If NOT ctrl-hover.
                if (!evt.ctrlKey){
                    // Do nothing
                }
                // If ctrl-press:
                else{
                    // Change cursor style to crosshair
                    plot.viewport.cursor.style = "crosshair";
                }
            }
        }
        // If mousedown in navigation bar (navi.onFocus)
        if (plot.viewport.cursor.focus_area == "navi"){
            // navigation bar can always be manipulated, with or without ctrlKey pressed.
            plot.viewport.cursor.style = "grab";
        }
    },
    onMouseDown(plot, evt){
        // If mouseDown inside plot area
        if (plot.viewport.cursor.focus_area == "plot"){
            // If pressing on an element (e.g. series line or rule).
            if (plot.viewport.cursor.magnify.rule || plot.viewport.cursor.magnify.series){
                // If NOT ctrl-press:
                if (!evt.ctrlKey){
                    // If pressing on a UNSELECTED rule:
                    if ( plot.viewport.cursor.magnify.rule &&
                        !(plot.viewport.cursor.magnify.rule in plot.viewport.selected.rules)
                    ){
                        // Release all previous selections
                        plot.viewport.selected.rules  = {};
                    }
                    // If pressing on a UNSELECTED series:
                    else if ( plot.viewport.cursor.magnify.series &&
                        !(plot.viewport.cursor.magnify.series in plot.viewport.selected.series)
                    ){
                        // Release all previous selections
                        plot.viewport.selected.series = {};
                    }
                    // If pressing on a SELECTED element:
                    else{
                        // @drag: drag all selected elements
                        // @click: deselect element
                    }
                }
                // If ctrl-press on an element:
                else{
                    // @ctrl-drag: clear "magnify". User may be trying to cancel a click action. 
                    // @ctrl-click: add/remove selection
                }
            }
            // If pressing on blank area.
            else{
                // If NOT ctrl-press.
                if (!evt.ctrlKey){
                    // @drag: drag the entire plot(x).
                    // @click: do nothing.
                }
                // If ctrl-press:
                else{
                    // @ctrl-drag: initiate a x_range selection. Not implemented yet.
                    // @ctrl-click: insert/remove a rule.
                    plot.viewport.cursor.style = "crosshair";
                }
            }
        }
        // If mousedown in navigation bar (navi.onFocus)
        if (plot.viewport.cursor.focus_area == "navi"){
            // navigation bar can always be manipulated, with or without ctrlKey pressed.
            plot.viewport.cursor.style = "grabbing";
        }
    },
    onDrag(plot, evt){
        var delta = {
                x: plot.viewport.cursor.x - plot.viewport.cursor.down.x, // in plot coordinate
                y: plot.viewport.cursor.y - plot.viewport.cursor.down.y  // in canvas coordinate
            };
        // If dragging was started in plot area
        if (plot.viewport.cursor.focus_area == "plot"){
            // If dragging on an element (e.g. series line or rule).
            if (plot.viewport.cursor.magnify.rule || plot.viewport.cursor.magnify.series){
                // If NOT ctrl-drag:
                if (!evt.ctrlKey){
                    // If dragging on rule:
                    if (plot.viewport.cursor.magnify.rule){
                        // The drag is rendered by draw_rules()
                        // @onMouseUp: apply drag offset to the actual element.
                            // Update intersections only
                            [
                                plot.viewport.cursor.intersection
                            ]
                            =   plot.intersection(plot.viewport.cursor);
                    }
                    // If dragging on series:
                    else {
                        // Do nothing, the drag is rendered by draw_series()
                        // @onMouseUp: apply drag offset to the actual element.
                    }
                }
                // If ctrl-drag on an element:
                else{
                    plot.viewport.cursor.magnify.rule = undefined;
                    plot.viewport.cursor.magnify.series = undefined;
                }
            }
            // If dragging on blank area.
            else{
                // If NOT ctrl-drag.
                if (!evt.ctrlKey){
                    // If this drag was initiated with x range selection,
                    // which means user releases ctrl-key during drag
                    if (plot.viewport.cursor.selection_x){
                        // Set the later of range to NaN, this will cause the selection
                        // to disappear, but if user press ctrl before drag ends, the
                        // selection will appear again. 
                        plot.viewport.cursor.selection.X[1] = NaN;
                    }
                    // If this drag was originally on blank plot area.
                    else{
                        // Manipulate viewport.X to emulate drag effects.
                        plot.viewport.X = [
                            plot.viewport.cursor.down.X[0] - delta.x,
                            plot.viewport.cursor.down.X[1] - delta.x
                        ]
                    }
                }
                // If ctrl-drag:
                else{
                    // If this drag event is initiated by x selection.
                    if (plot.viewport.cursor.selection_x){
                        // Keep cursor style as crosshair.
                        plot.viewport.cursor.style = "crosshair";
                        // Update selecton_x
                        plot.viewport.cursor.selection.X[1] = plot.viewport.cursor.x;
                    }
                    // If this drag event is NOT initiaed by x selection,
                    // e.g. user presses ctrl key during drag, or control-drag on an
                    // element which causes loss of focus.
                    else{
                        // Do nothing for the second case.
                    }
                }
            }
        }
        // If drag on navigation bar (navi.onFocus)
        if (plot.viewport.cursor.focus_area == "navi"){
            // navigation bar can always be manipulated, with or without ctrlKey pressed.
            plot.viewport.cursor.style = "grabbing";
            // drag behaviors have not yet been implemented.
        }
    },
    onMouseUp(plot, evt){
        var delta = {
                x: plot.viewport.cursor.x - plot.viewport.cursor.down.x, // in plot coordinate
                y: plot.viewport.cursor.y - plot.viewport.cursor.down.y  // in canvas coordinate
            };
        // If mouseUp inside plot area
        if (plot.viewport.cursor.focus_area == "plot"){
            // Since ctrl-drag on an element will be auto released, if "magnify" is not empty,
            // this can only be a click event.
            // If mouseUp => click on an element (e.g. series line or rule).
            if (plot.viewport.cursor.magnify.rule || plot.viewport.cursor.magnify.series){
                // If drag on one or more element(s):
                if (plot.viewport.cursor.down.drag){
                    // Apply Drag offset.
                    // If drag on a rule.
                    if (plot.viewport.cursor.magnify.rule){
                        var rule = plot.viewport.cursor.magnify.rule;
                        if (!(rule in plot.viewport.selected.rules)){
                            plot.viewport.rules[rule].coord_x += delta.x;
                        }
                        for (rule in plot.viewport.selected.rules){
                            plot.viewport.rules[rule].coord_x += delta.x;
                        }
                    }
                    // If drag on a series.
                    if (plot.viewport.cursor.magnify.series){
                        var series = plot.viewport.cursor.magnify.series;
                        if (!(series in plot.viewport.selected.series)){
                            var delta_y = delta.y
                                               * PlotJS.util.range_length(plot.Data[series].PlotJS[plot.ID].Y || plot.viewport.Y)
                                               / PlotJS.util.range_length(plot.area.plot.Y);
                            if (!plot.Data[series].PlotJS[plot.ID].Y) plot.Data[series].PlotJS[plot.ID].Y = plot.viewport.Y;
                            plot.Data[series].PlotJS[plot.ID].Y[0] += delta_y;
                            plot.Data[series].PlotJS[plot.ID].Y[1] += delta_y;
                        }
                        for (series in plot.viewport.selected.series){
                            var delta_y = delta.y
                                               * PlotJS.util.range_length(plot.Data[series].PlotJS[plot.ID].Y || plot.viewport.Y)
                                               / PlotJS.util.range_length(plot.area.plot.Y);
                            if (!plot.Data[series].PlotJS[plot.ID].Y) plot.Data[series].PlotJS[plot.ID].Y = plot.viewport.Y;
                            plot.Data[series].PlotJS[plot.ID].Y[0] += delta_y;
                            plot.Data[series].PlotJS[plot.ID].Y[1] += delta_y;
                        }
                    }
                }
                // If click on an element:
                else{
                    // If clicked WITHOUT ctrlKey
                    if (!evt.ctrlKey){
                        // Make selection.
                        if (plot.viewport.cursor.magnify.series){
                            plot.viewport.selected.series ={};
                            plot.viewport.selected.series[plot.viewport.cursor.magnify.series] = 
                            plot.Data[plot.viewport.cursor.magnify.series];
                        }
                        if (plot.viewport.cursor.magnify.rule){
                            plot.viewport.selected.rules ={};
                            plot.viewport.selected.rules[plot.viewport.cursor.magnify.rule] =
                            plot.viewport.rules[plot.viewport.cursor.magnify.rule];
                        }
                    }
                    // If ctrl-click on an element:
                    else{
                        // If ctrl-click on a UNSELECTED series:
                        if (plot.viewport.cursor.magnify.series && !(plot.viewport.cursor.magnify.series in plot.viewport.selected.series)){
                            // Make selection.
                            plot.viewport.selected.series[plot.viewport.cursor.magnify.series] = 
                            plot.Data[plot.viewport.cursor.magnify.series];
                        }
                        // If ctrl-click on a UNSELECTED rule:
                        else if (plot.viewport.cursor.magnify.rule && !(plot.viewport.cursor.magnify.rule in plot.viewport.selected.rules)){
                            // Make selection.
                            plot.viewport.selected.rules[plot.viewport.cursor.magnify.rule] =
                            plot.viewport.rules[plot.viewport.cursor.magnify.rule];
                        }
                        // If ctrl-click on a SELECTED element:
                        else{
                            // Withdraw selection.
                            if (plot.viewport.cursor.magnify.rule){
                                delete plot.viewport.selected.series[plot.viewport.cursor.magnify.series];
                            }
                            if (plot.viewport.cursor.magnify.rule){
                                delete plot.viewport.selected.rules[plot.viewport.cursor.magnify.rule];
                            }
                        }
                    }
                }
            }
            // If mouseUp on blank area.
            else{
                // If this is the end of a click (onClick on plot blank)
                if (!plot.viewport.cursor.down.drag){
                    // If NOT ctrl-click.
                    if (!evt.ctrlKey){
                        // Release all selected elements
                        plot.viewport.selected.series = {};
                        plot.viewport.selected.rules = {};
                    }
                    // If ctrl-click on blank area of the plot:
                    else{
                        // Insert a new rule.
                        var rule = {
                                coord_x     : plot.viewport.cursor.x,
                                intersection: plot.viewport.cursor.intersection
                            },
                            rule_name = "Rule " + plot.viewport.cursor.x.toString();
                        // Resolve potential name collisions
                        while (plot.viewport.rules[rule_name])
                            rule_name = "$" + rule_name;
                        // Insert rule to viewport.rules
                        plot.viewport.rules[rule_name] = rule;
                        // Make it selected
                        plot.viewport.selected.rules[rule_name] = rule;
                    }
                }
            }
        }
        // If mouseUp in navigation bar (navi.onFocus)
        if (plot.viewport.cursor.focus_area == "navi"){
            // Do nothing.
        }
    },
    onScroll(plot, evt){
        // If cursor is NOT clicking/dragging while scrolling.
        if (!plot.viewport.cursor.down){
            if (evt.ctrlKey){
                // plot.zoom_x(plot.config.plot.scroll_ratio_x ** evt.deltaX)
                plot.zoom_y(plot.config.plot.scroll_ratio_y ** evt.deltaY)
            }
            else {
                plot.zoom_x(plot.config.plot.scroll_ratio_x ** evt.deltaY)
                // plot.zoom_y(plot.config.plot.scroll_ratio_y ** evt.deltaX)
            }
        }
        // If cursor is clicking/dragging while scrolling.
        else{
            // Do nothing.
        }
        plot.update_cursor_position(evt);
    },
    onKeyDown(plot, evt){
        // Backspace
        if (
            evt.key == "Backspace" || evt.code=="Backspace" ||
            evt.key == "Delete" || evt.code=="Delete"
        ){
            for (var rule in plot.viewport.selected.rules){
                delete plot.viewport.selected.rules[rule];
                delete plot.viewport.rules[rule];
            }
            if (
                Object.keys(plot.viewport.selected.rules).length
                &&
                confirm(`Delete data series ${Object.keys(plot.viewport.selected.rules).join(', ')} from current working space?`)){
                    for (var series in plot.viewport.selected.series){
                        delete plot.viewport.selected.series[series];
                        delete plot.Data[series];
                    }
            }
        }
        plot.draw();
    }
}