export const trimObjectStrings = (obj: any) => {
    if (typeof obj === "string") {
        return obj.trim();
    } else if (typeof obj === "object") {
        for (const key in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(key)) {
                obj[key] = trimObjectStrings(obj[key]);
            }
        }

        return obj;
    } else {
        return obj;
    }
};
