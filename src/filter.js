import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ===== 기본 경로 세팅 =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, "../datasets/raw-data"); // 원본 JSON 폴더
const outputDir = path.join(__dirname, "../datasets/processed-data");       // 추출 결과 저장 폴더

// 결과 폴더 생성
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}


const extractFromItem = (item) => {
    const safeArr = (v) => (Array.isArray(v) ? v : []);

    return {
        // 상위
        catalogId: item?.idx ?? null,
        type: item?.cate ?? null,

        // corp
        issuer: {
            idx: item?.corp?.idx ?? null,
            name: item?.corp?.name ?? null,
            name_eng: item?.corp?.name_eng ?? null,
        },

        // 카드 기본
        name: item?.name ?? null,

        // brand[]
        globalAcquirers: safeArr(item?.brand).map((b) => ({
            idx: b?.idx ?? null,
            name: b?.name ?? null,
            code: b?.code ?? null,
        })),

        // 기타 상위 필드
        targetMonthlySpending: item?.pre_month_money ?? null,
        only_online: item?.only_online ?? null,

        // 연회비(문자열 그대로 보존)
        annual_fee_basic: item?.annual_fee_basic ?? null,
        annual_fee_detail: item?.annual_fee_detail ?? null,

        // 이미지
        card_img: item?.card_img
            ? { name: item.card_img.name ?? null, url: item.card_img.url ?? null }
            : null,
        card_imgs: safeArr(item?.card_imgs).map((ci) => ({
            id: ci?.id ?? ci?.idx ?? null,
            name: ci?.name ?? null,
            url: ci?.url ?? null,
        })),

        // top_benefit
        top_benefit: safeArr(item?.top_benefit).map((tb) => ({
            idx: tb?.idx ?? null,
            // 표에는 "tag"라고 표기되어 있었지만 실제 데이터는 "tags" 배열 → 둘 다 대응
            tags: Array.isArray(tb?.tags) ? tb.tags : (tb?.tag ? [tb.tag] : []),
            title: tb?.title ?? null,
        })),

        // 카드 혜택 유형
        c_type: item?.c_type ?? null, // P/D/M 등

        // search_benefit
        search_benefit: safeArr(item?.search_benefit).map((sb) => ({
            title: sb?.title ?? null,
            value: sb?.value ?? null,
            options: safeArr(sb?.options).map((opt) => ({
                label: opt?.label ?? null,
                value: opt?.value ?? null,
            })),
        })),

        // key_benefit
        key_benefit: safeArr(item?.key_benefit).map((kb) => ({
            cate: {
                idx: kb?.cate?.idx ?? null,
                title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
            },
            // !!여기 바꿔야 함.
            info_html: kb?.info ?? "",
            comment: kb?.comment ?? "",
        })),
    };
};

// ===== 메인 실행 =====
const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
    try {
        const raw = fs.readFileSync(path.join(inputDir, file), "utf-8");
        const data = JSON.parse(raw);

        const result = Array.isArray(data)
            ? data.map(extractFromItem)
            : extractFromItem(data);

        fs.writeFileSync(
            path.join(outputDir, file),
            JSON.stringify(result, null, 2),
            "utf-8"
        );
        console.log(`✔ extracted → ${path.join("storage/extracted", file)}`);
    } catch (err) {
        console.error(`✖ error on ${file}:`, err.message);
    }
}

console.log("✅ 모든 파일 처리 완료");
