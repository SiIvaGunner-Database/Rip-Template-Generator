// Builds a spreadsheet with basic information for every SiIvaGunner video.
function retrieveUploads() 
{
  var startTime = new Date();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var uploadsSheet = spreadsheet.getSheetByName("SiIvaGunner");
  var currentTotal = spreadsheet.getSheetByName("Summary").getRange("B1").getValue();
  var results = YouTube.channelArr.list('contentDetails', {id: "UC9ecwl3FTG66jIKA9JRDtmg"});
  var row = 1;
  var scheduled = false;
  
  for (var i in results.items) 
  {
    // Get the uploads playlist ID.
    var item = results.items[i];
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
          var publishDate = playlistItem.snippet.publishedAt;
          var wikiUrl = "https://siivagunner.fandom.com/wiki/" + title;
          
          
          wikiUrl = wikiUrl.replace(/ /g, "_");
          wikiUrl = wikiUrl.replace(/"/g, "\"\"");
          wikiUrl = wikiUrl.replace(/#/g, "");
          wikiUrl = wikiUrl.replace(/&/g, "%26");
          wikiUrl = wikiUrl.replace(/'/g, "%27");
          wikiUrl = wikiUrl.replace(/\?/g, "%3F");
          
          // Check if the video has a wiki article.
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
          uploadsSheet.getRange(row, 4).setValue(publishDate);
          
          Logger.log("Row " + row + ": " + title);
        }
        nextPageToken = playlistResponse.nextPageToken;
        
        // Check if the script timer has passed a specified time limit.
        var currentTime = new Date();
        
        if (currentTime.getTime() - startTime.getTime() > (5*350000) && !scheduled)
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
