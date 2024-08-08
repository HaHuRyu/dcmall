import { searchRecom } from '../../../_lib/db';
import { NextResponse } from "next/server";

export async function POST(req){
    try{
        const {searchText} = await req.json();

        const res = searchRecom(searchText);
        console.log("중간 점검: "+res.message+" // 스테이터스: "+res.status+ " // searchText: "+searchText);

        return NextResponse.json({ message : res.message}, {status: res.status});
    }catch(err){
        console.log("검색어 추천 서버 캐치!"+err);
    }
}