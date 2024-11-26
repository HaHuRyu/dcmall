import { selectAllProduct, productinfoMaxPostId } from "../../../_lib/db";
import { redisFullSize, getAllRecords } from "../../../_lib/redis"
import { NextResponse } from "next/server";
/*
1. InfScroll에 redis의 모든 정보를 넘겨 먼저 뿌리도록 유도한다
2. db.lib의 productinfoMaxPostId - redis.js의 redisFullSize = postid 저장 없이 마지막 redis에 있는 마지막 postid를 알아낼 수 있음
3. 그보다도 미만인 놈들로만 resultList에 넣어 InfScroll에 보내 나머지를 뿌려준다
*/
export async function POST(req){
    try{
        const redisAllRecord = await getAllRecords();
        return NextResponse.json({message: redisAllRecord}, {status: 200})
    }catch(err){
        console.error("redis 상품 정보 가져오기 서버 오류: ",err)
        return NextResponse.json({message: "allproduct redis server error"}, {status: 500})
    }
}

export async function GET(req){
    try{
        const MaxPostIdResult = await productinfoMaxPostId();
        const redisFullSizeResult = await redisFullSize();

        const boarder = MaxPostIdResult.message - redisFullSizeResult
    
        const resultList = await selectAllProduct(boarder);
        console.log(boarder+" = 보더 // "+JSON.stringify(resultList))
        return NextResponse.json({message:resultList.message}, {status: 200});
    }catch(err){
        console.err("모든 상품 가져오기 서버 오류: ",err)
        return NextResponse.json({message: "allproduct server error"}, {status: 500})
    }
}