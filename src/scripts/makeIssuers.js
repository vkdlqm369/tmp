import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, "../../datasets/raw-data");

const files = fs.readdirSync(dirPath);

const issuerPairs = new Set(); // (idx, title) pair 저장용

for (const file of files) {
    if (file.endsWith(".json")) {
        const filePath = path.join(dirPath, file);
        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(raw);


            const checkCate = (item) => {
                issuerPairs.add(`${item.corp.idx}::${item.corp.name}::${item.corp.name_eng.toUpperCase()}`);
            };

            if (Array.isArray(data)) {
                data.forEach(checkCate);
            } else {
                checkCate(data);
            }

        } catch (err) {
            console.error(`Error reading ${file}:`, err.message);
        }
    }
}


const sortedPairs = Array.from(issuerPairs).sort((a, b) => {
    const [idxA, titleA] = a.split("::");
    const [idxB, titleB] = b.split("::");
    return Number(idxA) - Number(idxB) || titleA.localeCompare(titleB);
});

for (const pair of sortedPairs) {
    console.log(pair);
}