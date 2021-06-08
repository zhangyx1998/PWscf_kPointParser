/** --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 *  This module defines the default mouse interactions, it
 *  will be loaded into callback tree of class Plot.
 *  ------------------------------------------------------ */

// lower case x/y means the axis, and are single numbers.
// upper case X/Y means range of axis, and they are arrays of 2 numbers.
PlotJS.viewport = {
    X: [-50 ,  50],
    Y: [-1.2, 1.2],
    unit_scale: 1.0,
    unit_name : "",
    /**
     * @template {x:[0,1], y:[0,1]}
     * Note that both x and y are in plot coordinate.
     */
    full_data_range: undefined,
    cursor: {
            x: 0,
            y: 0,
            plot_x: 0,
            focus_area  : undefined,    // undefined | "plot" | "axis" | "navi",
            contextmenu : undefined,    // undefined | false | true,
            down        : undefined ,   
            // undefined | {x: <num>, y: <num>, X: [<num>, <num>], drag: <boolean>},
            intersection: {
            // Note that coord_y is in relation to each series' y-viewport
            // "series_name": <number> (coord_y),
            },
            magnify: {
                series  : undefined,   // undefined | <string>(name)
                rules   : undefined    // undefined | <string>(name)
            },
            // hint text, rendered at cursor position.
            hint:[],
            /**
             *  This is the selection made by ctrl-drag on blank area.
             *  This selection is cleared on next mouseDown within plot area.
             *  Undefined if no selection is made.
             */
            selection_x: undefined
        },
    selected: {
        rules   : {},   // {<object_name>:<object>}
        series  : {}    // {<object_name>:<object>}
        // rules have the priority
    },
    rules:{}
    // name: {  // default_name = "unnamed_" + coord_x.toString()
    //      coord_x: 0,
    //      color: "gray",
	//		label: undefined //optional
    //      intersection: undefined
    // }
}