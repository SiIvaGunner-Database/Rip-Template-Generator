var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var uploadsSheet = spreadsheet.getSheetByName("List of Rips");
var summarySheet = spreadsheet.getSheetByName("Summary");
var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";

// Builds a spreadsheet with basic information for every SiIvaGunner video.
function buildList() 
{
  var startTime = new Date();
  var currentTotal = summarySheet.getRange("B1").getValue();
  var mostRecent = uploadsSheet.getRange("D2").getValue();
  
  var results = YouTube.Channels.list('contentDetails', {id: "UC9ecwl3FTG66jIKA9JRDtmg"});
  var scheduled = false;
  
  for (var i in results.items) 
  {
    // Get the uploads playlist ID.
    var item = results.items[i];
    var playlistId = item.contentDetails.relatedPlaylists.uploads;
    var nextPageToken = '';
    var row = 1;
    
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
          var originalTitle = playlistItem.snippet.title;
          var id = playlistItem.snippet.resourceId.videoId;
          var publishDate = playlistItem.snippet.publishedAt;
          
          var title = originalTitle.replace(/\[/g, '(').replace(/\]/g, ')').replace(/#/g, '');
          
          var wikiUrl = "https://siivagunner.fandom.com/wiki/" + encodeURIComponent(title);
          
          // Check if the video has a wiki article.
          try 
          {
            var response = UrlFetchApp.fetch(wikiUrl).getResponseCode();
            
            uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + originalTitle.replace(/"/g, '""') + '")');
            uploadsSheet.getRange(row, 2).setValue("No");
          } catch (e)
          {
            e = e.toString().replace(/\n\n/g, "\n");
            Logger.log(e + "\n" + wikiUrl);
            if (e.indexOf("404") != -1)
            {
              uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '?action=edit", "' + originalTitle.replace(/"/g, '""') +'")');
              uploadsSheet.getRange(row, 2).setValue("Yes");
              //*
              Logger.log("Add: " + title);
              YouTube.PlaylistItems.insert
              ({
                snippet: 
                {
                  playlistId: "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni",
                  resourceId: 
                  {
                    kind: "youtube#video",
                    videoId: id
                  }
                }
              }, "snippet");
              //*/
            }
            else
            {
              uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + originalTitle.replace(/"/g, '""') + '")');
              uploadsSheet.getRange(row, 2).setValue("Unknown");
            }
          }
          
          uploadsSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
          uploadsSheet.getRange(row, 4).setValue(publishDate);
          
          Logger.log("Row " + row + ": " + originalTitle);
        }
        nextPageToken = playlistResponse.nextPageToken;
        
        // Check if the script timer has passed a specified time limit.
        var currentTime = new Date();
        
        if (currentTime.getTime() - startTime.getTime() > (10 * 60 * 2800) && !scheduled) // 28 minutes
        {
          var allTriggers = ScriptApp.getProjectTriggers();
          
          for (var i = 0; i < allTriggers.length; i++)
            ScriptApp.deleteTrigger(allTriggers[i]);
          
          ScriptApp.newTrigger("buildList")
          .timeBased()
          .after(10 * 60 * 500) // 5 minutes
          .create();

          scheduled = true;
        }
        uploadsSheet.getRange("A2:P20000").sort({column: 4, ascending: false});
        if (scheduled) break;
      }
      if (scheduled) break;
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateList() 
{
  uploadsSheet.getRange("A2:P20000").sort({column: 4, ascending: false});
  
  var currentTotal = summarySheet.getRange("B1").getValue();
  var mostRecent = uploadsSheet.getRange("D2").getValue();
  var row = currentTotal + 2;
  var newRipCount = 0;
  
  var results = YouTube.Channels.list('contentDetails', {id: "UC9ecwl3FTG66jIKA9JRDtmg"});
  
  for (var i in results.items) 
  {
    // Get the uploads playlist ID.
    var item = results.items[i];
    var playlistId = item.contentDetails.relatedPlaylists.uploads;
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50});
    
    Logger.log(mostRecent);
    for (var j = 0; j < playlistResponse.items.length; j++)
    {
      var playlistItem = playlistResponse.items[j];
      var originalTitle = playlistItem.snippet.title;
      var id = playlistItem.snippet.resourceId.videoId;
      var publishDate = playlistItem.snippet.publishedAt;
      
      if (publishDate > mostRecent)
      {
        //*
        var title = originalTitle.replace(/\[/g, '(').replace(/\]/g, ')').replace(/#/g, '');
        var wikiUrl = "https://siivagunner.fandom.com/wiki/" + encodeURIComponent(title);
        
        // Check if the video has a wiki article.
        try 
        {
          var response = UrlFetchApp.fetch(wikiUrl).getResponseCode();
          
          uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + originalTitle.replace(/"/g, '""') + '")');
          uploadsSheet.getRange(row, 2).setValue("No");
        } catch (e)
        {
          e = e.toString().replace(/\n\n/g, "\n");
          Logger.log(e + "\n" + wikiUrl);
          if (e.indexOf("404") != -1)
          {
            uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '?action=edit", "' + originalTitle.replace(/"/g, '""') +'")');
            uploadsSheet.getRange(row, 2).setValue("Yes");
            //*
            Logger.log("Add: " + title);
            YouTube.PlaylistItems.insert
            ({
              snippet: 
              {
                playlistId: "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni",
                resourceId: 
                {
                  kind: "youtube#video",
                  videoId: id
                }
              }
            }, "snippet");
            //*/
          }
          else
          {
            errorLog.push(e + "\n[" + wikiUrl + "]");
            uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + originalTitle.replace(/"/g, '""') + '")');
            uploadsSheet.getRange(row, 2).setValue("Unknown");
          }
        }
        uploadsSheet.getRange(row, 3).setFormula('=HYPERLINK("https://www.youtube.com/watch?v=' + id + '", "' + id + '")');
        uploadsSheet.getRange(row, 4).setValue(publishDate);
        //*/
        Logger.log("Row " + row + ": " + originalTitle + " - " + publishDate);
        
        row++;
        newRipCount++;
      }
    }
  }
  var lastUpdatedRow = summarySheet.getRange("B5").getValue();
  summarySheet.getRange("B5").setValue(lastUpdatedRow + newRipCount);
  uploadsSheet.getRange("A2:P20000").sort({column: 4, ascending: false});
  Logger.log(newRipCount);
}


