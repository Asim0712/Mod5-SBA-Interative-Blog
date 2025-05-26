// Constants and DOM Elements
const LOCAL_KEY = "blog_posts";
const elements = {
  form: document.getElementById("postForm"),
  titleInput: document.getElementById("titleInput"),
  contentInput: document.getElementById("contentInput"),
  postIdField: document.getElementById("postIdField"),
  submitBtn: document.getElementById("submitBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  titleError: document.getElementById("titleError"),
  contentError: document.getElementById("contentError"),
  postsContainer: document.getElementById("postsContainer")
};

// State Management
let state = {
  posts: [],
  editingId: null
};

// Initialization
function init() {
  loadPosts();
  renderPosts();
  setupEventListeners();
}

// Data Persistence
function loadPosts() {
  const data = localStorage.getItem(LOCAL_KEY);
  state.posts = data ? JSON.parse(data) : [];
}

function savePosts() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(state.posts));
}

// Form Handling
function handleFormSubmit(e) {
  e.preventDefault();

  const { titleInput, contentInput } = elements;
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!validateForm(title, content)) return;

  if (state.editingId) {
    updatePost(state.editingId, title, content);
  } else {
    createPost(title, content);
  }

  savePosts();
  renderPosts();
  resetForm();
}

function validateForm(title, content) {
  let isValid = true;
  
  if (!title) {
    elements.titleError.classList.remove("hidden");
    isValid = false;
  } else {
    elements.titleError.classList.add("hidden");
  }

  if (!content) {
    elements.contentError.classList.remove("hidden");
    isValid = false;
  } else {
    elements.contentError.classList.add("hidden");
  }

  return isValid;
}

// Post CRUD Operations
function createPost(title, content) {
  state.posts.push({
    id: Date.now().toString(),
    title,
    content,
    timestamp: Date.now()
  });
}

function updatePost(id, title, content) {
  state.posts = state.posts.map(post => 
    post.id === id ? { ...post, title, content } : post
  );
}

function deletePost(id) {
  state.posts = state.posts.filter(post => post.id !== id);
  if (state.editingId === id) resetForm();
}

// UI Rendering
function renderPosts() {
  const { postsContainer } = elements;
  
  if (!state.posts.length) {
    postsContainer.innerHTML = `<p class="text-center text-slate-500">No posts yet — start writing!</p>`;
    return;
  }

  postsContainer.innerHTML = state.posts
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(post => renderPost(post))
    .join("");
}

function renderPost(post) {
  return `
    <article class="bg-white shadow rounded-lg p-6" data-id="${post.id}">
      <header class="flex justify-between items-start mb-2">
        <h2 class="text-xl font-semibold break-words">${escapeHTML(post.title)}</h2>
        <span class="text-xs text-slate-500">${new Date(post.timestamp).toLocaleString()}</span>
      </header>
      <p class="whitespace-pre-wrap break-words mb-4">${escapeHTML(post.content)}</p>
      <div class="flex gap-3">
        <button class="editBtn bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Edit</button>
        <button class="deleteBtn bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Delete</button>
      </div>
    </article>
  `;
}

// Utilities
function escapeHTML(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.postIdField.value = "";
  elements.submitBtn.textContent = "Publish";
  elements.cancelEditBtn.classList.add("hidden");
  elements.titleError.classList.add("hidden");
  elements.contentError.classList.add("hidden");
}

// Event Handlers
function handlePostContainerClick(e) {
  const article = e.target.closest("article[data-id]");
  if (!article) return;
  const postId = article.dataset.id;

  if (e.target.classList.contains("editBtn")) {
    startEditingPost(postId);
  } else if (e.target.classList.contains("deleteBtn")) {
    deletePost(postId);
    savePosts();
    renderPosts();
  }
}

function startEditingPost(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  state.editingId = postId;
  elements.titleInput.value = post.title;
  elements.contentInput.value = post.content;
  elements.submitBtn.textContent = "Update";
  elements.cancelEditBtn.classList.remove("hidden");
  elements.titleInput.focus();
}

// Event Listener Setup
function setupEventListeners() {
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.cancelEditBtn.addEventListener("click", resetForm);
  elements.postsContainer.addEventListener("click", handlePostContainerClick);
}

// Initialize the application
init();