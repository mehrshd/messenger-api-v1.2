
import {
    createPrivateKey,
    sign
} from "node:crypto";

import {
    readFileSync,
    writeFileSync
} from "node:fs";

import { homedir } from "node:os";
import { join } from "node:path";

const identity = {
    author: "ALOKI",
    signature: "ALOKI-MESSENGER-2026",
    version: "1.0.0"
};

const privateKeyPath = join(
    homedir(),
    ".config",
    "aloki",
    "keys",
    "messenger-private.pem"
);

const privateKey = createPrivateKey(
    readFileSync(privateKeyPath, "utf8")
);


const payload = JSON.stringify(identity);

const signature = sign(
    null,
    Buffer.from(payload),
    privateKey
).toString("base64");

const signatureData = {
    identity,
    signature
};

writeFileSync(
    "src/config/project-signature.json",
    JSON.stringify(signatureData, null, 4) + "\n"
);

console.log("Project identity signed successfully.");
