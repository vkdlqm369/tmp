import { createCheerioRouter, type CheerioCrawlingContext } from 'crawlee';
import fs from 'node:fs';
import path from 'node:path';
import {extractData} from './filters';

import { IRawCardData } from "./interfaces/IRawCardData";

export const router = createCheerioRouter();

// API 응답은 JSON이라 링크 큐잉 없이 기본 핸들러에서 파싱
router.addDefaultHandler(async (ctx: CheerioCrawlingContext) => {
    const { request, body, contentType, log } = ctx;

    log.info('Fetching card JSON', { url: request.loadedUrl, contentType });

    let data : IRawCardData;

    try {

        const raw =
            typeof body === 'string'
                ? body
                : Buffer.isBuffer(body)
                    ? body.toString('utf8')
                    : '';

        // CheerioCrawler에서도 body는 문자열이므로 그대로 JSON 파싱
        data = JSON.parse(raw);

        extractData(data);

        console.log("✅ 파일 처리 완료");

    } catch (err: any) {
        log.error('Failed to parse JSON', { error: err.message });
        return;
    }


});
