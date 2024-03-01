/**
 * Run a test run on a few IDs and insert the results into the template field.
 */
async function runTests() {
  const videoIdsToTest = [
    "", "123", "123456789ab", // Invalid IDs
    "0ujxiMbucmQ", "Dga13KmU3EU", // SiIvaGunner
    "0fsMS_SIVFA", "DjtWVlhjfF4", // TimmyTurnersGrandDad
    "mVmZo5yXBb4", "2It3LYSKyhY", // Mysikt
    "wgS4N5dZ_R8" // VvvvvaVvvvvvr
  ]
  let result = ""

  // Fetch and combine each individual result
  for (const id of videoIdsToTest) {
    console.log(`Testing ID: ${id}`)
    document.getElementById("inputText").value = id
    await updateTemplate()
    result += document.getElementById("template").innerHTML + "\n"
  }

  // Display the results
  const lineCount = result.split(/\n/).length + 10
  console.log(`Result length: ${result.length}`, `Line count: ${lineCount}`)
  setTemplate(result, lineCount)
}
