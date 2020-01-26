// NOTE: 0-indexed
var NAME_COL = 6;
var NUM_COL = 7;
var MUST_BRING_COL = 8;
var START_ROW = 5;
var END_ROW = 29;
var TOTAL_ROW = 30;

var Actions = {
  hent: {
    requiredArgsCount: 1,
    helpText: [
      {
        text:
          "Skriv `/vinstraffer hent <ditt navn>` for å sjekke dine vinstraffer, `/vinstraffer hent alle` for å hente alle."
      }
    ],
    args: {
      0: [/[\s\S]*/, "Oops. Det navnet ble galt!"]
    },
    execute: getVinstraffer
  }
};

function doPost(e) {
  var req = null;
  try {
    req = queryStringToJSON(e.postData.contents);
    /* Extract the action from the request text */
    var action = getAction(req);
    if (!actionIsValid(action)) throw "Du sendte en ugyldig kommando.";
    /* Extract the action arguments from the request text */
    var args = getActionArgs(req);
    args.forEach(function(arg) {
      if (!actionParamIsValid(arg, action)) {
        throw actions[action].args[index][1];
      }
    });
    /* The result of the handler for any action is assigned to resText */
    var resText = Actions[action].execute(args);
    /* The response is composed and sent here */
    var res = composeResponse(resText);
    return quickResponse(res);
  } catch (error) {
    sendLogs("Ny feil: " + error + " fra " + e.postData.contents);
    var errorMessage = composeResponse(error, Actions.hent.helpText);
    return quickResponse(errorMessage);
  }
}

function queryStringToJSON(queryString) {
  if (queryString.indexOf("=") == -1) return {};
  var queryStr = queryString.split("&");
  var queryJSON = {};
  queryStr.forEach(function(keyValPair) {
    var keyValPairArr = keyValPair.split("=");
    queryJSON[keyValPairArr[0]] = decodeURIComponent(keyValPairArr[1] || "");
  });
  return queryJSON;
}

function getAction(req) {
  var payload = req["text"];
  var action = payload.split("+")[0];
  return action;
}

function actionIsValid(action) {
  var actionList = Object.keys(Actions);
  if (actionList.indexOf(action) > -1) return true;
  return false;
}

function getActionArgs(req) {
  var payload = req["text"];
  var payloadObjects = payload.split("+");
  if (!payloadObjects[1]) {
    throw "Oups. Du skrev en ufullstendig kommando. Skriv /vinstraffer for autocomplete-valg";
  }
  var args = payloadObjects.slice(1);
  return args;
}

function actionParamIsValid(param, action) {
  var pattern = Actions[action].args[0][0];
  return pattern.test(param);
}

function findValueInSheet(key, _sheet) {
  var selectedRow = null;
  var sheet = _sheet;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  for (var i = START_ROW; i < END_ROW; i++) {
    if (values[i][NAME_COL] === key) {
      selectedRow = i;
      break;
    }
  }
  if (!selectedRow) return null;
  return [values[selectedRow][NUM_COL], values[selectedRow][MUST_BRING_COL]];
}

function getAllVinstraffer(_sheet) {
  var sheet = _sheet;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var result = [["Dette er vinstraffene som er gyldige akkurat nå:\n"]];
  for (var i = START_ROW; i < END_ROW; i++) {
    var name = values[i][NAME_COL];
    if (name !== "" && values[i][NUM_COL] !== 0) {
      var straffer = values[i][NUM_COL];
      var min_staffer = values[i][MUST_BRING_COL];

      result.push([
        name +
          ": " +
          straffer +
          conjugate(straffer) +
          "\nMå ha med minst " +
          min_staffer +
          "\n\n"
      ]);
    }
  }
  result.push([
    "\nTotalt er det " +
      values[TOTAL_ROW][NUM_COL] +
      conjugate(values[TOTAL_ROW][NUM_COL]) +
      ".\nDet skal tas med minst " +
      values[TOTAL_ROW][MUST_BRING_COL] +
      " på neste taco! :tada: :wine_glass: :taco: :tada:"
  ]);
  return result;
}

function getBrukerVinstraffer(args) {
  var name = capitalize(args[0]);
  if (args.length > 1) {
    for (var i = 1; i < args.length; i++) {
      name += " " + capitalize(args[i]);
    }
  }
  var result = findValueInSheet(name, SpreadsheetApp.getActiveSheet());
  if (!result || result[0] === 0) {
    return name + " har ingen vinstraffer. Gratulerer!";
  }
  return (
    name +
    " har " +
    result[0] +
    conjugate(result[0]) +
    ", og må ta med minst " +
    result[1] +
    " på neste taco."
  );
}

function getVinstraffer(args) {
  var result = undefined;
  if (args[0] === "alle") {
    var result = getAllVinstraffer(SpreadsheetApp.getActiveSheet());
    result = result.join("");
  } else {
    result = getBrukerVinstraffer(args);
  }
  return result;
}

/* This function helps us to deal with sending advanced Slack messages
 * that involve attachments
 */
function composeResponse(text, attachments) {
  var res = {
    response_type: "in_channel",
    text: text,
    attachments: attachments || []
  };
  return res;
}

/* This function serializes our response into JSON and sends it back */
function quickResponse(res) {
  var resString = JSON.stringify(res);
  var JSONOutput = ContentService.createTextOutput(resString);
  JSONOutput.setMimeType(ContentService.MimeType.JSON);
  return JSONOutput;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function conjugate(vinstraffer) {
  if (vinstraffer <= 1) {
    return " vinstraff";
  } else {
    return " vinstraffer";
  }
}

function sendLogs(error) {
  Logger.log(error);
  var recipient = Session.getEffectiveUser().getEmail();
  var subject = "Error from Vinstraffbot";
  var body = Logger.getLog();
  MailApp.sendEmail(recipient, subject, body);
}
