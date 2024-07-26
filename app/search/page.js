'use client'

import { useState } from "react";

export default function search(){
    const [title, titleModify] = useState('');
    
    return(
        <form action={"/api/post/embeding"} method="post">
            <input type="text"
            name="searchText"/>
            <input type="submit"/>
        </form>
    )
}