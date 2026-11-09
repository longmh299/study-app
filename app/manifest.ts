import type { MetadataRoute } from "next";

// Cho phép "Thêm vào màn hình chính" trên điện thoại, mở như app thật.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vở Song Ngữ",
    short_name: "Song Ngữ",
    description: "Học tiếng Anh và tiếng Trung từ con số 0",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1f4",
    theme_color: "#eef1f4",
    lang: "vi",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
