
function buildTemplate(id)
{
  var range = SpreadsheetApp.getActiveSheet().getRange('A2');
  var description = "";

  range.setValue('Retrieving video details...');
  
  var videoId = JSON.stringify(id).replace("{\"rip\":\"", "").replace("\"}", "");
  Logger.log(videoId);
  //var videoId = "EouWnJVXoTE";
  var playlistId = [];
  var uploadDate = "";
  var length = "";
  
  var composer = [];
  var platform = [];
  var catchphrase = [];
  var pageName = "";
  var mix = [];
  var track = [];
  var simplifiedTrack = [];
  var game = [];
  
  try 
  {
    // Fetch the video title and description.
    var results = YouTube.Videos.list('id,snippet,contentDetails',
                                      {
                                        id: videoId,
                                        maxResults: 1,
                                        type: 'video'
                                      });
    
    results.items.forEach(function(item)
                          {
                            pageName = item.snippet.title.toString();
                            description = item.snippet.description.toString();
                            uploadDate = item.snippet.publishedAt.toString();
                            length = item.contentDetails.duration.toString();
                          });
    
    // Put the title, description, and ID into the template.
    var temp = pageName.split("");
    var copy = "";
    for (var i in temp)
    {
      copy += temp[i].toString();

      if (copy.indexOf(" - ") != -1)
        game.push(temp[i]);
      else if (copy.indexOf("(") != -1)
      {
        mix.push(temp[i]);
        track.push(temp[i]);
      } else
        track.push(temp[i]);
    }
    
    track.pop();
    track.pop();
    game.shift();
    mix.shift();
    mix = mix.join("");
    simplifiedTrack = track.join("");
    simplifiedTrack = simplifiedTrack.split("");
    for (i = 0; i < mix.length; i++)
      simplifiedTrack.pop();
    
    if (mix.indexOf("Version)") != -1)
    {
      mix = mix.split("");
      for (i = 0; i < 10; i++)
        mix.pop();
      mix = "of the " + mix.join("") + "version ";
    } else if (mix.indexOf("Mix)") != -1)
    {
      mix = mix.split("");
      for (i = 0; i < 6; i++)
        mix.pop();
      mix = "of the " + mix.join("") + "mix ";
    } else if (mix.indexOf(")") != -1)
    {
      mix = mix.split("");
      for (i = 0; i < 3; i++)
        mix.pop();
      mix = "of the " + mix.join("") + " ";
    } else
    {
      mix = "";
      simplifiedTrack = track;
    }
    
    temp = description.split("");
    copy = "";
    i = 0;

    for (i in temp)
    {
      copy += temp[i].toString();
      if (copy.indexOf("\n\n") != -1)
        catchphrase.push(temp[i]);
      else if (copy.indexOf("Platform: ") != -1)
        platform.push(temp[i]);
      else if (copy.indexOf("Playlist: ") != -1) 
        playlistId.push(temp[i]);
      else if (copy.indexOf("Composer: ") != -1)
        composer.push(temp[i]);
    }
    catchphrase.shift();
    platform.pop();
    
    for (i = 0; i < 10; i++)
    {
      composer.pop();
      playlistId.pop();
    }
    
    // Print the template to the sheet.
    var val = "{{Rip" +
              "\n|image= " + game.join("") + ".jpg" + 
              "\n\n|link= " + videoId + 
              "\n|playlist= " + game.join("") +
              "\n|playlist id=" + playlistId.join("").replace("https://www.youtube.com/playlist?list=", "") +
              "\n|upload= " + uploadDate +
              "\n|length= " + length +
              "\n|author=" +
              "\n" +
              "\n|album=" +
              "\n|track=" +
              "\n" +
              "\n|music= " + track.join("") +
              "\n|composer=" + composer.join("") +
              "\n|platform=" + platform.join("") +
              "\n|catchphrase= " + catchphrase.join("") +
              "\n}}" +
              "\n\"\'\'\'" + pageName + "\'\'\'\" is a high quality rip " + mix +
              "of \"" + simplifiedTrack.join("") + "\" from \'\'" + game.join("") + "\'\'." +
              "\n\n== Jokes ==";
    
    range.setValue(val);
    
    Logger.log(val);
    console.log(val);
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
