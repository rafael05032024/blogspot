document.getElementById('submit_btn').addEventListener('click', () => {
  document.getElementById('submit_inpt').click();
});

const filterKeyMapper = {
  ALL: 'filter-all',
  LIKED: 'filter-liked',
  HEARTED: 'filter-hearted'
};
const loadedPosts = localStorage.getItem('storage_posts');
let filterBy = 'filter-all';
let posts = loadedPosts ? JSON.parse(loadedPosts) : [];

function storePosts() {
  localStorage.setItem(
    'storage_posts',
    JSON.stringify(posts)
  );
}

function loadByFilter(id) {
  const collorMapper = {
    [filterKeyMapper.ALL]: '#8888AF',
    [filterKeyMapper.LIKED]: '#5564FF',
    [filterKeyMapper.HEARTED]: '#FC6565'
  };

  const element = document.getElementById(id);

  element.style.color = collorMapper[id];
  element.style.borderBottom = `2px solid ${collorMapper[id]}`

  for (const spanId of Object.keys(collorMapper)) {
    if (id === spanId) continue;

    const span = document.getElementById(spanId);

    span.style.color = '#9E9E9E';
    span.style.borderBottom = 'none';
  }

  filterBy = id;

  loadPosts();
}

const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;

      resolve(base64data);
    }
  });
}

function download(source, postId) {
  const postIndex = posts.findIndex(p => p.id === Number(postId));

  posts[postIndex].downloads += 1;

  const fileName = source.split('/').pop();
  const anchor = document.createElement("a");

  anchor.setAttribute("href", source);
  anchor.setAttribute("download", fileName);

  document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  storePosts();
  loadPosts();
}

function favorite(element, action) {
  const [, id] = element.id.split(`${action}-btn-`)
  const postIndex = posts.findIndex(p => p.id === Number(id));
  const favorited = !posts[postIndex][action];

  posts[postIndex][action] = favorited;

  storePosts();
  loadPosts();

  element.style.color = favorited
    ? (action === 'like' ? '#5564FF' : '#FC6565')
    : '#9E9E9E'

}

function handleRefresh() {
  Swal.fire({
    title: "Tem certeza?",
    text: "Todas as imagens serão deletadas da sua galeria!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, deletar!",
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      posts = [];

      Swal.fire({
        title: "Deleteda!",
        text: "Todas as imagens foram deletadas.",
        icon: "success"
      });

      storePosts();
      loadPosts();
    }
  });
}

function handleDelete(id) {
  Swal.fire({
    title: "Tem certeza?",
    text: "A imagem será deletada da sua galeria!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sim, deletar!",
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      posts = posts.filter(post => post.id !== Number(id));

      Swal.fire({
        title: "Deleteda!",
        text: "Sua imagem foi deleta.",
        icon: "success"
      });

      storePosts();
      loadPosts();
    }
  });

}

function loadPosts() {
  const mural = document.getElementById('posts');
  let display = [];

  mural.innerHTML = '';

  switch (filterBy) {
    case filterKeyMapper.HEARTED:
      display = posts.filter(post => post.heart);
      break;
    case filterKeyMapper.LIKED:
      display = posts.filter(post => post.like);
      break;
    default:
      display = posts;
  }

  if (!display.length) {
    const div = document.createElement('h4');

    div.className = 'no-images-warning'
    div.innerHTML = 'Nenhuma imagem encontrada!';

    mural.appendChild(div);

    return;
  }

  display
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach((post) => {
      const html = `
    <div class="card" id="${post.id}">
      <div class="card-header">
      </div>

      <div class="card-body">
        <div class="background"></div>

        <div class="number-of-comments">
          <i class="fa fa-download"></i>
          <span>${post.downloads}</span>
        </div>

        <img src="${post.img}">
      </div>

      <div class="card-footer">
        <i class="fa fa-thumbs-up" id="like-btn-${post.id}" onclick="favorite(this, 'like')" style="color: ${post.like ? '#5564FF' : '#9E9E9E'};"></i>
        <i class="fa fa-heart" id="heart-btn-${post.id}" onclick="favorite(this, 'heart')" style="color: ${post.heart ? '#FC6565' : '#9E9E9E'};"></i>
        <i class="fa fa-download" onclick="download('${post.img}', ${post.id})"></i>
        <i class="fa fa-trash" onclick="handleDelete('${post.id}')"></i>
      </div>
    </div>
    `;

      const div = document.createElement('div');

      div.className = 'card'
      div.innerHTML = html;

      mural.appendChild(div);
    });
}

function loadFile(event) {
  const src = URL.createObjectURL(event.target.files[0]);
  const date = new Date();

  getBase64FromUrl(src).then((s) => {
    posts.push({
      id: date.getTime(),
      img: s,
      created_at: date.toISOString(),
      like: false,
      heart: false,
      downloads: 0
    });

    storePosts();
    loadPosts();
  })
};

loadByFilter(filterKeyMapper.ALL);