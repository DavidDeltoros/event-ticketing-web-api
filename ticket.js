const axios = require("axios");
const { z } = require("zod");


async function buildAndPushEvent() {
  try {
    // 1) Build a sample event (set date as a JS Date object so zod accepts it)
    const newEvent = {
    id: "74c32be4-3c5b-49d1-ab6a-fb053c61d0d8",
    email: "deltoro@gmail.com"      
    };

    const payload = {
      ...newEvent
    };

    // 4) POST to the server
    const url = "http://localhost:3000/api/ticket"; // your provided endpoint
    const response = await axios.delete(url, payload, {
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
