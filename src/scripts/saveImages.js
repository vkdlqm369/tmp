import fs from "fs";
import path from "path";
import https from "https";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, "../../datasets/raw-data");
const saveDir = path.join(__dirname, "../../datasets/card-images");

const files = fs.readdirSync(dirPath);
const errList = [];

for (const file of files) {
    if (file.endsWith(".json")) {
        const filePath = path.join(dirPath, file);

        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(raw);

            let url = data.card_img.url;

            if(typeof url !== "string") {
                errList.push(data.idx)
                continue;
            }


            // 대표 이미지 저장
            let filename = data.idx.toString() + "card_0" + path.extname(data.card_img.name);
            let savePath = saveDir + "/" + filename;

            const res = await fetch(url, { redirect: "follow" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const arrayBuffer = await res.arrayBuffer();

            await fs.promises.writeFile(savePath, Buffer.from(arrayBuffer));

            console.log("saved:", path.resolve(savePath));


            // 추가 이미지 저장
            for(const [suf ,tb] of data.card_imgs.entries()) {
                url = tb.url;

                if(typeof url !== "string") {
                    errList.push(data.idx)
                    continue;
                }
                filename = data.idx.toString() + "card_" + (suf+1).toString() +path.extname(data.card_img.name);
                savePath = saveDir + "/" + filename;

                const res = await fetch(url, { redirect: "follow" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const arrayBuffer = await res.arrayBuffer();

                await fs.promises.writeFile(savePath, Buffer.from(arrayBuffer));
                console.log("saved:", path.resolve(savePath));
            }


        } catch (err) {
            console.error(`Error reading ${file}:`, err.message);
        }
    }
}

for(const e of errList) {
    console.log(e, "URL이 존재하지 않음.");
}
