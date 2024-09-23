import path from "path";
import fs from "node:fs";

const filePath = path.join(__dirname, "../../resources/best-tracker-list.txt");

console.log("filePath", filePath);

export const getAnnounce = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        const dataList = data.split("\n").filter((line) => line.trim() !== "");
        console.log("dataList", dataList);
        resolve(dataList);
      }
    });
  });
};
