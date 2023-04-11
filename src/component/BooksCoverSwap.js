import { useEffect, useState } from "react";
import { fetch, ResponseType } from "@tauri-apps/api/http";
import noImgCover from "../asset/noimage.webp";

export default function BookCoverSwap({ coverUri, className }) {
  const [cover, setCover] = useState(coverUri);
  useEffect(() => {
    fetch(coverUri, {
      method: "GET",
      timeout: 5,
      responseType: ResponseType.Binary,
    })
      .then(() => {
        setCover(coverUri);
      })
      .catch((err) => {
        console.log("err", err);
        setCover(noImgCover);
      });
  }, [coverUri]);
  return <div className={`w-[280px] h-4/6 border-0 border-black bg-contain bg-center bg-no-repeat rounded-xl ${className}`} style={{ backgroundImage: `url(${cover})` }}></div>;
}
