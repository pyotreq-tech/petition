const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const db = require("./db");
const cookieSession = require("cookie-session");

const cookieCheck = (req, res, next) => {
    if (req.session.signatureId) {
        next();
    } else {
        res.redirect("/petition");
    }
};

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.use(
    cookieSession({
        name: "session",
        secret: "I am so hungry!",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (!req.session.signatureId) {
        res.render("petition");
    } else {
        res.redirect("/signed");
    }
});

app.get("/signed", cookieCheck, (req, res) => {
    db.getImageUrl(req.session.signatureId)
        .then((url) => {
            let imgUrl = url.rows[0].signature;
            db.countSignatures()
                .then(({ rows }) => {
                    // console.log(rows);
                    res.render("signed", {
                        rows,
                        imgUrl,
                    });
                })
                .catch((err) => {
                    console.log("Error with obtaining singers number", err);
                });
        })
        .catch((err) => {
            console.log("Something went wrong with obtaining image URL", err);
        });
});

app.get("/signers", cookieCheck, (req, res) => {
    db.getSignatures()
        .then(({ rows }) => {
            res.render("signers", {
                rows,
            });
        })
        .catch((err) => {
            console.log("error in get Signers: ", err);
        });
});

app.post("/petition", (req, res) => {
    const { firstName, lastName, signature } = req.body;
    const time = new Date();
    // checking if all fields are filled
    if (firstName !== "" && lastName !== "" && signature !== "") {
        db.addSignature(firstName, lastName, signature, time)
            .then(({ rows }) => {
                req.session.signatureId = rows[0].id;
                res.redirect("/signed");
            })
            .catch((err) => {
                console.log("Something went wrong: ", err);
            });
    } else {
        res.render("petition", {
            empty: true,
        });
    }
});

app.listen(8080, () => {
    console.log("Server is listening...");
});
