import { cleanEnv} from 'envalid';
import 'dotenv/config'
import {str,port, email} from 'envalid/dist/validators'
export default cleanEnv(process.env,{
    PORT:port(),
    MONGODB_URL_STRING  :str(),
    SECRET_KEY:str(),
    EMAIL_TEST:email(),
    EMAIL_TEST_APP:str()
    
})