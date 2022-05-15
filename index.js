const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const router = require("./routes/admin/auth");
const productsRouter = require("./routes/admin/products");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
    keys:["uncweu983u43498uc98n48u3298"]
}));

app.use(router);
app.use(productsRouter);

app.listen(3000, () => {
    console.log("Watching...");
})