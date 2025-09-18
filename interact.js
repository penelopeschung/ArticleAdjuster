function extractText() {
  // Get the textarea element by its ID.
  const textarea = document.getElementById("inputarticle");

  // Get the value (content) of the textarea.
  const extractedText = textarea.value;

  // Get the output element where we will display the result.
  const outputParagraph = document.getElementById("output");

  // Set the content of the output paragraph to the extracted text.
  outputParagraph.textContent = "Extracted text: " + extractedText;
}

function submitData() {
    let inputarticle = document.querySelector("#inputarticle");
    
}