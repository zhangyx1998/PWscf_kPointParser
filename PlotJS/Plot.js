/*  --------------------------------------------------------
 *  PlotJS
 *  Version N/A
 *  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *                         LICENSING
 *  This is NOT a release version, no license is applicable.
 *  You're NOT permitted to publish, modify or distribute
 *  this copy of source code, unless explicitly permitted by
 *  its author (specified above).
 *  --------------------------------------------------------
 *                    Additional Statements
 *  This project WILL be eventually made open-source and
 *  publicly available at some future time point.
 *  That is, I have to make sure that the project's workspace
 *  file and its API protocol has come to a stable stage.
 *  Otherwise, the earliest users and developers will creat
 *  files and plugins that quickly become incompatible with
 *  later versions.
 *  --------------------------------------------------------
 *                        About PlotJS
 *  This is a JavaScript module that draws plot of give data
 *  on a HTML5 canvas.
 *
 *  >> Interactions and Plugins
 *  This module have implementations of UI interaction. It has
 *  a built-in event dispatch and catch mechanism, and have
 *  a default module "Plot.interaction.js" that takes care
 *  of basic interactions, e.g. drag plot, select elements.
 *  You can add your listener to a plot instance, please see
 *  line#81 for details.
 * 
 *  >> Themes and Configurations.
 *  You can create custom theme for your plot. To create a
 *  new theme, you can copy "Plot.default.theme.js" and make
 *  modifications. Custom themes, when loaded as runtime
 *  objects, can be applied to a plot instance by replacing
 *  its default "theme" entry. E.g. to apply theme "MyTheme"
 *  to plot instance "plot", you can use the following code:
 *  plot.theme = MyTheme;
 *  --------------------------------------------------------
 *  This is the main module of PlotJS,
 *  your import statement should point to this file.
 *  ------------------------------------------------------ */

// SHA/MD5 support from NodeJS Native API
// const crypto = require("crypto");

// Utility functions needed by class Plot
// import * as util      from "./Plot. PlotJS.util.js";

// Default parameters necessary for rendering.
// import {viewport}     from "./Plot.default.viewport.js";
// import {config}       from "./Plot.default.config.js";
// import {theme}        from "./Plot.default.theme.js";
// import {interactions} from "./Plot.interactions.js";
// import {data}         from "./Plot.default.data.js";
// Function components of class Plot
// import * as GRAPHICS  from "./Plot.GRAPHICS.js";
// import * as UTILITY from "./Plot.UTILITY.js";
// import * as API from "./Plot.API.js";

class Plot{
    $debug = undefined;
    /** Class Data
     * name: {
     *     data :[[x,y]...],
     *     unit : "V",
     *     scale: 1.00,
     *     PlotJS :{
     *         _instance_ID_:{<defaults.data>}
     *     },
     *     // MEASUREMENTS - updated on data refresh or change of parameters.
     *     measurements:{
     *         _default_measurements_:{
     *             displayName: "Basic properties",
     *             X: [0, 1],
     *             Y: [0, 3]
     *         },
     *     },
     *     // If data is managed by a generator object,
     *     // "generator should point to its instance"
     *     generator: undefined
     * }
     */
    Data   = {};
    // initialize crucial runtime parameters
    defaults = {
        viewport : Object.assign({}, PlotJS.viewport),
        config   : Object.assign({}, PlotJS.config),
        theme    : Object.assign({}, PlotJS.theme),
        data     : Object.assign({}, PlotJS.data),
    }
    viewport = Object.assign({}, PlotJS.viewport);
    config   = Object.assign({}, PlotJS.config);
    theme    = Object.assign({}, PlotJS.theme);
    callback = {
        _Defualt_interactions_: PlotJS.interactions,
        // Call back functions are grouped by modules.
        /* -------------------------------------------
         * Implemented callbacks:
         * onMouseMove (this, mouseEvent)
         * onMouseDown (this, mouseEvent)
         * onMouseUp   (this, mouseEvent)
         * onDrag      (this, mouseEvent)
         * onScroll    (this, mouseEvent)
         * onMouseMove (this, mouseEvent)
         * ------------------------------------------
         * Planned callbacks:
         * onSelect     (this, selected  )
         * onDraw       (this, undefined )
         * onDrawEnd    (this, undefined )
         * ------------------------------------------
         * Upon dispatch of a event "EventName", the
         * event dispatcher will go through EVERY
         * entries within plot.callback and fire each 
         * entry's corresponding listener function,
         * if there exists one.
         * Be advised that you should NOT expect the
         * listeners of a specific event to be fired
         * in any certain order. 
         * ------------------------------------------
         * If you have a new module and want to add
         * event listener for this module, you should
         * create an object containing all custom
         * callback functions, and add it to the plot
         * instance's callback object.
         * By grouping callbacks by its parent module
         * name, we can delete it as a whole when it
         * is removed from the plot instance by user.
         * Note that your callback should ONLY be 
         * plugged into a instance if user demands it
         * OR if it was set to load on initiation.
         -------------------------------------------- */
         /* // This is how your custom listener object should look like:
         Your_Own_Module_Name:{EventName: function(plot, args){}}
         */
    }
    constructor(elem, args = {} , load_listener = true){
        if ("ID" in args){
            this.ID = args.ID;
        }
        else{
            // this.ID = crypto.createHash('md5')
            //                 .update(Date.now().toString())
            //                 .digest("hex")
            //                 .slice(-8)
            //                 .toUpperCase();
			this.ID =  PlotJS.util.makeID();
        }
        this.canvas = elem;
        this.ctx = elem.getContext("2d");
        if ("config" in args) this.config =  PlotJS.util.apply_config(this.config, args.config);
        if ("theme" in args) this.theme =  PlotJS.util.apply_config(this.config, args.theme);
        if (load_listener && this.canvas){
            this.load_listener(this.canvas)
        }
    }
}

// --------------------------------------------------
// Put together all prototype function for class Plot
// THIS IS VERY IMPORTANT!!!! DO NOT REMOVE !!!!
//  PlotJS.util.assembly(Plot, PlotJS.GRAPHICS, PlotJS.UTILITY, PlotJS.API);
// --------------------------------------------------