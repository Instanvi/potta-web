import CryptoJS from "crypto-js"
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// import { API_URL, SECRET } from "./env";

const axios = Axios.create({ baseURL: 'https://staging.instanvi.com/api' })

export const refreshTokenAPI = async (refresh_token:string):Promise<{access_token:string,refresh_token:string}> =>{
  const response = await axios.post(`/auth/refresh_token/`, {refresh_token})
   return response?.data;
}

const authRequestInterceptor = async (
	config: AxiosRequestConfig
): Promise<any> => {
	const storage = await localStorage.getItem("token")
	config.headers = { ...config.headers }

	if (storage) {
    const decrypt = CryptoJS.AES.decrypt(storage, '0946323')
		const token = decrypt.toString(CryptoJS.enc.Utf8)
		config.headers.authorization = `Bearer ${token}`
	}

  config.headers['orgId'] = '8f79d19a-5319-4783-8ddc-c863d98ecc16';
  config.headers['userId']='8f79d19a-5319-4783-8ddc-c863d98ecc16'
  config.headers['branchId']='f7b1b3b0-0b1b-4b3b-8b1b-0b1b3b0b1b3b'
	config.headers.Accept = "/"
  config.headers["Content-Type"]="application/json"

  // Log request details
  console.log('REQUEST:', {
	url: (config.baseURL || '') + (config.url || ''),
    method: config.method,
    headers: config.headers,
    data: config.data,
    params: config.params
  });

	return config
}

axios.interceptors.request.use(authRequestInterceptor)
axios.interceptors.response.use(
	(response: AxiosResponse) => {
    // Log successful response
    console.log('RESPONSE:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });

		const status = response?.status
		if ([200, 201].includes(status)) {
			return response?.data // use optional chaining to avoid errors if the data doesn't exist
		}
		else if (status === 401) {
			localStorage.clear()

			// const storage = localStorage.getItem("refresh")

			// if (storage) {
			// 	const decrypt = CryptoJS.AES.decrypt(storage, SECRET)
			// 	const token = decrypt.toString(CryptoJS.enc.Utf8)
			// 	refreshTokenAPI(token)
			// 	.then((data) => {
			// 		// const usertoken = data?.access_token
			//     // const token =  CryptoJS.AES.encrypt(usertoken, SECRET)
			//     // const refreshtoken =  CryptoJS.AES.encrypt(data?.refresh_token, SECRET)
			//     // localStorage.setItem("token", token.toString())
			//     // localStorage.setItem("refresh", refreshtoken.toString())
			// 		const usertoken = data?.access_token
			//     const refreshtoken =  data?.refresh_token
			//     encryptAndStore("token", usertoken)
			//     encryptAndStore("refresh", refreshtoken)
			// 	})
			// 	.catch(()=>{
			// 		localStorage.clear()
			// 	})
			// }

		}
		 else {
			return "pas de donnees disponible" // return a string instead of throwing an error
		}
	},
	(error) => {
    // Log error response
    console.log('RESPONSE ERROR:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data,
      message: error.message
    });

		if (error?.response?.status === 401) {
			localStorage.clear()
			// const storage = localStorage.getItem("refresh")

			// if (storage) {
			// 	const decrypt = CryptoJS.AES.decrypt(storage, SECRET)
			// 	const token = decrypt.toString(CryptoJS.enc.Utf8)
			// 	refreshTokenAPI(token)
			// 	.then((data) => {
			// 		const usertoken = data?.access_token
			//     const refreshtoken =  data?.refresh_token
			//     encryptAndStore("token", usertoken)
			//     encryptAndStore("refresh", refreshtoken)
			// 	})
			// 	.catch(()=>{
			// 		localStorage.clear()
			// 	})
			// }
		}
		return Promise.reject(error)
	}
)

export default axios
