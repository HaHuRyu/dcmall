import {storeID, storePW} from '@/app/loginInfo'
import CryptoJS from 'crypto-js';

// @/ => 현재 앱의 최상위 경로
export default function handler(req, res)
{
    if(req.method == "POST")
    {

        try
        {
            const {id, password} = req.body;
            var hashPW = CryptoJS.SHA256(password);

            if(storeID == id && storePW == hashPW)
            {
                console.log("Collect");
            }
            else
            {
                console.log("Wrong");
            }

            return res.status(200).redirect(302, '/');
        }catch(error)
        {
            return res.status(500).json("Error!");
        }
        
    }
}