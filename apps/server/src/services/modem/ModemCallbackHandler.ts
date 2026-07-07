import {Log} from "../helpers/Log";
import {SignalKHelper} from "../helpers/SignalKHelper";

// tslint:disable-next-line:no-var-requires
const Parser = require("@signalk/nmea0183-signalk");

export class ModemCallbackHandler {

    private nmeaParser: any;

    receivedData = false;

    handleData(line: string) {
        Log.debug(line);
        this.receivedData = true;
        if (this.nmeaParser === undefined) {
            this.nmeaParser = new Parser();
        }
        if (line.startsWith("$GP")) {
            try {
                const parsed = this.nmeaParser.parse(line);
                if (parsed != null) {
                    SignalKHelper.getInstance().saveUpdate(parsed.updates).then();
                }

                const prefix = line.split(",")[0];
                SignalKHelper.getInstance().gpsSentences.map((sentence: string) => {
                    if (sentence.startsWith(prefix)) {
                        sentence = line;
                    }
                });

                if (SignalKHelper.getInstance().gpsSentences.find(x => x.startsWith(prefix)) == null) {
                    SignalKHelper.getInstance().gpsSentences.push(line);
                }

            } catch (e) {
                Log.error("Error parsing NMEA data");
                Log.error(e);
            }
            return;
        }
        Log.info(line);
    }

    handleError(error: string) {
        this.receivedData = true;
    }

}