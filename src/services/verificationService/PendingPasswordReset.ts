interface PendingPasswordReset {
    email: string;
    codeHash: string;
    verified?: boolean;
    expiresAt: number;
    attempts: number;
}

const PendingPasswordResets = new Map<string, PendingPasswordReset>();

export default PendingPasswordResets