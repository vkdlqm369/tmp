// For more information, see https://crawlee.dev/
import { CheerioCrawler, Configuration } from 'crawlee';
import { router } from './routes.js';

const ids = Array.from({ length: 3000 }, (_, i) => i + 1);
// const ids = Array.from({ length: 15 - 10 + 1 }, (_, i) => i + 10);
const startUrls = ids.map(id => `https://api.card-gorilla.com:8080/v1/cards/${id}`);

const config = new Configuration({
    persistStorage: false,        // 전역적으로 디스크 영속화 끄기
});


const crawler = new CheerioCrawler({

    // JSON 응답도 처리할 수 있도록
    additionalMimeTypes: ['application/json'],

    requestHandler: router,

    // 요청 개수 = URL 개수
    maxRequestsPerCrawl: startUrls.length,

    // API 예의상 속도 제한 설정
    maxConcurrency: 5,
    maxRequestsPerMinute: 1000,
    },

    new Configuration({
        persistStorage: false,
    })


);


await crawler.run(startUrls);
