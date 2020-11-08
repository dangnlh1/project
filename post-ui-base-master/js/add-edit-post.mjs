import postApi from "./api/postApi.js";
import AppConstants from "./appConstants.js";

const setFormValues = (post) => {
  const ImgElement = document.querySelector("#postHeroImage");
  if (ImgElement) {
    ImgElement.style.backgroundImage = `url(${post.imageUrl})`;
  }

  const formElement = document.querySelector("#postForm");

  const titleInput = formElement.querySelector("#postTitle");
  if (titleInput) {
    titleInput.value = post.title;
  }

  const authorInput = formElement.querySelector("#postAuthor");
  if (authorInput) {
    authorInput.value = post.author;
  }

  const descriptionInput = formElement.querySelector("#postDescription");
  if (descriptionInput) {
    descriptionInput.value = post.description;
  }
};

const handleChangeImageClick = () => {
  const randomId = 1 + Math.trunc(Math.random() * 1000);

  const imageUrl = `https://picsum.photos/id/${randomId}/${AppConstants.DEFAULT_IMAGE_WIDTH}/${AppConstants.DEFAULT_IMAGE_HEIGHT}`;

  const element = document.querySelector("#postHeroImage");
  if (element) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.addEventListener("error", handleChangeImageClick);
  }
};

const changeBackgroundButton = document.querySelector("#postChangeImage");
if (changeBackgroundButton) {
  changeBackgroundButton.addEventListener("click", handleChangeImageClick);
}

const getImageUrlFromString = (str) => {
  const firstDoubleQuotePosition = str.indexOf('"');
  const lastDoubleQuotePosition = str.lastIndexOf('"');
  return str.slice(firstDoubleQuotePosition + 1, lastDoubleQuotePosition);
};

const getFormValues = () => {
  // if (!form) return;
  const formvalues = {};

  const titleElement = document.querySelector("#postTitle");
  if (titleElement) {
    formvalues.title = titleElement.value;
  }

  const authorElement = document.querySelector("#postAuthor");
  if (titleElement) {
    formvalues.author = authorElement.value;
  }

  const desElement = document.querySelector("#postDescription");
  if (titleElement) {
    formvalues.description = desElement.value;
  }

  const imgElement = document.querySelector("#postHeroImage");
  if (imgElement) {
    formvalues.imageUrl = getImageUrlFromString(
      imgElement.style.backgroundImage
    );
  }
  return formvalues;
};
const validateForm = () => {
  let isValid = true;

  // title is required
  const titleElement = document.querySelector("#postTitle");
  const title = titleElement.value;
  if (!title) {
    titleElement.classList.add("is-invalid");
    isValid = false;
  }

  // author is required
  const authorElement = document.querySelector("#postAuthor");
  const author = authorElement.value;
  if (!author) {
    authorElement.classList.add("is-invalid");
    isValid = false;
  }

  return isValid;
};

const handleFormSubmit = async (postId) => {
  const formValues = getFormValues();

  console.log(formValues);
  const isValid = validateForm(formValues);

  if (isValid) {
    try {
      const payload = {
        id: postId,
        ...formValues,
      };

      if (postId) {
        await postApi.update(payload);
        alert("Save successfully");
      } else {
        const newPost = await postApi.add(payload);

        const editPageUrl = `add-edit-post.html?id=${newPost.id}`;
        window.location = editPageUrl;

        alert("add successfully");
      }
    } catch (error) {
      alert("Failed to save : ", error);
    }
  }
};

(async () => {
  const params = new URLSearchParams(window.location.search);
  console.log("window", window.location.search);

  // const postId = params.get("postId");
  const postId = params.get("id");
  // console.log("postid ", postId);
  const isEditMode = !!postId;

  if (isEditMode) {
    // try {
    const post = await postApi.get(postId);
    setFormValues(post);

    const goToDetailPageLink = document.querySelector("#goToDetailPageLink");
    goToDetailPageLink.href = `./post-detail.html?id=${post.id}`;
    goToDetailPageLink.innerHTML =
      '<i class="fas fa-eye mr-1"></i> View post detail';

    // } catch (error) {
    //   console.log(error);
    // }
  } else {
    handleChangeImageClick();
  }

  const formElement = document.querySelector("#postForm");
  if (formElement) {
    formElement.addEventListener("submit", (e) => {
      handleFormSubmit(postId);
      e.preventDefault();
    });
  }

  const imgElement = document.querySelector("#postHeroImage");
  if (imgElement) {
    imgElement.onerror = handleChangeImageClick;
  }
})();
