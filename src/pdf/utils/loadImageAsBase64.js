// ======================================================
// LOAD IMAGE AS BASE64
// ======================================================

export const loadImageAsBase64 = (
  imageURL
) => {

  return new Promise((
    resolve,
    reject
  ) => {

    if (!imageURL) {

      resolve(null);

      return;

    }

    const image =
      new Image();

    // ==================================================
    // IMPORTANT
    // ==================================================

    image.crossOrigin =
      "Anonymous";

    image.onload = () => {

      try {

        const canvas =
          document.createElement(
            "canvas"
          );

        canvas.width =
          image.width;

        canvas.height =
          image.height;

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          image,
          0,
          0
        );

        const base64 =
          canvas.toDataURL(
            "image/png"
          );

        resolve(base64);

      } catch (error) {

        reject(error);

      }

    };

    image.onerror = (
      error
    ) => {

      reject(error);

    };

    image.src = imageURL;

  });

};