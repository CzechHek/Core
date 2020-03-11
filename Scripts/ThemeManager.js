HudConfig = Java.type("net.ccbluex.liquidbounce.file.configs.HudConfig");
FileConfig = Java.type("net.ccbluex.liquidbounce.file.FileConfig");
LiquidBounce = Java.type("net.ccbluex.liquidbounce.LiquidBounce");
HttpsURLConnection = Java.type("java.net.HttpURLConnection");
InputStreamReader = Java.type("java.io.InputStreamReader");
DataOutputStream = Java.type("java.io.DataOutputStream");
FileUtils = Java.type("org.apache.commons.io.FileUtils");
JsonElement = Java.type("com.google.gson.JsonElement");
GsonBuilder = Java.type("com.google.gson.GsonBuilder");
JsonObject = Java.type("com.google.gson.JsonObject");
BufferedReader = Java.type("java.io.BufferedReader");
StringBuilder = Java.type("java.lang.StringBuilder");
IOUtils = Java.type("org.apache.commons.io.IOUtils");
JsonParser = Java.type("com.google.gson.JsonParser");
PrintWriter = Java.type("java.io.PrintWriter");
FileWriter = Java.type("java.io.FileWriter");
URL = Java.type("java.net.URLConnection");
Arrays = Java.type("java.util.Arrays");
File = Java.type("java.io.File");

command = {
    commands: ["ThemeManager", "tm", "theme"],
    subcommands: ["folder", "list", "load", "save", "delete", "upload", "download", "onlinelist"],
    author: "natte, CzechHek",
    version: 2.1,
    onExecute: function (args) {
        folder = new File("LiquidBounce-1.8/themes/");

        if (!folder.exists()) folder.mkdirs();

        files = folder.listFiles();

        switch (args[1]) {
            case "folder": {
                Java.type("java.awt.Desktop").getDesktop().open(folder);
                print("§7Opened folder");
                break;
            }

            case "list": {
                print("§7Available themes§8: (§7" + files.length + "§8)");
                Arrays.asList(files).forEach(function(value) {
                    print("§7" + value.getName().replace(".json", ""));
                });
                break;
            }

            case "load": {
                if (args.length <= 2) {
                    print("§cUsage: load <name>");
                    return;
                }

                file = new File("LiquidBounce-1.8/themes/" + args[2] + ".json");

                if (!file.exists()) {
                    print("§cTheme §7" + args[2] + " §cnot found");
                    return;
                }

                try {
                    config = new HudConfig(file);
                    LiquidBounce.INSTANCE.getFileManager().loadConfig(config);
                    print("§aLoaded §7" + file.getName());
                    LiquidBounce.INSTANCE.getFileManager().hudConfig = config;
                    LiquidBounce.INSTANCE.getFileManager().saveConfig(LiquidBounce.INSTANCE.getFileManager().hudConfig);
                } catch(e) {}
                break;
            }

            case "save": {
                if (args.length <= 2) {
                    print("§cUsage: load <name>");
                    return;
                }

                file = new File("LiquidBounce-1.8/themes/" + args[2] + ".json");
                hudFile = new File("LiquidBounce-1.8/hud.json");

                FileUtils.copyFile(hudFile, file);
                print("§aSaved §7" + file.getName());
                break;
            }

            case "delete": {
                if (args.length <= 2) {
                    print("§cUsage: delete <name>");
                    return;
                }

                file = new File("LiquidBounce-1.8/themes/" + args[2] + ".json");

                if (!file.exists()) {
                    print("§cTheme §7" + args[2] + " §cnot found");
                    return;
                }

                file.delete();
                print("§aDeleted §7" + file.getName());
                break;
            }

            case "upload": {
                if (args.length <= 2) {
                    print("§cUsage: upload <name>");
                    return;
                }

                file = new File("LiquidBounce-1.8/hud.json");
                data = FileUtils.readFileToString(file);

                try {
                    response = post("https://natte.dev/thememanager/upload", "name=" + args[2] + "&data=" + data);
                    json = toJsonObject(response);

                    code = json.get("code").getAsInt();
                    message = json.get("message").getAsString();

                    success = code == 1;

                    print((success ? "§a" : "§c") + message);
                } catch (e) {
                    print(e);
                }
                break;
            }

            case "download": {
                if (args.length <= 2) {
                    print("§cUsage: download <name>");
                    return;
                }

                try {
                    response = post("https://natte.dev/thememanager/get", "name=" + args[2]);

                    if (response == "0") {
                        print("§cTheme §7" + args[2] + " §cnot found");
                    } else {
                        file = new File("LiquidBounce-1.8/themes/" + args[2] + ".json");
    
                        FileUtils.writeStringToFile(file, response);
                        print("§aDownloaded §7" + file.getName());
                    }
                } catch (e) {
                    print(e);
                }
                break;
            }

            case "onlinelist": {
                try {
                    response = get("https://natte.dev/thememanager/themes");
                    json = toJsonObject(response);

                    code = json.get("code").getAsInt();
                    array = json.get("message").getAsJsonArray();

                    print("§7Online themes§8: (§7" + array.size() + "§8)");
                    for (i = 0; i < array.size(); i++) {
                        name = array.get(i).getAsString();
                        print("§7" + name);
                    }
                } catch (e) {
                    print(e);
                }
                break;
            }
        }
    }
}

function post(theUrl, data) {
    contentType = "application/x-www-form-urlencoded";
    var con = new java.net.URL(theUrl).openConnection();

    con.requestMethod = "POST";
    con.setRequestProperty("User-Agent", "Mozilla/5.0");
    con.setRequestProperty("Content-Type", contentType);

    con.doOutput = true;
    write(con.outputStream, data);

    input = con.getInputStream();
    encoding = con.getContentEncoding();
    encoding = encoding == null ? "UTF-8" : encoding;
    body = IOUtils.toString(input, encoding);

    return body;
}

function get(theUrl) {
    var con = new java.net.URL(theUrl).openConnection();
    con.requestMethod = "GET";
    con.setRequestProperty("User-Agent", "Mozilla/5.0");

    input = con.getInputStream();
    encoding = con.getContentEncoding();
    encoding = encoding == null ? "UTF-8" : encoding;
    body = IOUtils.toString(input, encoding);

    return body;
}

function write(outputStream, data) {
    var wr = new java.io.DataOutputStream(outputStream);
    wr.writeBytes(data);
    wr.flush();
    wr.close();
}

function toJsonObject(content) {
    parser = new JsonParser();
    element = parser.parse(content);

    return element.getAsJsonObject();
}

function print(message) {
    chat.print("§5§lThemeManager §8>> §r§7" + message);
}

script.import("Core.lib");
