import * as dotenv from "dotenv";
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {PoCRounter} from "./PoCRounter";

export function createServer() {
	const app = express();

	app.use(bodyParser.urlencoded({ extended: false }));
	app.set("view engine", "ejs");
	app.use(express.static(path.join(__dirname, "../public")));

	app.get("/", (req, res) => {
	 res.render("index", {name:req.query.name});
	});

	app.use("/PoC", PoCRounter);

	app.listen(process.env.PORT, () => {
	  console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
	});

	return app;
}