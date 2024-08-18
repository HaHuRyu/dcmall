import {getEmbedding} from "../../../util/openai-utils"

export async function POST(req){
    // const searchText = await req.json();
    const { searchText } = await req.json();
    console.log(searchText);
    let emtext;
    // if("Threshold" in searchText ){
    //     const {title, threshold} = searchText;
    //     emtext = getEmbedding(title, threshold);
    // } else {
       emtext = getEmbedding(searchText, "x");
    // }
    console.log("testdsadsa" + emtext)
    return emtext;

}