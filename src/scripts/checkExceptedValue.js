import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirPath = path.join(__dirname, "../../datasets/raw-data");

const files = fs.readdirSync(dirPath);

let counts = { CRD: 0, CHK: 0, OTHER: 0 };

const cTypes = new Set(); // c_type 값 저장용 Set
const cTypeCounts = {};   // c_type별 개수 카운트
let cnt = 0;

for (const file of files) {
    if (file.endsWith(".json")) {
        const filePath = path.join(dirPath, file);
        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            const data = JSON.parse(raw);


            const checkCate = (item) => {
                if (item.cate === "CRD") {
                    counts.CRD++;
                } else if (item.cate === "CHK") {
                    counts.CHK++;
                } else {
                    counts.OTHER++;
                }

                // if (item.event !== null) {
                //     console.log(`card id: ${item.idx}`);
                // }
                //
                // if (item.is_request_name === true) {
                //     console.log(`card id: ${item.idx}`);
                // }
                //
                // if(item.only_online === true) {
                //     console.log(`card id ${item.idx}`);
                // }
                //
                // // inputValue가 ""가 아닌 경우 출력
                // if (Array.isArray(item.top_benefit)) {
                //     for (const tb of item.top_benefit) {
                //         if (tb?.inputValue && tb.inputValue.trim() !== "") {
                //             console.log(`HAS inputValue -> card id: ${item.idx} (file: ${file})`);
                //         }
                //     }
                // }


                // const str = item.idx.toString();
                // // 뒤에서 3자리 가져오기
                // const last3 = str.slice(-3);
                // const s = last3.padStart(3, "0");
                // if(s === item.cid)
                //     cnt++;




// //
//                 // 국내전용 금액
//                 let domestic = 0;
//                 const domesticMatch = item.annual_fee_basic.match(/국내전용\s*\[([0-9,]+)원?\]/);
//                 if (domesticMatch) {
//                     domestic = parseInt(domesticMatch[1].replace(/,/g, ""), 10) || 0;
//                 }
//
// // 해외겸용 금액
//                 let abroad = 0;
//                 const abroadMatch = item.annual_fee_basic.match(/해외겸용\s*\[([0-9,]+)원?\]/);
//                 if (abroadMatch) {
//                     abroad = parseInt(abroadMatch[1].replace(/,/g, ""), 10) || 0;
//                 }
// //


                // console.log(item.idx, "domestic =", domestic, "abroad =", abroad);

                // console.log(item.idx, item.annual_fee_basic)


                // console.log(item.idx, item.annual_fee_basic)

                // console.log(item.idx, last3.padStart(3, "0"));
                //
                // for(const tb of item.corp){
                //     if(typeof tb.idx !== "number"){
                //         cnt++;
                //     }
                // }

                // for(const tb of item.key_benefit){
                //     if(typeof tb.comment !== "string"){
                //         cnt++;
                //     }
                //
                // }


                // if(  typeof item.card_img.name  === "string") {
                //     cnt++;
                // }
                // else{
                //     console.log( item.idx);
                // }


                // c_type 값 수집 + 카운트
                // if (item.c_type) {
                //     cTypes.add(item.c_type);
                //     cTypeCounts[item.c_type] = (cTypeCounts[item.c_type] || 0) + 1;
                // }
                // let invalid = false;
                // if (!item.top_benefit || !Array.isArray(item.top_benefit)) {
                //     invalid = true; // top_benefit이 없거나 배열이 아니면 문제로 간주
                // } else {
                //     for (const tb of item.top_benefit) {
                //         const tags = tb?.tags;
                //         if (!Array.isArray(tags) || tags.length !== 3) {
                //             invalid = true;
                //             break;
                //         }
                //     }
                // }
                // if (invalid) {
                //     // 파일명도 같이 찍어두면 추적이 쉬워요
                //     console.log(`INVALID top_benefit.tags length -> card id: ${item.idx} (file: ${file})`);
                // }
                //
                // if (item.only_online === true) {
                //     console.log(`only_online card id: ${item.idx}`);
                // }
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

console.log("=====================================\n");
console.log(
    `TOTAL=${counts.CRD + counts.CHK} CRD=${counts.CRD}, CHK=${counts.CHK}, OTHER=${counts.OTHER}`
);
console.log("\n=====================================\n");
console.log("c_type counts:", cTypeCounts);
console.log(cnt);

