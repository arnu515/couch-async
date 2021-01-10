import Couch from "../src";
import Database from "../src/db";
import { ItemNotFoundError, IDOrRevisionError } from "../src/exceptions";
import { COUCH_DB_2, COUCH_URI } from "./test-config";

describe("CRUD fields in a database", () => {
    let couch: Couch;
    let db: Database;

    beforeAll(async () => {
        couch = Couch.fromUri(COUCH_URI);
        await couch.new(COUCH_DB_2);
        db = await couch.database(COUCH_DB_2);
    });

    test("Create a field", async () => {
        expect((await db.add({ test: "data" }, "testId")).id).toBe("testId");
        try {
            await db.add({ invalid: "id" }, "testId");
        } catch (e) {
            expect(e).toBeInstanceOf(IDOrRevisionError);
        }
    });

    test("Get the field", async () => {
        expect((await db.get("testId")).test).toBe("data");
        try {
            await db.get("invalidId");
        } catch (e) {
            expect(e).toBeInstanceOf(ItemNotFoundError);
        }
    });

    test("Update the field", async () => {
        const data = await db.update("testId", { test: "data", more: "data" });
        expect(data.ok).toBeTruthy();
        expect(data.id).toBe("testId");
        const rev = data.rev;

        expect(
            (await db.update("testId", { someMore: "data" }, rev)).ok
        ).toBeTruthy();
        try {
            await db.update("testId", { error: "willBeThrown" }, rev);
        } catch (e) {
            expect(e).toBeInstanceOf(IDOrRevisionError);
        }
        try {
            await db.update("testId", { error: "willBeThrown" }, "invalidRev");
        } catch (e) {
            expect(e).toBeInstanceOf(IDOrRevisionError);
        }

        try {
            await db.update("invalidId", { field: "doesNotExist" });
        } catch (e) {
            expect(e).toBeInstanceOf(ItemNotFoundError);
        }
    });

    // test("Delete the field", async () => {
    //     expect(async () => await db.delete("invalidId")).toThrow(
    //         IDOrRevisionError
    //     );

    //     expect((await db.delete("testId")).ok).toBeTruthy();
    //     expect(async () => await db.delete("testId")).toThrow(
    //         FieldNotFoundError
    //     );
    // });
});
