export interface pendingVerification {
    fullname: string;
    email: string;
    passwordHash: string;
    codeHash: string;
    expiresAt: number;
    attempts: number;
    verified?: boolean;
}

const pendingVerifications = new Map<string, pendingVerification>();

export default pendingVerifications;