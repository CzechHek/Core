HudConfig = Java.type("net.ccbluex.liquidbounce.file.configs.HudConfig");
FileConfig = Java.type("net.ccbluex.liquidbounce.file.FileConfig");
LiquidBounce = Java.type("net.ccbluex.liquidbounce.LiquidBounce");
Script = Java.type("net.ccbluex.liquidbounce.script.Script");
OutputStreamWriter = Java.type("java.io.OutputStreamWriter");
FileOutputStream = Java.type("java.io.FileOutputStream");
FileUtils = Java.type("org.apache.commons.io.FileUtils");
JsonElement = Java.type("com.google.gson.JsonElement");
GsonBuilder = Java.type("com.google.gson.GsonBuilder");
Collectors = Java.type("java.util.stream.Collectors");
JsonObject = Java.type("com.google.gson.JsonObject");
IOUtils = Java.type("org.apache.commons.io.IOUtils");
JsonParser = Java.type("com.google.gson.JsonParser");
URLConnection = Java.type("java.net.URLConnection");
Channels = Java.type("java.nio.channels.Channels");
PrintWriter = Java.type("java.io.PrintWriter");
Runnable = Java.type("java.lang.Runnable");
Files = Java.type("java.nio.file.Files");
Integer = Java.type("java.lang.Integer");
System = Java.type("java.lang.System");
Arrays = Java.type("java.util.Arrays");
Thread = Java.type("java.lang.Thread");
Long = Java.type("java.lang.Long");
File = Java.type("java.io.File");
URL = Java.type("java.net.URL");
Font = Java.type("java.awt.Font");
FileUtils = Java.type("org.apache.commons.io.FileUtils");

baseUrl = "https://natte.dev/manager/"
devMode = false;

