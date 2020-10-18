const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
const methodOverride = require("method-override");
const bcrypt = require("./bcrypt");

// const url = require("url");
// setting cookies
// it's secure because you cannot fake them, but you can decode the values in dev tools
const cookieSession = require("cookie-session");
//
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false }));

// check for cookies - middleware
const signatureCheck = (req, res, next) => {
    if (req.session.user.signatureId) {
        next();
    } else {
        res.redirect("/petition");
    }
};
//

// check for cookies - middleware
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};
//

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

// config for cookies
app.use(
    cookieSession({
        name: "session",
        secret: "I am so hungry!",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
//

app.use(express.static("./public"));
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    const { emailAddress, password } = req.body;
    db.getUserPassword(emailAddress)
        .then(({ rows }) => {
            const hash = rows[0].password;
            bcrypt
                .compare(password, hash)
                .then((auth) => {
                    if (auth) {
                        db.getUserData(emailAddress)
                            .then(({ rows }) => {
                                req.session.user = {
                                    id: rows[0].id,
                                    firstName: rows[0].first,
                                    lastName: rows[0].last,
                                    email: emailAddress,
                                    admin: rows[0].admin,
                                };
                                console.log("cookie: ", req.session.user);
                                res.redirect("/signed");
                            })
                            .catch((err) => {
                                console.log("error in sql: ", err);
                            });
                    } else {
                        res.render("login", {
                            empty: "Invalid login or password.",
                        });
                    }
                })
                .catch((err) => {
                    console.log("Err in matching the password: ", err);
                });
        })
        .catch((err) => {
            console.log("Error in loging in: ", err);
            res.render("login", {
                empty: "Invalid login or password.",
            });
        });
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;
    const time = new Date();
    console.log(firstName, lastName, emailAddress, password);
    bcrypt
        .hash(password)
        .then((hash) => {
            db.addUser(firstName, lastName, emailAddress, hash, time)
                .then(({ rows }) => {
                    req.session.user = {
                        id: rows[0].id,
                        firstName: firstName,
                        lastName: lastName,
                        email: emailAddress,
                    };
                    res.redirect("/petition");
                })
                .catch((err) => {
                    res.render("register", {
                        empty: "Please fill in all the fields.",
                    });
                    console.log("Error while creating a user: ", err);
                });
        })
        .catch((err) => {
            console.log("Error while making a password: ", err);
        });
});

app.use(isLoggedIn);

app.get("/petition", (req, res) => {
    const { id } = req.session.user;
    const { user } = req.session;

    if (!req.session.user.signatureId) {
        db.getIfSignature(id).then(({ rows }) => {
            if (rows.length === 0) {
                res.render("petition", {
                    isLoggedIn: true,
                    user,
                });
            } else {
                console.log("second: ", rows);
                req.session.user.signatureId = rows[0].id;
                res.redirect("/signed");
            }
        });
    } else {
        res.redirect("/signed");
    }
});

app.get("/signed", signatureCheck, (req, res) => {
    db.getImageUrl(req.session.user.signatureId)
        .then((url) => {
            let imgUrl = url.rows[0].signature;
            const { user } = req.session;
            db.countSignatures()
                .then(({ rows }) => {
                    // console.log(rows);
                    res.render("signed", {
                        rows,
                        imgUrl,
                        isLoggedIn: true,
                        user,
                    });
                })
                .catch((err) => {
                    console.log("Error with obtaining singers number", err);
                });
        })
        .catch((err) => {
            console.log("Something went wrong with obtaining image URL", err);
            res.redirect("/petition");
        });
});

app.get("/signers", signatureCheck, (req, res) => {
    const { user } = req.session;

    db.getSignatures()
        .then(({ rows }) => {
            res.render("signers", {
                rows,
                isLoggedIn: true,
                user,
            });
        })
        .catch((err) => {
            console.log("error in get Signers: ", err);
        });
});

app.post("/petition", (req, res) => {
    const { signature } = req.body;
    const { firstName, lastName, id } = req.session.user;
    const time = new Date();

    db.addSignature(firstName, lastName, signature, time, id)
        .then(({ rows }) => {
            // setting cookie value
            // we can add another values here and in routes use && operator to determine access to different places
            req.session.user.signatureId = rows[0].id;
            //
            res.redirect("/signed");
        })
        .catch((err) => {
            const { user } = req.session;

            console.log("Something went wrong: ", err);
            res.render("petition", {
                user,
                empty: true,
                isLoggedIn: true,
            });
        });
});

app.delete("/signers/:id", (req, res) => {
    const { id } = req.params;
    db.deleteSignature(id)
        .then(() => {
            delete req.session.user.signatureId;
            res.redirect("/signers");
        })
        .catch((err) => {
            console.log("error while making delete request", err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(8080, () => {
    console.log("Server is listening...");
});

// => toCheck constent security policy header and external policy headers
// check all securities
// admin tool
// handle when deleted, what in route, user
// => toDO  Protecting against CSURF
// => app.use(csurf()) goes AFTER .use cookieSession, urlencoded
// res.set('x-frame-options','deny') can be also in csurf middleware(app.use)
// => toDo res.setHeader('xframes - deny') - against clickjacking
