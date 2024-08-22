import React, { useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

function SSEComponent() {
  const [data, setData] = useState(""); // Initialize data as an empty string
  const [prompt, setPrompt] = useState(""); // State to manage the prompt
  const [eventSource, setEventSource] = useState(null); // State to manage eventSource
  const serverBaseURL = 'http://localhost:8000'; // Adjust as needed

  const fetchData = async () => {
    // Clean up existing event source if any
    if (eventSource) {
      eventSource.close();
    }

    const newEventSource = await fetchEventSource(`${serverBaseURL}/stream/sse`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      onopen(res) {
        if (res.ok && res.status === 200) {
          console.log("Connection made", res);
        } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          console.log("Client-side error", res);
        }
      },
      onmessage(event) {
        console.log("Received event data:", event.data);

        // Update the data as a single string
        setData((prevData) => prevData + event.data);
      },
      onclose() {
        console.log("Connection closed by the server");
      },
      onerror(err) {
        console.log("There was an error from server", err);
      },
    });

    setEventSource(newEventSource);
  };

  const handleButtonClick = () => {
    // Clear previous data
    setData("");
    // Fetch data when the button is clicked
    fetchData();
  };

  // Cleanup function to close the eventSource when the component unmounts
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div>
      <h1>Server-Sent Events (SSE) Example</h1>
      <div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)} // Update prompt state
          placeholder="Enter your prompt here"
        />
        <button onClick={handleButtonClick}>Send Prompt</button> {/* Button to send request */}
      </div>
      <div>
        <p>{data}</p> {/* Display data as a single paragraph */}
      </div>
    </div>
  );
}

export default SSEComponent;
