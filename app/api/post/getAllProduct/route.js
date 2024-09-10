import { selectAllProduct } from "../../../_lib/db";
import { NextResponse } from "next/server";

export async function POST(req){
    try{
        const allProductQuery = await selectAllProduct();
        
        return NextResponse.json({message: allProductQuery.message}, {status: 200})
    }catch(err){
        console.error("모든 상품 정보 가져오기 서버 오류")
        return NextResponse.json({message: "allproduct server error"}, {status: 400})
    }
}