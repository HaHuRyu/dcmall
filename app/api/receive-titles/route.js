import { getEmbedding } from "../../util/openai-utils";
/*둘 다 새로고침 해주면 통신은 된다 (서로 메세지를 주고 받음)
근데 titles이 비어있음 얘를 띄워두고 spring을 새로고침
*/
export async function POST(req) {
    try {
        const titles = await req.json();
        await console.log("I got titles!: ",titles);

        // 임베딩 계산
        for (const title of titles) {
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