command = {
    commands: ["Manager", "m"],
    subcommands: ["script", "config", "theme"],
    author: "natte, CzechHek",
    version: 1.1,
    onExecute: function (args) {
    	if (!new File("LiquidBounce-1.8/themes/").exists()) {
    		new File("LiquidBounce-1.8/themes/").mkdir();
    	}

        try {
            switch (args[1]) {
                case "script": {
                    if (args.length <= 2) {
                        chat.print("§8▏ §7Available subcommands§8: (§7§l4§8)");
                        chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§flist§7, §fdownload§7, §fupload§7, §fdelete§8]");
                        return;
                    }
    
                    switch (args[2]) {
                        case "list": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Available subcommands§8: (§7§l2§8)");
                                chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§fonline§7, §flocal§8]");
                                return;
                            }
                            
                            switch (args[3]) {
                                case "online": {
                                    response = get(baseUrl + "list?type=scripts");
    
                                    json = toJsonObject(response);
                                    array = json.get("message").getAsJsonArray();
                                    
                                    chat.print("§8▏ §7Online scripts§8: (§7" + array.size() + "§8)");
                                    for (i = 0; i < array.size(); i++) {
                                        name = array.get(i).getAsString();
                                        index = i + 1;
                                        chat.print("§8▏ §8[§7" + index + "§8]§7 " + name);
                                    }
                                    break;
                                }
    
                                case "local": {
                                    folder = new File("LiquidBounce-1.8/scripts");
    
                                    if (!folder.exists()) return;
    
                                    array = [];
                                
                                    for (i = 0; i < folder.listFiles().length; i++) {
                                        if (folder.listFiles()[i].getName().endsWith(".js")) {
                                            array.push(folder.listFiles()[i].getName().replace(".js", ""))
                                        }
                                    }
                                
                                    chat.print("§8▏ §7Local scripts: §8(§7" + array.length + "§8)");
                                    for (i in array) chat.print("§8▏ §8[§7" + (parseInt(i) + 1) + "§8]§7 " + array[i]);
                                }
                            }
    
                            break;
                        }
    
                        case "download": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            if (downloadFile(baseUrl + "scripts/" + args[3] + ".js", file = new File("LiquidBounce-1.8/scripts/" + args[3] + ".js"), args[3] + ".js")) {
                                chat.print("§8▏ §aDownloaded '§2§l" + args[3] + ".js§a'");
    
                                LiquidBounce.INSTANCE.getScriptManager().loadScript(file);
    
                                chat.print("§8▏ §aLoaded '§2§l" + file.getName() + "§a'");
                            }
                            break;
                        }
    
                        case "upload": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            file = new File("LiquidBounce-1.8/scripts/" + args[3] + ".js");
    
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + ".js§c'");
                                return;
                            }
    
                            response = uploadFile(baseUrl + "upload?type=script", file);
                        
                            json = toJsonObject(response);
                            code = json.get("code").getAsInt();
                            message = json.get("message").getAsString();
                            
                            if (code == 0) {
                                printError(message);
                            } else {
                                chat.print("§8▏ §aUploaded '§4§l" + file.getName() + "§c'");
                            }
                            break;
                        }
    
                        case "delete": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            file = new File("LiquidBounce-1.8/scripts/" + args[3] + ".js");
    
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + ".js§c'");
                                return;
                            }
                            LiquidBounce.INSTANCE.getScriptManager().deleteScript(new Script(file));
    
                            chat.print("§8▏ §cDeleted '§4§l" + file.getName() + "§c'");
                        }
                    }
                    break;
                }
    
                case "config": {
                    if (args.length <= 2) {
                        chat.print("§8▏ §7Available subcommands§8: (§7§l6§8)");
                        chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§flist§7, §fdownload§7, §fupload§7, §fsave§7, §fload§7, §fdelete§8]");
                        return;
                    }
    
                    switch (args[2]) {
                        case "list": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Available subcommands§8: (§7§l2§8)");
                                chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§fonline§7, §flocal§8]");
                                return;
                            }
                            
                            switch (args[3]) {
                                case "online": {
                                    response = get(baseUrl + "list?type=configs");
    
                                    json = toJsonObject(response);
                                    array = json.get("message").getAsJsonArray();
                                    
                                    chat.print("§8▏ §7Online configs: §8(§7" + array.size() + "§8)");
                                    for (i = 0; i < array.size(); i++) {
                                        name = array.get(i).getAsString();
                                        index = i + 1;
                                        chat.print("§8▏ §8[§7" + index + "§8]§7 " + name);
                                    }
                                    break;
                                }
    
                                case "local": {
                                    folder = new File("LiquidBounce-1.8/settings");
    
                                    if (!folder.exists()) return;
    
                                    array = [];
                                
                                    for (i = 0; i < folder.listFiles().length; i++) {
                                        if (folder.listFiles()[i].getName().endsWith("")) {
                                            array.push(folder.listFiles()[i].getName())
                                        }
                                    }
                                
                                    chat.print("§8▏ §7Local configs: §8(§7" + array.length + "§8)");
                                    for (i in array) chat.print("§8▏ §8[§7" + (parseInt(i) + 1) + "§8]§7 " + array[i]);
                                }
                            }
                            break;
                        }
    
                        case "download": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            if (downloadFile(baseUrl + "configs/" + args[3], new File("LiquidBounce-1.8/settings/" + args[3]), args[3])) {
                                chat.print("§8▏ §aDownloaded '§2§l" + args[3] + "§a'");
                            }
                            break;
                        }
    
                        case "upload": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            file = new File("LiquidBounce-1.8/settings/" + args[3]);
    
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + "§c'");
                                return;
                            }
    
                            response = uploadFile(baseUrl + "upload?type=config", file);
                        
                            json = toJsonObject(response);
                            code = json.get("code").getAsInt();
                            message = json.get("message").getAsString();
                            
                            if (code == 0) {
                                printError(message);
                            } else {
                                chat.print("§8▏ §aUploaded '§4§l" + file.getName() + "§c'");
                            }
                            break;
                        }
    
                        case "save": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
                            
                            LiquidBounce.commandManager.executeCommands(".localconfig save " + args[3]);
                            break;
                        }
    
                        case "load": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            LiquidBounce.commandManager.executeCommands(".localconfig load " + args[3]);
                            break;
                        }
    
                        case "delete": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
            
                            file = new File("LiquidBounce-1.8/settings/" + args[3]);
            
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + "§c'");
                                return;
                            }
    
                            file.delete();
                            chat.print("§8▏ §cDeleted '§4§l" + file.getName() + "§c'");
                            break;
                        }
                    }
    
                    break;
                }
    
                case "theme": {
                    if (args.length <= 2) {
                        chat.print("§8▏ §7Available subcommands§8: (§7§l6§8)");
                        chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§flist§7, §fdownload§7, §fupload§7, §fsave§7, §fload§7, §fdelete§8]");
                        return;
                    }
    
                    switch (args[2]) {
                        case "list": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Available subcommands§8: (§7§l2§8)");
                                chat.print("§8▏ §f" + prefix + Java.from(args).join(" ") + " §8[§fonline§7, §flocal§8]");
                                return;
                            }
                            
                            switch (args[3]) {
                                case "online": {
                                    response = get(baseUrl + "list?type=themes");
    
                                    json = toJsonObject(response);
                                    array = json.get("message").getAsJsonArray();
                                    
                                    chat.print("§8▏ §7Online themes: §8(§7" + array.size() + "§8)");
                                    for (i = 0; i < array.size(); i++) {
                                        name = array.get(i).getAsString();
                                        index = i + 1;
                                        chat.print("§8▏ §8[§7" + index + "§8]§7 " + name);
                                    }
                                    break;
                                }
    
                                case "local": {
                                    folder = new File("LiquidBounce-1.8/themes");
    
                                    if (!folder.exists()) return;
    
                                    array = [];
                                
                                    for (i = 0; i < folder.listFiles().length; i++) {
                                        if (folder.listFiles()[i].getName().endsWith(".json")) {
                                            array.push(folder.listFiles()[i].getName().replace(".json", ""))
                                        }
                                    }
                                
                                    chat.print("§8▏ §7Local themes: §8(§7" + array.length + "§8)");
                                    for (i in array) chat.print("§8▏ §8[§7" + (parseInt(i) + 1) + "§8]§7 " + array[i]);
                                }
                            }
                            break;
                        }
    
                        case "download": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            if (downloadFile(baseUrl + "themes/" + args[3] + ".json", new File("LiquidBounce-1.8/themes/" + args[3] + ".json"), args[3] + ".json")) {
                                chat.print("§8▏ §aDownloaded '§2§l" + args[3] + ".json§a'");
                            }
                            break;
                        }
    
                        case "upload": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            file = new File("LiquidBounce-1.8/themes/" + args[3] + ".json");
    
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + ".json§c'");
                                return;
                            }
    
                            response = uploadFile(baseUrl + "upload?type=theme", file);
                        
                            json = toJsonObject(response);
                            code = json.get("code").getAsInt();
                            message = json.get("message").getAsString();
                            
                            if (code == 0) {
                                printError(message);
                            } else {
                                chat.print("§8▏ §aUploaded '§4§l" + file.getName() + "§c'");
                            }
                            break;
                        }
    
                        case "save": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
    
                            file = new File("LiquidBounce-1.8/themes/" + args[3] + ".json");
                            hudFile = new File("LiquidBounce-1.8/hud.json");
            
                            FileUtils.copyFile(hudFile, file);
                            chat.print("§8▏ §aSaved '§2§l" + file.getName() + "§a'");
                            break;
                        }
    
                        case "load": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
            
                            file = new File("LiquidBounce-1.8/themes/" + args[3] + ".json");
            
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + args[3] + ".json§c'");
                                return;
                            }
            
                            config = new HudConfig(file);
                            LiquidBounce.INSTANCE.getFileManager().loadConfig(config);
                            chat.print("§8▏ §aLoaded '§4§l" + file.getName() + "§c'");
                            LiquidBounce.INSTANCE.getFileManager().hudConfig = config;
                            LiquidBounce.INSTANCE.getFileManager().saveConfig(LiquidBounce.INSTANCE.getFileManager().hudConfig);
                            break;
                        }
    
                        case "delete": {
                            if (args.length <= 3) {
                                chat.print("§8▏ §7Usage§8: §f" + prefix + Java.from(args).join(" ") + " §8[§fname§8]");
                                return;
                            }
            
                            file = new File("LiquidBounce-1.8/themes/" + args[3] + ".json");
            
                            if (!file.exists()) {
                                printError("Couldn't find '§4§l" + file.getName() + "§c'");
                                return;
                            }
            
                            file.delete();
                            chat.print("§8▏ §cDeleted '§4§l" + file.getName() + "§c'");
                            break;
                        }
                    }
                    break;
                }
            }
        } catch (e) {
        	printError("Error occured while executing command.");
            if (devMode) {
        		printError(e);
        	}
        }
    }
}

