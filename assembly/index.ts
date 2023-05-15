import {
  setOutputJSON,
  log,
  getLocation,
  getTagValue,
  getSourceValue,
  getTimestamp,
  getUserdata,
  getInputBufferAsString,
} from "orbit-sdk-assemblyscript";

import { JSON, JSONEncoder } from "assemblyscript-json";

/**
 * process uplink (device -> SORACOM) message
 */
export function uplink(): i32 {
  // decode input string as JSON string
  let data: JSON.Obj = <JSON.Obj>(JSON.parse(getInputBufferAsString()));

  // create a new encoder which will be used to generate final JSON string
  const encoder = new JSONEncoder();

  const detect_type = data.getString("detect_type");
  const detect_type_string: string = detect_type === null ? "":detect_type.valueOf();
  const seq_number = data.getInteger("seq_number");
  const seq_number_number: i64 = seq_number === null ? 0:seq_number.valueOf();

  log(detect_type_string)

  let clickType: i64 = 0;
  let clickTypeName: string = "";
  let batteryLevel: f64 = 0;
  
  if (detect_type_string === "Single short click") {
    log("single");
    clickType = 1;
    clickTypeName = "SINGLE";
  } else if (detect_type_string === "Double short click") {
    log("double");
    clickType = 2;
    clickTypeName = "DOUBLE";
  } else if (detect_type_string === "Single long click"){
    log("long")
    clickType = 3;
    clickTypeName = "LONG";
  } else {
    log(`no type: ${detect_type_string}`)
    clickType = 0;
    clickTypeName = "NaN";
  }

  // calicurate batteryLevel only from seq_number(0-4095)
  if (seq_number_number < 1024){
    batteryLevel = 1.0;
  } else if (seq_number_number < 2048){
    batteryLevel = 0.75;
  } else if (seq_number_number < 3072){
    batteryLevel = 0.5;
  } else {
    batteryLevel = 0.25;
  }

  encoder.setInteger("clickType", clickType);
  encoder.setString("clickTypeName", clickTypeName);
  encoder.setFloat("batteryLevel", batteryLevel);
  encoder.setBoolean("binaryParserEnabled", true);

  // set output JSON. Note that we have to wrap result with {}
  setOutputJSON("{" + encoder.toString() + "}");

  // return user defined result code for success
  return 0;
}
