'use client'

import { useState } from "react";

export default function search(){
    let [title, titleModify] = useState("가나다");
    
    return(
        <form action={"/api/post/embeding"} method="post">
            <input type="text"
            value={title}
            onChange={(e) => e.target.value}/>
            <input type="submit"/>
        </form>
    )
}