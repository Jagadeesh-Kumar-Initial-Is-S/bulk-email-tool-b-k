import express, { json } from "express";
const app = express();
import cors from "cors";
import { connect } from "mongoose";
import { create, findOne, updateOne } from "./user.model";
import { hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";

app.use(cors());
app.use(json());

import { config } from 'dotenv';
config();

connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Mongodb Connected..."))
    .catch((err) => console.error(err));


app.get("/",(req,res)=>{
  res.send( {advertisement : "Submitted and coded by Jagadeesh Kumar . S, you may send mail to my email address which is jagadeesh_2k17@proton.me and you may contribute some money to my Indian Unified Payment Interface (UPI) which is jagadeesh-kumar@ybl ."});
});

app.post("/api/register", async (req, res) => {
  const newPassword = await hash(req.body.password, 10);
  try {
    const user = await create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });

    res.json({ status: "ok" });
  } catch (err) {
    res.json({ status: "Duplicate Email" });
  }
});

app.post("/api/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await findOne({ email: email });

  const isPasswordValid = await compare(password, user.password);
  console.log(isPasswordValid);
  if (isPasswordValid) {
    const token = await sign(
      { email: user.email, name: user.name },
      "secret123"
    );

    res.json({ status: "ok", token: token });
  } else {
    res.json({ status: "Wrong Email or Password" });
  }
});

app.post("/api/dashboard", async (req, res) => {
  const token = req.headers["x-access-token"];
  const goal = req.body.tempGoal;

  const isTokenValid = await verify(token, "secret123");
  const email = isTokenValid.email;

  if (isTokenValid) {
    await updateOne({ email: email }, { $set: { goal: goal } });

    res.json({ status: "ok" });
  } else {
    res.json({ status: "Invalid Token" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const token = req.headers["x-access-token"];
  const isValidToken = await verify(token, "secret123");

  if (isValidToken) {
    const email = isValidToken.email;
    const user = await findOne({ email: email });
    res.json({ status: "ok", goal: user.goal });
  } else {
    res.json("Invalid Token");
  }
});

app.listen("1337", () => console.log("Server started on port 1337"));
