
function buildTemplate(id)
{
  var range = SpreadsheetApp.getActiveSheet().getRange('A2');

  range.setValue('Retrieving video details...');
  
  var image = "";
  var videoId = JSON.stringify(id).replace("{\"rip\":\" ", "").replace("\"}", "");
  var playlistId = "";
  var uploadDate = "";
  var length = "";
  
  var composer = "";
  var platform = "";
  var catchphrase = "";
  var pageName = "";
  var mix = "";
  var track = "";
  var game = "";
  
  try 
  {
    // Fetch the video title and description.
    var results = YouTube.Videos.list('id,snippet',
                                      {
                                        id: videoId,
                                        maxResults: 1,
                                        type: 'video'
                                      });
    
    results.items.forEach(function(item)
                          {
                            var description = item.snippet.description.toString();
                            pageName = item.snippet.title;
                            Logger.log(item.snippet.title);
                            Logger.log(item.id);
                            console.log(item.snippet.title);
                            console.log(item.id);
                          });
    
    // Put the title, description, and ID into the template.
    for (var i = 0; i < pageName.length; i++)
    {
      //Logger.log(pageName.charAt(i));
      //console.log(pageName.charAt(i));
    }
    
    // Print the template to the sheet.
    var val = "{{Rip" +
              "\n|image= " + image + 
              "\n\n|link= " + videoId + 
              "\n|playlist=" + game +
              "\n|playlist id=" + playlistId +
              "\n|upload=" + uploadDate +
              "\n|length=" + length +
              "\n|author=" +
              "\n" +
              "\n|album=" +
              "\n|track=" +
              "\n" +
              "\n|music=" + track +
              "\n|composer=" + composer +
              "\n|platform=" + platform +
              "\n|catchphrase=" + catchphrase +
              "\n}}" +
              "\n\"\'\'\'" + pageName + "\'\'\'\" is a high quality rip of the " + mix +
              " of " + track + " from \'\'" + game + "\'\'." +
              "\n== Joke ==";
    
    range.setValue(val);
    
  } catch(e)
  {
    range.setValue(e); 
    Logger.log(e);
    console.log(e);
  }
  
  return val.replace(/\n/g, "<br>");
} 

function doGet()
{
  return HtmlService.createHtmlOutputFromFile('Index');
}
