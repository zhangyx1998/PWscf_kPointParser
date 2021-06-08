# PlotJS

Author: Yuxuan Zhang
License: Not Applicable yet

---
## Introduction

PlotJS is a JavaScript module that draws plot of give data
on a HTML5 canvas.

### Interactions and Plugins

This module have implementations of UI interaction. It has
a built-in event dispatch and catch mechanism, and have
a default module "Plot.interaction.js" that takes care
of basic interactions, e.g. drag plot, select elements.
You can add your listener to a plot instance, please see
line#81 for details.

### Themes and Configurations.

You can create custom theme for your plot. To create a
new theme, you can copy "Plot.default.theme.js" and make
modifications. Custom themes, when loaded as runtime
objects, can be applied to a plot instance by replacing
its default "theme" entry. E.g. to apply theme "MyTheme"
to plot instance "plot", you can use the following code:

plot_instance.theme = MyTheme;

---
## Release Note

