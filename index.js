const express = require("express");
// const helmet = require("helmet");
const app = (exports.app = express());
// app.use(helmet());
// const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
const bcrypt = require("./bcrypt");

const methodOverride = require("method-override");
// setting cookies
// it's secure because you cannot fake them, but you can decode the values in dev tools
const cookieSession = require("cookie-session");
const csurf = require("csurf");

// const { hash } = require("bcryptjs");
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

//function that validates input from user profile input
const validator = (age, homePage) => {
    let empty;
    if (isNaN(age)) {
        empty = "Please use digits to specify your age";
        return empty;
    } else if (age < 0) {
        if (age < -99) {
            empty = `Do you remember last Ice Age?`;
            return empty;
        } else {
            empty = `Come back to us in ${age.slice(1)} years`;
            return empty;
        }
    } else if (age > 99) {
        empty = "Did you lost your false teeth grandpa?";
        return empty;
    } else if (homePage) {
        if (
            !homePage.startsWith("http://") &&
            !homePage.startsWith("https://")
        ) {
            if (homePage.startsWith("www")) {
                empty = "Please add http:// or https:// to your e-mail address";
                return empty;
            }
            empty = "Please start your url with http:// or https://";
            return empty;
        }
    }
};

//

// check for cookies - middleware
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/register");
    }
};
//

const isLoggedOut = (req, res, next) => {
    if (!req.session.user) {
        next();
    } else {
        res.redirect("/petition");
    }
};

// check if filled data
const isUserData = (req, res, next) => {
    if (!req.session.user.profile) {
        next();
    } else {
        res.redirect("/petition");
    }
};

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

