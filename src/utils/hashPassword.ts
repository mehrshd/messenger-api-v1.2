import bcrypt from 'bcrypt'

const HashPassword = async(password: string) => {
    return await bcrypt.hash(password, 10);
}

const ComparePassword = async(password:string, hashPassword:string) => {
    return await bcrypt.compare(password, hashPassword)
}

export {
    HashPassword,
    ComparePassword
}