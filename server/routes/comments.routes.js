const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:id/comments", (req, res) => {
  try {
    const { id } = req.params;

    const post = db
      .prepare("SELECT id FROM posts WHERE id = ?")
      .get(id);

    if (!post) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    const rows = db
      .prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC")
      .all(id);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la récupération des commentaires."
    });
  }
});

router.post("/:id/comments", (req, res) => {
  try {
    const { id } = req.params;
    const { author, content } = req.body;

    if (!author || !author.trim() || !content || !content.trim()) {
      return res.status(400).json({
        error: "Les champs author et content sont obligatoires."
      });
    }

    const post = db
      .prepare("SELECT id FROM posts WHERE id = ?")
      .get(id);

    if (!post) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    const result = db
      .prepare("INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)")
      .run(id, author.trim(), content.trim());

    const row = db
      .prepare("SELECT * FROM comments WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json(row);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de l'ajout du commentaire."
    });
  }
});

module.exports = router;