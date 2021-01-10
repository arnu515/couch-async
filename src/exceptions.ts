export class InvalidCredentialsError extends Error {
    constructor() {
        super();
        this.message =
            "Invalid username/password or the user doesn't have access to the database";
    }
}

export class DatabaseNotFoundError extends Error {
    constructor(db: string) {
        super();
        this.message = `The database ${db} was not found`;
    }
}

export class ItemNotFoundError extends Error {
    constructor() {
        super();
        this.message = "This item was not found";
    }
}

export class IDOrRevisionError extends Error {
    constructor(id: string) {
        super();
        this.message = `A field with id ${id} already exists or the revision provided was incorrect`;
    }
}
