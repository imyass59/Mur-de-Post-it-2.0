const postForm = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

async function fetchPosts() {
  try {
    const search = searchInput.value.trim();
    const category = filterCategory.value;

    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (category) params.append("category", category);

    const response = await fetch(`/api/posts?${params.toString()}`);
    const posts = await response.json();

    if (!response.ok) {
      throw new Error(posts.error || "Erreur lors du chargement des posts.");
    }

    renderPosts(posts);
  } catch (error) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <p>${error.message}</p>
      </div>
    `;
  }
}

function getCategoryClass(category) {
  const normalized = category.toLowerCase();

  if (normalized === "travail") return "travail";
  if (normalized === "idée" || normalized === "idee") return "idee";
  if (normalized === "personnel") return "personnel";
  if (normalized === "urgent") return "urgent";

  return "";
}

async function renderPosts(posts) {
  postsContainer.innerHTML = "";

  if (!posts.length) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <p>Aucun post-it trouvé.</p>
      </div>
    `;
    return;
  }

  for (const post of posts) {
    const commentsHtml = await getCommentsHtml(post.id);

    const article = document.createElement("article");
    article.className = `post-card ${getCategoryClass(post.category)}`;
    article.id = `post-${post.id}`;

    article.innerHTML = `
      <h3 class="post-title">${escapeHtml(post.title)}</h3>
      <div class="post-meta">
        <strong>Catégorie :</strong> ${escapeHtml(post.category)}<br>
        <strong>Likes :</strong> <span id="likes-${post.id}">${post.likes}</span><br>
        <strong>Commentaires :</strong> ${post.comments_count}
      </div>

      <p class="post-content">${escapeHtml(post.content)}</p>

      <div class="post-actions">
        <button onclick="likePost(${post.id})">👍 Like</button>
        <button onclick="toggleEditForm(${post.id}, '${escapeJs(post.title)}', '${escapeJs(post.content)}', '${escapeJs(post.category)}')">
          ✏️ Modifier
        </button>
        <button onclick="deletePost(${post.id})">🗑️ Supprimer</button>
      </div>

      <div id="edit-container-${post.id}"></div>

      <div class="comments-box">
        <h4>Commentaires</h4>
        <div id="comments-${post.id}">
          ${commentsHtml}
        </div>

        <div class="comment-form">
          <input type="text" id="author-${post.id}" placeholder="Votre nom" />
          <input type="text" id="comment-${post.id}" placeholder="Votre commentaire" />
          <button onclick="addComment(${post.id})">Ajouter un commentaire</button>
        </div>
      </div>
    `;

    postsContainer.appendChild(article);
  }
}

async function getCommentsHtml(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}/comments`);
    const comments = await response.json();

    if (!response.ok) {
      return `<p>${comments.error || "Erreur lors du chargement des commentaires."}</p>`;
    }

    if (!comments.length) {
      return `<p>Aucun commentaire pour ce post-it.</p>`;
    }

    return comments
      .map((comment) => {
        return `
          <div class="comment-item">
            <strong>${escapeHtml(comment.author)}</strong><br>
            <span>${escapeHtml(comment.content)}</span>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    return `<p>Erreur lors du chargement des commentaires.</p>`;
  }
}

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const category = document.getElementById("category").value.trim();

  try {
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content, category })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erreur lors de l'ajout du post-it.");
      return;
    }

    postForm.reset();
    fetchPosts();
  } catch (error) {
    alert("Erreur réseau lors de l'ajout du post-it.");
  }
});

async function likePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: "POST"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erreur lors du like.");
      return;
    }

    document.getElementById(`likes-${postId}`).textContent = data.likes;
  } catch (error) {
    alert("Erreur réseau lors du like.");
  }
}

async function deletePost(postId) {
  const confirmDelete = confirm("Voulez-vous vraiment supprimer ce post-it ?");

  if (!confirmDelete) return;

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erreur lors de la suppression.");
      return;
    }

    fetchPosts();
  } catch (error) {
    alert("Erreur réseau lors de la suppression.");
  }
}

async function addComment(postId) {
  const authorInput = document.getElementById(`author-${postId}`);
  const commentInput = document.getElementById(`comment-${postId}`);

  const author = authorInput.value.trim();
  const content = commentInput.value.trim();

  try {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ author, content })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erreur lors de l'ajout du commentaire.");
      return;
    }

    authorInput.value = "";
    commentInput.value = "";
    fetchPosts();
  } catch (error) {
    alert("Erreur réseau lors de l'ajout du commentaire.");
  }
}

function toggleEditForm(postId, currentTitle, currentContent, currentCategory) {
  const container = document.getElementById(`edit-container-${postId}`);

  if (container.innerHTML.trim() !== "") {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <form class="edit-form" onsubmit="submitEdit(event, ${postId})">
      <input type="text" id="edit-title-${postId}" value="${escapeHtmlAttribute(currentTitle)}" required />
      <textarea id="edit-content-${postId}" rows="4" required>${escapeHtml(currentContent)}</textarea>
      <select id="edit-category-${postId}" required>
        <option value="Travail" ${currentCategory === "Travail" ? "selected" : ""}>Travail</option>
        <option value="Idée" ${currentCategory === "Idée" ? "selected" : ""}>Idée</option>
        <option value="Personnel" ${currentCategory === "Personnel" ? "selected" : ""}>Personnel</option>
        <option value="Urgent" ${currentCategory === "Urgent" ? "selected" : ""}>Urgent</option>
      </select>
      <button type="submit">Enregistrer</button>
    </form>
  `;
}

async function submitEdit(event, postId) {
  event.preventDefault();

  const title = document.getElementById(`edit-title-${postId}`).value.trim();
  const content = document.getElementById(`edit-content-${postId}`).value.trim();
  const category = document.getElementById(`edit-category-${postId}`).value.trim();

  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content, category })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erreur lors de la modification.");
      return;
    }

    fetchPosts();
  } catch (error) {
    alert("Erreur réseau lors de la modification.");
  }
}

/** 
 * Helpers
*/

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}

function escapeJs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

searchInput.addEventListener("input", fetchPosts);
filterCategory.addEventListener("change", fetchPosts);

fetchPosts();