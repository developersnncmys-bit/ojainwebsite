// utils/getImageUrl.js
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/category1.jpg";
  // Local /public asset or already-absolute URL — use as-is.
  if (
    imagePath.startsWith("/") ||
    imagePath.startsWith("http") ||
    imagePath.startsWith("blob:")
  )
    return imagePath;
  return `/${imagePath.replace(/\\/g, "/")}`;
};

export default getImageUrl;
