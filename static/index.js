"use strict"

// Set a global variable for the template spacing selection.
let spacingSelection = "single"

// Set event listeners for interactions with the form.
document.addEventListener("click", checkFormattingSelection)
document.getElementById("generatorForm").addEventListener("submit", submitTemplateGenerator)
document.getElementById("copyButton").addEventListener("click", copyTemplate)

/**
 * Format the spacing used in the rip template. Triggered by page clicks.
 */
function checkFormattingSelection() {
  const currentSpacingSelection = document.getElementById("formatSelect").value

  if (currentSpacingSelection !== spacingSelection) {
    let template = document.getElementById("templateArea").value.toString()
    template = template.replace("== Jokes ==", "JOKEHEADER")
    spacingSelection = currentSpacingSelection

    switch(currentSpacingSelection) {
      case "none":
        template = template.replace(/\t\t\t= |\t\t= |\t= | = |= /g, "=")
        break
      case "single":
        template = template.replace(/\t\t\t= |\t\t= |\t= | = |=/g, "= ")
        break
      case "double":
        template = template.replace(/\t\t\t= |\t\t= |\t= |= |=/g, " = ")
        break
      case "tab":
        template = template.replace(/ = |= |=/g, "\t\t\t= ")
          .replace("playlist\t\t", "playlist\t")
          .replace("playlist id\t\t\t", "playlist id\t")
          .replace("composer\t\t", "composer\t")
          .replace("composer label\t\t\t", "composer label\t")
          .replace("platform\t\t", "platform\t")
          .replace("platform label\t\t\t", "platform label\t")
          .replace("catchphrase\t\t\t", "catchphrase\t")
        break
    }

    template = template.replace("JOKEHEADER", "== Jokes ==")
    document.getElementById("templateArea").innerHTML = template
  }
}

/**
 * Copy the template text to the user's clipboard. Triggered by button clicks.
 */
function copyTemplate() {
  const copyText = document.getElementById("templateArea")
  copyText.select()
  copyText.setSelectionRange(0, 99999) // For mobile devices
  document.execCommand("copy")
}

/**
 * Generate a rip template or validation message. Triggered by form submissions.
 * @param {Event} event - The event instance.
 */
async function submitTemplateGenerator(event) {
  event.preventDefault()
  const idInput = document.getElementById("idInput").value.trim()
  const options = {
    "id": idInput,
    "spacing": spacingSelection
  }
  // TODO determine whether or not the current use of generator.js is a bad idea
  // await fetch(`api/rip?id=${idInput}&spacing=${spacingSelection}`)
  //   .then(response => response.json())
  await ripJsonResponse(options)
    .then(json => {
      if (json.message !== undefined) {
        setTemplate(json.message)
        return
      }

      const lineCount = json.template.split(/\n/).length + 1
      const thumbnailElement = `
        <a target="_blank" href="${json.thumbnail}">
          <img src="${json.thumbnail}" alt="The rip's YouTube thumbnail">
        </a>
      `
      setTemplate(json.template, lineCount, thumbnailElement)
    })
    .catch(error => {
      console.error(error.stack)
      setTemplate("An unexpected error occurred.")
    });
}

/**
 * Set template and thumbnail values on the page.
 * @param {String} template - The text to set in template textarea.
 * @param {Number} [rows] - A number to set on the textarea, defaulting to 1.
 * @param {String} [thumbnail] - An HTML string, defaulting to an empty string.
 */
function setTemplate(template, rows = 1, thumbnail = "") {
  document.getElementById("templateArea").rows = rows
  document.getElementById("templateArea").innerHTML = template
  document.getElementById("thumbnailDiv").innerHTML = thumbnail
}

/**
 * Generate a few templates and insert the results into the template textarea.
 */
async function runTests() {
  const startTime = new Date().getTime()
  const videoIdsToTest = [
    "", "123", "123456789ab", // Invalid IDs
    "0ujxiMbucmQ", "Dga13KmU3EU", "iSNwuxRWvbk", "_s3WZVWkT5Q", "5gSAAb_WoJE", "32orTDGfccc", // SiIvaGunner
    "0fsMS_SIVFA", "DjtWVlhjfF4", // TimmyTurnersGrandDad
    "mVmZo5yXBb4", "2It3LYSKyhY", // Mysikt
    "wgS4N5dZ_R8", // VvvvvaVvvvvvr
    "https://www.youtube.com/playlist?list=PLL0CQjrcN8D0C1R9di590CNrqsUp6S1uh", // Invalid playlist URL
    "https://www.youtube.com/watch?v=NzoneDE0A2o", // Video URL
    "https://youtu.be/Sg5MsV5LZwg?si=PwHSbUxRr5qbBlIc", // Shared video URL
    "https://www.youtube.com/watch?v=6GCMkfxUvOg&list=PLL0CQjrcN8D38CfZ2TuZUbb6lreHbSHSL&index=19" // Video in playlist URL
  ]
  let result = ""

  // Fetch and combine each individual result
  for (const id of videoIdsToTest) {
    console.log(`Testing ID: ${id}`)
    document.getElementById("idInput").value = id
    await submitTemplateGenerator({ preventDefault: () => {} })
    result += document.getElementById("templateArea").innerHTML + "\n"
  }

  // Display the results
  const completionTime = new Date().getTime() - startTime
  console.log(`Tests completed in ${completionTime} milliseconds`)
  const lineCount = result.split(/\n/).length + 14
  console.log(`Result length: ${result.length}`, `Line count: ${lineCount}`)
  setTemplate(result, lineCount)
}
