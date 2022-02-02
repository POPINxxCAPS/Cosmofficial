import Express from "express";

const app = Express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => console.log('Website Viewed'))