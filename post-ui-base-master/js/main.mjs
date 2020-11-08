import postApi from "./api/postApi.js";
import AppConstants from "./appConstants.js";
import utils from "./utils.js";
const renderPostList = (postList) => {
  const ulElement = document.querySelector("#postsList");

  postList.forEach((post) => {
    const templateElement = document.querySelector("#postItemTemplate");
    if (!templateElement) return;

    const liElementFromTemplate = templateElement.content.querySelector("li");
    const newLiElement = liElementFromTemplate.cloneNode(true);

    console.log(newLiElement);

    const imgElement = newLiElement.querySelector("#postItemImage");
    if (imgElement) {
      imgElement.src = post.imageUrl;
      imgElement.addEventListener("click", () => {
        window.location = `./post-detail.html?id=${post.id}`;
      });
    }

    const titleElement = newLiElement.querySelector("#postItemTitle");
    if (titleElement) {
      titleElement.addEventListener("click", () => {
        window.location = `./post-detail.html?id=${post.id}`;
      });
      titleElement.textContent = `${post.title}`;
    }

    const descriptionElement = newLiElement.querySelector(
      "#postItemDescription"
    );
    console.log(descriptionElement);
    if (descriptionElement) {
      descriptionElement.textContent = `${post.description.slice(0, 100)}...`;
    }

    const authorElement = newLiElement.querySelector("#postItemAuthor");
    if (authorElement) {
      authorElement.textContent = `${post.author}`;
    }

    const timeElement = newLiElement.querySelector("#postItemTimeSpan");
    if (timeElement) {
      timeElement.textContent = `${utils.formatDate(post.updatedAt)}`;
    }

    const editElement = newLiElement.querySelector("#postItemEdit");
    if (editElement) {
      editElement.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location = `./add-edit-post.html?id=${post.id}`;
      });
    }

    const removeElement = newLiElement.querySelector("#postItemRemove");
    if (removeElement) {
      removeElement.addEventListener("click", async (e) => {
        e.stopPropagation();

        const message = `Are you sure to remove  ${post.title}?`;
        if (window.confirm(message)) {
          try {
            await postApi.remove(post.id);

            // newLiElement.remove();
            window.location.reload();
          } catch (error) {
            console.log("Failed to remove :", error);
          }
        }
      });
    }

    ulElement.appendChild(newLiElement);
  });
};
// make page button-------------------------------------------------
const getPageList = (pagination) => {
  const { _limit, _totalRows, _page } = pagination;
  const totalPages = Math.ceil(_totalRows / _limit);
  let prevPage = -1;

  //invalid page detected
  if (_page < 1 || _page > totalPages) return [0, -1, -1, -1, 0];

  if (_page === 1) prevPage = 1;
  else if (_page === totalPages) prevPage = _page - 2 > 0 ? _page - 2 : 1;
  else prevPage = _page - 1;

  const currPage = prevPage + 1 > totalPages ? -1 : prevPage + 1;
  const nextPage = prevPage + 2 > totalPages ? -1 : prevPage + 2;

  return [
    _page === 1 || _page === 1 ? 0 : _page - 1,
    prevPage,
    currPage,
    nextPage,
    _page === totalPages || totalPages === _page ? 0 : _page + 1,
  ];
};

const renderPostsPagination = (pagination) => {
  const postPagination = document.querySelector("#postsPagination");
  if (postPagination) {
    const pageList = getPageList(pagination);
    const { _page, _limit } = pagination;
    const pageItems = postPagination.querySelectorAll(".page-item");
    if (pageItems.length === 5) {
      pageItems.forEach((item, idx) => {
        if (pageList[idx] === -1) {
          item.setAttribute("hidden", "");
          return;
        }

        if (pageList[idx] === 0) {
          item.classList.add("disabled");
          return;
        }

        const pageLink = item.querySelector(".page-link");
        if (pageLink) {
          pageLink.href = `?_page=${pageList[idx]}&_limit=${_limit}`;

          if (idx > 0 && idx < 4) {
            pageLink.textContent = pageList[idx];
          }
        }

        if (idx > 0 && idx < 4 && pageList[idx] === _page) {
          item.classList.add("active");
        }
      });

      postPagination.removeAttribute("hidden");
    }
  }
};

(async function () {
  try {
    const urlParam = new URLSearchParams(window.location.search);
    const page = urlParam.get("_page");
    const limit = urlParam.get("_limit");
    const params = {
      _page: page || AppConstants.DEFAULT_PAGE,
      _limit: limit || AppConstants.DEFAULT_LIMIT,
      _sort: "updatedAt",
      _order: "desc",
    };
    // made page buttom -----------------------
    const response = await postApi.getAll(params);
    const postList = response.data;
    renderPostList(postList);

    renderPostsPagination(response.pagination);
    // ---------------------------------------

    const loading = document.querySelector("#loading");
    loading.style.display = "none";
    // render
  } catch (error) {
    console.log("Failed to fetch  list", error);
  }
})();
