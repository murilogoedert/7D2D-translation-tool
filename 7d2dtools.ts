#!/usr/bin/env node
import { Command } from "commander";
import * as progress from "cli-progress";
import * as fs from "fs";
import * as path from "path";
import csv = require("csv-parser");

const program = new Command();

const languageMapping: { [lang: string]: string } = {
  english: "en-US",
  german: "de-DE",
  spanish: "es-ES",
  french: "fr-FR",
  italian: "it-IT",
  japanese: "ja-JP",
  koreana: "ko-KR",
  polish: "pl-PL",
  brazilian: "pt-BR",
  russian: "ru-RU",
  turkish: "tr-TR",
  schinese: "zh-CN",
  tchinese: "zh-TW",
};

async function findLocalizationFiles(
  dir: string,
  fileList: string[] = []
): Promise<string[]> {
  const files = await fs.promises.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);
    if (stat.isDirectory()) {
      await findLocalizationFiles(filePath, fileList);
    } else if (file === "Localization.txt") {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function dumpLanguage(args: any) {
  const extraKeys: string[] = (args.keys ?? []).map((key: string) =>
    key.toLowerCase()
  );
  const lang = (args.language || ("english" as string)).toLowerCase();
  const targetLang = args.targetLanguage
    ? args.targetLanguage.toLowerCase()
    : false;
  const googleTranslate = args.googleTranslate || false;

  if (googleTranslate && !targetLang) {
    console.error("Google Translate option requires a target language");
    return;
  }
  if (!languageMapping[lang]) {
    console.error(
      "Invalid language selected. Available languages are: " +
        Object.keys(languageMapping).join(", ")
    );
    return;
  }

  if (targetLang && !languageMapping[targetLang.toLowerCase()]) {
    console.error(
      "Invalid target language selected. Available languages are: " +
        Object.keys(languageMapping).join(", ")
    );
    return;
  }
  const ignored = args.ignoreLanguage || false;
  const ignoredFiles = [];
  const filesWitError = [];
  const localizationFiles = await findLocalizationFiles(
    path.join(process.cwd(), "Mods")
  );
  if (localizationFiles.length === 0) {
    console.error("No Localization.txt files found in the Mods directory.");
    return;
  }

  const bar = new progress.SingleBar({}, progress.Presets.shades_classic);
  bar.start(localizationFiles.length, 0);

  let combinedData: { Key: string; Value: string; ExtraValues: string[] }[] =
    [];
  let count = 1;
  for (const file of localizationFiles) {
    let doIgnore = false;
    const rows: { Key: string; Value: string; ExtraValues: string[] }[] = [];
    await new Promise((resolve, reject) => {
      const parser = fs
        .createReadStream(file)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }));
      parser.on("data", (data: any) => {
        if (doIgnore) return;
        if (ignored) {
          const index = Object.keys(data).findIndex(
            (key) => key.toLowerCase() == ignored.toLowerCase()
          );
          if (index !== -1 && data[Object.keys(data)[index]] != "") {
            doIgnore = true;
            return;
          }
        }
        const ExtraValues = extraKeys.map((key: string) => {
          const index = Object.keys(data).findIndex(
            (header) => header.toLowerCase() == key
          );
          return data[Object.keys(data)[index]];
        });
        const index = Object.keys(data).findIndex(
          (key) => key.toLowerCase() == lang.toLowerCase()
        );

        const indexUsedInMainMenu = Object.keys(data).findIndex(
          (key) => key.toLowerCase() == "usedinmainmenu"
        );

        if (
          (data.Key || data.key) &&
          data[Object.keys(data)[index]] &&
          !data[Object.keys(data)[indexUsedInMainMenu]]
        ) {
          let Value = "";
          if (googleTranslate) {
            Value = `=GOOGLETRANSLATE("${data[Object.keys(data)[index]].replace(
              /"/g,
              ""
            )}"; "${languageMapping[lang]}"; "${
              languageMapping[targetLang]
            }" )`;
          } else {
            Value = `"${data[Object.keys(data)[index]].replace(/"/g, "")}"`;
          }
          rows.push({
            Key: data.Key || data.key,
            ExtraValues,
            Value,
          });
        }
      });
      parser.on("end", () => resolve(rows));
      parser.on("error", reject);
    }).catch((err) => {
      console.error(err);
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    if (rows.length === 0) {
      if (doIgnore) {
        ignoredFiles.push(file);
      } else {
        filesWitError.push(file);
      }
      bar.update(count++);
      continue;
    }
    combinedData = combinedData.concat(rows);
    bar.update(count++);
  }
  combinedData.sort((a, b) => a.Key.localeCompare(b.Key));

  combinedData.unshift({
    Key: "Key",
    ExtraValues: extraKeys,
    Value: targetLang || lang,
  });
  const separator = googleTranslate ? "º" : ",";
  const outputContent = combinedData
    .map((row) => {
      let extraColumns = "";
      if (extraKeys.length > 0) {
        for (const index in extraKeys) {
          extraColumns += `${row.ExtraValues[index] || ""}${separator}`;
        }
      }
      return `${row.Key}${separator}${extraColumns}${row.Value}`;
    })
    .join("\n");
  await fs.promises.writeFile(
    path.join(process.cwd(), "Localization-DUMP.txt"),
    outputContent,
    "utf8"
  );
  bar.stop();
  console.log("\nLocalization file created at ./Localization-DUMP.txt");
  if (ignoredFiles.length > 0) {
    console.warn(
      "\nFiles ignored because of the ignored language (" + ignored + ")"
    );
    console.table(
      ignoredFiles.map((file) => ({ File: file })),
      ["File"]
    );
  }
  if (filesWitError.length > 0) {
    console.log(
      "\nFiles with errors (or ignored), should be checked manually for non existing selected language or malformed csv content (or keys containing usedInMainMene):"
    );
    console.table(
      filesWitError.map((file) => ({ File: file })),
      ["File"]
    );
  }
}

program.name("7 Days to Die Utilities").version("0.0.1")
  .description(`  ████████████████  
  ████████████████  
           ██████   
          ███████   
        ████████    
       ████████     
       ███████      
      ████████      
     ███████        
     ███████        
    ██████          
   ███████          
    ████            
    ███             
   █                `);

program
  .command("locale-dump")
  .alias("ld")
  .description("Dump the game Localization data to ./dump/Localization.txt")
  .option("-l, --language [language]", "The language to dump", "english")
  .option("-k, --keys [names...]", "Extra keys to dump", [])
  .option(
    "-tl, --target-language [targetLanguage]",
    "The target Language of the translation dump"
  )
  .option(
    "-i, --ignore-language [ignored]",
    "The language to ignore (If already has a translation for that language, do not dump)",
    ""
  )
  .option(
    "-gt, --google-translate [translate]",
    "If the output must have googletranslate formula to easy translate via Google Sheets"
  )

  .action(dumpLanguage);

program.parse();
