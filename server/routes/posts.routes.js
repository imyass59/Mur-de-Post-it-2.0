const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  try {
    const { category, search } = req.query;

    let sql = `
      SELECT posts.*,
             COUNT(comments.id) AS comments_count
      FROM posts
      LEFT JOIN comments ON posts.id = comments.post_id
      WHERE 1=1
    `;

    const params = [];

    if (category) {
      sql += " AND posts.category = ?";
      params.push(category);
    }

    if (search) {
      sql += " AND (posts.title LIKE ? OR posts.content LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += `
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
    `;

    const rows = db.prepare(sql).all(...params);

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la récupération des posts."
    });
  }
});

router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const row = db
      .prepare("SELECT * FROM posts WHERE id = ?")
      .get(id);

    if (!row) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    return res.status(200).json(row);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la récupération du post."
    });
  }
});

router.post("/", (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !title.trim() || !content || !content.trim() || !category || !category.trim()) {
      return res.status(400).json({
        error: "Les champs title, content et category sont obligatoires."
      });
    }

    const stmt = db.prepare(`
      INSERT INTO posts (title, content, category)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      content.trim(),
      category.trim()
    );

    const row = db
      .prepare("SELECT * FROM posts WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json(row);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la création du post."
    });
  }
});

router.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;

    if (!title || !title.trim() || !content || !content.trim() || !category || !category.trim()) {
      return res.status(400).json({
        error: "Les champs title, content et category sont obligatoires."
      });
    }

    const stmt = db.prepare(`
      UPDATE posts
      SET title = ?, content = ?, category = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      title.trim(),
      content.trim(),
      category.trim(),
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    const row = db
      .prepare("SELECT * FROM posts WHERE id = ?")
      .get(id);

    return res.status(200).json(row);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la modification du post."
    });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    const result = db
      .prepare("DELETE FROM posts WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    return res.status(200).json({ message: "Post supprimé avec succès." });
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors de la suppression du post."
    });
  }
});

router.post("/:id/like", (req, res) => {
  try {
    const { id } = req.params;

    const result = db
      .prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?")
      .run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Post introuvable." });
    }

    const row = db
      .prepare("SELECT * FROM posts WHERE id = ?")
      .get(id);

    return res.status(200).json(row);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur lors du like."
    });
  }
});

module.exports = router;