function uploadFile(url, file) {
	try {
	    boundary = Long.toHexString(System.currentTimeMillis());
	    CRLF = "\r\n";

	    con = new URL(url).openConnection();
	    con.setDoOutput(true);
	    con.setRequestProperty("User-Agent", "Mozilla/5.0");
	    con.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);

	    output = con.getOutputStream();
	    writer = new PrintWriter(new OutputStreamWriter(output, "UTF-8"), true);

	    writer.append("--" + boundary).append(CRLF);
	    writer.append("Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getName() + "\"").append(CRLF);
	    writer.append("Content-Type: " + URLConnection.guessContentTypeFromName(file.getName())).append(CRLF);
	    writer.append("Content-Transfer-Encoding: binary").append(CRLF);
	    writer.append(CRLF).flush();

	    Files.copy(file.toPath(), output);

	    output.flush();
	    writer.append(CRLF).flush();

	    writer.append("--" + boundary + "--").append(CRLF).flush();

	    input = con.getInputStream();
	    encoding = con.getContentEncoding();
	    encoding = encoding == null ? "UTF-8" : encoding;
	    body = IOUtils.toString(input, encoding);
	} catch (e) {
        if (devMode) {
        	printError(e);
        }
	}
    return body;
}

function downloadFile(url, file, name) {
    try {
        con = new URL(url).openConnection();
   
        con.setRequestProperty("User-Agent", "Mozilla/5.0");
        channel = Channels.newChannel(con.getInputStream());
        output = new FileOutputStream(file);
        
        output.getChannel().transferFrom(channel, 0, Long.MAX_VALUE);

        return true;
    } catch(e) {
        printError("Couldn't find '§4§l" + name + "§c'");
        if (devMode) {
        	printError(e);
        }
        return false;
    }
}

function get(theUrl) {
    var con = new URL(theUrl).openConnection();
    con.requestMethod = "GET";
    con.setRequestProperty("User-Agent", "Mozilla/5.0");

    input = con.getInputStream();
    encoding = con.getContentEncoding();
    encoding = encoding == null ? "UTF-8" : encoding;
    body = IOUtils.toString(input, encoding);

    return body;
}

function toJsonObject(content) {
    parser = new JsonParser();
    element = parser.parse(content);

    return element.getAsJsonObject();
}

function printError(error) {
    chat.print("§8▏ §c§lError:§r§c " + error);
}

function hasFont(name, size) {
    fonts = JSON.parse(FileUtils.readFileToString(new File("LiquidBounce-1.8/fonts/fonts.json")));
    for (i in fonts) if (Font.createFont(0, new File("LiquidBounce-1.8/fonts/" + fonts[i].fontFile)).getName() == name && fonts[i].fontSize == size) return true;
}

script.import("Core.lib");
