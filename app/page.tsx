import { doc, getDoc, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import HomeClient from "@/components/home-client";
import { Event } from "@/lib/types";

// HomeClient is imported directly where needed

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

async function getEvents(): Promise<{ upcoming: Event[], past: Event[] }> {
  try {
    const eventsCollection = collection(db, "events");
    const q = query(eventsCollection, orderBy("datetimes", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { upcoming: [], past: [] };
    }

    const now = new Date();
    const upcoming: Event[] = [];
    const past: Event[] = [];

    snapshot.docs.forEach(doc => {
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

      // Check if any datetime is in the future
      const hasUpcomingDate = event.datetimes.some(date => date > now);
      if (hasUpcomingDate) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    return { upcoming, past };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return { upcoming: [], past: [] };
  }
}

export default async function Home() {
  const bioHtml = await getBioHtml();
  const { upcoming: upcomingEvents, past: pastEvents } = await getEvents();
  return <HomeClient bioHtml={bioHtml} upcomingEvents={upcomingEvents} pastEvents={pastEvents} />;
}
