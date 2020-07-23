## Introduction
Core is a coding base for minecraft's client LiquidBounce (https://liquidbounce.net/), that significantly simplifies coding via LB's ScriptAPI, without losing any of its features.
It's suitable for anyone, from complete beginners to experienced coders.

## Why should I use it?
When you make a variety of scripts, you waste your precious time doing unimportant things in the code. These actions are much easier and faster to do with Core.
It has integrated utilities that anyone can use, so you don't have to make them yourself. It also imports many classes so you don't have to import them manually.
It autogenerates help command and prints all possible subcommands (configurable).
If modules category doesn't exist, Core will create it automatically, adding tabs to TabGUI and ClickGUI. You can make scripts stand out by that.

Examples: https://github.com/CzechHek/Core/tree/master/Scripts.


## Importing
Core automatically imports:
* net.minecraft.block.* (blocks)
* net.minecraft.client.gui.* (guis)
* net.minecraft.client.renderer.* (renderers)
* net.minecraft.entity.* (entities)
* net.minecraft.init.* (blocks, items)
* net.minecraft.item.* (items)
* net.minecraft.network.* (packets+)
* net.minecraft.util.* (mc utils)
* net.ccbluex.liquidbounce.utils.* (lb utils)
* net.ccbluex.liquidbounce.value.* (lb values)

and other function utilities
