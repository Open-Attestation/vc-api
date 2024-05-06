import express from "express";
import credentialsRouter from "./credentials";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use("/credentials", credentialsRouter);

// app.get("/", (req, res) => {
//   res.json(req.headers).end();
// });

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});
