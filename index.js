const apiUrl = "http://localhost:8000/query";

function saveConversation() {
  const chatMessages = document.getElementById("chat-messages");
  localStorage.setItem("conversation", chatMessages.innerHTML);
}

function loadConversation() {
  const chatMessages = document.getElementById("chat-messages");
  const storedConversation = localStorage.getItem("conversation");

  if (storedConversation) {
    chatMessages.innerHTML = storedConversation;
  }
}

function displayChatMessage(message, className, link = null) {
  const chatMessages = document.getElementById("chat-messages");
  const chatMessageElement = document.createElement("li");
  chatMessageElement.classList.add("chat-message", className);
  chatMessageElement.innerText = message;

  if (link) {
    const br = document.createElement("br");
    const sourceLink = document.createElement("a");
    sourceLink.href = link.url;
    sourceLink.target = "_blank";
    sourceLink.innerText = " " + link.source;
    sourceLink.classList.add("text-light");
    chatMessageElement.appendChild(br);
    chatMessageElement.appendChild(sourceLink);
  }
  chatMessages.appendChild(chatMessageElement);
  // Calculate the position of the new message relative to the chat container
  const chatContainer = document.querySelector(".chat-container");
  const messageRect = chatMessageElement.getBoundingClientRect();
  const containerRect = chatContainer.getBoundingClientRect();
  const scrollTop =
    messageRect.bottom - containerRect.bottom + chatContainer.scrollTop;

  // Scroll the chat container to the new message
  chatContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
}

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
    document.getElementById("submit").classList.add("d-none");

    displayChatMessage(userInput, "user-message");

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
        if (web) {
          displayChatMessage(data.response, "response-message", {
            url: data.url,
            source: data.source,
          });
        } else {
          displayChatMessage(data.response, "response-message");
        }
        saveConversation();
      })
      .catch((error) => {
        // Hide spinner
        document.getElementById("spinner").classList.add("d-none");
        document.getElementById("submit").classList.remove("d-none");

        // Set error message in the modal
        document.getElementById("errorModalText").innerText = error;

        // Show the error modal
        const errorModal = new bootstrap.Modal(
          document.getElementById("errorModal")
        );
        errorModal.show();
      });
  });

loadConversation();

document
  .getElementById("clear-conversation")
  .addEventListener("click", function () {
    const confirmationModal = new bootstrap.Modal(
      document.getElementById("confirmationModal")
    );
    confirmationModal.show();
  });

document
  .getElementById("confirm-delete")
  .addEventListener("click", function () {
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = "";
    localStorage.removeItem("conversation");
    const confirmationModal = bootstrap.Modal.getInstance(
      document.getElementById("confirmationModal")
    );
    confirmationModal.hide();
  });
