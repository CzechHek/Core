module = {
    name: "AutoFindBlock",
    category: "Misc",
    description: "Helps you to automatically select a block",
    author: "Lolmc, CzechHek",
    version: "2.1",
    onUpdate: function () {
        if ((ScaffoldModule.state || TowerModule.state) && ~(blockSlot = InventoryUtils.findAutoBlockBlock())) {
            !~slot && (slot = mc.thePlayer.inventory.currentItem);
            mc.thePlayer.inventory.currentItem = blockSlot - 36;
            mc.playerController.updateController();
        } else if (~slot) {
            mc.thePlayer.inventory.currentItem = slot;
            mc.playerController.updateController(); slot = -1;
        }
    }
}

var slot = -1;
script.import("Core.lib");
