import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import he from "he";

import {IRawCardData, KeyBenefit, SearchBenefit, TopBenefit} from "./interfaces/IRawCardData";
import { IProcessedCardData} from "./interfaces/IProcessedCardData";
import output from "string-comparison";

const issuerMap: Record<number, string> = {
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

const outputCardDataDir = path.join(__dirname, "../datasets/processed-data");
const outputCardImageDir = path.join(__dirname, "../datasets/card-images");

// 결과 폴더 생성
if (!fs.existsSync(outputCardDataDir)) {
    fs.mkdirSync(outputCardDataDir, { recursive: true });
}

// 결과 폴더 생성
if (!fs.existsSync(outputCardImageDir)) {
    fs.mkdirSync(outputCardImageDir, { recursive: true });
}

const safeArr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);


async function downloadRotateAndSave(url: string, destPath: string ) {


    const res = await fetch(url); // Node 18+ 전역 fetch
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let image = sharp(buffer);
    const meta = await image.metadata();

    // width/height가 모두 존재하고, 가로가 더 길면 시계방향 90도
    if (meta.width && meta.height && meta.width > meta.height) {
        image = image.rotate(90);
    }

    await image.toFile(destPath);
    console.log("saved:", path.resolve(destPath));
}


function splitFees(s: string): { domesticFee: string ; internationalFee: string } {


    const pureStr = decodeAndExtract(s)


    const domesticIdx = pureStr.indexOf("국내전용");
    const internationalIdx = pureStr.indexOf("해외겸용");

    let domesticFee= "";
    let internationalFee = "";

    if (domesticIdx !== -1) {
        if (internationalIdx !== -1) {
            domesticFee = pureStr.slice(domesticIdx, internationalIdx).trim();
        } else {
            domesticFee = pureStr.slice(domesticIdx).trim();

        }
    }
    else{
        internationalFee = pureStr;
        return { domesticFee, internationalFee };
    }


    if (internationalIdx !== -1) {
        internationalFee = pureStr.slice(internationalIdx).trim();
    }
    else{
        domesticFee = pureStr;
    }

    return { domesticFee, internationalFee };
}


function decodeAndExtract(str : string) {
    if (!str) return "";

    // 1. 유니코드 이스케이프를 실제 문자로 변환
    let decoded = str.replace(/\\u003C/g, "<").replace(/\\u003E/g, ">");

    // 2. HTML 엔티티 디코딩 (예: &amp; → &)
    decoded = he.decode(decoded);

    // 3. <br>을 줄바꿈으로 교체
    decoded = decoded.replace(/<br\s*\/?>/gi, "\n");

    // 4. 남은 태그 제거
    decoded = decoded.replace(/<[^>]*>/g, "");
    decoded = decoded.replace(/Powered by Froala Editor/g, "").trim();
    decoded = decoded.replace(/국내외겸용|국내외 겸용/g, "해외겸용").trim();

    return decoded.trim();
}




export const extractData = (item: IRawCardData): any => {

    let domesticFee = "";
    let internationalFee = "";

    if(item.annual_fee_detail === null) {
        ({ domesticFee, internationalFee } = splitFees(item.annual_fee_basic));
        domesticFee = domesticFee.replace("/", "");
    }
    else{
        ({ domesticFee, internationalFee } = splitFees(item.annual_fee_detail));
    }


    const processedData: IProcessedCardData = {
        catalogId: item?.idx ?? null,
        type: item?.cate,

        // corp
        issuer: issuerMap[item?.corp?.idx] ?? null,

        // 카드 기본
        name: item?.name ?? null,

        // brand[]
        globalAcquirers: safeArr(item?.brand).map((br: any) => br?.name ?? ""),

        // 기타 상위 필드
        targetMonthlySpending: item?.pre_month_money ?? null,

        onlyOnline: item?.only_online ?? null,

        // 연회비(문자열 그대로 보존)
        annualFee: domesticFee,
        annualFeeInternational: internationalFee,

        // 이미지는 따로 저장

        c_type: item?.c_type ?? null, // P/D/M 등

        benefits: {
            top: safeArr<TopBenefit>(item?.top_benefit).map((tb) => ({
                tags: tb.tags,
                title: tb?.title ?? "",
            })),

            toc: safeArr<SearchBenefit>(item?.search_benefit).map((sb) => ({
                title: sb?.title ?? "",
                sub_titles: safeArr(sb?.options)
                    .map((opt: any) => opt?.label ?? "")
                    .filter((s: string) => s),
            })),

            details: safeArr<KeyBenefit>(item?.key_benefit)
                .filter((kb) => kb?.cate?.idx !== 28)
                .map((kb) => ({
                    title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
                    info_html: kb?.info ?? "",
                    comment: kb?.comment ?? "",
                })),
        },

        notes: safeArr<KeyBenefit>(item?.key_benefit)
            .filter((kb) => kb?.cate?.idx === 28)
            .map((kb) => ({
                title: kb?.title ?? kb?.cate?.name ?? null, // 타이틀 없으면 cate.name 보조
                info_html: kb?.info ?? "",
                comment: kb?.comment ?? "",
            })),
    };

    // Data 저장
    const fileName = `${item.idx}-${item.name}.json`;

    fs.writeFileSync(
        path.join(outputCardDataDir, fileName),
        JSON.stringify(processedData, null, 2),
        "utf-8"
    );

    // // url 같으면 skip 하는 메커니즘 고려??
    // // 대표 이미지 저장
    // (async () => {
    //     if (!Array.isArray(item.card_img)) {
    //         await downloadRotateAndSave(item.card_img.url,   outputCardImageDir + '/' +`${item.idx.toString()}card_0${path.extname(item.card_img.name)}`);
    //     }
    // })();
    //
    // // 상세 이미지 저장
    // (async () => {
    //     for(const [suf ,tb] of item.card_imgs.entries()) {
    //         await downloadRotateAndSave(tb.url,   outputCardImageDir + '/' +`${item.idx.toString()}card_${suf+1}${path.extname(tb.name)}`);
    //     }
    // })();
};


