/**
 * Generate a few templates and insert the results into the template textarea.
 */
async function runTests() {
  const startTime = new Date().getTime()
  const videoIdsToTest = [
    "", "123", "123456789ab", // Invalid IDs
    "0ujxiMbucmQ", "Dga13KmU3EU", // SiIvaGunner
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
