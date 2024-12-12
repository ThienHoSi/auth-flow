const fs = require("fs");
const https = require("https");
const express = require("express");
const cookieParse = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");

const { base64url } = require("./helper");

const app = express();
const port = 3000;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParse());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const jwtSecret =
  "pXPd1i6LCBKS/89aDrD588c3P3ZXTbMi/j0lY8+VSzLe9MU7v58yAJAnST/w5yk1m4b+tWlofv+cl5XvREApadKSXAH0f5Z0kE4aO4Fb4wLQQZedMjyfZuNvlHfOolzSldObNN4Z8FcOwCJJnQJATpYvazMG1/m6j4GLrq6GKxoRneF+orCB+amXQ6f5QPJdtYucLulK9T+ChO8RIiqvs9SULCoY/tyVkQKa+lj8xwj2SAGxcQxkSNXDJH9nE0iev4UbiJK/t/BdTpycGzDVmc53lJfEBDo8FKtByBwAyRYmttaYkrS+OP2pRfQwCEz2iSDEkBTxapNnmV40UvjQ9g==";

// Fake DB (MySQL, MongoDB)
const db = {
  users: [
    {
      id: 1,
      email: "nguyenvana@gmail.com",
      password: "123456", // hash
      name: "A Nguyen",
    },
  ],
  posts: [
    {
      id: 1,
      title: "Title 1",
      description: "Description 1",
    },
    {
      id: 2,
      title: "Title 2",
      description: "Description 2",
    },
    {
      id: 3,
      title: "Title 3",
      description: "Description 3",
    },
  ],
};

/** SSR */
// const sessions = {};

// app.get("/", (req, res) => {
//   res.render("pages/index");
// });
// app.get("/login", (req, res) => {
//   res.render("pages/login");
// });
// app.get("/dashboard", (req, res) => {
//   console.log(req.cookies);
//   const session = sessions[req.cookies?.sessionId];
//   if (!session) {
//     return res.redirect("/login");
//   }

//   const user = db.users.find((user) => user.id === session.userId);
//   if (!user) {
//     return res.redirect("/login");
//   }

//   res.render("pages/dashboard", { user });
// });

// app.post("/login", (req, res) => {
//   const { email, password } = req.body;

//   const user = db.users.find(
//     (user) => user.email === email && user.password === password
//   );

//   if (user) {
//     const sessionId = Date.now().toString();
//     sessions[sessionId] = {
//       userId: user.id,
//     };

//     res
//       .setHeader("Set-Cookie", `sessionId=${sessionId}; max-age=3600; httpOnly`)
//       .redirect("/dashboard");
//     return;
//   }

//   res.send("Mật khẩu không hợp lệ");
// });

// app.get("/logout", (req, res) => {
//   delete sessions[req.cookies.sessionId];
//   res.setHeader("Set-Cookie", "sessionId=; max-age=0").redirect("/login");
// });

const sessions = {};

/** CSR */
// app.get("/api/posts", (req, res) => {
//   res.json(db.posts);
// });

// app.post("/api/auth/login", (req, res) => {
//   const { email, password } = req.body;
//   const user = db.users.find(
//     (user) => user.email === email && user.password === password
//   );
//   if (!user) {
//     res.status(401).json({ message: "Unauthorized" });
//   }

//   const sessionId = Date.now().toString();
//   sessions[sessionId] = { sub: user.id };

//   res
//     .setHeader(
//       "Set-Cookie",
//       `sessionId=${sessionId}; HttpOnly; Max-Age=3600; SameSite=None; Secure; Partitioned`
//     )
//     .json(user);
// });

// app.get("/api/auth/me", (req, res) => {
//   const session = sessions[req.cookies.sessionId];
//   if (!session) {
//     return res.status(401).json({
//       message: "Unauthorized",
//     });
//   }
//   const user = db.users.find((user) => user.id === session.sub);
//   if (!user) {
//     return res.status(401).json({
//       message: "Unauthorized",
//     });
//   }
//   res.json(user);
// });

/** JWT */
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const header = {
    alg: "HS256",
    typ: "JWT",
  };
  const payload = {
    sub: user.id,
    exp: Date.now() + 3600000,
  };

  // Mã hóa base64(json(header & payload))
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));

  // Tạo token data <header>.<payload>
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  // Tạo chữ ký
  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");

  res.json({
    token: `${tokenData}.${signature}`,
  });
});

app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const [encodedHeader, encodedPayload, tokenSignature] = token.split(".");
  const tokenData = `${encodedHeader}.${encodedPayload}`;

  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");

  if (signature !== tokenSignature) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const payload = JSON.parse(atob(encodedPayload));
  const user = db.users.find((user) => user.id === payload.sub);
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (payload.exp < Date.now()) {
    return res.status(401).json({
      message: "Token expired",
    });
  }

  res.json(user);
});

/** HTTPS */
// https
//   .createServer(
//     {
//       key: fs.readFileSync("testcookie.com+2-key.pem"),
//       cert: fs.readFileSync("testcookie.com+2.pem"),
//     },
//     app
//   )
//   .listen(port, () => {
//     console.log(`App is running on port ${port}`);
//   });

/** HTTP */
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
