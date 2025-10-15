import { doc, getDoc, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import HomeClient from "@/components/home-client";
import { Event } from "@/lib/types";

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

async function getEvents(): Promise<Event[]> {
  try {
    const eventsCollection = collection(db, "events");
    const q = query(eventsCollection, orderBy("datetimes", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      const event: Event = {
        id: doc.id,
        title: data.title,
        venue: data.venue,
        location: data.location,
        description: data.description,
        link: data.link,
        datetimes: (data.datetimes as Timestamp[] || []).map(t => t.toDate()),
        times: data.times || [],
      };
      return event;
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

export default async function Home() {
  const bioHtml = await getBioHtml();
  const events = await getEvents();
  return <HomeClient bioHtml={bioHtml} events={events} />;
}
