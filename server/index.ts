import * as dotenv from "dotenv";
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {orderRouter} from "./routes/orderRouter";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
 res.render("index");
});

app.post("/login", (req, res) => {
  const { name, password } = req.body;

  if (name === "admin" && password === "admin") {
    res.render("success", {
      username: name,
    });
  } else {
    res.render("failure");
  }
});

app.use("/orders", orderRouter);

app.listen(process.env.PORT, () => {
  console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
});