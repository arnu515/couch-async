import axios from "axios";
import Database from "./db";
import { InvalidCredentialsError, ItemNotFoundError } from "./exceptions";

/**
 * Creates a connection to CouchDB
 *
 * @param host The host of your CouchDB server. Defaults to `127.0.0.1` (localhost)
 * @param port The port of your CouchDB server. Defaults to `5984`
 * @param username The username of a user account on your CouchDB server. An admin user is required to create databases.
 * @param password The password to the user account
 * @param ssl Weather to use `https` or `http`
 */
export default class Couch {
    private authString: string;
    private uri: string;

    constructor(
        host?: string,
        port?: number,
        username?: string,
        password?: string,
        ssl?: boolean
    ) {
        this.authString = [username, password].join(":") + "@";
        this.uri = `http${ssl ? "s" : ""}://${this.authString}${host}:${port}`;
    }

    public async check() {
        try {
            await axios.get(`${this.uri}/_all_dbs`);
            return true;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            return false;
        }
    }

    /**
     * Returns a Couch class from a couchdb uri connector
     *
     * Example:
     * ```js
     * const couch = Couch.fromUri("https://username:password@couchdb.mywebsite.com");
     * ```
     *
     * @param uri_ The URI to generate host, port, username and password from. It can have a scheme of `http` or `https`.
     */
    public static fromUri(uri_: string) {
        let uri = uri_.replace(/https?:\/\//, "");
        uri = uri.replace(/\//g, "");
        const authStringAndUri = uri.split("@");
        if (![1, 2].includes(authStringAndUri.length))
            throw new Error("Bad URI format");
        uri =
            authStringAndUri.length === 2
                ? authStringAndUri[1]
                : authStringAndUri[0];
        let authString =
            authStringAndUri.length === 2 ? authStringAndUri[0] : "";

        const hostAndPort = uri.split(":");
        if (![1, 2].includes(hostAndPort.length))
            throw new Error("Bad URI format");
        let host = hostAndPort[0];
        let port = hostAndPort.length === 2 ? parseInt(hostAndPort[1]) : 5984;

        return new Couch(
            host,
            port,
            authString.split(":")[0],
            authString.split(":")[1],
            uri_.startsWith("https")
        );
    }

    /**
     * Creates a new database
     *
     * @param database The database to create
     *
     * @returns `true` if database was created, `false` if database already exists
     */
    public async new(database: string) {
        try {
            const {
                data: { ok },
            } = await axios.put<{ ok: boolean }>(`${this.uri}/${database}`);
            return !!ok;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.data?.error === "file_exists") return false;
            throw new Error(e);
        }
    }

    /**
     * Returns a database
     *
     * @param database The database to get
     * @param createIfNotExists Creates the database if it doesn't exist
     */
    public async database(database: string, createIfNotExists = false) {
        const db = new Database(this.uri, database, createIfNotExists);
        await db.check();
        return db;
    }

    public async delete(database: string) {
        try {
            const {
                data: { ok },
            } = await axios.delete<{ ok: boolean }>(`${this.uri}/${database}`);
            return ok;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.status === 404) throw new ItemNotFoundError();
            if (e?.response?.data?.error === "file_exists") return false;
            throw new Error(e);
        }
    }
}
