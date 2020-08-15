///api_version=2
(script = registerScript({
    name: "LocalSettingsList",
    version: "1.2",
    authors: ["Nvaros"]
})).import("Core.lib");

ButtonElement = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.elements.ButtonElement");
Panel = Java.type("net.ccbluex.liquidbounce.ui.client.clickgui.Panel");
localSettingsButtons = [];
shouldDelete = [];
shouldOverwrite = [];
LocalFiles = LiquidBounce.fileManager.settingsDir.listFiles();
prevLocalListLength = LocalListLength = LocalFiles.length;
isPanelEnabled = hasLoadedPanel = false;

APanel = Java.extend(Panel, { setupItems: function() {} });
localSettingsPanel = APanel.class.getConstructors()[0].newInstance("-=LocalConfigs=-", 1, 1, 100, 18, true);

list = [
	RetardSafe = value.createBoolean("RetardSafe", false),
	UsePanel = value.createBoolean("UsePanel", false)
]

module = {
	category: "Misc",
    description: "Panel that shows your local settings",
    values: list,
    onEnable: function() {
		hasLoadedPanel = false;
		prevLocalListLength = LocalFiles.length;
		LocalListLength = LocalFiles.length;
	},
	
	onDisable: function() {
		delay(20, function() {
			commandManager.executeCommand(".t localsettingslist")
		});
	},
	
	onUpdate: function () {
		if (LiquidBounce.clickGui != null && UsePanel.get()) {
			LocalFiles = LiquidBounce.fileManager.settingsDir.listFiles();
			LocalListLength = LocalFiles.length;
			
			if (!isPanelEnabled) {
				isPanelEnabled = true;
				LiquidBounce.clickGui.panels.add(localSettingsPanel);
			} else if (!hasLoadedPanel) {
				hasLoadedPanel = true;
				shouldDelete.length = 0;
				shouldOverwrite.length = 0;
				
				
				localsettingsElements = localSettingsPanel.getElements();
				for (i in localsettingsElements) {
					
					localSettingsPanel.getElements().remove(localsettingsElements[0]);
				}
			
				for (i in LocalFiles) {
					localSettingsPanel.getElements().add(createLocalSettingsButton(LocalFiles[i].getName()));
					shouldDelete.push(false, 0);
					shouldOverwrite.push(false, 0);
				}
			}
			
			if (hasLoadedPanel && LocalListLength != prevLocalListLength) {
				prevLocalListLength = LocalListLength;
				hasLoadedPanel = false;
			}
			
		} else if (LiquidBounce.clickGui != null && !UsePanel.get()) {
			isPanelEnabled = false;
			LiquidBounce.clickGui.panels.remove(localSettingsPanel);
		} 
    },

    onLoad: function () {
        delay(2500, function() {
            moduleManager.getModule(this.name).state = true;
        });
    }
}

function createLocalSettingsButton(name) {
	
	length = localSettingsButtons.length;
	localSettingsButtons[length] = new (Java.extend(ButtonElement))(name) {
		mouseClicked: function(mouseX, mouseY, mouseButton) {
			if (localSettingsButtons[length].isHovering(mouseX, mouseY)) {
				switch (mouseButton) {
					case 0:
						commandManager.executeCommand(".localconfig load " + name);
					break;
						
					case 1:
						if (RetardSafe.get() ? shouldOverwrite[2 * length] : true) {
							commandManager.executeCommand(".localconfig save " + name);
							shouldOverwrite[2 * length] = false;
							if (RetardSafe.get()) {
								shouldOverwrite[2 * length + 1].cancel();
							}
						} else {
							chat.print("§8[§9§lLiquidBounce§8] §aAre you sure you want to overwrite the config §c'" + name + "'§a? Right-click again!");
							shouldOverwrite[2 * length] = true;
							shouldOverwrite[2 * length + 1] = delay(1500, function() {
								shouldOverwrite[2 * length] = false;
							});
						}
						
					break;
					
					case 2:
						if (RetardSafe.get() ? shouldDelete[2 * length] : true) {
							commandManager.executeCommand(".localconfig delete " + name);
							shouldDelete[2 * length] = false;
							if (RetardSafe.get()) {
								shouldDelete[2 * length + 1].cancel();
							}
						} else {
							chat.print("§8[§9§lLiquidBounce§8] §aAre you sure you want to delete the config §c'" + name + "'§a? Mid-click again!");
							shouldDelete[2 * length] = true;
							shouldDelete[2 * length + 1] = delay(1500, function() {
								shouldDelete[2 * length] = false;
							});
						}
						
					break;
				}
			}
		}
	}
	return localSettingsButtons[length];
}
