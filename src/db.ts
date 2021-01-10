import axios from "axios";
import {
    DatabaseNotFoundError,
    ItemNotFoundError,
    InvalidCredentialsError,
    IDOrRevisionError,
} from "./exceptions";
import { v4 as uuid } from "uuid";

export default class Database {
    private uri: string;
    private db: string;
    private createIfNotExists: boolean;

    constructor(uri: string, db: string, createIfNotExists = false) {
        this.uri = uri;
        this.db = db;
        this.createIfNotExists = !!createIfNotExists;
    }

    /**
     * Checks the database connection
     *
     * @returns true/false if database is connected or not
     */
    public async check(): Promise<boolean> {
        try {
            await axios.get(`${this.uri}/${this.db}`);
            return true;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            else if (e?.response?.status === 404) {
                if (this.createIfNotExists) {
                    await this.new(this.db);
                    return await this.check();
                } else throw new DatabaseNotFoundError(this.db);
            }
            return false;
        }
    }

    private async new(database: string) {
        try {
            const {
                data: { ok },
            } = await axios.post<{ ok: boolean }>(`${this.uri}/${database}`);
            return !!ok;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.data?.error === "file_exists") return false;
            throw new Error(e);
        }
    }

    /**
     * Gets an item from the database
     * @param id The id of the item to get
     */
    public async get(id: string) {
        try {
            const { data } = await axios.get(`${this.uri}/${this.db}/${id}`);
            return data;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.status === 404) throw new ItemNotFoundError();
            throw new Error(e);
        }
    }

    /**
     * Adds a field to the database
     * @param data Data in the field
     * @param id ID of the field. Leave blank to autogenerate
     * @returns The ID of the inserted item
     */
    public async add(
        data: any,
        id?: string
    ): Promise<{ id: string; rev: string; ok: boolean }> {
        if (!id) id = uuid();
        try {
            return (
                await axios.put<{ id: string; rev: string; ok: boolean }>(
                    `${this.uri}/${this.db}/${id}`,
                    data
                )
            ).data;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.status === 404) throw new ItemNotFoundError();
            if (e?.response?.status === 409)
                throw new IDOrRevisionError(id as string);
            throw new Error(e);
        }
    }

    /**
     * Deletes the field from the database
     *
     * @param id ID of the field to delete
     * @param rev Revision hash. If blank, will fetch from database
     */
    public async delete(
        id: string,
        rev?: string
    ): Promise<{ id: string; rev: string; ok: boolean }> {
        if (!rev) {
            rev = (await this.get(id))._rev;
        }
        try {
            return (
                await axios.delete<{ id: string; rev: string; ok: boolean }>(
                    `${this.uri}/${this.db}/${id}?rev=${rev}`
                )
            ).data;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.status === 404) throw new ItemNotFoundError();
            if (
                e?.response?.status === 409 ||
                (e?.response?.status === 400 &&
                    e?.response?.data?.reason === "Invalid rev format")
            )
                throw new IDOrRevisionError(id as string);
            throw new Error(e);
        }
    }

    /**
     * Updates the field from the database
     *
     * @param id ID of the field to delete
     * @param data New data
     * @param rev Revision hash. If blank, will fetch from database
     */
    public async update(id: string, data: any, rev?: string): Promise<any> {
        if (!rev) {
            rev = (await this.get(id))._rev;
        }
        try {
            return (
                await axios.put<{ id: string; rev: string; ok: boolean }>(
                    `${this.uri}/${this.db}/${id}?rev=${rev}`,
                    data
                )
            ).data;
        } catch (e) {
            if ([401, 403].includes(e?.response?.status))
                throw new InvalidCredentialsError();
            if (e?.response?.status === 404) throw new ItemNotFoundError();
            if (
                e?.response?.status === 409 ||
                (e?.response?.status === 400 &&
                    e?.response?.data?.reason === "Invalid rev format")
            )
                throw new IDOrRevisionError(id as string);
            throw new Error(e);
        }
    }
}
