import jwt from 'jsonwebtoken'
import env from '../util/validate'

const generateToken =  (id:string) => {
    return jwt.sign({id}, env.SECRET_KEY,{expiresIn:'30d'} )
}

export default generateToken