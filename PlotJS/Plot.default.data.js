/*  --------------------------------------------------------
 *  Author: Yuxuan Zhang
 *  Email : admin@yuxuanzhang.net
 *  --------------------------------------------------------
 *  See Plot.js and LICENSE.txt for license statements.
 *  --------------------------------------------------------
 * 
 *  ------------------------------------------------------ */

PlotJS.data = {
    instance  : {/* external data object */},
    selectable: undefined,// this property is reserved
    Y         : undefined,// if defined, will override canvas level scope.
    // status is a runtime modifying parameter.
    status    : "normal", // "normal" | "hover" | "down" | "drag" | "dashed"
    // Top priority cascading style.
    $color    : undefined,
    $lineWith : undefined,
    $dash     : undefined,
}