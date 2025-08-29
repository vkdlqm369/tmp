import { createCheerioRouter } from 'crawlee';
import fs from 'node:fs';
import path from 'node:path';

export const router = createCheerioRouter();

// API 응답은 JSON이라 링크 큐잉 없이 기본 핸들러에서 파싱
router.addDefaultHandler(async ({ request, body, contentType, log, pushData }) => {
    log.info('Fetching card JSON', { url: request.loadedUrl, contentType });

    let data;
    try {
        // CheerioCrawler에서도 body는 문자열이므로 그대로 JSON 파싱
        data = JSON.parse(body);
    } catch (err) {
        log.error('Failed to parse JSON', {error: err.message});
        return;
    }

    const urlParts = request.loadedUrl.split('/');
    const cardId = urlParts[urlParts.length - 1];


    // name 필드 값으로 파일 이름 생성
    const fileName = `${cardId}-${data.name}.json`;
    // 저장 경로 (기존 dataset 경로에 맞춤)
    const saveDir = path.join(process.cwd(), '..', 'datasets', 'raw-data');
    if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
    }

    const savePath = path.join(saveDir, fileName);

    // JSON을 예쁘게 저장
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf8');

    // 그대로 저장 (필드 선택 X)
    // await pushData({
    //     url: request.loadedUrl,
    //     ...data,   // JSON의 모든 필드가 dataset에 들어감
    // });

    // await pushData([ JSON.parse(body) ], );

    // // 필요 필드만 골라 저장 (원본도 raw로 함께 저장)
    // const {
    //     id,
    //     name,
    //     companyName,
    //     brandName,
    //     benefitSummary,
    //     annualFee,
    //     domesticOnly,
    //     imageUrl,
    //     urlHomepage,
    //     urlApply,
    // } = data || {};
    //
    // await pushData({
    //     url: request.loadedUrl,
    //     id,
    //     name,
    //     companyName,
    //     brandName,
    //     benefitSummary,
    //     annualFee,
    //     domesticOnly,
    //     imageUrl,
    //     urlHomepage,
    //     urlApply,
    //     raw: data,
    // });

    log.info('Card JSON saved to dataset.');
});
