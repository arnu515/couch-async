import Couch from "../src";
import Database from "../src/db";
import { COUCH_DB_1, COUCH_URI } from "./test-config";

describe("Database tests", () => {
    let couch: Couch;

    beforeAll(() => {
        couch = Couch.fromUri(COUCH_URI);
    });

    test("Connect to database", async () => {
        expect(await couch.check()).toBe(true);
    });

    test("Create new database", async () => {
        expect([true, false]).toContain(await couch.new(COUCH_DB_1));
    });

    test("Get the database", async () => {
        expect(await couch.database(COUCH_DB_1)).toBeInstanceOf(Database);
    });

    test("Delete the database", async () => {
        expect(await couch.delete(COUCH_DB_1)).toBeTruthy();
    });
});
