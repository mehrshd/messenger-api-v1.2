
import { verify, createPublicKey } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import AppError from "../errors/AppError.ts";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

const identityPath = join(
    currentDirectory,
    "../config/project-signature.json"
);

const publicKeyPath = join(
    currentDirectory,
    "../config/project-public.pem"
);

const verifyProjectIdentity = (): void => {
    try {
        const signatureData = JSON.parse(
            readFileSync(identityPath, "utf8")
        );

        const publicKey = createPublicKey(
            readFileSync(publicKeyPath, "utf8")
        );

        const payload = Buffer.from(
            JSON.stringify(signatureData.identity)
        );

        const signature = Buffer.from(
            signatureData.signature,
            "base64"
        );

        const isValid = verify(
            null,
            payload,
            publicKey,
            signature
        );

        if (!isValid) {
            throw new Error("Invalid project signature");
        }

        console.log(
            `[${signatureData.identity.author}] Project identity verified.`
        );
    } catch {
        throw new AppError("Project identity verification failed", 500);
    }
};

export default verifyProjectIdentity;