// config for cookies
app.use(
    cookieSession({
        name: "r2d2",
        secret: "c3po",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
//

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.set("x-frame-options", "DENY");
    next();
});

app.use(express.static("./public"));
app.get("/", isLoggedOut, (req, res) => {
    res.redirect("/login");
});

app.get("/login", isLoggedOut, (req, res) => {
    res.render("login");
});

app.post("/login", isLoggedOut, (req, res) => {
    const { emailAddress, password } = req.body;
    if (emailAddress && password) {
        db.getUserData(emailAddress)
            .then(({ rows }) => {
                if (rows.length !== 0) {
                    const hash = rows[0].password;
                    bcrypt
                        .compare(password, hash)
                        .then((auth) => {
                            if (auth) {
                                req.session.user = {
                                    id: rows[0].id,
                                    firstName: rows[0].first,
                                    lastName: rows[0].last,
                                    email: emailAddress,
                                    admin: rows[0].admin,
                                };
                                req.session.user.profile = true;
                                res.redirect("/petition");
                            } else {
                                res.render("login", {
                                    empty: "Invalid login or password",
                                });
                            }
                        })
                        .catch((err) => {
                            console.log("Err in matching the password: ", err);
                            res.render("login", {
                                empty:
                                    "Something went wrong. Please try again later.",
                            });
                        });
                } else {
                    res.render("login", {
                        empty: "E-mail address does not exist in database",
                    });
                }
            })
            .catch((err) => {
                console.log("Error in loging in: ", err);
                res.render("login", {
                    empty: "Something went wrong with db connection.",
                });
            });
    } else {
        res.render("login", {
            empty: "Please fill in both username and password.",
        });
    }
});

app.get("/register", isLoggedOut, (req, res) => {
    res.render("register");
});

app.post("/register", isLoggedOut, (req, res) => {
    const { firstName, lastName, emailAddress, password } = req.body;
    if (firstName && lastName && emailAddress && password) {
        db.getUserData(emailAddress)
            .then(({ rows }) => {
                if (rows.length === 0) {
                    bcrypt
                        .hash(password)
                        .then((hash) => {
                            db.addUser(firstName, lastName, emailAddress, hash)
                                .then(({ rows }) => {
                                    req.session.user = {
                                        id: rows[0].id,
                                        firstName: firstName,
                                        lastName: lastName,
                                        email: emailAddress,
                                    };

                                    res.redirect("/profile");
                                })
                                .catch((err) => {
                                    res.render("register", {
                                        empty:
                                            "Error while adding users to the db.",
                                    });
                                    console.log(
                                        "Error while creating a user: ",
                                        err
                                    );
                                });
                        })
                        .catch((err) => {
                            res.render("register", {
                                empty: "Something went wrong. Please try again",
                            });
                            console.log("Error while making a password: ", err);
                        });
                } else {
                    res.render("register", {
                        empty: "E-mail already exists in database",
                    });
                }
            })
            .catch((err) => {
                res.render("register", {
                    empty: "Error internal db request",
                });
                console.log("Error internal db request: ", err);
            });
    } else {
        res.render("register", {
            empty: "All fields are required",
        });
    }
});

app.use(isLoggedIn);

app.get("/petition", (req, res) => {
    const { id } = req.session.user;
    const { user } = req.session;

    if (req.session.user.signatureId) {
        req.session.user.profile = true;

        res.redirect("/signed");
    } else {
        db.getIfSignature(id)
            .then(({ rows }) => {
                if (rows.length === 0) {
                    req.session.user.profile = true;

                    res.render("petition", {
                        isLoggedIn: true,
                        user,
                    });
                } else {
                    req.session.user.signatureId = rows[0].id;

                    res.redirect("/signed");
                }
            })
            .catch((err) => {
                console.log(
                    "error while getting signature id, can't check whether user signed or no: ",
                    err
                );
                res.redirect("/logout");
            });
    }
});

app.post(
    "/petition",
    (req, res, next) => {
        const { signatureId } = req.session.user;
        if (signatureId) {
            res.redirect("/signed");
        } else {
            next();
        }
    },
    (req, res) => {
        const { signature } = req.body;
        const { id } = req.session.user;
        const { user } = req.session;

        if (signature) {
            db.addSignature(signature, id)
                .then(({ rows }) => {
                    // setting cookie value
                    // we can add another values here and in routes use && operator to determine access to different places
                    req.session.user.signatureId = rows[0].id;
                    res.redirect("/signed");
                })
                .catch((err) => {
                    console.log("Error while adding a signature: ", err);
                    res.render("petition", {
                        user,
                        empty:
                            "Internal database error while making a petition",
                        isLoggedIn: true,
                    });
                });
        } else {
            res.render("petition", {
                user,
                empty: "Please sign up the petition!",
                isLoggedIn: true,
            });
        }
    }
);

app.get("/signed", signatureCheck, (req, res) => {
    const { user } = req.session;
    db.getImageUrl(req.session.user.signatureId)
        .then((url) => {
            if (url.rows.length !== 0) {
                let imgUrl = url.rows[0].signature;
                db.countSignatures()
                    .then(({ rows }) => {
                        res.render("signed", {
                            rows,
                            imgUrl,
                            isLoggedIn: true,
                            user,
                        });
                    })
                    .catch((err) => {
                        console.log("Error with obtaining singers number", err);
                        res.render("signed", {
                            empty: "Internal database error",
                            isLoggedIn: true,
                            user,
                            imgUrl,
                        });
                    });
            } else {
                delete req.session.user.signatureId;
                res.redirect("/petition");
                console.log("pic deleted by admin");
            }
        })
        .catch((err) => {
            console.log("Something went wrong with obtaining image URL", err);
            res.render("signed", {
                empty: "Internal database error",
                isLoggedIn: true,
                user,
            });
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
            res.render("signers", {
                isLoggedIn: true,
                user,
                empty: "Internal db error",
            });
        });
});

app.get("/profile", isUserData, (req, res) => {
    const { user } = req.session;
    res.render("profile", {
        isLoggedIn: true,
        user,
    });
});

app.post("/profile", isUserData, (req, res) => {
    var { age, city, homePage } = req.body;
    const { id } = req.session.user;
    const { user } = req.session;
    const empty = validator(age, homePage);
    if (empty) {
        res.render("profile", {
            empty,
            isLoggedIn: true,
            user,
        });
    } else {
        db.addUserProfile(age, city, homePage, id)
            .then(() => {
                req.session.user.profile = true;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("something went wrong with adding profile: ", err);
                res.render("profile", {
                    empty: "Internal database error",
                    isLoggedIn: true,
                    user,
                });
            });
    }
});

app.get("/signers/:city", signatureCheck, (req, res) => {
    const { user } = req.session;
    const { city } = req.params;

    db.getSignaturesCity(city)
        .then(({ rows }) => {
            res.render("signersCity", {
                isLoggedIn: true,
                user,
                rows,
                city,
            });
        })
        .catch((err) => {
            console.log("error while obtaing data from db: ", err);
            res.render("signers", {
                empty: "Internal database error",
                isLoggedIn: true,
                user,
            });
        });
});

app.get("/profile/edit", (req, res) => {
    let { user } = req.session;
    db.getUserDataForUpdate(user.id)
        .then(({ rows }) => {
            user.firstName = rows[0].first;
            user.lastName = rows[0].last;
            user.email = rows[0].email;
            user.age = rows[0].age;
            user.city = rows[0].city;
            user.url = rows[0].url;
            req.session.user.profile = true;

            res.render("profileEdit", {
                isLoggedIn: true,
                user,
                rows,
            });
        })
        .catch((err) => {
            console.log("Error in obtaining user data: ", err);
            res.render("profileEdit", {
                isLoggedIn: true,
                user,
                empty: "Internal db error",
            });
        });
});

app.post("/profile/edit", (req, res) => {
    let {
        firstName,
        lastName,
        emailAddress,
        age,
        city,
        homePage,
        password,
    } = req.body;
    const { user } = req.session;
    const empty = validator(age, homePage);

    if (empty) {
        res.render("profileEdit", {
            isLoggedIn: true,
            user,
            empty,
        });
    } else {
        db.getUserData(emailAddress)
            .then(({ rows }) => {
                if (rows.length === 0 || rows[0].email === user.email) {
                    db.updateUsers(user.id, firstName, lastName, emailAddress)
                        .then(() => {
                            user.firstName = firstName;
                            user.lastName = lastName;
                            user.email = emailAddress;

                            db.upsertUsers(age, city, homePage, user.id)
                                .then(() => {
                                    user.age = age;
                                    user.city = city;
                                    user.url = homePage;

                                    if (password) {
                                        bcrypt
                                            .hash(password)
                                            .then((hash) => {
                                                db.updateUserPassword(
                                                    user.id,
                                                    hash
                                                )
                                                    .then(() => {
                                                        res.render(
                                                            "profileEdit",
                                                            {
                                                                isLoggedIn: true,
                                                                user,
                                                                good:
                                                                    "Your profile has been succesfully updated",
                                                            }
                                                        );
                                                    })
                                                    .catch((err) => {
                                                        console.log(
                                                            "Error while updating user password: ",
                                                            err
                                                        );
                                                        res.render(
                                                            "profileEdit",
                                                            {
                                                                isLoggedIn: true,
                                                                user,
                                                                empty:
                                                                    "Error while updating user password",
                                                            }
                                                        );
                                                    });
                                            })
                                            .catch((err) => {
                                                console.log(
                                                    "error while hashing the password: ",
                                                    err
                                                );
                                                res.render("profileEdit", {
                                                    isLoggedIn: true,
                                                    user,
                                                    empty:
                                                        "Internal error while hashing the password",
                                                });
                                            });
                                    } else {
                                        res.render("profileEdit", {
                                            isLoggedIn: true,
                                            user,
                                            good:
                                                "Your profile has been succesfully updated",
                                        });
                                    }
                                })
                                .catch((err) => {
                                    console.log(
                                        "Something went wrong while making second part of update: ",
                                        err
                                    );
                                    res.render("profileEdit", {
                                        isLoggedIn: true,
                                        user,
                                        empty:
                                            "Internal error while updating part 2 of database",
                                    });
                                });
                        })
                        .catch((err) => {
                            console.log("error in updating database: ", err);
                            res.render("profileEdit", {
                                isLoggedIn: true,
                                user,
                                empty: "We need to know this about you",
                            });
                        });
                } else {
                    res.render("profileEdit", {
                        isLoggedIn: true,
                        user,
                        empty:
                            "Sorry but this e-mail already exists in the database",
                    });
                }
            })
            .catch((err) => {
                console.log("error while checking e-mail address", err);
                res.render("profileEdit", {
                    isLoggedIn: true,
                    user,
                    empty: "Error while checking e-mail address",
                });
            });
    }
});

app.get("/profile/delete", (req, res) => {
    const { user } = req.session;

    res.render("profileDelete.handlebars", {
        isLoggedIn: true,
        user,
    });
});

app.post("/profile/delete", (req, res) => {
    const { user } = req.session;
    const { password } = req.body;

    db.getUserData(user.email)
        .then(({ rows }) => {
            const hash = rows[0].password;
            bcrypt
                .compare(password, hash)
                .then((auth) => {
                    if (auth) {
                        db.deleteUserAccount(user.id)
                            .then(() => {
                                res.redirect("/logout");
                            })
                            .catch((err) => {
                                console.log("error", err);
                                res.render("profileDelete", {
                                    isLoggedIn: true,
                                    user,
                                    empty: "Internal db error.",
                                });
                            });
                    } else {
                        res.render("profileDelete", {
                            isLoggedIn: true,
                            user,
                            empty: "Sorry, but password does not match.",
                        });
                    }
                })
                .catch((err) => {
                    console.log("Error while comparing password: ", err);
                    res.render("profileDelete", {
                        isLoggedIn: true,
                        user,
                        empty: "Error while comparing passwords",
                    });
                });
        })
        .catch((err) => {
            console.log("Error while obtaining data from db: ", err);
            res.render("profileDelete", {
                isLoggedIn: true,
                user,
                empty: "Internal error.",
            });
        });
});

//How I can be sure that users nobody will be able to fake the request, other users, third parties?
app.delete("/signers/delete/:id", (req, res) => {
    const { id } = req.params;
    //check with req.session here before db query is enought, but my isLoggedIn is enough
    if (req.session.user.signatureId == id) {
        db.deleteSignature(id)
            .then(() => {
                delete req.session.user.signatureId;
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error while making delete request", err);
            });
    } else if (req.session.user.admin) {
        db.deleteSignature(id)
            .then(() => {
                res.redirect("/signers");
            })
            .catch((err) => {
                console.log("error while making delete request", err);
            });
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Server is listening...");
    });
}

// => toCheck constent security policy header and external policy headers
// check all securities
// admin tool
// handle when deleted, what in route, user
// => toDO  Protecting against CSURF
// => app.use(csurf()) goes AFTER .use cookieSession, urlencoded
// res.set('x-frame-options','deny') can be also in csurf middleware(app.use)
// => toDo res.setHeader('xframes - deny') - against clickjacking
// server form validations?
//when signed details straight after reg. -> never show again
//forgot your password?
//validation for too many characters
//frontend validation - server rejection
//first backend validation, then frontend validation

// csurf, xframe:

// app.use(csurf());
// app.use(function (req, res, next) {
//     res.set("x-frame-options", "Deny");
//     res.locals.csurfToken = req.csurfToken();
//     next();
// });

//req. Logged In, Logged out, Signed, Not Signed
//export middleware that we wrote to other file and import/ require them, copy paste and export
//zrozumieć routing

// return  res.redirect also possible!!
// push msgs?