function updateArticleStatuses()
{
  var startTime = new Date();
  
  if (checkRips)
    updateList();
  
  var yesToNo =[];
  var noToYes =[];
  var errorLog =[];
  var currentTotal = summarySheet.getRange("B1").getValue();
  var row = summarySheet.getRange("B5").getValue();
  var ready = true;
  
  while (ready)
  {
    if (row == currentTotal + 1)
      row = 2;
    else
      row++;
    
    var originalTitle = uploadsSheet.getRange(row, 1).getValue();
    var title = format(originalTitle);
    var wikiUrl = "https://siivagunner.fandom.com/wiki/" + encodeURIComponent(title);
    var oldStatus = uploadsSheet.getRange(row, 2).getValue();
    var id = uploadsSheet.getRange(row, 3).getValue();
    
    // Check if the video has a wiki article.
    try 
    {
      var response = UrlFetchApp.fetch(wikiUrl).getResponseCode();
      
      uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '", "' + originalTitle.replace(/"/g, '""') + '")');
      uploadsSheet.getRange(row, 2).setValue("No");
    } catch (e)
    {
      e = e.toString().replace(/\n\n/g, "\n");
      Logger.log(e + "\n" + wikiUrl);
      if (e.indexOf("404") != -1)
      {
        uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + wikiUrl + '?action=edit", "' + originalTitle.replace(/"/g, '""') +'")');
        uploadsSheet.getRange(row, 2).setValue("Yes");
      }
      else
        errorLog.push(e + "\n[" + wikiUrl + "]");
    }
    
    var newStatus = uploadsSheet.getRange(row, 2).getValue();
    
    if (oldStatus != newStatus && newStatus == "No") // The rip no longer needs an article
    {
      yesToNo.push(originalTitle + " (" + response + ")");
      Logger.log("Remove from playlist: " + originalTitle);
      try
      {
        var videoResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, videoId: id});
        var deletionId = videoResponse.items[0].id;
        YouTube.PlaylistItems.remove(deletionId);
      }
      catch (e)
      {
        e = e.toString().replace(/\n\n/g, "\n");
        Logger.log(e + "\n" + wikiUrl);
        errorLog.push(e + "\n[" + wikiUrl + "]");
      }
    }
    else if (oldStatus != newStatus && newStatus == "Yes") // The rip needs an article
    {
      noToYes.push(originalTitle + " (" + response + ")");
      
      Logger.log("Add to playlist: " + originalTitle);
      YouTube.PlaylistItems.insert
      ({
        snippet: 
        {
          playlistId: playlistId,
          resourceId: 
          {
            kind: "youtube#video",
            videoId: id
          }
        }
      }, "snippet");
    }
    
    Logger.log("Row " + row + ": " + originalTitle + " (" + oldStatus + ", " + newStatus + ")");
    summarySheet.getRange("B5").setValue(row);
    
    // Check if the script timer has passed a specified time limit.
    var currentTime = new Date();
    
    if (currentTime.getTime() - startTime.getTime() > (10 * 60 * 500)) // 5 minutes
    {
      if (noToYes.length > 0 || yesToNo.length > 0 || errorLog.length > 0)
      {
        var emailAddress = 'a.k.zamboni@gmail.com';
        var subject = 'List of Uploads Update';
        var message = noToYes.length + ' rips were changed from no to yes.\n\t' + noToYes.toString().replace(/,/g, '\n\t')
        + '\n\n' + yesToNo.length + ' rips were changed from yes to no.\n\t' + yesToNo.toString().replace(/,/g, '\n\t')
        + '\n\n' + errorLog.length + ' errors occured.\n' + errorLog.toString().replace(/,/g, '\n\n');
        
        MailApp.sendEmail(emailAddress, subject, message);
        Logger.log("Email successfully sent. " + message);
      }
      
      ready = false;
    }
  }
}

