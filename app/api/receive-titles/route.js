import { getEmbedding } from "../../util/openai-utils";
/*240625 서로 titles 가능
*/
export async function POST(req) {
    try {
        const titles = await req.json();

        // 임베딩 계산
        for (const title of titles) {
            console.log("가져온 제목: ",title);
            await getEmbedding(title);
        }

        return new Response(JSON.stringify({ message: "Success" }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error("처리 실패: ", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
