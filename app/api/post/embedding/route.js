import { NextResponse } from "next/server";
import {getEmbedding} from "../../../util/openai-utils"

export async function POST(req){
    const obj = await req.json();
    let emtext;
    if("threshold" in obj ){
        const {title, threshold} = obj;
        emtext = getEmbedding(title, threshold);
    } else {
        const {searchText} = obj;
        emtext = getEmbedding(searchText, "x");
    }
    console.log("testdsadsa" + emtext)
    return emtext;

}