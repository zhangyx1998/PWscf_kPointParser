/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 * 
 *  ------------------------------------------------------ */

PlotJS.config = {
    // This entry defines how the x-axis value is parsed
    axis:{
        unit_scale: [1e12, 1e9, 1e6, 1e3, 1, 1e-3, 1e-6, 1e-9],
        unit_name : ["tera ", "giga ", "mega ", "kilo ", "", "milli ", "micro ", "nano "],
        general_unit: "second",
    },
    // This entry defines the format of x-axis rule
    tick:{
        display: true,
        min_rule_distance: "0.6em",
        half_major_rule: true,
        major_rule_ticks: 10,
        major_rule_guideline: true,
        major_rule_scale_setp: 10
    },
    // This entry controls navigation bar
    navi:{
        display: true,
        scroll_zoom_cof: 1.2,
    },
    // This entry define control parameters
    plot:{
        // Half border length of a rectangluar area, in px. 
        drag_dead_zone: 2.0,
        // The magnifing range for the cursor to selecet.
        // eg. coff=2.0 means the selectable range of a line is 2.0 times
        // of its displayed size.
        series_magnify_coff: 8.0,
        rule_magnify_coff: 8.0,
        // The scroll_zoom_coffcient
        scroll_ratio_x: 1.0002,
        scroll_ratio_y: 1.0002
    }
}