/**
 * A hack to get the typescript compiler to unpack the whole
 * type tree into a simplified object-map format. This is necessary
 * in some cases for tsoa to be able to process the type
 */
export type Unpack<T> = {
    [K in keyof T]: Unpack<T[K]>;
};
