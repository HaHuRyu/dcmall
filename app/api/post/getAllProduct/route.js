import { selectAllProduct, perfectUrlByProductId } from "../../../_lib/db";
import { NextResponse } from "next/server";

export async function POST(req){
    try{
        const allProductQuery = await selectAllProduct();
        const resultList = [];
        
        for(const product of allProductQuery.message){
            const perfectUrlQuery = await perfectUrlByProductId(product.id);
            if(perfectUrlQuery.status === 200){
                const perfectUrl = perfectUrlQuery.message + product.url;
                resultList.push({
                    cost: product.cost,
                    title: product.title,
                    perfectUrl: perfectUrl
                });
            }else{
                console.error("perfectUrlByProductId 오류: "+perfectUrlQuery.message);
                console.error("모든 상품 정보 가져오기 서버 오류")
                return NextResponse.json({message: "allproduct server error"}, {status: 400})
            }
        }
        return NextResponse.json({message: resultList}, {status: 200})
    }catch(err){
        console.error("모든 상품 정보 가져오기 서버 오류")
        return NextResponse.json({message: "allproduct server error"}, {status: 400})
    }
}