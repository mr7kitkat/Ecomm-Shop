const express = require("express");
const db = require("./repo/users");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
    keys:["uncweu983u43498uc98n48u3298"]
}))

app.get("/", (req, res) => {
    res.redirect("/signup");
})

app.get("/signup", (req, res) => {
    res.send(
        `
        <div>
        <form method="post">
            <input type="email" name="email">
            <br>
            <input type="password" name="password">
            <br>
            <input type="password" name="passwordConfirmation">
            <br>
            <button>Sign Up</button>
        </form>
        </div>  
        `
    )
});

app.post("/signup", async (req, res) => {
    const {email, password, passwordConfirmation} = req.body;
    const useremail = await db.getOneByFilter({email});
    
    if (useremail) {
        return res.send("Sorry this email is already in use sir!");
    }else if (password !== passwordConfirmation) {
        return res.send("Sorry but password is not matching !");
    } 

    db.create({email, password});
    return res.send(`
    Yuppy account created sucessfully, now you can <a href="/login">login</a>
    `)
});

app.get("/login", (req, res) => {
    if (req.session.id) {
        res.redirect("/welcome");
    }
    res.send(
        `
        <div>
        <form method="post">
            <input type="email" name="email">
            <br>
            <input type="password" name="password">
            <br>
            <button>Sign In</button>
        </form>
        </div>  
        `
    )  
});

app.post("/login", async(req, res) => {
    const {email, password} = req.body;
    const useremail = await db.getOneByFilter({email});

    if (!useremail) {
        return res.send(`
        No user available with this username, if this is your first time on this page please <a href="/signup">Sign up</a>.
        `);
    }

    const result = await db.comparePasswords(password, useremail.password);
    
    if(result) {
        req.session.id = useremail.id;
        return res.redirect("/welcome");
    }else{
        return res.send(`
        Wrong password dude, <a href="login">Try again</a>
        `)
    }
})


app.get("/welcome", (req, res) => {
    if (req.session.id) {
        res.send(`
        Welcome ${req.session.id}
        `)
    }
    else {
        res.redirect("/login");
    }
    
})

app.get("/logout", (req, res) => {
    req.session = null;

    res.redirect("/login");
})

app.listen(3000, () => {
    console.log("Watching...");
})