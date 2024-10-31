import { SagebookDatabase } from '@sagebook/db-client';

let db: SagebookDatabase | undefined;

export async function getDb() {
    if (db) return db;
    return (db = await SagebookDatabase.connect());
}
