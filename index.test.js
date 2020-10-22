const supertest = require("supertest");
const { app } = require("./index.js");
const cookieSession = require("cookie-session");

test("Users who are logged out are redirected to the registration page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({});
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/register");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to either the registration page", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
        },
    });

    return supertest(app)
        .get("/register")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});

test("Users who are logged in are redirected to the petition page when they attempt to go to either the login page", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
        },
    });
    return supertest(app)
        .get("/login")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
            signatureId: 1,
        },
    });
    return supertest(app)
        .get("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/signed");
        });
});

test("Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to submit the signature", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
            signatureId: 1,
        },
    });
    return supertest(app)
        .post("/petition")
        .then((res) => {
            expect(res.headers.location).toBe("/signed");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to thank you page", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
        },
    });
    return supertest(app)
        .get("/signed")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});

test("Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to the signers page", () => {
    cookieSession.mockSessionOnce({
        user: {
            id: 1,
        },
    });
    return supertest(app)
        .get("/signers")
        .then((res) => {
            expect(res.headers.location).toBe("/petition");
        });
});
