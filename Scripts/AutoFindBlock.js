///api_version=2
(script = registerScript({
    name: "AutoFindBlock",
    version: "2.2",
    authors: ["Lolmc", "CzechHek"]
})).import("Core.lib");

module = {
    category: "Misc",
    description: "Helps you to automatically select a block",
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

slot = -1;
