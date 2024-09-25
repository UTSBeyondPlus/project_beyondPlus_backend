const axios = require('axios');

async function fetchMultipleRequests(url, count) {
    const promises = [];

    for (let i = 0; i < count; i++) {
        promises.push(
            axios.get(`${url}?param=${i}`)
                .then(response => {
                    console.log(`Response for request ${i}:`, response.data); // 결과 출력
                })
                .catch(error => {
                    console.error(`Error for request ${i}:`, error.message); // 오류 출력
                })
        );
    }

    // 모든 요청을 동시에 처리
    // await Promise.allSettled(promises);
    await Promise.all(promises);
}

// 함수 호출
fetchMultipleRequests('http://localhost:8080/test', 10);
