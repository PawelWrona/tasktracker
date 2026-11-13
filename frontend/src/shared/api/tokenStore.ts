import { jwtDecode } from "jwt-decode"

let token: string | null = null

export const tokenStore = {
    get(){
        return token
    },
    set(newToken: string){
        token = newToken
    },
    isExpired(){
        if(!token) return true

        try{
            const decodedToken = jwtDecode(token)
            const currentTime = Date.now() / 1000

            if(!decodedToken.exp){
                return true
            }

            return decodedToken.exp < currentTime
        } catch {
            return true
        }
    },
    clear(){
        token = null
    }
}