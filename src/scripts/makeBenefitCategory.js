import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, "../../datasets/raw-data");

const files = fs.readdirSync(dirPath);

const topBenefitPairs = new Set(); // (idx, title) pair 저장용

for (const file of files) {
    if (file.endsWith(".json")) {
        const filePath = path.join(dirPath, file);
        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(raw);


            const checkCate = (item) => {

                // top_benefit (idx, title) 수집
                if (Array.isArray(item.top_benefit)) {
                    for (const tb of item.top_benefit) {
                        if (tb?.idx !== undefined && tb?.title) {
                            topBenefitPairs.add(`${tb.idx}::${tb.title}`);
                        }
                    }
                }

                // search_benefit (value, title) 수집
                if (Array.isArray(item.search_benefit)) {
                    for (const sb of item.search_benefit) {
                        if (sb?.value !== undefined && sb?.title) {
                            topBenefitPairs.add(`${sb.value}::${sb.title}`);
                        }
                    }
                }

                // search_benefit.options (value, label) 수집
                if (Array.isArray(item.search_benefit)) {
                    for (const sb of item.search_benefit) {
                        if (Array.isArray(sb.options)) {
                            for (const opt of sb.options) {
                                if (opt?.value !== undefined && opt?.label) {
                                    topBenefitPairs.add(`${opt.value}::${opt.label}`);
                                }
                            }
                        }
                    }
                }


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




const sortedPairs = Array.from(topBenefitPairs).sort((a, b) => {
    const [idxA, titleA] = a.split("::");
    const [idxB, titleB] = b.split("::");
    return Number(idxA) - Number(idxB) || titleA.localeCompare(titleB);
});

for (const pair of sortedPairs) {
    console.log(pair);
}