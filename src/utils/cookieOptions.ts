const cookieSecureFlag = (): boolean => {
    return process.env.NODE_ENV === "production";
};

const baseCookieOptions = () => ({
    httpOnly: true,
    secure: cookieSecureFlag(),
    sameSite: "lax" as const,
    path: "/"
});

export {
    cookieSecureFlag,
    baseCookieOptions
};
