import Couch from "../src";
import { COUCH_DB_1, COUCH_URI } from "./test-config";

(async () => {
    const couch = Couch.fromUri(COUCH_URI);
    const db = await couch.database(COUCH_DB_1);

    console.log(await db.add({ test: 10 }, "kkk"));
})();
