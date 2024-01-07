let lastFormattingSelection = "single" // Default spacing format
document.onclick = checkFormattingSelection

/**
 * Format the spacing used in the rip template.
 * Triggered by all page clicks.
 */
function checkFormattingSelection() {
  const currentFormattingSelection = document.getElementById("format").value

  if (currentFormattingSelection !== lastFormattingSelection) {
    let template = document.getElementById("template").value.toString()
    template = template.replace("== Jokes ==", "JOKEHEADER")
    lastFormattingSelection = currentFormattingSelection

    switch(currentFormattingSelection) {
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
    document.getElementById("template").innerHTML = template
  }
}

/**
 * Copy the rip template text to the user's clipboard.
 * Triggered by copy button presses.
 */
function copyTemplate() {
  const copyText = document.getElementById("template")
  copyText.select()
  copyText.setSelectionRange(0, 99999) // For mobile devices
  document.execCommand("copy")
}

/**
 * Generate a rip template for wiki articles.
 * Displays an error message if the form input is invalid.
 * Triggered by template generator form submissions.
 */
function submitTemplateGenerator() {
  try {
    updateTemplate()
  } catch (error) {
    console.error(error.stack)
  }

  return false
}

/**
 * Generate a rip template for wiki articles.
 * Displays an error message if the form input is invalid.
 * Triggered by template generator form submissions.
 */
async function updateTemplate() {
  const input = document.getElementById("inputText").value.trim()

  if (input.length === 0) {
    setTemplate(`Please enter a video URL or ID. For example: "NzoneDE0A2o"`)
  } else {
    const id = input.replace(/&.*/g, "").replace(/.*[=\/]/g, "")

    if (id.length !== 11) {
      setTemplate(`Invalid video URL or ID: "${input}"`)
    } else {
      const videoListJson = await fetchVideoJson(id)
      console.log(videoListJson)

      if (videoListJson.items.length === 0) {
        setTemplate(`No video found with the ID "${id}"`)
      } else {
        generateTemplate(videoListJson.items[0])
      }
    }
  }
}

/**
 * Set the template and thumbnail in the page.
 * @param {String} template - The template string.
 * @param {Number} [templateRowCount] - The estimated number of rows in the template, defaulting to 1.
 * @param {String} [thumbnailElement] - The thumbnail HTML element, defaulting to an empty string.
 */
function setTemplate(template, templateRowCount = 1, thumbnailElement = "") {
  document.getElementById("template").rows = templateRowCount
  document.getElementById("template").innerHTML = template
  document.getElementById("thumbnail").innerHTML = thumbnailElement
}

/**
 * Fetch video metadata from the YouTube API.
 * @param {String} id - The video ID.
 * @return {Object} The JSON object.
 */
async function fetchVideoJson(id) {
    let url = "https://youtube.googleapis.com/youtube/v3/videos?"
    const params = {
      "part": "id,snippet,contentDetails",
      "id": id,
      "key": "AIzaSyDZhxq5ynR0_7VK2zxufeUSusae-AgHu6M",
    }

    Object.entries(params).forEach(([key, value]) => {
      url += "&" + key + "=" + value
    })

    const response = await fetch(url)
    return await response.json()
}

/**
 * Generate a template in six primary steps:
 * Step 1. Format the upload date and length.
 * Step 2. Search and replace uncommon labels that might be in the description.
 * Step 3. Search for common template values: composer, playlist, platform, etc.
 * Step 4. Separate the full title, track title, game title, and mix.
 * Step 5. Build the rip template string.
 * Step 6. Insert the template and thumbnail into the page.
 * @param {Object} videoJson - The video metadata JSON object.
 */
async function generateTemplate(videoJson) {
  const siivaId = "UC9ecwl3FTG66jIKA9JRDtmg"
  const ttgdId = "UCIXM2qZRG9o4AFmEsKZUIvQ"
  const mysiktId = "UCnv4xkWtbqAKMj8TItM6kOA"
  const vavrId = "UCCPGE1kAoonfPsbieW41ZZA"

  const pageName = videoJson.snippet.title.toString()
  const videoId = videoJson.id
  const channelId = videoJson.snippet.channelId.toString()
  let description = videoJson.snippet.description.toString().replace(/\r/g, "").replace(/  /g, "&nbsp;&nbsp;")
  const vavrDescription = description.replace(/\n/g, "<br/>\n")

  ////////////////////////////////////////////////
  // Step 1. Format the upload date and length. //
  ////////////////////////////////////////////////

  let uploadDate = videoJson.snippet.publishedAt.toString()
  let length = videoJson.contentDetails.duration.toString()

  // Format the length in the style "HH:MM:SS" or "MM:SS"
  for (let i = 0; i < length.length; i++) {
    if (length.charAt(i) === "T" && length.charAt(i + 2) === "S") {
      length = length.replace("PT", "0:0")
    } else if (length.charAt(i) === "T" && length.charAt(i + 3) === "S") {
      length = length.replace("PT", "0:")
    } else if (length.charAt(i) === "M" && length.charAt(i + 2) === "S") {
      length = length.replace("M", ":0")
    } else if (length.charAt(i) === "H" && length.charAt(i + 2) === "M") {
      length = length.replace("H", ":0")
    }
  }

  if (!length.includes("S")) {
    length += "00"
  }

  length = length.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "")

  // Format the upload date in the style "MMMM d, yyyy"
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  uploadDate = new Date(uploadDate)
  uploadDate = `${months[uploadDate.getUTCMonth()]} ${uploadDate.getUTCDate()}, ${uploadDate.getUTCFullYear()}`

  //////////////////////////////////////////////////////////////////////////////////
  // Step 2. Search and replace uncommon labels that might be in the description. //
  // If they exist, they will be used in place of the default labels.             //
  //////////////////////////////////////////////////////////////////////////////////

  let composerLabel = ""
  let platformLabel = ""

  // Search for composer labels
  if (description.includes("Composers: ") === true) {
    description = description.replace("Composers: ", "Composer: ")
    composerLabel = "\n|composer label\t= Composers"
  } else if (description.includes("Composer(s): ") === true) {
    description = description.replace("Composer(s): ", "Composer: ")
    composerLabel = "\n|composer label\t= Composer(s)"
  } else if (description.includes("Arrangement: ") === true) {
    description = description.replace("Arrangement: ", "Composer: ")
    composerLabel = "\n|composer label\t= Arrangement"
  } else if (description.includes("Arrangers: ") === true) {
    description = description.replace("Arrangers: ", "Composer: ")
    composerLabel = "\n|composer label\t= Arrangers"
  } else if (description.includes("Composed by: ") === true) {
    description = description.replace("Composed by: ", "Composer: ")
    composerLabel = "\n|composer label\t= Composed by"
  }

  // Search for platform labels
  if (description.includes("Platforms: ") === true) {
    description = description.replace("Platforms: ", "Platform: ")
    platformLabel = "\n|platform label\t= Platforms"
  } else if (description.includes("Available on: ") === true) {
    description = description.replace("Available on: ", "Platform: ")
    platformLabel = "\n|platform label\t= Available on"
  }

  // Search for ripper labels
  if (description.includes("Ripped by: ") === true) {
    description = description.replace("Ripped by: ", "Ripper: ")
  }

  ///////////////////////////////////////////////////////////////////////////////////
  // Step 3. Search for common template values: composer, playlist, platform, etc. //
  ///////////////////////////////////////////////////////////////////////////////////

  let playlistId = ""
  let ripper = ""
  let developer = ""
  let composer = ""
  let platform = ""
  let catchphrase = ""

  // Set up the regular expressions
  const playlistIdPattern = new RegExp("Playlist: (.*)\n")
  const composerPattern = new RegExp("Composer: (.*)\n")
  const developerPattern = new RegExp("Developed by: (.*)\n")
  const platformPattern = new RegExp("Platform: (.*)\n")
  let ripperPattern

  if (description.includes("\n\n")) {
    ripperPattern = new RegExp("Ripper: (.*)\n")
  } else {
    ripperPattern = new RegExp("Ripper: (.*)")
    catchphrase = "\n|catchphrase\t= "
  }

  description = description.replace(/,/g, "COMMA")

  // Search for playlist ID
  if (playlistIdPattern.test(description) === true) {
    playlistId = playlistIdPattern.exec(description).toString().split(",").pop()
  }

  // Search for ripper
  if (ripperPattern.test(description) === true) {
    console.log(ripperPattern.exec(description))
    ripper = ripperPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",")
  }

  // Search for developer
  if (developerPattern.test(description) === true) {
    developer = developerPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",")
  }

  // Search for composer
  if (composerPattern.test(description) === true) {
    composer = "\n|composer\t= " + composerPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",")
  }

  // Search for platform
  if (platformPattern.test(description) === true) {
    platform = "\n|platform\t= " + platformPattern.exec(description).toString().split(",").pop().replace(/COMMA/g, ",")
  }

  // Search for catchphrase
  if (!description.includes("Please read the channel description.") && description.match(/(\n\n|\u2550\n)/)) {
    catchphrase = "\n|catchphrase\t= " + description.split(/(\n\n|\u2550\n)/).pop().replace(/COMMA/g, ",")
  }

  ////////////////////////////////////////////////////////////////////////
  // Step 4. Separate the full title, track title, game title, and mix. //
  ////////////////////////////////////////////////////////////////////////

  let game = ""
  let track = ""
  let mix = ""

  // Characters used to separate the track from the game and the mix
  let gameSeperatorChar = "-"
  let mixSeperatorChar = "("

  if (channelId === mysiktId) {
    if (pageName.includes("~")) {
      mixSeperatorChar = "~"
    }

    if (pageName.includes("|")) {
      gameSeperatorChar = "|"
    }
  }

  const titleSections = pageName.split(gameSeperatorChar)

  // Parse the game title and track
  if (titleSections.length > 1) {
    game = titleSections.pop().trim()
    track = titleSections.join(gameSeperatorChar).trim()
  } else {
    game = pageName
    track = pageName
  }

  // Update the game title and playlist ID for Mysikt specifically
  if (channelId === mysiktId) {
    if (description.match(game + ": (.*)\n")) {
      const mysiktPlaylistIdPattern = new RegExp(game + ": (.*)\n")
      playlistId = mysiktPlaylistIdPattern.exec(description).toString().split(",").pop()
    }

    game = game.replace(/ Music$/, "")
  }

  let image = game.replace(/:/, "-")
  let simplifiedTrack = track

  // Parse the mix and save a copy of the track without the mix included
  if (track.includes(mixSeperatorChar) && (track.includes("Mix") || track.includes("Version"))) {
    const trackSections = track.split(mixSeperatorChar)
    mix = "of the " + trackSections.pop().replace(/\)/g, "").replace(/Mix/g, "mix").replace(/Version/g, "version").trim() + " "
    simplifiedTrack = trackSections.join(mixSeperatorChar).trim()
  }

  /////////////////////////////////////////////////////////////////////////
  // Step 5. Build the rip template string.                              //
  // Note that some channels have significant differences in formatting. //
  /////////////////////////////////////////////////////////////////////////

  let template = ""

  // The "|" vertical bar isn't an allowed character in URLs, so the page title needs to be manually changed
  if (pageName.includes("|")) {
    template += "{{DISPLAYTITLE:" + pageName.replace(/\|/g, "{{!}}") + "}}\n"
  }

  template += "{{Rip" +
              "\n|image\t\t= " + image + ".jpg" +
              "\n" +
              "\n|link\t\t= " + videoId

  if (channelId !== vavrId) {
    template += "\n|playlist\t= " + game +
                "\n|playlist id\t= " + playlistId.replace(/h.*=/, "")
  }

  template += "\n|upload\t\t= " + uploadDate +
              "\n|length\t\t= " + length +
              "\n|author\t\t= " + ripper

  if (channelId !== vavrId) {
    template += "\n"

    if (channelId === siivaId || channelId === ttgdId) {
      template += "\n|album\t\t= " +
                  "\n|track\t\t= " +
                  "\n"
    }

    if (channelId !== mysiktId) {
      template += "\n|music\t\t= " + track
    }

    template += /* "\n|composer\t= " + */ composer +
                /* "\n|composer label\t= " + */ composerLabel

    if (channelId === mysiktId) {
      template += "\n|developer\t\t= " + developer
    }

    template += /* "\n|platform\t= " + */ platform +
                /* "\n|platform label\t= " + */ platformLabel +
                /* "\n|catchphrase\t= " + */ catchphrase +
                "\n}}" +
                "\n\"'''" + pageName + "'''\" is a high quality rip " + mix +
                "of \"" + simplifiedTrack + "\" from ''" + game + "''." +
                "\n== Jokes =="
  } else {
    template += "\n|all_authors_if_multiple= " +
                "\n" +
                "\n|track\t\t= " +
                "\n|previous\t\t= " +
                "\n|next\t\t= " +
                "\n|description\t= " + vavrDescription +
                "\n}}" +
                "\n\"'''{{PAGENAME}}'''\" is a super duper epic medium-high quality vip " + mix +
                "of \"" + simplifiedTrack + "\" from ''" + game + "''." +
                "\n== Jokes =="
  }

  //////////////////////////////////////////////////////////////
  // Step 6. Insert the template and thumbnail into the page. //
  //////////////////////////////////////////////////////////////

  // Format the template spacing based on the selected preference
  const format = document.getElementById("format").value

  if (format === "single") {
    template = template.replace(/\t\t= |\t= /g, "= ")
  } else if (format === "double") {
    template = template.replace(/\t\t= |\t= /g, " = ")
  } else if (format === "none") {
    template = template.replace(/\t\t= |\t= /g, "=")
  }

  // Insert the template and thumbnail into the page
  const lineCount = template.split(/\n/).length + 1
  const thumbnails = [
    videoJson.snippet.thumbnails.maxres,
    videoJson.snippet.thumbnails.standard,
    videoJson.snippet.thumbnails.high,
    videoJson.snippet.thumbnails.medium,
    videoJson.snippet.thumbnails.default
  ]
  const thumbnailUrl = thumbnails.find(thumbnail => thumbnail !== undefined).url
  const thumbnailElement = `
    <a target="_blank" href="${thumbnailUrl}">
      <img src="${thumbnailUrl}" alt="The thumbnail of the given rip shown on YouTube">
    </a>
  `
  setTemplate(template, lineCount, thumbnailElement)
}