function checkRips()
{
  uploadsSheet.getRange("A2:P20000").sort({column: 4, ascending: false});
  var stop = false;
  var missingRip = false;
  var missingRipList = [];
  var recentRipIds = uploadsSheet.getRange("C2:C101").getValues();
  var results = YouTube.Channels.list('contentDetails', {id: "UC9ecwl3FTG66jIKA9JRDtmg"});
  
  for (var i in results.items) 
  {
    // Get the uploads playlist ID.
    var item = results.items[i];
    var playlistId = item.contentDetails.relatedPlaylists.uploads;
    var playlistResponse = YouTube.PlaylistItems.list('snippet', {playlistId: playlistId, maxResults: 50});

    for (var j = 0; j < 50; j++)
    {
      var playlistItem = playlistResponse.items[j];
      var title = playlistItem.snippet.title;
      var id = playlistItem.snippet.resourceId.videoId;

      stop = false;
      k = 0;
      while (!stop)
      {
        if (id == recentRipIds[k][0])
          stop = true;
        else if (k == 99)
        {
          stop = true;
          missingRip = true;
          missingRipList.push(title);
        }
        k++;
      }
    }
  }
  
  if (missingRip)
  {
    /*
    var emailAddress = 'a.k.zamboni@gmail.com';
    var subject = 'Missing Rips Update';
    var message = 'The following rips are missing from the spreadsheet:\n\t' + missingRipList.toString().replace(/,/g, '\n\t');
    
    MailApp.sendEmail(emailAddress, subject, message);
    Logger.log("Email successfully sent. " + message);
    //*/
    Logger.log(message);
    return true;
  }
  else
  {
    Logger.log("There are no rips missing from the spreadsheet.");
    return false;
  }
}

function createTrigger()
{
  ScriptApp.newTrigger("updateArticleStatuses")
  .timeBased()
  .everyMinutes(10)
  .create();
}

function format(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/#/g, '');
  //str = str.replace(/\​\|\​_/g, 'L'); //Fix this!
  return str;
}

function test()
{
  var originalTitle = "$4cR1f1c14​|​_ - The Binding of Isaac";
  var title = format(originalTitle);
  Logger.log(title);
  var url = "https://siivagunner.fandom.com/wiki/" + encodeURIComponent(title);
  try 
  {
    var response = UrlFetchApp.fetch(url).getResponseCode();
    
    Logger.log("Success: response code " + response);
  } catch (e)
  {
    e = e.toString().replace(/\n\n/g, "\n");
    if (e.indexOf("404") != -1)
        Logger.log("Error 404");
    Logger.log(e);
    Logger.log("Failure: response code " + response);
  }
  Logger.log(url);
}
