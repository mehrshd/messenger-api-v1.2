import type { updates } from "../types/user.ts";

const CheckUndefined = (fields:updates, allowedFields:(keyof updates)[]) => {

    const result:updates = {};

    for(const [field, values] of Object.entries(fields)){
        if(allowedFields.includes(field as keyof updates) && values !== undefined){
            const key = field as keyof updates;
            result[key] = values;
        }
    }

    return result
}

export default CheckUndefined