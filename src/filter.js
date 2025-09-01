import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const issuerMap = {
    1: "SAMSUNG",
    2: "SHINHAN",
    3: "KOOKMIN",
    4: "LOTTE",
    5: "WOORI",
    6: "CITI",
    7: "HYUNDAI",
    8: "HANA",
    9: "NONGHYEOP",
    10: "IBK_BC",
    11: "JEIL",
    12: "SSG",
    13: "KBANK",
    14: "KAKAOBANK",
    15: "POST",
    19: "DGB",
    20: "BUSAN",
    21: "KDBBANK",
    22: "SAEMAUL",
    23: "SAVINGBANK",
    24: "SUHYEOP",
    25: "GWANGJUBANK",
    26: "KYOBO",
    27: "SHINHYEOP",
    28: "YUANTA",
    29: "JEONBUKBANK",
    30: "JEJUBANK",
    31: "KAKAOPAY",
    32: "BC",
    33: "MIRAE",
    34: "NH_INVESTMENT_AND_SECURITIES",
    35: "KBS",
    36: "KOREAINVEST",
    44: "DB",
    45: "SK",
    46: "EUGENE",
    47: "TOSSBANK",
    48: "CHAI",
    49: "FINT",
    50: "FINNQ",
    51: "PCP",
    52: "KONA",
    53: "TOSSBANK",
    54: "IAURORA",
    55: "HANPASS",
    56: "DANAL",
    57: "TRAVEL",
    58: "MOBILIANS",
    59: "HYANDAIDEPART",
    63: "GYEONGNAM",
    64: "NAVER",
    65: "MONEYTREE",
};


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
        issuer: issuerMap[item?.corp?.idx] ?? null,

        // 카드 기본
        name: item?.name ?? null,

        // brand[]
        globalAcquirers: safeArr(item?.brand)
            .map((br) => br?.name ?? ""),


        // 기타 상위 필드
        targetMonthlySpending: item?.pre_month_money ?? null,
        only_online: item?.only_online ?? null,

        // 연회비(문자열 그대로 보존)
        annual_fee_basic: item?.annual_fee_basic ?? null,
        annual_fee_detail: item?.annual_fee_detail ?? null,

        // 이미지는 따로 저장


        benefits: {
            top: safeArr(item?.top_benefit).map((tb) => ({
                tags: Array.isArray(tb?.tags) ? tb.tags : (tb?.tag ? [tb.tag] : []),
                title: tb?.title ?? null,
            })),

            toc: safeArr(item?.search_benefit).map((sb) => ({
                title: sb?.title ?? null,
                sub_titles: safeArr(sb?.options)
                    .map((opt) => opt?.label ?? "")
                    .filter((s) => s)
            })),

            key: safeArr(item?.key_benefit)
                .filter((kb) => kb?.cate?.idx !== 28)
                .map((kb) => ({
                    title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
                    info_html: kb?.info ?? "",
                    comment: kb?.comment ?? "",
            })),
        },

        keyBenefits: safeArr(item?.key_benefit)
            .filter((kb) => kb?.cate?.idx === 28)
            .map((kb) => ({
                title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
                info_html: kb?.info ?? "",
                comment: kb?.comment ?? "",
            }))

        // // top_benefit
        // top_benefit: safeArr(item?.top_benefit).map((tb) => ({
        //     idx: tb?.idx ?? null,
        //     // 표에는 "tag"라고 표기되어 있었지만 실제 데이터는 "tags" 배열 → 둘 다 대응
        //     tags: Array.isArray(tb?.tags) ? tb.tags : (tb?.tag ? [tb.tag] : []),
        //     title: tb?.title ?? null,
        // })),
        //
        // // 카드 혜택 유형
        // c_type: item?.c_type ?? null, // P/D/M 등
        //
        // // search_benefit
        // search_benefit: safeArr(item?.search_benefit).map((sb) => ({
        //     title: sb?.title ?? null,
        //     value: sb?.value ?? null,
        //     options: safeArr(sb?.options).map((opt) => ({
        //         label: opt?.label ?? null,
        //         value: opt?.value ?? null,
        //     })),
        // })),
        //
        // // key_benefit
        // key_benefit: safeArr(item?.key_benefit).map((kb) => ({
        //     cate: {
        //         idx: kb?.cate?.idx ?? null,
        //         title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
        //     },
        //     info_html: kb?.info ?? "",
        //     comment: kb?.comment ?? "",
        // })),
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
