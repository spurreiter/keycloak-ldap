#!/usr/bin/env node
export type Log = {
    error: Function;
    warn: Function;
    info: Function;
    debug: Function;
};
