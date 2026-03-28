const express = require("express");
const path = require("path");

require("./db");

const postsRoutes = require("./routes/posts.routes");
const commentsRoutes = require("./routes/comments.routes");

const app = express();
const PORT = 8002;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/posts", postsRoutes);
app.use("/api/posts", commentsRoutes);

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});