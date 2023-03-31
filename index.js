const apiUrl = "http://localhost:8000/query";

document
  .getElementById("gpt-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const instruction = document.getElementById("instruction").value;
    const userInput = document.getElementById("user-input").value;
    const temperature = parseFloat(
      document.getElementById("temperature").value
    );
    const topK = parseInt(document.getElementById("top-k").value);
    const topP = parseFloat(document.getElementById("top-p").value);
    const web = document.getElementById("web").checked;

    document.getElementById("spinner").classList.remove("d-none");
    document.getElementById("response-container").classList.add("d-none");
    document.getElementById("submit").classList.add("d-none");

    // Send the data to the API and handle the response
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instruction: instruction,
        input: userInput,
        temperature: temperature,
        top_k: topK,
        top_p: topP,
        web: web,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("submit").classList.remove("d-none");
        document.getElementById("spinner").classList.add("d-none");
        document
          .getElementById("response-container")
          .classList.remove("d-none");
        // Display the response in the response-container div
        document.getElementById("response-container").innerHTML =
          "<p>" +
          data.response +
          "</p>" +
          "<a href=" +
          data.url +
          " target='_blank'>" +
          data.source +
          "</a>";
      })
      .catch((error) => {
        // Hide spinner
        document.getElementById("spinner").classList.add("d-none");
        document.getElementById("response-container").classList.add("d-none");
        document.getElementById("submit").classList.remove("d-none");
        // Handle errors
        alert(error);
      });
  });
