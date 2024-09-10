import { NextResponse } from "next/server";
import { searchLinking } from "../../../_lib/db";

export async function POST(req){
    const {searchText} = await req.json();

    const res = await searchLinking(searchText);

    if(res.status === 200){
        return NextResponse.json({message: res.message, status: 200});
    }else{
        return NextResponse.json({message: null, status: 400});
    }
}