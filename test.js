const axios = require("axios");
const { z } = require("zod");

/**
 * Re-declared schema (matches the schema you gave).
 * If you already have this schema in a file, import it instead.
 */
const NewEventSchema = z.object({
  name: z.string().min(1, { message: "name must have at least 1 character" }),
  description: z.string().optional(),
  date: z.date(),
  venue: z.string().min(1, { message: "venue must have at least 1 character" }),
  capacity: z.number().int().min(0).optional(),
  ticketPrice: z.number().nonnegative().optional(),
  category: z.string().optional()
});

async function buildAndPushEvent() {
  try {
    // 1) Build a sample event (set date as a JS Date object so zod accepts it)
    const newEvent = {
      name: "Aumn Tech Meetup",
      description: "An evening of talks and networking for devs and product people",
      // keep date as a Date for validation, convert to ISO when sending
      date: new Date("2025-12-15T19:00:00Z"),
      venue: "Belgrade Tech Hub",
      capacity: 3,
      ticketPrice: 10.0,
      category: "Conference"
    };

    // 2) Validate with zod
    // This will throw if invalid
    const validatedEvent = NewEventSchema.parse(newEvent);

    // 3) Prepare payload for sending: convert date to ISO string (JSON-friendly)
    const payload = {
      ...validatedEvent,
      date: validatedEvent.date.toISOString()
    };

    // 4) POST to the server
    const url = "http://localhost:3000/api/event"; // your provided endpoint
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    // 5) Log result
    console.log("POST successful. status:", response.status);
    console.log("response data:", response.data);
  } catch (err) {
    // zod validation errors
    if (err && err.name === "ZodError") {
      console.error("Validation failed:", err.errors);
      return;
    }

    // axios / network errors
    if (err && err.response) {
      console.error("Server responded with error. status:", err.response.status);
      console.error("response data:", err.response.data);
    } else if (err && err.request) {
      console.error("No response received. request info:", err.request);
    } else {
      console.error("Error:", err.message || err);
    }
  }
}

// run
buildAndPushEvent();
