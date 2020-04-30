var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var uploadsSheet = spreadsheet.getSheetByName("List of Rips");
var summarySheet = spreadsheet.getSheetByName("Summary");
var playlistId = "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni";
var errorLog = [];

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
          var encodedTitle = format(originalTitle);
          var id = playlistItem.snippet.resourceId.videoId;
          var publishDate = playlistItem.snippet.publishedAt;
          
          var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
          
          checkStatus(row, url, originalTitle, id, true);
          
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
        uploadsSheet.getRange("A2:P19000").sort({column: 4, ascending: false});
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

// Add new rips to list.
function addToList() 
{
  uploadsSheet.getRange("A2:P19000").sort({column: 4, ascending: false});
  
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
    
    Logger.log("Most recent upload date: " + mostRecent);
    for (var j = 0; j < playlistResponse.items.length; j++)
    {
      var playlistItem = playlistResponse.items[j];
      var originalTitle = playlistItem.snippet.title;
      var id = playlistItem.snippet.resourceId.videoId;
      var publishDate = playlistItem.snippet.publishedAt;
      
      if (publishDate.length == 20)
        publishDate = publishDate.replace("Z", ".000Z");
      
      if (publishDate > mostRecent)
      {
        //*
        var encodedTitle = format(originalTitle);
        var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
        
        checkStatus(row, url, originalTitle, id, true);

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
  uploadsSheet.getRange("A2:P19000").sort({column: 4, ascending: false});
  Logger.log("New rips: " + newRipCount);
}

// Update rip values and add missing rips.
function updateList()
{
  var startTime = new Date();
  
  if (checkForNewRips())
    addToList();
  
  var yesToNo = [];
  var noToYes = [];
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
    var encodedTitle = format(originalTitle);
    var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
    var oldStatus = uploadsSheet.getRange(row, 2).getValue();
    var id = uploadsSheet.getRange(row, 3).getValue();
    
    checkStatus(row, url, originalTitle, id, false);
    
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
        Logger.log(e + "\n" + url);
        errorLog.push(e + "\n[" + url + "]");
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
      if (noToYes.length > 0 || errorLog.length > 0)
      {
        var emailAddress = 'a.k.zamboni@gmail.com';
        var subject = 'List of Uploads Update';
        var beginning = '';
        var end = '';
        
        if (noToYes.length > 0)
          beginning = noToYes.length + ' rips were changed from no to yes.\n\t' + noToYes.toString().replace(/,/g, '\n\t') + '\n\n';
        if (errorLog.length > 0)
          end = errorLog.length + ' errors occured.\n' + errorLog.toString().replace(/,/g, '\n\n');
        
        var message = beginning + end;
        
        MailApp.sendEmail(emailAddress, subject, message);
        Logger.log("Email successfully sent. " + message);
      }
      ready = false;
    }
  }
}

// Check for recently uploaded rips.
function checkForNewRips()
{
  uploadsSheet.getRange("A2:P19000").sort({column: 4, ascending: false});
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
      var originalTitle = playlistItem.snippet.title;
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
          missingRipList.push(originalTitle);
        }
        k++;
      }
    }
  }
  
  if (missingRip)
    return true;
  else
    return false;
}

// Check if the rip has a wiki article.
function checkStatus(row, url, originalTitle, id, newRip)
{
  try 
  {
    var response = UrlFetchApp.fetch(url).getResponseCode();
    
    uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') + '")');
    uploadsSheet.getRange(row, 2).setValue("No");
  } catch (e)
  {
    e = e.toString().replace(/\n\n/g, "\n");
    Logger.log(e + "\n" + url);
    if (e.indexOf("404") != -1)
    {
      uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '?action=edit", "' + originalTitle.replace(/"/g, '""') +'")');
      uploadsSheet.getRange(row, 2).setValue("Yes");

      if (newRip)
      {
        Logger.log("Add: " + originalTitle);
        YouTube.PlaylistItems.insert
        ({
          snippet: 
          {
            playlistId: "PLn8P5M1uNQk4_1_eaMchQE5rBpaa064ni",
            resourceId: {kind: "youtube#video", videoId: id}
          }
        }, "snippet");
      }
    }
    else
    {
      if (newRip)
        uploadsSheet.getRange(row, 1).setFormula('=HYPERLINK("' + url + '", "' + originalTitle.replace(/"/g, '""') + '")');
      
      if (uploadsSheet.getRange(row, 2).getValue() == "")
        uploadsSheet.getRange(row, 2).setValue("Unknown");
      
      if (e.indexOf("Address unavailable") == -1)
        errorLog.push(e + "\n[" + url + "]")
    }
  }
}

function createTrigger()
{
  ScriptApp.newTrigger("updateList")
  .timeBased()
  .everyMinutes(30)
  .create();
}

function format(str)
{
  str = str.replace(/\[/g, '(');
  str = str.replace(/\]/g, ')');
  str = str.replace(/#/g, '');
  str = str.replace(/\​\|\​_/g, 'L');
  str = encodeURIComponent(str);
  str = str.replace(/%7C/g, '|');
  return str;
}

function formatTester()
{
  var originalTitle = "";
  var encodedTitle = format(originalTitle);
  var url = "https://siivagunner.fandom.com/wiki/" + encodedTitle;
  try 
  {
    var response = UrlFetchApp.fetch(url).getResponseCode();
    Logger.log("Success!");
  } catch (e)
  {
    e = e.toString().replace(/\n\n/g, "\n");
    Logger.log(e);
  }
  Logger.log(url);
}
