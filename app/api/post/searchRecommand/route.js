import { searchRecom } from '../../../_lib/db';
import { NextResponse } from "next/server";

export async function POST(req){
    try{
        const {searchText} = await req.json();

        const res = await searchRecom(searchText);

        if(res.status === 200){
            return NextResponse.json({ message : res.message}, {status: res.status});
        }else{
            return NextResponse.json({ message : null}, {status: res.status});
        }
    }catch(err){
        console.log("검색어 추천 서버 캐치!"+err);
        return NextResponse.json({ message : null}, {status: res.status});
    }
}