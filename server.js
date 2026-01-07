const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const DB = "data.json";

const read = () => JSON.parse(fs.readFileSync(DB));
const write = d => fs.writeFileSync(DB, JSON.stringify(d, null, 2));

app.post("/login", (req,res)=>{
  const db = read();
  const u = db.users.find(
    x => x.username === req.body.username && x.password === req.body.password
  );
  res.json(u ? { success:true, username:u.username, budget:u.budget } : { success:false });
});

app.get("/transactions/:user",(req,res)=>{
  res.json(read().transactions.filter(t=>t.username===req.params.user));
});

app.post("/transactions",(req,res)=>{
  const db = read();
  db.transactions.push(req.body);
  write(db);
  res.json({ ok:true });
});

app.post("/budget",(req,res)=>{
  const db = read();
  const u = db.users.find(x=>x.username===req.body.username);
  if(u){u.budget=req.body.budget; write(db);}
  res.json({ ok:true });
});

app.listen(3000,()=>console.log("✅ Backend running on http://localhost:3000"));
