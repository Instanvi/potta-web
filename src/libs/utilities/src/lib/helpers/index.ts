import CryptoJS from "crypto-js"
import CountryList from 'country-list-with-dial-code-and-flag'
import { CountryInterface } from "country-list-with-dial-code-and-flag/dist/types";
import { SECRET } from '../configs/env';

const countries: CountryInterface[] = CountryList.getAll()

export const countryList = countries?.map(country => {
    return { value: country.name, label: `${country.flag} ${country.name}` }
})

export const getAndDecrypt =(name:string)=>{
    const data = localStorage.getItem(name) as string
    if (data){
        const decrypt = CryptoJS.AES.decrypt(data, SECRET);
        const result = decrypt.toString(CryptoJS.enc.Utf8);
        return result
    }
    else return null
}

export const encryptAndStore =(name:string, data: string)=>{
    if (data){
        const decrypt = CryptoJS.AES.decrypt(data, SECRET);
        const result = decrypt.toString(CryptoJS.enc.Utf8);
       return localStorage.setItem(name, result.toString());
    }
    else return null
} 
