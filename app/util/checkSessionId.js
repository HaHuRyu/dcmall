import { cookies } from "next/headers";

export function checkSessionId(){
    const cookieStore = cookies();
    const nextSession = cookieStore.get('next-session');
    let loginSession = null;

    if (nextSession != null) {
        const valueObj = JSON.parse(nextSession.value);
        loginSession = valueObj.sessionID;
    }

    return loginSession
}