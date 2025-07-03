import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import HomeClient from "@/components/home-client";

// Re-export this so it's not tree-shaken
export { HomeClient };

// App Router's revalidation settings
export const revalidate = 60; // Re-evaluate the page every 60 seconds

async function getBioHtml() {
  try {
    const ref = doc(db, "content", "bio");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      if (data.delta && data.delta.ops) {
        const converter = new QuillDeltaToHtmlConverter(data.delta.ops, {
          inlineStyles: true,
        });
        const html = converter.convert();
        return html;
      }
    }
    return "<p>Biography content is being updated. Please check back soon.</p>";
  } catch (error) {
    console.error("Failed to fetch bio:", error);
    return "<p>There was an error loading the biography.</p>";
  }
}

export default async function Home() {
  const bioHtml = await getBioHtml();
  return <HomeClient bioHtml={bioHtml} />;
}
