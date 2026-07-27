const grid = document.getElementById("galleryGrid");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter-btn");

const modal = document.getElementById("pdfModal");
const modalPdf = document.getElementById("modalPdf");
const modalCaption = document.getElementById("modalCaption");
const closeModal = document.getElementById("closeModal");

let certificates = [];
let currentFilter = "all";
let currentIndex = 0;
let currentList = [];

/* BACK BUTTON */
document.getElementById("backBtn").onclick = () => {
  window.location.href = "../index.html#certificat";
};

/* LOAD DATA */
fetch("certificates.json")
  .then(res => res.json())
  .then(data => {
    certificates = data;
    renderGallery();
  });

/* MATCH CATEGORY */
function matchCategory(cert, filter) {
  if (filter === "all") return true;
  return Array.isArray(cert.category) && cert.category.includes(filter);
}

/* SEARCH */
searchInput.addEventListener("input", renderGallery);

/* FILTER BUTTON */
filterBtns.forEach(btn => {
  btn.onclick = () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderGallery();
  };
});

/* RENDER GALLERY */
function renderGallery() {
  grid.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();

  const filtered = certificates.filter(cert =>
    matchCategory(cert, currentFilter) &&
    cert.title.toLowerCase().includes(keyword)
  );

  /* GROUP BY ORG + LEVEL */
  const groupMap = {};

  filtered.forEach(cert => {
    const key = `${cert.organization}||${cert.level || "Other"}`;

    if (!groupMap[key]) {
      groupMap[key] = {
        org: cert.organization,
        level: cert.level || "Other",
        items: []
      };
    }

    groupMap[key].items.push(cert);
  });

  Object.values(groupMap).forEach(group => {
    const section = document.createElement("div");
    section.className = "org-section";

    section.innerHTML = `
      <h2 class="org-title">
        ${group.org}
        <span class="level-tag ${group.level.toLowerCase()}">${group.level}</span>
        (${group.items.length})
      </h2>
      <div class="org-grid"></div>
    `;

    const orgGrid = section.querySelector(".org-grid");

    group.items.forEach((cert, index) => {
      const item = document.createElement("div");
      item.className = "gallery-item";

      item.innerHTML = `
        <div class="gallery-title">${cert.title}</div>
        <div class="gallery-desc">${cert.desc || ""}</div>
      `;

      item.onclick = () => openModal(index, group.items);
      orgGrid.appendChild(item);
    });

    grid.appendChild(section);
  });
}

/* OPEN MODAL */
function openModal(index, list) {
  currentIndex = index;
  currentList = list;
  showCurrent();
  modal.classList.add("show");
}

function showCurrent() {
  const cert = currentList[currentIndex];
  const file = cert.pdf || "";

  const isImage = file.match(/\.(jpg|jpeg|png|webp)$/i);
  const isPdf = file.match(/\.pdf$/i);

  /* HANDLE IMAGE */
  let img = document.getElementById("modalImg");

  if (isImage) {
    modalPdf.style.display = "none";

    if (!img) {
      img = document.createElement("img");
      img.id = "modalImg";
      img.className = "modal-img";
      modal.insertBefore(img, modalCaption);
    }

    img.src = file;
    img.style.display = "block";
  }

  /* HANDLE PDF */
  else if (isPdf) {
    modalPdf.style.display = "block";
    modalPdf.src = file;
    if (img) img.style.display = "none";
  }

  /* BUTTONS */
  const certBtn = cert.pdf
    ? `<a href="${cert.pdf}" target="_blank" class="modal-btn primary">Open Certificate</a>`
    : "";

  const courseBtn = cert.courseUrl
    ? `<a href="${cert.courseUrl}" target="_blank" class="modal-btn secondary">Open Course</a>`
    : "";

  modalCaption.innerHTML = `
    <strong>${cert.title}</strong>
    <div class="level-badge ${cert.level?.toLowerCase() || ""}">
      ${cert.level || ""}
    </div>
    <p class="modal-desc">${cert.desc || ""}</p>
    <div class="modal-actions">
      ${certBtn}
      ${courseBtn}
    </div>
  `;
}

/* CLOSE */
closeModal.onclick = () => modal.classList.remove("show");
modal.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };

/* NAVIGATION */
document.getElementById("prevBtn").onclick = () => {
  currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  showCurrent();
};

document.getElementById("nextBtn").onclick = () => {
  currentIndex = (currentIndex + 1) % currentList.length;
  showCurrent();
};
