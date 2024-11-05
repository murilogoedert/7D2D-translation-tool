

**Have you ever tried translating a 7 Days to Die mod? The process can be incredibly tedious and time-consuming, but this tool is designed to save you a lot of time.**

**Its primary feature compiles all localization files within the game’s 'Mods' folder into a single, organized file with just two columns: Key and your chosen Language. Additionally, it offers the option to inject a Google Sheets formula for Google Translate, potentially saving you days of work and leaving only the task of reviewing the final result.**

This also enhances maintainability. With the file sorted alphabetically, tracking changes in the original localization files from mod creators becomes much easier. After an update, simply generate a new version, compare it with your previous one using a tool like WinMerge, and voilà—you can see exactly what’s changed!

**If you like the project, please consider buying me a coffee using the "Donate" button <3**

### Requirements

- [**Node.js 20+**](https://nodejs.org/) must be installed on your machine.
- **Operating System**: Windows

### Installation

1. Download the file and extract its contents to a preferred directory, such as **Program Files** (*If the files are deleted, the tool will cease to function*).
2. Open the Terminal or PowerShell in this directory. (To do this, hold Shift + right-click the folder, and select "Open PowerShell window here.")
3. Once inside the folder in the terminal, enter the following commands:

   ```bash
   npm install
   ```

   Then:

   ```bash
   npm install -g
   ```

Now the tool is installed on your machine.

### Usage:

To create a dump of all localization files from all mods, navigate to the 7 Days to Die root folder (where the "Mods" folder is located), open a terminal in this location, and type the following command:

```bash
7d2d ld
```

There are four parameters that you can pass to the `ld` command:

- **`-l | --language`** (Optional) The original language that will be searched inside localization files to dump (Default is "English").
- **`-tl | --target-language`** (Optional) The target language, used as the second column on the output dump, `-gt` uses this too.
- **`-gt | --google-translate`** (Optional) Add the GOOGLETRANSLATE formula to each line based on the `language` and `target-language`.
- **`-i | --ignore-language`** (Optional) Language to ignore, you can pass the target language of your translation, this way only files that haven’t yet been translated will be dumped.

This will create a language dump file in the game root directory called **Localization-DUMP.txt**. This file will contain all localization texts from all mods in the game's Mods folder, organized into two columns: **Key** and **English** (or whatever language you dumped), sorted alphabetically. Now, you can translate each value and rename the English column to the target language of your choice.

You can also keep versions of the dump file for future comparison when the mod author updates the localization files.

**Note**: Typing `7d2d` in the terminal will bring up a help screen with a list of available commands.

### Upcoming Features:

- A merging tool to help visualize changes between mod releases.
- A detector for malformed localization files.
- A Modinfo.xml / Mod.zip generator.

### Using Google Sheets to easily translate the file:

You can take advantage of a feature in Google Sheets to automatically translate text for you. To do this, you'll need to use the `-gt` and `-tl` parameters in the command to specify the target language, and then apply the Google Translate formula to the output. This method allows you to easily translate all the values by importing the file into Google Sheets—completely free of charge!

**Keep in mind that machine translation usually doesn't yield very good results, requiring manual review, but it's a good starting point.**

1. First, run the command:

   ```bash
   7d2d ld -l {Language to translate from} -tl {Target language} -gt
   ```

2. Now the generated Localization-DUMP.txt lines should look like this:

   ```text
   Key,Language
   ...
   AC_MiningMachine2º=GOOGLETRANSLATE("Excavator (Finding Veins)"; "en-US"; "pt-BR" )
   AC_MiningMachine3º=GOOGLETRANSLATE("Excavator (Starting Drill)"; "en-US"; "pt-BR" )
   AC_MiningMachine4º=GOOGLETRANSLATE("Excavator (25% Full)"; "en-US"; "pt-BR" )
   AC_MiningMachine5º=GOOGLETRANSLATE("Excavator (50% Full)"; "en-US"; "pt-BR" )
   ...
   ```

   Note that the separator in this case is **º** instead of **,**. This is necessary to correctly import data into Google Sheets, ensuring that commas within text fields are used as separators (Sheets is pretty dumb sometimes).

With this file in hand, open Google Sheets and click on "Import":

![Google Sheets Import](https://i.imgur.com/GPTAVWx.jpg)

Then you need to upload the file, and configure the import like this:

![Google Sheets Config](https://i.imgur.com/kPQcveV.jpg)

When you click "Import Data," Google Sheets will automatically begin the translation process. Depending on the number of rows in your file, this may take several minutes.

**Note**: Occasionally, localization files from mod creators may contain malformed content (see the screenshot below). In such cases, you'll need to manually fix each malformed line by correcting the content or formula.

![Malformed content screenshot](https://i.imgur.com/mmdwHbZ.jpg)
