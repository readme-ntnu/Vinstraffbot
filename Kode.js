var NAME_COL = 6;
var NUM_COL = 7;
var MUST_BRING_COL = 7;
var START_ROW = 5;
var END_ROW = 24;
var TOTAL_ROW = 26;

var Actions = {
  checkAll: {
    requiredArgsCount: 0,
    helpText: [{ text: "Skriv `/vinstraffer` for å hente alle vinstraffene." }],
    execute: getVinstraffer
  },
  check: {
    requiredArgsCount: 1,
    helpText: [
      { text: "Skriv `/vinstraffer <dittnavn>` for å sjekke dine vinstraffer." }
    ],
    args: {
      0: [/[\s\S]*/, "Oops. Det navnet ble galt!"]
    },
    execute: getBrukerVinstraffer
  }
};

function doPost(e) {
  var req = null;
  try {
    req = queryStringToJSON(e.postData.contents);
    /* Extract the action from the request text */
    var action = getAction(req);
    if (!actionIsValid(action)) throw "Hi. You sent an invalid command";
    /* Extract the action arguments from the request text */
    var args = getActionArgs(req);
    args.forEach(function(arg, index) {
      if (!actionParamIsValid(arg, index, action)) {
        throw actions[action].args[index][1];
      }
    });
    /* The result of the handler for any action is assigned to resText */
    var resText = actions[action].execute(args);
    /* The response is composed and sent here */
    var res = composeResponse(resText);
    return quickResponse(res);
  } catch (error) {
    Logger.log("Ny feil: " + error + " fra " + e.postData.contents);
    if (!req || !req["text"]) {
      return quickResponse(
        composeResponse("Hei! Du kjørte meg", actions.check.helpText)
      );
    }
    var errorMessage = composeResponse(error, actions.check.helpText);
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
  var payloadObjects = payload.split("+", 2);
  var action = payloadObjects[0];
  if (!payloadObjects[1]) {
    throw "Oups. Du skrev en ufullstendig kommando. Skriv /vinstraffer " +
      action +
      " for autocomplete-valg";
  }
  var argCount = Actions[action].requiredArgsCount;
  var args = payloadObjects[1].split("+", argCount);
  return args;
}

function actionParamIsValid(param, paramIndex, action) {
  var pattern = Actions[action].args[paramIndex][0];
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
  if (!selectedRow) throw captialize(key) + " har ingen vinstraffer!";
  return [values[selectedRow][NUM_COL], values[selectedRow][MUST_BRING_COL]];
}

function findAllVinstraffer(_sheet) {
  var sheet = _sheet;
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  var result = [];
  for (var i = START_ROW; i < END_ROW; i++) {
    var name = values[i][NAME_COL];
    if (name !== "") {
      var straffer = values[i][NUM_COL];
      var min_staffer = values[i][MUST_BRING_COL];

      result.push([
        name +
          ": " +
          straffer +
          "Vinstraffer\nMå ha med minst " +
          min_staffer +
          "+\n"
      ]);
    }
  }
  result.push([
    "\nTotalt er det " +
      values[TOTAL_ROW][NUM_COL] +
      "vinstraffer.\nDet skal tas med minst " +
      values[TOTAL_ROW][MUST_BRING_COL] +
      " på neste taco! :tada::tada:"
  ]);
  return result;
}

function getBrukerVinstraffer(args) {
  var name = args[0];
  var result = findValueInSheet(name, SpreadsheetApp.getActiveSheet());
  if (!numberOnList) {
    throw captialize(name) + "har ingen vinstraffer. Gratulerer!";
  }
  return (
    "Du har " +
    result[0] +
    " vinstraffer, og må ta med minst " +
    result[1] +
    "på neste taco."
  );
}

function getVinstraffer() {
  var result = findAllVinstraffer();
  return result.join("");
}

/* This function helps us to deal with sending advanced Slack messages
 * that involve attachments
 */
function composeResponse(text, attachments) {
  var res = {
    response_type: "ephemeral",
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

function captialize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
