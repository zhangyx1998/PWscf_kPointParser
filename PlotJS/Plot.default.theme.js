/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 *  This module defines the default mouse interactions, it
 *  will be loaded into callback tree of class Plot.
 *  ------------------------------------------------------ */

PlotJS.theme = {
    // Universal Config
    default:{
        // This is the root of the plot's cascading style system.
        // Styles from more specific scope will overwrite parent scope styles,
        // You can modify the value following settings, but NEVER remove any of them.
        $color       : "#263087",
        $strokeStyle : undefined, // If undefined, use value of "$color" instead.
        $fillStyle   : undefined, // If undefined, use value of "$color" instead.
        $lineWidth   : 1.0, // in px, will be scaled according to display DPI
        $dash        : [],
        $font_size   : "1em", // strings and numbers are all accepted
        $font_family : "Ubuntu",
        // Parameters for draw_text().
        $typesetting :{
            // <string> name of the area that the text is restricted in.
            // If floating is unwanted, leave it undefined
            $_floatArea  : undefined,
            $_margin    : "0.5em", // strings and numbers are all accepted
            $_stroke     : false,
            $_fill       : true,
            $_baseline    : "top",
            $_align       : "center",
            // Cascading params that goes straight into ctx.
            // The following params defines stroke style.
            $strokeStyle : "#EEE",
            $lineWidth   : 1.0,
        },
        // Parameters for line()
        $lineTip:{
            // Cascading params that goes straight into ctx.
            $color       : undefined,
            $strokeStyle : undefined,
            $fillStyle   : undefined,
            $lineWidth   : undefined,
            // These switches on/off tip stroke and fill.
            $_stroke     : false,
            $_fill       : false,
            // If any of following are valued (number or size),
            // a line tip with corresponding size will be plotted
            $_square     : undefined,
            $_circle     : undefined,
            $_triangle   : undefined,
        }
    },
    // Cursor assistance mark and hint text
    cursor:{
        $color       : "#555",
        $font_size   : "1em",
        $font_family : "Primary",
        $typesetting :{
            $baseline : "top",
            $align    : "left",
            $floatArea: "canvas"
        },
        selection:{
            $strokeStyle: "#AAA",
            $fillStyle  : "#444",
            $lineWidth  : 2.0
        }
    },
    // Border of the entire canvas, NOT IMPLEMENTED YET
    border:{
        display   : false,
        $color     : "gray",
        $lineWidth : 1.5
    },
    // Navigation bar
    navi:{
		show: false,
        backdrop: 0.2, // "Transparency" effect for existing graph.
        height: "0.0em",
        background: {$color: "#666"},
        slider: {$color: "#888"},
        arrow: {$color: "#A66", $lineWidth: 1.2},
        cursor_style: "grab",
    },
    // Rule ticks
    tick:{
        backdrop: 0.2, // "Transparency" effect for existing graph.
        $color       : "gray",
        $font_family : "Primary",
        $typesetting :{
            $baseline : "top",
            $align    : "center"
        },
        primary_text: {
            $font_size: "0em",
			$color    : "transparent"
        },
        sub_text    : {
            $font_size: "0em",
            $font_family: "Ubuntu",
			$color    : "transparent"
        },
        // horizontal line
        horizontal_line:{
            $lineWidth: 1.5
        },
        // Tickmarks
        major:{
            $lineWidth   : 1.5,
            height      : -8,
        },
        sub:{
            $lineWidth   : 1.0,
            height      : -6,
        },
        minor:{
            $lineWidth   : 1.0,
            height      : -5,
        }
    },
    // Guidelines
    guideline:{
        $font_size  : "1em",
        $font_family: "Primary",
        $typesetting :{
            $_baseline : "bottom",
            $_align    : "left",
            $_floatArea: "plot"
        },
        hover:{
            $lineWidth: 0.6,
            $dash: [6, 3],
            $color: "#DDD"
        },
        down:{
            $lineWidth: 1.0,
            $dash: [8, 4],
            $color: "#555"
        },
        drag:{
            $lineWidth: 1.2,
            $color: "#AAA"
        },
        horizontal:{
            $lineWidth: 0.8,
            $dash: [8, 6],
            $typesetting :{
                $_baseline  : "top",
                $_align     : "left",
                $_stroke    : false,
                $_floatArea : "plot",
                $strokeStyle: "rgb(30, 30, 30) solid",
                $lineWidth  : 4.0,
            },
        }
    },
    // Rules
    rule:{
		show_value: false,
        $lineWidth: 0.8,
        $dash: [],
        $color: "#555",
        $font_size  : "1em",
        $font_family: "Times New Roman",
        $typesetting :{
            $_baseline : "top",
            $_align    : "left",
            $_floatArea: "plot"
        },
        hover:{
            $lineWidth: 1.8,
            $color: "#AAA"
        },
        down:{
            $color: "#888"
        },
        drag:{
            $lineWidth: 0.8,
            $dash: [],
            $color: "#FFF"
        },
        selected:{
            $lineWidth: 1.2,
            $dash: [],
            $color: "#DDD"
        }
    },
    // Series
    series:{
        $color: "#263087",
        normal:{
            $lineWidth: 1.2,
        },
        hover:{
            $lineWidth: 2.0,
        },
        down:{
            $lineWidth: 1.2,
        },
        drag:{
            $lineWidth: 1.2,
        },
        selected:{
            $lineWidth: 2.0,
        },
        dashed:{
            $lineWidth: 1.0,
            $dash: [],
            $color: "black"
        }
    },
    // Debug
    debug:{
        $strokeStyle: "cyan",
        $fillStyle: "#333",
        $lineWidth: 0.5,
        $dash: [1,2]
    }
}