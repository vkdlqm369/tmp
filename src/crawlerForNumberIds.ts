// For more information, see https://crawlee.dev/
import { CheerioCrawler, Configuration } from 'crawlee';
import { router } from './routes';


const config = new Configuration({
    // 전역적으로 디스크 영속화 끄기
    persistStorage: false,
});


async function crawlerForNumberIds( url : string, ids : string[]): Promise<void> {

    const startUrls: string[] = ids.map((id) => `${url}/${id}`);

    const crawler = new CheerioCrawler(
        {
            // JSON 응답도 처리할 수 있도록
            additionalMimeTypes: ['application/json'],

            // 라우터 연결
            requestHandler: router,

            // 요청 개수 = URL 개수
            maxRequestsPerCrawl: startUrls.length,

            // API 예의상 속도 제한 설정
            maxConcurrency: 5,
            maxRequestsPerMinute: 1000,
        },
        // 인스턴스 전용 설정(옵션)
        new Configuration({
            persistStorage: false,
        }),
    );

    await crawler.run(startUrls);
}


const cardGorillaIds = Array.from({ length: 3000 }, (_, i) => (i + 1).toString());

// 코드 재활용 시 이거 없애고, 외부에서 호출
// 저장할 내용 routes에서 구현해야함
await crawlerForNumberIds("https://api.card-gorilla.com:8080/v1/cards", cardGorillaIds);

console.log("END!");


