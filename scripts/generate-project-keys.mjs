
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
});

const privateDirectory = join(
    homedir(),
    ".config",
    "aloki",
    "keys"
);

mkdirSync(privateDirectory, { recursive: true });

writeFileSync(
    join(privateDirectory, "messenger-private.pem"),
    privateKey,
    { mode: 0o600 }
);

writeFileSync(
    "src/config/project-public.pem",
    publicKey
);

console.log("ALOKI key pair generated successfully.");
console.log("Private key saved outside the project.");
console.log("Public key saved inside the project.");
