import * as dotenv from "dotenv";
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import {PoCRouter} from "./PoCRouter";

export function createWebServer() {
	const app = express();
	
	app.use(bodyParser.urlencoded({ extended: false }));
	app.set("view engine", "ejs");
	app.use(express.static(path.join(__dirname, "../public")));
	
	app.use("/", PoCRouter);
	
	app.listen(process.env.PORT, () => {
		console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
	});
	
	return app;
}