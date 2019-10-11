
function retrieveUploads() 
{
  var startTime = new Date();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var uploadsSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var results = YouTube.Channels.list('contentDetails', {id: "UC9ecwl3FTG66jIKA9JRDtmg"});
  var currentTotal = spreadsheet.getSheetByName("Summary").getRange("B1").getValue();
  var row = 1;
  var scheduled = false;
  
  for (var i in results.items) 
  {
    var item = results.items[i];
    
    // Get the uploads playlist ID
    var playlistId = item.contentDetails.relatedPlaylists.uploads;
    
    var nextPageToken = '';
    while (nextPageToken != null)
    {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', 
                                                        {
                                                          playlistId: playlistId,
                                                          maxResults: 50,
                                                          pageToken: nextPageToken
                                                        });
      
      for (var j = 0; j < playlistResponse.items.length; j++) 
      {
        row++;
        if (row > currentTotal + 1)
        {
          var playlistItem = playlistResponse.items[j];
          var title = playlistItem.snippet.title;
          var id = playlistItem.snippet.resourceId.videoId;
          
          var wikiUrl = "https://siivagunner.fandom.com/wiki/" + title;
          wikiUrl = wikiUrl.replace(/ /g, "_");
          wikiUrl = wikiUrl.replace(/"/g, "\"\"");
          wikiUrl = wikiUrl.replace(/#/g, "");
          wikiUrl = wikiUrl.replace(/&/g, "%26");
          wikiUrl = wikiUrl.replace(/'/g, "%27");
          
          try 
          {
            var response = UrlFetchApp.fetch(wikiUrl).getResponseCode();
            uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + title.replace(/"/g, "\"\"") + '")');
            uploadsSheet.getRange(row, 2).setValue("No");
          } catch (e)
          {
            uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '?action=edit", "' + title.replace(/"/g, "\"\"") +'")');
            uploadsSheet.getRange(row, 2).setValue("Yes");
          }
          
          uploadsSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
          Logger.log("Row " + row + ": " + title);
          console.log("Row " + row + ": " + title);
        }
        nextPageToken = playlistResponse.nextPageToken;
        // Check if the script timer has passed 350 seconds
        var currentTime = new Date();
        if (currentTime.getTime() - startTime.getTime() > 350000 && !scheduled)
        {
          var allTriggers = ScriptApp.getProjectTriggers();
          for (var i = 0; i < allTriggers.length; i++)
            ScriptApp.deleteTrigger(allTriggers[i]);
          
          ScriptApp.newTrigger("retrieveUploads")
          .timeBased()
          .after(10 * 60 * 1000) // 10 minutes
          .create();

          scheduled = true;
        }
      }
    }
  }
}

/*
function retrieveTemplateValues(pageName, uploadDate, length, description)
{
  uploadsSheet.getRange(row, 4).setValue(playlistId);
  uploadsSheet.getRange(row, 5).setValue(uploadDate);
  uploadsSheet.getRange(row, 6).setValue(length);
  uploadsSheet.getRange(row, 7).setValue(ripper);
  uploadsSheet.getRange(row, 8).setValue(track);
  uploadsSheet.getRange(row, 9).setValue(simplifiedTrack);
  uploadsSheet.getRange(row, 10).setValue(game);
  uploadsSheet.getRange(row, 11).setValue(mix);
  uploadsSheet.getRange(row, 12).setValue(composer);
  uploadsSheet.getRange(row, 13).setValue(composerLabel);
  uploadsSheet.getRange(row, 14).setValue(platform);
  uploadsSheet.getRange(row, 15).setValue(platformLabel);
  uploadsSheet.getRange(row, 16).setValue(catchphrase);
  
  return [ playlistId: playlistId, +
          uploadDate: uploadDate, +
          length: length, +
          ripper: ripper, +
          track: track, +
          simplifiedTrack: simplifiedTrack, +
          game: game, +
          mix: mix, +
          composer: composer, +
          composerLabel: composerLabel, +
          platform: platform, +
          platformLabel: platformLabel, +
          catchphrase: catchphrase ];
}
//*/
